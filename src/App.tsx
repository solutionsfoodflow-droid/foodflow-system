import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import Home from './pages/Home';
import Login from './pages/System/Login';
import { ProtectedRoute, SystemLayout } from './components/SystemLayout';
import AdminDashboard from './pages/System/AdminDashboard';
import ClientDashboard from './pages/System/ClientDashboard';
import CultureForm from './pages/System/Forms/CultureForm';
import TemperamentForm from './pages/System/Forms/TemperamentForm';

import { useAuth } from './store/AuthContext';

function DashboardRouter() {
  const { user } = useAuth();
  
  if (user?.perfil === 'admin') {
    return <Navigate to="/sistema/admin" replace />;
  } else if (user?.perfil === 'cliente') {
    return <Navigate to={`/sistema/cliente/${user.clienteId}`} replace />;
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
          
          {/* Public Forms (Accessed via QR) */}
          <Route path="/form/cultura/:slug" element={<CultureForm />} />
          <Route path="/form/temperamento/:slug" element={<TemperamentForm />} />

          {/* System Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/sistema" element={<Navigate to="/login" replace />} />

          {/* Protected System Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/sistema/painel" element={<DashboardRouter />} />

            <Route element={<SystemLayout />}>
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/sistema/admin" element={<AdminDashboard />} />
                <Route path="/sistema/admin/qr/:clienteId" element={<div>Redirecionando para visualização mockada dos QRs do admin... <br/>(Neste MVP os QRs também ficam visíveis no painel do cliente)</div>} />
              </Route>

              {/* Client Routes */}
              <Route element={<ProtectedRoute allowedRoles={['cliente']} />}>
                <Route path="/sistema/cliente/:clienteId" element={<ClientDashboard />} />
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
