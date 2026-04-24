import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { GlobalRole, ClientRole } from '../types/database';

// ── Tipos ────────────────────────────────────────────────────

export interface AppProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  global_role: GlobalRole | null;
  is_active: boolean;
}

export interface AuthContextType {
  // Supabase session/user
  session: Session | null;
  supabaseUser: User | null;
  // App profile
  profile: AppProfile | null;
  // Role resolved
  globalRole: GlobalRole | null;   // platform_admin | null
  clientRole: ClientRole | null;   // papel dentro do cliente
  clientId: string | null;         // ID do cliente vinculado
  orgUnitId: string | null;        // unidade org primária
  // Estado
  isLoading: boolean;
  isAuthenticated: boolean;
  // Ações
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [globalRole, setGlobalRole] = useState<GlobalRole | null>(null);
  const [clientRole, setClientRole] = useState<ClientRole | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [orgUnitId, setOrgUnitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega profile + roles após ter um user autenticado
  async function loadUserData(userId: string) {
    try {
      // 1. Carregar profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, global_role, is_active')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        console.error('Failed to load profile:', profileError);
        return;
      }

      setProfile(profileData);
      setGlobalRole(profileData.global_role);

      // Se for platform_admin, não precisa carregar client role
      if (profileData.global_role === 'platform_admin') {
        setClientRole(null);
        setClientId(null);
        setOrgUnitId(null);
        return;
      }

      // 2. Carregar papel no cliente (primeiro ativo)
      const { data: clientRoleData } = await supabase
        .from('user_client_roles')
        .select('client_id, client_role')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (clientRoleData) {
        setClientRole(clientRoleData.client_role);
        setClientId(clientRoleData.client_id);

        // 3. Carregar unidade org primária
        const { data: orgData } = await supabase
          .from('user_org_assignments')
          .select('org_unit_id')
          .eq('user_id', userId)
          .eq('client_id', clientRoleData.client_id)
          .eq('is_primary', true)
          .limit(1)
          .single();

        setOrgUnitId(orgData?.org_unit_id ?? null);
      }
    } catch (err) {
      console.error('Unexpected error loading user data:', err);
    }
  }

  // Limpa estado ao sair
  function clearUserData() {
    setProfile(null);
    setGlobalRole(null);
    setClientRole(null);
    setClientId(null);
    setOrgUnitId(null);
  }

  // Escuta mudanças de sessão (incluindo reload da página)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          clearUserData();
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Ações ───────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    clearUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        supabaseUser,
        profile,
        globalRole,
        clientRole,
        clientId,
        orgUnitId,
        isLoading,
        isAuthenticated: !!supabaseUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
