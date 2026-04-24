import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogOut, LayoutDashboard, Settings, Users, BarChart2, FileText } from 'lucide-react';
import type { GlobalRole } from '../types/database';

// ── ProtectedRoute ───────────────────────────────────────────

interface ProtectedRouteProps {
  requireGlobalRole?: GlobalRole;
  requireClientUser?: boolean; // qualquer role de cliente
}

export function ProtectedRoute({ requireGlobalRole, requireClientUser }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, globalRole, clientRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--color-gray-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
          <p style={{ color: 'var(--color-gray-medium)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireGlobalRole && globalRole !== requireGlobalRole) {
    return <Navigate to="/sistema/painel" replace />;
  }

  if (requireClientUser && !clientRole) {
    return <Navigate to="/sistema/painel" replace />;
  }

  return <Outlet />;
}

// ── Sidebar items por role ───────────────────────────────────

function getSidebarItems(globalRole: string | null, clientRole: string | null) {
  if (globalRole === 'platform_admin') {
    return [
      { icon: <LayoutDashboard size={18} />, label: 'Painel Geral', path: '/sistema/admin' },
      { icon: <Users size={18} />, label: 'Clientes', path: '/sistema/admin' },
      { icon: <Settings size={18} />, label: 'Configurações', path: '/sistema/admin' },
    ];
  }

  const base = [{ icon: <LayoutDashboard size={18} />, label: 'Painel', path: '' }];

  if (clientRole === 'client_ceo') {
    return [
      ...base,
      { icon: <BarChart2 size={18} />, label: 'Dashboards', path: '' },
      { icon: <FileText size={18} />, label: 'Relatórios', path: '' },
    ];
  }

  if (clientRole === 'client_manager') {
    return [
      ...base,
      { icon: <BarChart2 size={18} />, label: 'Minha Gerência', path: '' },
    ];
  }

  if (clientRole === 'client_coordinator') {
    return [
      ...base,
      { icon: <BarChart2 size={18} />, label: 'Minha Coordenação', path: '' },
    ];
  }

  if (clientRole === 'client_supervisor') {
    return [
      ...base,
      { icon: <BarChart2 size={18} />, label: 'Minha Equipe', path: '' },
    ];
  }

  return base;
}

function getRoleLabel(globalRole: string | null, clientRole: string | null): string {
  if (globalRole === 'platform_admin') return 'Admin da Plataforma';
  if (clientRole === 'client_ceo') return 'CEO';
  if (clientRole === 'client_manager') return 'Gerente';
  if (clientRole === 'client_coordinator') return 'Coordenador';
  if (clientRole === 'client_supervisor') return 'Supervisor';
  if (clientRole === 'employee_respondent') return 'Colaborador';
  return '';
}

// ── SystemLayout ─────────────────────────────────────────────

export function SystemLayout() {
  const { profile, globalRole, clientRole, clientId, logout } = useAuth();
  const params = useParams<{ clientId?: string }>();
  const activeClientId = params.clientId ?? clientId;

  const sidebarItems = getSidebarItems(globalRole, clientRole);
  const roleLabel = getRoleLabel(globalRole, clientRole);
  const initials = profile?.full_name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-gray-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--color-dark)',
        color: 'var(--color-white)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img
            src="/imgs/Logotipo_Perfil Instagram 01.png"
            alt="FoodFlow"
            style={{ height: '40px', borderRadius: '4px' }}
          />
        </div>

        {/* Client info for client users */}
        {activeClientId && globalRole !== 'platform_admin' && (
          <ClientBrandingHeader clientId={activeClientId} />
        )}

        {/* Nav items */}
        <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Menu</p>
          {sidebarItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.65rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                background: i === 0 ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: i === 0 ? 'white' : 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                transition: 'background 0.15s',
              }}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1rem', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name ?? profile?.email ?? '—'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                {roleLabel}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none',
              color: '#ff6b6b', cursor: 'pointer', fontSize: '0.875rem',
              padding: '0.4rem 0',
            }}
          >
            <LogOut size={15} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}

// ── Client Branding Header ───────────────────────────────────
// Mostra logo + nome do cliente na sidebar

function ClientBrandingHeader({ clientId }: { clientId: string }) {
  const [clientName, setClientName] = React.useState<string>('');
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase
      .from('clients')
      .select('name, client_branding(logo_url)')
      .eq('id', clientId)
      .single()
      .then(({ data }) => {
        if (data) {
          setClientName(data.name);
          const branding = Array.isArray(data.client_branding) ? data.client_branding[0] : data.client_branding;
          setLogoUrl(branding?.logo_url ?? null);
        }
      });
  }, [clientId]);

  if (!clientName) return null;

  return (
    <div style={{
      padding: '0.75rem 1rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: '0.6rem',
    }}>
      {logoUrl ? (
        <img src={logoUrl} alt={clientName} style={{ height: '28px', borderRadius: '4px', objectFit: 'contain' }} />
      ) : (
        <div style={{
          width: '28px', height: '28px', borderRadius: '4px',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', fontWeight: 700,
        }}>
          {clientName.charAt(0)}
        </div>
      )}
      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
        {clientName}
      </span>
    </div>
  );
}

import React from 'react';
import { supabase } from '../lib/supabase';
