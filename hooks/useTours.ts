// hooks/useTours.ts
import { supabase } from '@/lib/supabase'

export const toursApi = {
    async getTours(filters: Record<string, any> = {}) {
        let q = supabase.from('tour_programs').select('*')
        if (filters.status) q = q.eq('status', filters.status)
        if (filters.from_date) q = q.gte('start_date', filters.from_date)
        if (filters.to_date) q = q.lte('start_date', filters.to_date)
        return q.order('start_date', { ascending: false })
    },

    async getTourById(tourId: string) {
        return supabase.from('tour_programs')
            .select('*')
            .eq('id', tourId)
            .single()
    },

    async createTour(payload: Record<string, any>) {
        return supabase.from('tour_programs')
            .insert(payload)
            .select()
            .single()
    },

    async updateTour(tourId: string, payload: Record<string, any>) {
        return supabase.from('tour_programs')
            .update(payload)
            .eq('id', tourId)
            .select()
            .single()
    },

    async deleteTour(tourId: string) {
        return supabase.from('tour_programs')
            .delete()
            .eq('id', tourId)
    },

    async getUpcomingTours() {
        const today = new Date().toISOString().split('T')[0]
        return supabase.from('tour_programs')
            .select('*')
            .gte('start_date', today)
            .eq('status', 'Scheduled')
            .order('start_date', { ascending: true })
    }
}



