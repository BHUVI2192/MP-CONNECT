import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Complaint {
  id: string;
  citizen_name: string;
  category: string;
  location: string;
  description: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Forwarded' | 'Verified' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  staff_notes?: string;
  pa_instructions?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export function useComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setComplaints(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetch();

    const channel = supabase
      .channel('complaints-hook-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => {
          void fetch();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetch]);

  const updateStatus = useCallback(async (
    id: string,
    status: Complaint['status'],
    notes?: string
  ) => {
    const update: Partial<Complaint> = { status };
    if (notes) update.staff_notes = notes;
    const { error } = await (supabase.from('complaints') as any)
      .update(update)
      .eq('id', id);
    if (!error) setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...update } : c));
    return { error: error?.message };
  }, []);

  const addComplaint = useCallback(async (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      ...complaint,
      submitted_by: user?.id ?? null,
    };
    const { data, error } = await (supabase.from('complaints') as any)
      .insert(payload)
      .select()
      .single();
    if (!error && data) setComplaints(prev => [data, ...prev]);
    return { error: error?.message, data };
  }, []);

  return { complaints, loading, error, updateStatus, addComplaint, refetch: fetch };
}



