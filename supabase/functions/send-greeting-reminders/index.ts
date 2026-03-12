// BE-7.2: Edge Function — Greeting Reminders (Called by cron)
// Deploy with: supabase functions deploy send-greeting-reminders

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Parallel execution for efficiency
        const [bdaysResult, annivsResult, paResult] = await Promise.all([
            supabase.rpc('get_todays_birthdays'),
            supabase.rpc('get_todays_anniversaries'),
            supabase.from('profiles').select('id').eq('role', 'PA').single()
        ])

        const bdays = bdaysResult.data
        const annivs = annivsResult.data
        const pa = paResult.data

        const bCount = bdays?.length ?? 0
        const aCount = annivs?.length ?? 0

        if (bCount + aCount === 0) {
            return new Response('No greetings today', {
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
            })
        }

        if (!pa) {
            return new Response('PA profile not found', {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
            })
        }

        // Insert in-app notification (Realtime will push to PA's bell)
        await supabase.from('notifications').insert({
            recipient_id: pa.id,
            type: 'GREETING_REMINDER',
            title: `Today's Greetings: ${bCount} Birthday${bCount !== 1 ? 's' : ''}, ${aCount} Anniversar${aCount !== 1 ? 'ies' : 'y'}`,
            body: 'Open Constituent Greetings to send messages.',
            metadata: {
                birthday_count: bCount,
                anniversary_count: aCount,
                birthday_list: bdays?.map((b: any) => b.full_name),
                anniversary_list: annivs?.map((a: any) => a.full_name)
            }
        })

        return new Response(JSON.stringify({ bCount, aCount }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
