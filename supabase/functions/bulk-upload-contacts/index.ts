// BE-6.5: Edge Function — Contact Bulk Upload CSV Processor
// Deploy with: supabase functions deploy bulk-upload-contacts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.177.0/encoding/csv.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const text = await file.text()
        const rows = parse(text, {
            skipFirstRow: true,
            columns: [
                'full_name', 'designation', 'organization', 'category', 'mobile',
                'alternate_mobile', 'email', 'whatsapp_number', 'state', 'zilla',
                'taluk', 'gram_panchayat', 'village', 'address',
                'date_of_birth', 'anniversary_date', 'tags', 'notes', 'is_vip'
            ]
        })

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const valid: any[] = [], errors: any[] = []

        rows.forEach((row: any, i: number) => {
            // Basic validation
            if (!row.full_name || !row.mobile) {
                errors.push({
                    row: i + 2,
                    field: !row.full_name ? 'full_name' : 'mobile',
                    error: 'Required field missing'
                })
            } else {
                // Simple mobile verification (adjust as needed for specific country codes if necessary)
                // Clean mobile number
                const cleanMobile = row.mobile.replace(/\D/g, '')
                if (cleanMobile.length < 10) {
                    errors.push({ row: i + 2, field: 'mobile', error: 'Invalid mobile number' })
                } else {
                    valid.push({
                        ...row,
                        is_vip: row.is_vip === 'true' || row.is_vip === '1' || row.is_vip === 'yes',
                        // Ensure dates are null if empty to prevent DB errors
                        date_of_birth: row.date_of_birth || null,
                        anniversary_date: row.anniversary_date || null
                    })
                }
            }
        })

        // Insert valid rows in batches of 100
        let imported = 0
        for (let i = 0; i < valid.length; i += 100) {
            const batch = valid.slice(i, i + 100)
            const { data, error, count } = await supabase
                .from('contacts')
                .insert(batch, { count: 'exact' })

            if (error) {
                return new Response(JSON.stringify({ error: 'Database error during insertion', details: error }), {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
            imported += count ?? batch.length
        }

        return new Response(JSON.stringify({ imported, skipped: errors.length, errors }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
