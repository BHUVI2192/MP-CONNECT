// BE-6.1: Edge Function — EQ Letter PDF Generation
// Deploy with: supabase functions deploy generate-eq-letter

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

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
        const { eq_request_id } = await req.json();

        if (!eq_request_id) {
            return new Response(JSON.stringify({ error: 'eq_request_id is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        // 1. Fetch EQ request
        const { data: eq, error: eqError } = await supabase
            .from('railway_eq_requests')
            .select('*')
            .eq('id', eq_request_id)
            .single();

        if (eqError || !eq) {
            return new Response(JSON.stringify({ error: 'EQ request not found', details: eqError?.message }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Generate letter number if not yet assigned
        let letterNumber = eq.letter_number;
        if (!letterNumber) {
            const { data: genNum } = await supabase
                .rpc('generate_eq_letter_number', { constituency: 'CONSTITUENCY' });
            letterNumber = genNum;
            await supabase
                .from('railway_eq_requests')
                .update({ letter_number: letterNumber })
                .eq('id', eq_request_id);
        }

        // 3. Try to load letterhead template, fall back to blank PDF
        let pdfDoc: PDFDocument;
        const { data: templateBlob } = await supabase.storage
            .from('eq-letters')
            .download('templates/letterhead.pdf');

        if (templateBlob) {
            const templateBuffer = await templateBlob.arrayBuffer();
            pdfDoc = await PDFDocument.load(templateBuffer);
        } else {
            // Create a blank A4 PDF if no letterhead template uploaded yet
            pdfDoc = await PDFDocument.create();
            pdfDoc.addPage([595, 842]); // A4
        }

        const page = pdfDoc.getPages()[0];
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { height } = page.getSize();

        const draw = (text: string, x: number, y: number, size = 11, bold = false) =>
            page.drawText(text, {
                x,
                y: height - y,
                size,
                font: bold ? boldFont : font,
                color: rgb(0, 0, 0),
            });

        // 4. Draw header
        draw('OFFICE OF THE MEMBER OF PARLIAMENT', 150, 80, 13, true);
        draw(`Letter No: ${letterNumber}`, 60, 140);
        draw(`Date: ${new Date().toLocaleDateString('en-IN')}`, 400, 140);

        // 5. Draw addressee and subject
        draw('To,', 60, 200);
        draw('The Divisional Railway Manager,', 60, 220);
        draw(`${eq.division || 'Southern Railway'}`, 60, 240);
        draw('Subject: Railway Emergency Quota Requisition', 60, 280, 11, true);

        // 6. Draw applicant details
        draw(`Applicant Name  : ${eq.applicant_name}`, 60, 330);
        draw(`Mobile          : ${eq.mobile}`, 60, 355);
        draw(`Train No & Name : ${eq.train_number} - ${eq.train_name}`, 60, 380);
        draw(`From            : ${eq.from_station}`, 60, 405);
        draw(`To              : ${eq.to_station}`, 60, 430);
        draw(`Date of Journey : ${eq.journey_date}`, 60, 455);
        draw(`Travel Class    : ${eq.travel_class}`, 60, 480);
        if (eq.pnr_number) draw(`PNR Number      : ${eq.pnr_number}`, 60, 505);
        draw(`Emergency Reason: ${eq.emergency_reason}`, 60, 535);

        // 7. Draw footer / signature block
        draw('This is to request your kind consideration to provide the above booking', 60, 590);
        draw('under the Emergency Quota at the earliest.', 60, 610);
        draw('Yours sincerely,', 60, 660);
        draw('____________________', 60, 710);
        draw('Member of Parliament', 60, 730);

        // 8. Save draft PDF
        const pdfBytes = await pdfDoc.save();
        const draftPath = `drafts/${eq_request_id}_draft.pdf`;

        await supabase.storage
            .from('eq-letters')
            .upload(draftPath, pdfBytes, { contentType: 'application/pdf', upsert: true });

        // 9. Update DB record
        await supabase
            .from('railway_eq_requests')
            .update({ letter_number: letterNumber, status: 'APPROVED' })
            .eq('id', eq_request_id);

        return new Response(JSON.stringify({ path: draftPath, letter_number: letterNumber }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
