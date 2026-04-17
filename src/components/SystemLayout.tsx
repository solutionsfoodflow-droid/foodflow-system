import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { LogOut, LayoutDashboard, Settings } from 'lucide-react';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: ('admin' | 'cliente')[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.perfil)) {
    return <Navigate to="/sistema/painel" replace />; // Fallback to their allowed dashboard
  }

  return <Outlet />;
}

export function SystemLayout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-gray-50)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--color-dark)', color: 'var(--color-white)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/imgs/Logotipo_Perfil Instagram 01.png" alt="FoodFlow" style={{ height: '40px', borderRadius: '4px' }} />
        </div>
        <div style={{ padding: '1rem', flex: 1 }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--color-gray-medium)', marginBottom: '1rem' }}>Menu</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}>
              <LayoutDashboard size={18} /> Painel Geral
            </div>
            {user?.perfil === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-gray-medium)' }}>
                <Settings size={18} /> Configurações
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.nome.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.nome}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)' }}>{user?.perfil.toUpperCase()}</div>
            </div>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem 0' }}>
            <LogOut size={16} /> Sair do Sistema
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
