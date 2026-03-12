// hooks/useDevelopmentWorks.ts
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type DevelopmentWork = Database['public']['Tables']['development_works']['Row']
type DevelopmentWorkInsert = Database['public']['Tables']['development_works']['Insert']
type DevelopmentWorkUpdate = Database['public']['Tables']['development_works']['Update']

export const devWorksApi = {
    async list(filters: Record<string, any> = {}) {
        let q = (supabase as any).from('development_works').select('*, development_work_media(*)')

        if (filters.sector) q = q.eq('sector', filters.sector)
        if (filters.zilla) q = q.eq('zilla', filters.zilla)
        if (filters.taluk) q = q.eq('taluk', filters.taluk)
        if (filters.gram_panchayat) q = q.eq('gram_panchayat', filters.gram_panchayat)
        if (filters.village) q = q.eq('village', filters.village)
        if (filters.status) q = q.eq('status', filters.status)
        if (filters.work_type) q = q.eq('work_type', filters.work_type)
        if (filters.is_public !== undefined) q = q.eq('is_public', filters.is_public)

        return q.is('deleted_at', null).order('created_at', { ascending: false })
    },

    async getById(workId: string) {
        return (supabase as any)
            .from('development_works')
            .select('*, development_work_media(*), profiles:created_by(full_name, email)')
            .eq('work_id', workId)
            .is('deleted_at', null)
            .single()
    },

    async search(query: string) {
        return (supabase as any).from('development_works')
            .select('*, development_work_media(*)')
            .textSearch('fts', query, { type: 'plain', config: 'english' })
            .is('deleted_at', null)
    },

    async create(work: DevelopmentWorkInsert) {
        return (supabase as any)
            .from('development_works')
            .insert(work)
            .select()
            .single()
    },

    async update(workId: string, updates: DevelopmentWorkUpdate) {
        return (supabase as any)
            .from('development_works')
            .update(updates)
            .eq('work_id', workId)
            .select()
            .single()
    },

    async delete(workId: string) {
        return (supabase as any)
            .from('development_works')
            .update({ deleted_at: new Date().toISOString() })
            .eq('work_id', workId)
    },

    async uploadMedia(workId: string, file: File, mediaType: 'PHOTO' | 'VIDEO') {
        const ext = file.name.split('.').pop()
        const path = `development-works/${workId}/${mediaType.toLowerCase()}s/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('dev-works-media').upload(path, file)
        
        if (uploadError) throw uploadError

        return (supabase as any).from('development_work_media').insert({
            work_id: workId,
            media_type: mediaType,
            storage_path: path,
            file_name: file.name,
            file_size: file.size
        })
    },

    async getMediaUrl(storagePath: string) {
        const { data } = supabase.storage.from('dev-works-media').getPublicUrl(storagePath)
        return data.publicUrl
    }
}




