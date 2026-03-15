// BE-6.3: Edge Function — Send EQ Email via Resend
// Deploy with: supabase functions deploy send-eq-email

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const supabaseAnon = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || ''
        );
        const token = authHeader.replace('Bearer ', '').trim();
        const { data: authData, error: authError } = await supabaseAnon.auth.getUser(token);
        if (authError || !authData.user) {
            return new Response(JSON.stringify({ error: 'Unauthorized caller' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

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

        const { data: callerProfile } = await supabase
            .from('profiles')
            .select('role, is_active')
            .eq('id', authData.user.id)
            .maybeSingle();

        const callerRole = String(callerProfile?.role ?? '').toUpperCase();
        if (!callerProfile?.is_active || !['PA', 'MP', 'ADMIN'].includes(callerRole)) {
            return new Response(JSON.stringify({ error: 'Forbidden: role not allowed for outbound EQ email' }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 1. Fetch EQ request + division config (joined)
        const { data: eq, error: eqError } = await supabase
            .from('railway_eq_requests')
            .select('*, railway_quota_config(drm_email, drm_office)')
            .eq('id', eq_request_id)
            .single();

        if (eqError || !eq) {
            return new Response(JSON.stringify({ error: 'EQ request not found' }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!eq.letter_path) {
            return new Response(JSON.stringify({ error: 'No signed letter found. Sign the letter first.' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Download signed PDF for attachment
        const { data: pdfBlob, error: downloadError } = await supabase.storage
            .from('eq-letters')
            .download(eq.letter_path);

        if (downloadError || !pdfBlob) {
            return new Response(JSON.stringify({ error: 'Could not download signed PDF' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Convert PDF to base64 for Resend attachment
        const pdfBuffer = await pdfBlob.arrayBuffer();
        const pdfB64 = btoa(
            String.fromCharCode(...new Uint8Array(pdfBuffer))
        );

        const drmEmail = eq.railway_quota_config?.drm_email;
        const drmOffice = eq.railway_quota_config?.drm_office || 'Railway Division Office';
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        const senderEmail = Deno.env.get('MP_OFFICE_EMAIL') || 'mp-office@yourdomain.com';

        if (!resendApiKey) {
            return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured in Supabase secrets' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!drmEmail) {
            return new Response(JSON.stringify({ error: 'DRM email not configured for this division' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 3. Send via Resend API
        const emailPayload = {
            from: `MP Office <${senderEmail}>`,
            to: [drmEmail],
            cc: [
                ...(eq.email ? [eq.email] : []),
                senderEmail,
            ],
            subject: `Emergency Quota Request - ${eq.letter_number} - ${eq.applicant_name}`,
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear Sir/Madam,</p>
          <p>
            Please find attached the Emergency Quota recommendation letter (Ref: <strong>${eq.letter_number}</strong>)
            from the office of the Member of Parliament.
          </p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr><td style="padding: 6px; font-weight: bold;">Applicant Name</td><td style="padding: 6px;">${eq.applicant_name}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding: 6px; font-weight: bold;">Train</td><td style="padding: 6px;">${eq.train_number} - ${eq.train_name}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Route</td><td style="padding: 6px;">${eq.from_station} → ${eq.to_station}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding: 6px; font-weight: bold;">Date of Journey</td><td style="padding: 6px;">${eq.journey_date}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Travel Class</td><td style="padding: 6px;">${eq.travel_class}</td></tr>
            <tr style="background:#f5f5f5"><td style="padding: 6px; font-weight: bold;">Emergency Reason</td><td style="padding: 6px;">${eq.emergency_reason}</td></tr>
          </table>
          <p>Kindly arrange the Emergency Quota berth at the earliest and confirm.</p>
          <p style="color: #666; font-size: 12px;">This is an official communication from the office of the Member of Parliament.</p>
        </div>
      `,
            attachments: [
                {
                    filename: `EQ_${eq.letter_number}.pdf`,
                    content: pdfB64,
                },
            ],
        };

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        const resendResult = await resendResponse.json();

        if (!resendResponse.ok) {
            return new Response(
                JSON.stringify({ error: 'Resend API error', details: resendResult }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 4. Update EQ request with email status
        await supabase
            .from('railway_eq_requests')
            .update({
                email_status: 'Delivered',
                emailed_at: new Date().toISOString(),
                emailed_to: drmEmail,
            })
            .eq('id', eq_request_id);

        return new Response(
            JSON.stringify({ email_id: resendResult.id, sent_to: drmEmail }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
