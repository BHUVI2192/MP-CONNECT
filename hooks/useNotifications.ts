import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Simple browser notification fallback (no external dependency needed)
const showToast = (title: string) => {
    // Dispatch a custom event so any toast UI layer in the app can listen  
    window.dispatchEvent(new CustomEvent('mp-notify', { detail: { title } }));
};

export interface AppNotification {
    notif_id: string;
    recipient_id: string;
    type: string;
    title: string;
    body?: string;
    metadata: Record<string, any>;
    is_read: boolean;
    created_at: string;
}

/**
 * BE-5.2: Realtime notifications hook.
 * Fetches the user's notifications and subscribes to new ones in real-time.
 */
export function useNotifications() {
    const [notifs, setNotifs] = useState<AppNotification[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        const list = (data ?? []) as AppNotification[];
        setNotifs(list);
        setUnread(list.filter((n) => !n.is_read).length);
        setLoading(false);
    }, []);

    const markAsRead = useCallback(async (notifId: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('notif_id', notifId);

        setNotifs((prev) =>
            prev.map((n) => (n.notif_id === notifId ? { ...n, is_read: true } : n))
        );
        setUnread((c) => Math.max(0, c - 1));
    }, []);

    const markAllAsRead = useCallback(async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('recipient_id', user.user.id)
            .eq('is_read', false);

        setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnread(0);
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to new notifications in real-time
        let channel: ReturnType<typeof supabase.channel>;

        (async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) return;

            channel = supabase
                .channel('my-notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${userData.user.id}`,
                    },
                    (payload) => {
                        const newNotif = payload.new as AppNotification;
                        setNotifs((prev) => [newNotif, ...prev]);
                        setUnread((c) => c + 1);
                        // Show notification via custom event
                        showToast(newNotif.title);
                    }
                )
                .subscribe();
        })();

        return () => {
            if (channel!) supabase.removeChannel(channel);
        };
    }, [fetchNotifications]);

    return { notifs, unread, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
