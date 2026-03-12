// hooks/useRailwayEQ.ts
import { supabase } from '@/lib/supabase'

export const railwayEQApi = {
    async lookupTrain(trainNumber: string) {
        return (supabase as any).from('train_master')
            .select('*').eq('train_number', trainNumber).single()
    },

    async submitRequest(payload: Record<string, any>) {
        // 1. Generate letter number
        const { data: letterNum } = await (supabase as any)
            .rpc('generate_eq_letter_number', { constituency: 'SMG' })

        // 2. Insert request
        const { data: eq, error } = await (supabase as any).from('railway_eq_requests')
            .insert({
                ...payload,
                letter_number: letterNum,
                status: 'PENDING_PA_APPROVAL'
            })
            .select()
            .single()

        if (error) throw error

        // 3. Generate draft letter PDF
        await supabase.functions.invoke('generate-eq-letter', {
            body: { eq_request_id: eq.eq_request_id }
        })

        return eq
    },

    async approveAndSign(eqId: string, signatureBase64: string) {
        return (supabase as any).functions.invoke('sign-eq-letter', {
            body: {
                eq_request_id: eqId,
                signature_base64: signatureBase64
            }
        })
    },

    async sendEmail(eqId: string) {
        return supabase.functions.invoke('send-eq-email', {
            body: { eq_request_id: eqId }
        })
    },

    async getQuotaStatus() {
        return (supabase as any).rpc('get_eq_quota_status')
    },

    async rejectRequest(eqId: string, reason: string) {
        return (supabase as any).from('railway_eq_requests').update({
            status: 'REJECTED',
            rejection_reason: reason
        }).eq('eq_request_id', eqId)
    },

    async getRequests(filters: Record<string, any> = {}) {
        let q = (supabase as any).from('railway_eq_requests').select('*')
        if (filters.status) q = q.eq('status', filters.status)
        return q.order('created_at', { ascending: false })
    },

    async getRequestById(eqId: string) {
        return (supabase as any).from('railway_eq_requests')
            .select('*')
            .eq('eq_request_id', eqId)
            .single()
    }
}




