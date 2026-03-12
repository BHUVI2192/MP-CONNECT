// BE-6.4: Edge Function — Voice Note Transcription via Google Speech-to-Text
// Deploy with: supabase functions deploy transcribe-audio

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
        const { event_id, speech_id, storage_path, bucket, language } = await req.json();

        if (!storage_path || !bucket) {
            return new Response(
                JSON.stringify({ error: 'storage_path and bucket are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
        if (!googleApiKey) {
            return new Response(JSON.stringify({ error: 'GOOGLE_API_KEY not configured in Supabase secrets' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 1. Create a signed URL (10 min) so Google can access the audio file
        const { data: signedData, error: signedError } = await supabase.storage
            .from(bucket)
            .createSignedUrl(storage_path, 600);

        if (signedError || !signedData?.signedUrl) {
            return new Response(JSON.stringify({ error: 'Could not create signed URL for audio', details: signedError?.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Determine encoding from file extension
        const extension = storage_path.split('.').pop()?.toLowerCase();
        const encodingMap: Record<string, string> = {
            mp3: 'MP3',
            wav: 'LINEAR16',
            ogg: 'OGG_OPUS',
            flac: 'FLAC',
            webm: 'WEBM_OPUS',
        };
        const encoding = encodingMap[extension ?? 'mp3'] ?? 'MP3';

        // 3. Call Google Speech-to-Text v1p1beta1
        const speechResponse = await fetch(
            `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${googleApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: {
                        encoding,
                        sampleRateHertz: 16000,
                        languageCode: language ?? 'kn-IN',           // Default: Kannada
                        alternativeLanguageCodes: ['en-IN', 'hi-IN'], // Also try English/Hindi
                        enableAutomaticPunctuation: true,
                        enableWordTimeOffsets: false,
                        model: 'latest_long',
                    },
                    audio: { uri: signedData.signedUrl },
                }),
            }
        );

        const speechResult = await speechResponse.json();

        if (!speechResponse.ok) {
            return new Response(
                JSON.stringify({ error: 'Google Speech API error', details: speechResult }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const transcript =
            speechResult.results
                ?.map((r: any) => r.alternatives?.[0]?.transcript ?? '')
                .join(' ')
                .trim() ?? '';

        // 4. Save transcript to the appropriate table based on context
        if (event_id) {
            await supabase
                .from('plan_today_events')
                .update({ voice_transcript: transcript })
                .eq('event_id', event_id);
        } else if (speech_id) {
            await supabase
                .from('speech_storage')
                .update({ transcript })
                .eq('speech_id', speech_id);
        }

        // 5. Notify PA that the transcript is ready
        if (event_id || speech_id) {
            const { data: pa } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'PA')
                .single();

            if (pa?.id) {
                await supabase.from('notifications').insert({
                    recipient_id: pa.id,
                    type: 'TRANSCRIPT_READY',
                    title: '🎙 Voice note transcribed',
                    body: transcript.substring(0, 120) + (transcript.length > 120 ? '...' : ''),
                    metadata: {
                        ...(event_id ? { event_id } : {}),
                        ...(speech_id ? { speech_id } : {}),
                    },
                });
            }
        }

        return new Response(
            JSON.stringify({ transcript, characters: transcript.length }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
