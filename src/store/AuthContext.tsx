import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  session: Session | null;
  supabaseUser: User | null;
  profile: AppProfile | null;
  globalRole: GlobalRole | null;
  clientRole: ClientRole | null;
  clientId: string | null;
  orgUnitId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loadError: string | null;
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
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * Carrega profile + roles do banco.
   * Retorna true se tudo OK, false se houve erro.
   */
  const loadUserData = useCallback(async (userId: string): Promise<boolean> => {
    setLoadError(null);

    try {
      console.log('[Auth] Carregando dados para:', userId);

      // 1. Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, global_role, is_active')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        console.error('[Auth] Perfil não encontrado:', profileError?.message);
        setLoadError('Perfil não encontrado no sistema.');
        return false;
      }

      setProfile(profileData);
      setGlobalRole(profileData.global_role);

      // Admin global: não precisa de client role
      if (profileData.global_role === 'platform_admin') {
        setClientRole(null);
        setClientId(null);
        setOrgUnitId(null);
        console.log('[Auth] ✅ Admin da plataforma carregado');
        return true;
      }

      // 2. Papel no cliente
      const { data: roleData, error: roleError } = await supabase
        .from('user_client_roles')
        .select('client_id, client_role')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (roleError) {
        console.error('[Auth] Erro ao buscar role:', roleError.message);
        setLoadError('Erro ao carregar papel do usuário.');
        return false;
      }

      if (roleData) {
        setClientRole(roleData.client_role);
        setClientId(roleData.client_id);

        // 3. Org unit (opcional)
        const { data: orgData } = await supabase
          .from('user_org_assignments')
          .select('org_unit_id')
          .eq('user_id', userId)
          .eq('client_id', roleData.client_id)
          .eq('is_primary', true)
          .limit(1)
          .maybeSingle();

        setOrgUnitId(orgData?.org_unit_id ?? null);
        console.log('[Auth] ✅ Cliente carregado:', roleData.client_role);
      } else {
        setClientRole(null);
        setClientId(null);
        setOrgUnitId(null);

        if (!profileData.global_role) {
          setLoadError('Usuário sem papel atribuído. Contate o administrador.');
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('[Auth] Erro inesperado:', err);
      setLoadError('Erro inesperado ao carregar dados.');
      return false;
    }
  }, []);

  function clearUserData() {
    setProfile(null);
    setGlobalRole(null);
    setClientRole(null);
    setClientId(null);
    setOrgUnitId(null);
    setLoadError(null);
  }

  // ── Inicialização + listener ───────────────────────────────
  useEffect(() => {
    let mounted = true;

    // 1. Recuperar sessão existente (reload / volta de aba)
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;

      if (s?.user) {
        setSession(s);
        setSupabaseUser(s.user);
        await loadUserData(s.user.id);
      }
      if (mounted) setIsLoading(false);
    });

    // 2. Listener — só reage a SIGNED_OUT e TOKEN_REFRESHED.
    //    SIGNED_IN é tratado exclusivamente por login() e getSession().
    //    Isso elimina 100% da race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        console.log('[Auth] onAuthStateChange:', event);

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setSupabaseUser(null);
          clearUserData();
          setIsLoading(false);
        }

        if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession);
          setSupabaseUser(newSession.user);
        }

        // SIGNED_IN e INITIAL_SESSION são IGNORADOS aqui de propósito.
        // login() e getSession() já cuidam de carregar os dados.
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  // ── Login ──────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    setLoadError(null);

    try {
      console.log('[Auth] Login:', email);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('[Auth] Falha auth:', error.message);
        setIsLoading(false);
        return { error: error.message };
      }

      if (!data.user || !data.session) {
        setIsLoading(false);
        return { error: 'Resposta inesperada do servidor.' };
      }

      // Setar sessão imediatamente
      setSession(data.session);
      setSupabaseUser(data.user);

      // Carregar dados — SEM concorrência porque onAuthStateChange não toca em SIGNED_IN
      const ok = await loadUserData(data.user.id);

      setIsLoading(false);

      if (!ok) {
        return { error: loadError || 'Erro ao carregar dados do usuário.' };
      }

      console.log('[Auth] ✅ Login completo');
      return { error: null };
    } catch (err) {
      console.error('[Auth] Erro inesperado:', err);
      setIsLoading(false);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  };

  // ── Logout ─────────────────────────────────────────────────

  const logout = async () => {
    await supabase.auth.signOut();
    clearUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        session, supabaseUser, profile,
        globalRole, clientRole, clientId, orgUnitId,
        isLoading, isAuthenticated: !!supabaseUser,
        loadError, login, logout,
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
