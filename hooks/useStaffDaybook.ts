import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DaybookEvent {
    event_id: string;
    title: string;
    type: string;
    scheduled_date: string;
    scheduled_time: string;
    duration: string;
    location: string;
    status: string;
    day_finalized: boolean;
    [key: string]: any;
}

/**
 * BE-5.1: Realtime Daybook hook for Office Staff view.
 * Fetches finalized events for a given date and subscribes to live updates.
 */
export function useStaffDaybook(date: string) {
    const [events, setEvents] = useState<DaybookEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('plan_today_events')
            .select('*')
            .eq('scheduled_date', date)
            .eq('day_finalized', true)
            .order('scheduled_time');

        if (error) {
            setError(error.message);
        } else {
            setEvents(data ?? []);
        }
        setLoading(false);
    }, [date]);

    useEffect(() => {
        fetchEvents();

        // Realtime subscription — listens for any changes to today's events
        const channel = supabase
            .channel(`daybook-${date}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'plan_today_events',
                    filter: `scheduled_date=eq.${date}`,
                },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        setEvents((prev) =>
                            prev.filter((e) => e.event_id !== (payload.old as any)?.event_id)
                        );
                    } else if (payload.eventType === 'INSERT') {
                        const newEvent = payload.new as DaybookEvent;
                        if (newEvent.day_finalized) {
                            setEvents((prev) => [...prev, newEvent].sort((a, b) =>
                                a.scheduled_time.localeCompare(b.scheduled_time)
                            ));
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setEvents((prev) =>
                            prev.map((e) =>
                                e.event_id === (payload.new as DaybookEvent).event_id
                                    ? (payload.new as DaybookEvent)
                                    : e
                            )
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [date, fetchEvents]);

    return { events, loading, error, refetch: fetchEvents };
}
