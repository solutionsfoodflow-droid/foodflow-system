import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import Home from './pages/Home';
import Login from './pages/System/Login';
import { ProtectedRoute, SystemLayout } from './components/SystemLayout';
import AdminDashboard from './pages/System/AdminDashboard';
import ClientDashboard from './pages/System/ClientDashboard';
import CultureForm from './pages/System/Forms/CultureForm';
import TemperamentForm from './pages/System/Forms/TemperamentForm';

// Redireciona para o painel correto após login baseado no role real
function DashboardRouter() {
  const { globalRole, clientRole, clientId, isLoading } = useAuth();

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Carregando...</div>;

  if (globalRole === 'platform_admin') {
    return <Navigate to="/sistema/admin" replace />;
  }

  if (clientRole && clientId) {
    // CEO, manager, coordinator, supervisor e respondent todos vão para o painel do cliente
    return <Navigate to={`/sistema/cliente/${clientId}`} replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<Home />} />

          {/* Public Forms — acessados via QR Code com token */}
          <Route path="/form/cultura/:token" element={<CultureForm />} />
          <Route path="/form/temperamento/:token" element={<TemperamentForm />} />

          {/* System Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/sistema" element={<Navigate to="/login" replace />} />

          {/* Protected System Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Router automático por role */}
            <Route path="/sistema/painel" element={<DashboardRouter />} />

            <Route element={<SystemLayout />}>
              {/* Platform Admin */}
              <Route element={<ProtectedRoute requireGlobalRole="platform_admin" />}>
                <Route path="/sistema/admin" element={<AdminDashboard />} />
              </Route>

              {/* Client Users (todos os roles de cliente) */}
              <Route element={<ProtectedRoute requireClientUser />}>
                <Route path="/sistema/cliente/:clientId" element={<ClientDashboard />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
