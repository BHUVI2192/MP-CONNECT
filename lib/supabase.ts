import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(
    supabaseUrl!,
    supabaseAnonKey!,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
        realtime: { params: { eventsPerSecond: 20 } },
    }
)

// Server-side admin client (Edge Functions / API routes only)
export const supabaseAdmin = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY!, // Fallback for safety in client bundles if mis-imported
    { auth: { autoRefreshToken: false, persistSession: false } }
)
