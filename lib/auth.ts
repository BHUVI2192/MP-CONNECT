import { supabase } from './supabase'

/**
 * Retrieves the current user's role from the JWT custom claims.
 * The role is injected into the JWT via the 'custom_access_token_hook' on the server.
 */
export async function getUserRole(): Promise<string | null> {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) return null

    // Custom claims are stored in the user_metadata or app_metadata 
    // depending on how the hook is configured, but usually event.claims 
    // in Supabase hooks map to session.user.app_metadata or user_metadata.
    // Based on the prompt hook: claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    return (session.user.app_metadata?.user_role as string) || (session.user.user_metadata?.user_role as string) || null
}

/**
 * Helper to enforce role requirements for specific actions or routes.
 * @param roles List of allowed roles
 * @throws Error if the user is unauthorized
 */
export async function requireRole(...roles: string[]) {
    const role = await getUserRole()
    if (!role || !roles.includes(role)) {
        throw new Error('Unauthorized: Insufficient permissions')
    }
    return role
}
