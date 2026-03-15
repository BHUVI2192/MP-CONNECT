// hooks/useRailwayEQ.ts
import { supabase } from '@/lib/supabase'

async function getFunctionHeaders() {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const accessToken = sessionData.session?.access_token
    if (!accessToken) {
        throw new Error('No active authenticated session found. Please sign in again.')
    }

    const anonKey =
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.SUPABASE_ANON_KEY ||
        import.meta.env.SUPABASE_PUBLISHABLE_KEY

    return {
        Authorization: `Bearer ${accessToken}`,
        ...(anonKey ? { apikey: anonKey } : {}),
    }
}

export const railwayEQApi = {
    async getLetterDownloadUrl(letterPath: string, expiresIn = 3600) {
        const normalized = letterPath.trim()
        if (!normalized) return { data: { signedUrl: '' }, error: new Error('Letter path is empty') }
        return supabase.storage
            .from('eq-letters')
            .createSignedUrl(normalized, expiresIn)
    },

    async lookupTrain(trainNumber: string) {
        const normalized = trainNumber.trim()
        return supabase
            .from('train_master')
            .select('*')
            .eq('train_number', normalized)
            .maybeSingle()
    },

    async submitRequest(payload: Record<string, any>) {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!userData.user) throw new Error('You must be signed in to submit EQ requests')

        // 1. Generate letter number
        const { data: letterNum } = await (supabase as any)
            .rpc('generate_eq_letter_number', { constituency: 'SMG' })

        // 2. Insert request
        const insertPayload = {
            ...payload,
            // Some deployed schemas still require traveler_name instead of applicant_name.
            traveler_name: payload.traveler_name ?? payload.applicant_name ?? '',
            // DB enforces NOT NULL on pnr_number; keep optional UX by storing empty string when omitted.
            pnr_number: payload.pnr_number ?? '',
            submitted_by: userData.user.id,
            letter_number: letterNum,
            status: 'PENDING_PA_APPROVAL'
        }

        let { data: eq, error } = await (supabase.from('railway_eq_requests') as any)
            .insert(insertPayload)
            .select()
            .single()

        // Some environments use a constrained division lookup table; fallback to NULL keeps request creation unblocked.
        if (error && error.code === '23503' && String(error.message ?? '').includes('division_fkey')) {
            ({ data: eq, error } = await (supabase.from('railway_eq_requests') as any)
                .insert({ ...insertPayload, division: null })
                .select()
                .single())
        }

        if (error) throw error

        // 3. Generate draft letter PDF
        const headers = await getFunctionHeaders()
        const { error: letterError } = await supabase.functions.invoke('generate-eq-letter', {
            headers,
            body: { eq_request_id: (eq as any).id }
        })

        if (letterError) {
            // Draft generation is best-effort; request creation must still succeed.
            console.warn('[EQ] generate-eq-letter failed, continuing with created request:', letterError)
        }

        return eq
    },

    async approveAndSign(eqId: string, signatureBase64: string) {
        const headers = await getFunctionHeaders()
        return supabase.functions.invoke('sign-eq-letter', {
            headers,
            body: {
                eq_request_id: eqId,
                signature_base64: signatureBase64
            }
        })
    },

    async sendEmail(eqId: string) {
        const headers = await getFunctionHeaders()
        return supabase.functions.invoke('send-eq-email', {
            headers,
            body: { eq_request_id: eqId }
        })
    },

    async markApproved(eqId: string, patch: { letter_number?: string; letter_path?: string | null } = {}) {
        let result = await ((supabase.from('railway_eq_requests') as any)
            .update({
                status: 'APPROVED',
                letter_number: patch.letter_number,
                letter_path: patch.letter_path ?? null,
            })
            .eq('id', eqId)
            .select()
            .single()) as any

        if (result.error && String(result.error.message ?? '').includes('column railway_eq_requests.id does not exist')) {
            result = await ((supabase.from('railway_eq_requests') as any)
                .update({
                    status: 'APPROVED',
                    letter_number: patch.letter_number,
                    letter_path: patch.letter_path ?? null,
                })
                .eq('eq_request_id', eqId)
                .select()
                .single()) as any
        }

        return result
    },

    async getQuotaStatus() {
        return supabase.rpc('get_eq_quota_status')
    },

    async rejectRequest(eqId: string, reason: string) {
        let result = await (supabase.from('railway_eq_requests') as any).update({
            status: 'REJECTED',
            rejection_reason: reason
        }).eq('id', eqId)

        if (result.error && String(result.error.message ?? '').includes('column railway_eq_requests.id does not exist')) {
            result = await (supabase.from('railway_eq_requests') as any).update({
                status: 'REJECTED',
                rejection_reason: reason
            }).eq('eq_request_id', eqId)
        }

        return result
    },

    async getRequests(filters: Record<string, any> = {}) {
        let q = supabase.from('railway_eq_requests').select('*')
        if (filters.status) q = q.eq('status', filters.status)
        return q.order('created_at', { ascending: false })
    },

    async getRequestById(eqId: string) {
        let result = await supabase.from('railway_eq_requests')
            .select('*')
            .eq('id', eqId)
            .single()

        if (result.error && String(result.error.message ?? '').includes('column railway_eq_requests.id does not exist')) {
            result = await supabase.from('railway_eq_requests')
                .select('*')
                .eq('eq_request_id', eqId)
                .single()
        }

        return result
    }
}




