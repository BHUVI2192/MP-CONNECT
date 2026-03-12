// hooks/usePhotoGallery.ts
import { supabase } from '@/lib/supabase'

export const photoGalleryApi = {
    async listAlbums(publicOnly = false) {
        let q = (supabase as any).from('photo_gallery_albums')
            .select('*, photo_gallery_photos(photo_id, storage_path, display_order)')
            .order('event_date', { ascending: false })

        if (publicOnly) q = q.eq('is_public', true)

        return q
    },

    async createAlbum(payload: Record<string, any>) {
        return (supabase as any)
            .from('photo_gallery_albums')
            .insert(payload)
            .select()
            .single()
    },

    async updateAlbum(galleryId: string, updates: Record<string, any>) {
        return (supabase as any)
            .from('photo_gallery_albums')
            .update(updates)
            .eq('gallery_id', galleryId)
            .select()
            .single()
    },

    async uploadPhoto(galleryId: string, file: File) {
        const path = `gallery/${galleryId}/${Date.now()}_${file.name}`
        await supabase.storage.from('photo-gallery').upload(path, file)

        return (supabase as any).from('photo_gallery_photos').insert({
            gallery_id: galleryId,
            storage_path: path,
            file_name: file.name,
            file_size: file.size
        })
    },

    async deletePhoto(photoId: string, storagePath?: string) {
        if (storagePath) {
            await supabase.storage.from('photo-gallery').remove([storagePath])
        }

        return (supabase as any)
            .from('photo_gallery_photos')
            .delete()
            .eq('photo_id', photoId)
    },

    getPhotoUrl(path: string) {
        return supabase.storage.from('photo-gallery').getPublicUrl(path).data.publicUrl
    }
}



