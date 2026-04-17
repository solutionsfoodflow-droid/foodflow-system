import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../store/mockDB';
import type { Client, TemperamentQuestion, Role, TemperamentResponse } from '../../../store/mockDB';
import { CheckCircle, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function TemperamentForm() {
  const { slug } = useParams<{ slug: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [questions, setQuestions] = useState<TemperamentQuestion[]>([]);
  
  // Form State
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [nivel, setNivel] = useState<Role>('operacional');
  const [setor, setSetor] = useState('');
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState<any>(null); // To store profile counts

  useEffect(() => {
    if (slug) {
      const c = api.getClientBySlug(slug);
      if (c) {
        setClient(c);
        // Using global temperament questions mock
        setQuestions(api.getTemperamentQuestions());
      }
    }
  }, [slug]);

  const handleNotaChange = (qId: string, value: number) => {
    setRespostas(prev => ({
      ...prev,
      [qId]: value
    }));
  };

  const calculateProfile = (resp: Record<string, number>) => {
    // Simple mock calculation: sum scores grouped by associated profile
    const scores = {
      executor: 0,
      comunicador: 0,
      planejador: 0,
      analista: 0
    };
    
    questions.forEach(q => {
      if (resp[q.id]) {
        scores[q.perfilAssociado] += resp[q.id];
      }
    });

    return scores;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const allAnswered = questions.every(q => respostas[q.id] > 0);
    if (!allAnswered || !nome) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const scores = calculateProfile(respostas);
    
    // Find dominant profile
    let dominant = 'N/A';
    let max = -1;
    Object.entries(scores).forEach(([k, v]) => {
      if (v > max) { max = v; dominant = k; }
    });

    const payload: Omit<TemperamentResponse, 'id' | 'data'> = {
      clienteId: client.id,
      respondenteNome: nome,
      cargo,
      nivel,
      setor,
      respostas,
      resultadoCalculado: dominant
    };

    api.saveTemperamentResponse(payload);
    setCalculatedResult({ scores, dominant });
    setIsSubmitted(true);
  };

  if (!client) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando formulário...</div>;

  if (isSubmitted && calculatedResult) {
    const dataBar = Object.entries(calculatedResult.scores).map(([k, v]) => ({
      perfil: k.charAt(0).toUpperCase() + k.slice(1),
      pontuacao: v
    }));

    return (
      <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '2rem 1rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card text-center" style={{ marginBottom: '2rem' }}>
            <CheckCircle size={48} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem auto' }} />
            <h2 style={{ color: 'var(--color-dark)', marginBottom: '0.5rem' }}>Perfil Identificado: <span style={{ color: 'var(--color-primary)' }}>{calculatedResult.dominant.toUpperCase()}</span></h2>
            <p style={{ color: 'var(--color-gray-medium)' }}>Este é o seu perfil predominante com base nas respostas.</p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-dark)', textAlign: 'center' }}>Distribuição do seu Temperamento</h3>
            
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBar} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="perfil" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="pontuacao" fill="#f39c12" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-gray-dark)', fontSize: '0.9rem' }}>
              Os resultados foram enviados para consolidação junto a sua unidade.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--color-dark)', padding: '2rem', textAlign: 'center', color: '#fff' }}>
            {client.logoUrl ? (
              <img src={client.logoUrl} alt={client.nome} style={{ height: '50px', marginBottom: '1rem', background: '#fff', padding: '4px', borderRadius: '4px' }} />
            ) : (
              <Activity size={48} style={{ color: '#f39c12', margin: '0 auto 1rem auto' }} />
            )}
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Autoavaliação de Temperamento</h1>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-gray-medium)' }}>{client.nome}</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
             <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#f39c12', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Identificação Opcional para Mapeamento</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', opacity: 0.9 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-gray-dark)' }}>Nome Completo *</label>
                  <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-gray-dark)' }}>Nível *</label>
                    <select value={nivel} onChange={e => setNivel(e.target.value as Role)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none', background: '#fff' }}>
                      <option value="operacional">Operacional</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="coordenador">Coordenador</option>
                      <option value="gerente">Gerente</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-gray-dark)' }}>Cargo atual</label>
                    <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-gray-dark)' }}>Setor/Área</label>
                  <input type="text" value={setor} onChange={e => setSetor(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(243, 156, 18, 0.05)', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--color-dark)' }}>
              <strong>Instruções:</strong> Indique o quanto cada afirmação descreve você no ambiente de trabalho (1 = Discordo Totalmente, 5 = Concordo Totalmente). Responda com a primeira coisa que vier a cabeça.
            </div>

            {questions.map((q, index) => {
              const currentNota = respostas[q.id] || 0;

              return (
                <div key={q.id} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                  <p style={{ color: 'var(--color-dark)', fontSize: '1rem', marginBottom: '1rem', fontWeight: 500 }}>{index + 1}. {q.texto}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const isSelected = currentNota === n;
                      return (
                        <button 
                          key={n}
                          type="button"
                          onClick={() => handleNotaChange(q.id, n)}
                          style={{ 
                            flex: 1,
                            padding: '0.75rem 0',
                            borderRadius: '4px', 
                            border: isSelected ? '2px solid #f39c12' : '1px solid #ccc',
                            background: isSelected ? '#f39c12' : '#fff',
                            color: isSelected ? '#fff' : '#666',
                            fontWeight: isSelected ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray-medium)' }}>
                    <span>Discordo</span>
                    <span>Concordo</span>
                  </div>
                </div>
              );
            })}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #f39c12, #e67e22)' }}>
              Ver meu Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
