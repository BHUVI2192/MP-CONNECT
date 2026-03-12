// BE-6.2: Edge Function — Embed Digital Signature & Finalise PDF
// Deploy with: supabase functions deploy sign-eq-letter

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { eq_request_id, signature_base64 } = await req.json();

        if (!eq_request_id || !signature_base64) {
            return new Response(
                JSON.stringify({ error: 'eq_request_id and signature_base64 are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // 1. Fetch EQ request to get the draft letter path
        const { data: eq, error: eqError } = await supabase
            .from('railway_eq_requests')
            .select('id, letter_number, letter_path, applicant_name, submitted_by')
            .eq('id', eq_request_id)
            .single();

        if (eqError || !eq) {
            return new Response(JSON.stringify({ error: 'EQ request not found', details: eqError?.message }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!eq.letter_path) {
            return new Response(
                JSON.stringify({ error: 'Draft letter not generated yet. Run generate-eq-letter first.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Download the draft PDF from storage
        const { data: pdfBlob, error: downloadError } = await supabase.storage
            .from('eq-letters')
            .download(eq.letter_path);

        if (downloadError || !pdfBlob) {
            return new Response(JSON.stringify({ error: 'Could not download draft PDF', details: downloadError?.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Load PDF and embed signature image
        const pdfBuffer = await pdfBlob.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const page = pdfDoc.getPages()[0];
        const { height } = page.getSize();

        // Decode base64 signature PNG
        const sigBytes = Uint8Array.from(atob(signature_base64), (c) => c.charCodeAt(0));
        const sigImage = await pdfDoc.embedPng(sigBytes);

        // Draw signature at the signature block position
        page.drawImage(sigImage, {
            x: 60,
            y: height - 720,
            width: 180,
            height: 55,
        });

        // 4. Set PDF metadata
        pdfDoc.setAuthor('MP Connect - Digital Signature');
        pdfDoc.setTitle(`EQ Letter ${eq.letter_number}`);
        pdfDoc.setCreationDate(new Date());

        // 5. Upload signed PDF
        const signedPath = `signed/${eq_request_id}_signed.pdf`;
        const signedBytes = await pdfDoc.save();

        await supabase.storage
            .from('eq-letters')
            .upload(signedPath, signedBytes, { contentType: 'application/pdf', upsert: true });

        // 6. Upload raw signature PNG to vault bucket
        const sigPath = `${eq_request_id}/sig_${Date.now()}.png`;
        await supabase.storage
            .from('eq-signatures')
            .upload(sigPath, sigBytes, { contentType: 'image/png' });

        // 7. Update EQ request record
        await supabase
            .from('railway_eq_requests')
            .update({
                letter_path: signedPath,
                pa_signature_path: sigPath,
                status: 'SENT',
                signed_at: new Date().toISOString(),
            })
            .eq('id', eq_request_id);

        // 8. Look up the PA user to notify
        const { data: paProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'PA')
            .single();

        if (paProfile?.id) {
            await supabase.from('notifications').insert({
                recipient_id: paProfile.id,
                type: 'EQ_SIGNED',
                title: `EQ Letter ${eq.letter_number} signed successfully`,
                body: `Letter for ${eq.applicant_name} has been signed. Sending to railway division now.`,
                metadata: { eq_request_id },
            });
        }

        // 9. Invoke the email-sending Edge Function
        const emailResult = await supabase.functions.invoke('send-eq-email', {
            body: { eq_request_id },
        });

        return new Response(
            JSON.stringify({
                path: signedPath,
                signature_stored: sigPath,
                email_invoked: !emailResult.error,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
