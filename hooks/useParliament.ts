// hooks/useParliament.ts
import { supabase } from '@/lib/supabase'

export const parliamentApi = {
    async getDashboardStats() {
        return supabase.rpc('get_parliament_stats')
    },

    async getLetters(filters: Record<string, any> = {}) {
        let q = supabase.from('parliament_letters').select('*')
        if (filters.status) q = q.eq('status', filters.status)
        if (filters.ministry) q = q.eq('ministry', filters.ministry)
        return q.order('sent_date', { ascending: false })
    },

    async getOverdueLetters() {
        return supabase.from('parliament_letters')
            .select('*')
            .lt('expected_response_date', new Date().toISOString().split('T')[0])
            .not('status', 'in', '(REPLIED,CLOSED)')
            .order('expected_response_date')
    },

    async addAnswer(questionId: string, payload: Record<string, any>) {
        return supabase.from('parliament_answers')
            .insert({ question_id: questionId, ...payload })
    },

    async getQuestions(filters: Record<string, any> = {}) {
        let q = supabase.from('parliament_questions').select('*')
        if (filters.status) q = q.eq('status', filters.status)
        if (filters.ministry) q = q.eq('ministry', filters.ministry)
        if (filters.type) q = q.eq('type', filters.type)
        return q.order('session_date', { ascending: false })
    },

    async getQuestionById(id: string) {
        return supabase.from('parliament_questions')
            .select('*')
            .eq('id', id)
            .single()
    }
}



