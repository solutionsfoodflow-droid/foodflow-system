import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { ArrowRight, Lock, User } from 'lucide-react';

export default function Login() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const { login: doLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !senha) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    const success = doLogin(login, senha);
    if (success) {
      navigate('/sistema/painel'); // Will route according to profile in ProtectedRoute or Dashboards
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-gray-50)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', borderTop: '4px solid var(--color-primary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/imgs/Logotipo_Perfil Instagram 01.png" alt="FoodFlow Solutions" style={{ height: '48px', marginBottom: '1rem', borderRadius: '6px' }} />
          <h2 style={{ color: 'var(--color-dark)', fontSize: '1.5rem' }}>Acesso ao Sistema</h2>
          <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem' }}>Insira suas credenciais corporativas</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && <div style={{ color: 'red', fontSize: '0.85rem', textAlign: 'center', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-gray-medium)', borderRadius: '4px', padding: '0.5rem 1rem' }}>
              <User size={18} style={{ color: 'var(--color-gray-medium)', marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Login" 
                value={login}
                onChange={e => setLogin(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-gray-medium)', borderRadius: '4px', padding: '0.5rem 1rem' }}>
              <Lock size={18} style={{ color: 'var(--color-gray-medium)', marginRight: '0.5rem' }} />
              <input 
                type="password" 
                placeholder="Senha" 
                value={senha}
                onChange={e => setSenha(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Entrar <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-gray-medium)' }}>
          Credenciais MVP:<br/>
          admin : admin<br/>
          cliente1 : cliente1<br/>
          cliente2 : cliente2
        </div>
      </div>
    </div>
  );
}
