// hooks/usePlanToday.ts
import { supabase } from '@/lib/supabase'

export const planTodayApi = {
    async getEvents(date: string, paId: string) {
        return (supabase as any).from('plan_today_events')
            .select('*')
            .eq('scheduled_date', date)
            .eq('pa_id', paId)
            .order('scheduled_time')
    },

    async createEvent(payload: Record<string, any>) {
        return (supabase as any).from('plan_today_events').insert(payload).select().single()
    },

    async updateEvent(eventId: string, payload: Record<string, any>) {
        return (supabase as any).from('plan_today_events')
            .update(payload)
            .eq('event_id', eventId)
            .select()
            .single()
    },

    async finalizeDay(date: string, paId: string) {
        return (supabase as any).rpc('finalize_day_plan', { p_date: date, p_pa_id: paId })
    },

    async markFinalStatus(eventId: string, attended: boolean, finalNotes: string) {
        const status = attended ? 'VISITED' : 'CANCELLED'

        // Resolve office staff for notification
        const { data: staff } = await (supabase as any).from('profiles').select('id').eq('role', 'STAFF')

        if (staff && staff.length > 0) {
            // Create notifications for each staff member
            await Promise.all(staff.map(m =>
                (supabase as any).from('notifications').insert({
                    recipient_id: m.id,
                    type: 'FINAL_STATUS',
                    title: `Event marked as ${status}`,
                    body: finalNotes,
                    metadata: { event_id: eventId, status }
                })
            ))
        }

        return (supabase as any).from('plan_today_events').update({
            is_attended: attended,
            status,
            final_notes: finalNotes,
            staff_notified_at: new Date().toISOString()
        }).eq('event_id', eventId)
    },

    async uploadVoiceNote(eventId: string, audioBlob: Blob) {
        const path = `voice-notes/${eventId}/${Date.now()}.mp3`
        await supabase.storage.from('daybook-audio').upload(path, audioBlob)

        await (supabase as any).from('plan_today_events')
            .update({ voice_note_url: path })
            .eq('event_id', eventId)

        // Invoke transcription function
        await supabase.functions.invoke('transcribe-audio', {
            body: {
                event_id: eventId,
                storage_path: path,
                bucket: 'daybook-audio'
            }
        })

        return path
    }
}



