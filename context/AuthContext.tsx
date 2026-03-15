
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string; role?: UserRole }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function withTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Your Supabase project may be waking up — please try again in 30 seconds.')), ms)
    ),
  ]);
}

function dbRoleToUserRole(dbRole: string): UserRole {
  switch (dbRole) {
    case 'MP': return UserRole.MP;
    case 'PA': return UserRole.PA;
    case 'OFFICE_STAFF':
    case 'FIELD_STAFF': return UserRole.STAFF;
    case 'CITIZEN': return UserRole.CITIZEN;
    default: return UserRole.CITIZEN;
  }
}

function userRoleToDbRole(role: UserRole): 'MP' | 'PA' | 'OFFICE_STAFF' | 'FIELD_STAFF' | 'CITIZEN' {
  switch (role) {
    case UserRole.MP: return 'MP';
    case UserRole.PA: return 'PA';
    case UserRole.STAFF: return 'OFFICE_STAFF';
    default: return 'CITIZEN';
  }
}

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('email not confirmed'))
    return 'This account exists but email is unconfirmed. Delete it in Supabase Dashboard → Authentication → Users, then sign up again.';
  if (m.includes('user already registered') || m.includes('already registered'))
    return 'An account with this email already exists. Try signing in, or delete the old account in Supabase Dashboard and re-register.';
  if (m.includes('invalid login credentials') || m.includes('invalid credentials') || m.includes('invalid email or password'))
    return 'Incorrect email or password. If you just signed up, try signing in now.';
  if (m.includes('rate limit') || m.includes('email rate'))
    return 'Too many attempts. Please wait a minute and try again.';
  if (m.includes('unable to validate') || m.includes('422'))
    return 'Signup failed. This email may already have an unconfirmed account — delete it in Supabase Dashboard → Authentication → Users and try again.';
  return message;
}

async function buildUserFromSession(session: Session): Promise<User | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileError) {
    console.warn('[auth] profile lookup failed, falling back to auth metadata:', profileError.message);
  }

  // Profile may not exist yet (trigger delay) — build a minimal one from session metadata
  const meta = session.user.user_metadata;
  const role = (profile as any)?.role ?? meta?.role ?? 'CITIZEN';
  const name = (profile as any)?.full_name ?? meta?.full_name ?? session.user.email ?? 'User';
  const constituency = (profile as any)?.constituency ?? meta?.constituency ?? 'Northeast Delhi';

  return {
    id: session.user.id,
    name,
    role: dbRoleToUserRole(role),
    constituency,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);
  const sessionLoadIdRef = useRef(0);

  const resolveSessionUser = useCallback(async (session: Session) => {
    const loadId = ++sessionLoadIdRef.current;
    const appUser = await buildUserFromSession(session);
    if (!isMountedRef.current || loadId !== sessionLoadIdRef.current) {
      return null;
    }
    setUser(appUser);
    return appUser;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const bootstrapSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[auth] getSession failed during bootstrap:', error.message);
        }
        if (!isMountedRef.current) return;

        if (session) {
          await resolveSessionUser(session);
        } else {
          setUser(null);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        if (!isMountedRef.current) return;

        if (event === 'SIGNED_OUT' || !session) {
          sessionLoadIdRef.current += 1;
          setUser(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        void resolveSessionUser(session)
          .catch((error) => {
            console.warn('[auth] session resolution failed:', error instanceof Error ? error.message : String(error));
            if (isMountedRef.current) {
              setUser(null);
            }
          })
          .finally(() => {
            if (isMountedRef.current) {
              setIsLoading(false);
            }
          });
      }, 0);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [resolveSessionUser]);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
    try {
      const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
      if (error) return { error: friendlyError(error.message) };
      if (data.session) {
        const appUser = await resolveSessionUser(data.session);
        if (appUser) return { role: appUser.role };
      }
      return {};
    } catch (e: any) {
      return { error: e?.message ?? 'Login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ): Promise<{ error?: string; needsEmailConfirmation?: boolean }> => {
    try {
      const dbRole = userRoleToDbRole(role);

      const { data, error } = await withTimeout(supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: dbRole } },
      }), 30000);

      if (error) return { error: friendlyError(error.message) };
      if (!data.user) return { error: 'Signup failed. Please try again.' };

      // Supabase returns an empty identities array when the email already exists
      // (it silently ignores duplicate signups to prevent enumeration).
      if (data.user.identities && data.user.identities.length === 0) {
        return { error: 'An account with this email already exists but is unconfirmed. Go to Supabase Dashboard → Authentication → Users, delete it, and sign up again.' };
      }

      // Fire-and-forget upsert — the DB trigger usually creates this first;
      // upsert with ignoreDuplicates avoids 409 conflicts.
      supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        role: dbRole,
      }, { onConflict: 'id', ignoreDuplicates: true }).then(() => {/* ignore */});

      if (data.session) return {};
      return { needsEmailConfirmation: true };
    } catch (e: any) {
      return { error: e?.message ?? 'Signup failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn('[auth] useAuth called before AuthProvider was ready; returning safe fallback context.');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => ({ error: 'Auth provider not ready yet.' }),
      signup: async () => ({ error: 'Auth provider not ready yet.' }),
      logout: async () => { },
    };
  }
  return context;
};
