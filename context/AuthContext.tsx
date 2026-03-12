
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, role, constituency')
    .eq('id', session.user.id)
    .single();

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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const appUser = await buildUserFromSession(session);
        setUser(appUser);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const appUser = await buildUserFromSession(session);
        setUser(appUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
    try {
      const { data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
      if (error) return { error: friendlyError(error.message) };
      if (data.session) {
        const appUser = await buildUserFromSession(data.session);
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
      (supabase as any).from('profiles').upsert({
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
