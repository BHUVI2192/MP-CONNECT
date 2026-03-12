// hooks/useContacts.ts
import { supabase } from '@/lib/supabase';

export const contactsApi = {
    async list(filters: Record<string, any> = {}) {
        let q = (supabase as any).from('contacts').select('*').is('deleted_at', null);

        if (filters.category) q = q.eq('category', filters.category);
        if (filters.state) q = q.eq('state', filters.state);
        if (filters.zilla) q = q.eq('zilla', filters.zilla);
        if (filters.taluk) q = q.eq('taluk', filters.taluk);
        if (filters.gram_panchayat) q = q.eq('gram_panchayat', filters.gram_panchayat);
        if (filters.village) q = q.eq('village', filters.village);
        if (filters.is_vip !== undefined) q = q.eq('is_vip', filters.is_vip);

        return q.order('full_name', { ascending: true });
    },

    async search(query: string, maxResults = 100) {
        return (supabase as any)
            .from('contacts')
            .select('*')
            .textSearch('fts', query, { type: 'plain', config: 'english' })
            .is('deleted_at', null)
            .limit(maxResults);
    },

    async getById(contactId: string) {
        return (supabase as any)
            .from('contacts')
            .select('*')
            .eq('contact_id', contactId)
            .is('deleted_at', null)
            .single();
    },

    async create(contactData: Record<string, any>) {
        return (supabase as any).from('contacts').insert(contactData).select().single();
    },

    async update(contactId: string, updates: Record<string, any>) {
        return (supabase as any)
            .from('contacts')
            .update(updates)
            .eq('contact_id', contactId)
            .select()
            .single();
    },

    async delete(contactId: string) {
        // Soft delete
        return (supabase as any)
            .from('contacts')
            .update({ deleted_at: new Date().toISOString() })
            .eq('contact_id', contactId);
    },

    async getTodaysBirthdays() {
        return (supabase as any).rpc('get_todays_birthdays');
    },

    async getTodaysAnniversaries() {
        return (supabase as any).rpc('get_todays_anniversaries');
    },

    async bulkUpload(contacts: Record<string, any>[]) {
        return (supabase as any).from('contacts').insert(contacts).select();
    }
};




