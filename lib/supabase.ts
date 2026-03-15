import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL

const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '[supabase.ts] Supabase URL/key env var is missing.\n' +
        'Expected one of: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (preferred),\n' +
        'or fallback names VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY.\n' +
        'Make sure your .env file exists and restart the Vite dev server (npm run dev).'
    )
}

type SupabaseClientType = ReturnType<typeof createClient<Database>>
const globalScope = globalThis as { __mpConnectSupabase?: SupabaseClientType }

if (!globalScope.__mpConnectSupabase) {
    globalScope.__mpConnectSupabase = createClient<Database>(
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
}

export const supabase = globalScope.__mpConnectSupabase
