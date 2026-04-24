import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setIsLoading(true);
    setError('');

    const { error: loginError } = await login(email, password);

    if (loginError) {
      setError('E-mail ou senha inválidos.');
      setIsLoading(false);
    } else {
      navigate('/sistema/painel');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      backgroundImage: 'radial-gradient(circle at 15% 15%, rgba(43, 151, 193, 0.08) 0%, transparent 40%), radial-gradient(circle at 85% 85%, rgba(50, 204, 61, 0.08) 0%, transparent 40%)'
    }}>
      <div className="card" style={{
        maxWidth: '420px',
        width: '100%',
        border: 'none',
        borderRadius: '20px',
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <img src="/imgs/Logotipo_Perfil Instagram 01.png" alt="FoodFlow Icon" style={{ height: '56px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.75rem', color: 'var(--color-dark)', margin: 0, fontWeight: 700 }}>FoodFlow</h1>
          </div>
          <h2 style={{ color: 'var(--color-dark)', fontSize: '1.25rem', marginBottom: '0.25rem', fontWeight: 600 }}>Acesso ao Sistema</h2>
          <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.95rem' }}>Insira suas credenciais corporativas</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ color: '#d32f2f', fontSize: '0.875rem', textAlign: 'center', background: '#ffebee', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.875rem 1rem', background: '#fff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
            <Mail size={18} style={{ color: 'var(--color-gray-medium)', marginRight: '0.75rem', flexShrink: 0 }} />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', background: 'transparent', color: 'var(--color-dark)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.875rem 1rem', background: '#fff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
            <Lock size={18} style={{ color: 'var(--color-gray-medium)', marginRight: '0.75rem', flexShrink: 0 }} />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', background: 'transparent', color: 'var(--color-dark)' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              justifyContent: 'center',
              background: isLoading ? '#94a3b8' : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '1.05rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 20px rgba(43, 151, 193, 0.25)',
              transition: 'all 0.3s ease',
            }}
          >
            {isLoading ? 'Entrando...' : <> Entrar <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
