import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../store/mockDB';
import type { Client, CultureItem, Role, CultureResponse } from '../../../store/mockDB';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function CultureForm() {
  const { slug } = useParams<{ slug: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [items, setItems] = useState<CultureItem[]>([]);
  
  // Form State
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('');
  const [nivel, setNivel] = useState<Role>('operacional');
  const [setor, setSetor] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [respostas, setRespostas] = useState<Record<string, { nota: number; justificativa: string }>>({});
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (slug) {
      const c = api.getClientBySlug(slug);
      if (c) {
        setClient(c);
        setItems(api.getCultureItems(c.id).sort((a, b) => a.ordem - b.ordem));
      }
    }
  }, [slug]);

  const handleNotaChange = (itemId: string, nota: number) => {
    setRespostas(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], nota, justificativa: prev[itemId]?.justificativa || '' }
    }));
  };

  const handleJustificativaChange = (itemId: string, text: string) => {
    setRespostas(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], nota: prev[itemId]?.nota || 0, justificativa: text }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    // Validate
    const allAnswered = items.every(i => respostas[i.id]?.nota > 0 && respostas[i.id]?.justificativa.trim().length > 0);
    if (!allAnswered || !nome) {
      alert("Por favor, preencha seu nome e avalie todos os pilares com notas e justificativas.");
      return;
    }

    const payload: Omit<CultureResponse, 'id' | 'data'> = {
      clienteId: client.id,
      respondenteNome: nome,
      cargo,
      nivel,
      setor,
      supervisor,
      respostas: items.map(i => ({
        itemId: i.id,
        nota: respostas[i.id].nota,
        justificativa: respostas[i.id].justificativa
      }))
    };

    api.saveCultureResponse(payload);
    setIsSubmitted(true);
  };

  if (!client) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando formulário...</div>;

  if (isSubmitted) {
    // Individual Dashboard
    const dataRadar = items.map(i => ({
      pilar: i.titulo,
      nota: respostas[i.id].nota,
      fullMark: 5,
    }));
    
    const notas = Object.values(respostas).map(r => r.nota);
    const media = (notas.reduce((a,b) => a+b, 0) / notas.length).toFixed(1);

    return (
      <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '2rem 1rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="card text-center" style={{ marginBottom: '2rem' }}>
            <CheckCircle size={48} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem auto' }} />
            <h2 style={{ color: 'var(--color-dark)', marginBottom: '0.5rem' }}>Autoavaliação Concluída!</h2>
            <p style={{ color: 'var(--color-gray-medium)' }}>Obrigado pelas suas respostas, {nome}.</p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-dark)', textAlign: 'center' }}>Seu Perfil de Cultura</h3>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(43,151,193,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{media}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)' }}>Média Geral</div>
              </div>
            </div>

            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dataRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="pilar" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar name="Sua Avaliação" dataKey="nota" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
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
              <ShieldCheck size={48} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem auto' }} />
            )}
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Autoavaliação de Cultura</h1>
            <p style={{ marginTop: '0.5rem', color: 'var(--color-gray-medium)' }}>{client.nome}</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            {/* Identification */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-primary)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Sua Identificação</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-gray-dark)' }}>Setor/Área</label>
                    <input type="text" value={setor} onChange={e => setSetor(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-gray-dark)' }}>Supervisor imediato</label>
                    <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Scale definition */}
            <div style={{ padding: '1rem', background: 'rgba(43,151,193,0.05)', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.85rem', color: 'var(--color-dark)' }}>
              <strong>Escala de Avaliação:</strong><br/>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e74c3c' }}></div> 1 - Nunca/Raro</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e67e22' }}></div> 2 - Raramente</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f1c40f' }}></div> 3 - Às vezes</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#82ccdd' }}></div> 4 - Frequentemente</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#32cc3d' }}></div> 5 - Sempre</span>
              </div>
            </div>

            {/* Questions */}
            {items.map((item, index) => {
              const currentNota = respostas[item.id]?.nota || 0;
              const currentColor = currentNota === 1 ? '#e74c3c' : currentNota === 2 ? '#e67e22' : currentNota === 3 ? '#f1c40f' : currentNota === 4 ? '#82ccdd' : currentNota === 5 ? '#32cc3d' : '#e0e0e0';

              return (
                <div key={item.id} style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: 'var(--color-dark)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>{index + 1}</div>
                    <h4 style={{ margin: 0, color: 'var(--color-dark)', fontSize: '1.1rem' }}>{item.titulo}</h4>
                  </div>
                  <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem', marginBottom: '1.5rem', paddingLeft: '2rem' }}>{item.descricao}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingLeft: '2rem' }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const bg = n === 1 ? '#e74c3c' : n === 2 ? '#e67e22' : n === 3 ? '#f1c40f' : n === 4 ? '#82ccdd' : '#32cc3d';
                      const isSelected = currentNota === n;
                      return (
                        <button 
                          key={n}
                          type="button"
                          onClick={() => handleNotaChange(item.id, n)}
                          style={{ 
                            width: '45px', 
                            height: '45px', 
                            borderRadius: '50%', 
                            border: isSelected ? '2px solid var(--color-dark)' : '1px solid #ccc',
                            background: isSelected ? bg : '#fff',
                            color: isSelected ? (n === 3 || n === 4 ? '#000' : '#fff') : '#666',
                            fontWeight: isSelected ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ paddingLeft: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--color-gray-dark)' }}>Cite 1 exemplo prático que justifique a nota {currentNota > 0 ? `(${currentNota})` : ''} *</label>
                    <textarea 
                      required
                      placeholder="Descreva uma situação do dia a dia..."
                      value={respostas[item.id]?.justificativa || ''}
                      onChange={e => handleJustificativaChange(item.id, e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: `1px solid ${currentNota > 0 ? currentColor : '#ccc'}`, outline: 'none', resize: 'vertical', minHeight: '80px', transition: 'border-color 0.2s' }}
                    />
                  </div>
                </div>
              );
            })}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }}>
              Finalizar Autoavaliação
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
