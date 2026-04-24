import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  // Erro de carregamento (para exibir na UI)
  loadError: string | null;
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
  const [loadError, setLoadError] = useState<string | null>(null);

  // Ref para evitar chamadas concorrentes a loadUserData
  const loadingRef = useRef(false);
  // Ref para saber se o login() está controlando o fluxo (evitar duplicata no onAuthStateChange)
  const loginInProgressRef = useRef(false);

  // Carrega profile + roles após ter um user autenticado
  const loadUserData = useCallback(async (userId: string): Promise<boolean> => {
    // Guard contra chamadas concorrentes
    if (loadingRef.current) {
      console.log('[AuthContext] loadUserData já em andamento, ignorando chamada duplicada');
      return false;
    }
    loadingRef.current = true;
    setLoadError(null);

    try {
      console.log('[AuthContext] Carregando dados do usuário:', userId);

      // 1. Carregar profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, global_role, is_active')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        const msg = profileError?.message || 'Perfil não encontrado';
        console.error('[AuthContext] Falha ao carregar perfil:', msg);
        setLoadError('Usuário autenticado, mas perfil não encontrado no sistema.');
        loadingRef.current = false;
        return false;
      }

      console.log('[AuthContext] Perfil carregado:', profileData.email, 'role:', profileData.global_role);
      setProfile(profileData);
      setGlobalRole(profileData.global_role);

      // Se for platform_admin, não precisa carregar client role
      if (profileData.global_role === 'platform_admin') {
        setClientRole(null);
        setClientId(null);
        setOrgUnitId(null);
        console.log('[AuthContext] Admin da plataforma identificado. Dados carregados com sucesso.');
        loadingRef.current = false;
        return true;
      }

      // 2. Carregar papel no cliente (primeiro ativo)
      const { data: clientRoleData, error: roleError } = await supabase
        .from('user_client_roles')
        .select('client_id, client_role')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle(); // maybeSingle não lança erro se 0 rows

      if (roleError) {
        const msg = roleError.message;
        console.error('[AuthContext] Falha ao carregar papel do cliente:', msg);
        setLoadError('Erro ao carregar papel do usuário: ' + msg);
        loadingRef.current = false;
        return false;
      }

      if (clientRoleData) {
        console.log('[AuthContext] Papel do cliente:', clientRoleData.client_role, 'client_id:', clientRoleData.client_id);
        setClientRole(clientRoleData.client_role);
        setClientId(clientRoleData.client_id);

        // 3. Carregar unidade org primária (opcional, não bloqueia login)
        const { data: orgData } = await supabase
          .from('user_org_assignments')
          .select('org_unit_id')
          .eq('user_id', userId)
          .eq('client_id', clientRoleData.client_id)
          .eq('is_primary', true)
          .limit(1)
          .maybeSingle();

        setOrgUnitId(orgData?.org_unit_id ?? null);
      } else {
        console.warn('[AuthContext] Nenhum papel de cliente encontrado para este usuário');
        setClientRole(null);
        setClientId(null);
        setOrgUnitId(null);

        // Se não é admin e não tem role de cliente, informar
        if (!profileData.global_role) {
          setLoadError('Usuário sem papel atribuído. Contate o administrador.');
          loadingRef.current = false;
          return false;
        }
      }

      console.log('[AuthContext] Dados do usuário carregados com sucesso.');
      loadingRef.current = false;
      return true;
    } catch (err) {
      console.error('[AuthContext] Erro inesperado ao carregar dados:', err);
      setLoadError('Erro inesperado ao carregar dados do usuário.');
      loadingRef.current = false;
      return false;
    }
  }, []);

  // Limpa estado ao sair
  function clearUserData() {
    setProfile(null);
    setGlobalRole(null);
    setClientRole(null);
    setClientId(null);
    setOrgUnitId(null);
    setLoadError(null);
  }

  // Escuta mudanças de sessão (incluindo reload da página)
  useEffect(() => {
    // 1. Carregar sessão existente (ex: após reload)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setSupabaseUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        loadUserData(existingSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listener para mudanças de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[AuthContext] onAuthStateChange:', event);

        setSession(newSession);
        setSupabaseUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && loginInProgressRef.current) {
          // O login() já está cuidando de carregar os dados.
          // NÃO chamar loadUserData aqui para evitar race condition.
          console.log('[AuthContext] SIGNED_IN ignorado — login() está controlando o fluxo');
          return;
        }

        if (event === 'SIGNED_OUT') {
          clearUserData();
          setIsLoading(false);
          return;
        }

        // Para TOKEN_REFRESHED ou SIGNED_IN sem login ativo (ex: outra aba)
        if (newSession?.user && event !== 'INITIAL_SESSION') {
          await loadUserData(newSession.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ── Ações ───────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    setLoadError(null);
    loginInProgressRef.current = true;

    try {
      console.log('[AuthContext] Iniciando login para:', email);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('[AuthContext] Erro de autenticação:', error.message);
        setIsLoading(false);
        loginInProgressRef.current = false;
        return { error: error.message };
      }

      if (!data.user) {
        console.error('[AuthContext] Auth retornou sem user');
        setIsLoading(false);
        loginInProgressRef.current = false;
        return { error: 'Autenticação falhou: resposta inesperada.' };
      }

      // Setar sessão e user imediatamente
      setSession(data.session);
      setSupabaseUser(data.user);

      console.log('[AuthContext] Autenticação OK. Carregando dados...');

      // Carregar dados do usuário de forma síncrona ANTES de retornar
      const success = await loadUserData(data.user.id);

      if (!success) {
        console.error('[AuthContext] Login OK, mas falha ao carregar dados do usuário');
        // Não faz signOut — o usuário pode tentar de novo
        setIsLoading(false);
        loginInProgressRef.current = false;
        return { error: loadError || 'Erro ao carregar dados do usuário.' };
      }

      setIsLoading(false);
      loginInProgressRef.current = false;
      console.log('[AuthContext] Login completo com sucesso');
      return { error: null };
    } catch (err) {
      console.error('[AuthContext] Erro inesperado no login:', err);
      setIsLoading(false);
      loginInProgressRef.current = false;
      return { error: 'Erro inesperado. Tente novamente.' };
    }
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
        loadError,
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
