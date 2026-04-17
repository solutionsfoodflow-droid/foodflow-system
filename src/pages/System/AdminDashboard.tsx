import { useState, useEffect } from 'react';
import { api } from '../../store/mockDB';
import type { Client, CultureResponse } from '../../store/mockDB';
import { Users, FileText, Activity, QrCode, Sliders, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [cultureResponses, setCultureResponses] = useState<CultureResponse[]>([]);

  useEffect(() => {
    setClients(api.getClients());
    setCultureResponses(api.getCultureResponses());
  }, []);

  // Simple aggregations
  const totalRespostas = cultureResponses.length;
  // Let's pretend they are all from culture for now in MVP unless we fetch temp too
  const tempResponses = api.getTemperamentResponses().length;

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--color-dark)', marginBottom: '1.5rem' }}>Painel Administrativo</h2>
      
      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem', margin: 0 }}>Total Clientes</p>
              <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-dark)' }}>{clients.length}</h3>
            </div>
            <Users size={32} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem', margin: 0 }}>Autoavaliações (Cultura)</p>
              <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-dark)' }}>{totalRespostas}</h3>
            </div>
            <FileText size={32} style={{ color: 'var(--color-secondary)', opacity: 0.5 }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f39c12' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem', margin: 0 }}>Autoavaliações (Temp.)</p>
              <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-dark)' }}>{tempResponses}</h3>
            </div>
            <Activity size={32} color="#f39c12" style={{ opacity: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-dark)' }}>Clientes Ativos</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-gray-light)' }}>
                <th style={{ padding: '1rem' }}>Cliente</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Respostas</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => {
                const respostasCliente = cultureResponses.filter(r => r.clienteId === c.id).length;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--color-gray-light)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {c.logoUrl ? (
                          <img src={c.logoUrl} alt={c.nome} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ width: '30px', height: '30px', background: 'var(--color-gray-light)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>Img</div>
                        )}
                        {c.nome}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', background: c.status === 'ativo' ? 'rgba(50,204,61,0.1)' : '#eee', color: c.status === 'ativo' ? 'var(--color-secondary)' : '#666', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>{c.status.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>{respostasCliente}</td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem' }} title="Painel do Cliente">
                        <ExternalLink size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.85rem' }} title="Gerenciar Pilares">
                        <Sliders size={16} />
                      </button>
                      <Link to={`/sistema/admin/qr/${c.id}`} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.85rem' }} title="Gerar QR Codes">
                        <QrCode size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DASHBOARDS - Visão Geral */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-dark)' }}>Visão Agregada de Cultura (Mock)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', height: '300px' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--color-gray-medium)' }}>Respostas por Cliente</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clients.map(c => ({ name: c.nome, Respostas: cultureResponses.filter(r => r.clienteId === c.id).length }))} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="Respostas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card" style={{ padding: '1.5rem', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-gray-medium)', textAlign: 'center' }}>Módulo de Heatmaps / Radar preparado para integração<br/>(Aguardando dados estruturados de Pilares)</p>
        </div>
      </div>
    </div>
  );
}
