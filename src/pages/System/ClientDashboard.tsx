import { useState, useEffect } from 'react';
import { api } from '../../store/mockDB';
import type { Client, CultureResponse } from '../../store/mockDB';
import { useAuth } from '../../store/AuthContext';
import { QrCode, FileText, CheckCircle, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [responses, setResponses] = useState<CultureResponse[]>([]);

  useEffect(() => {
    if (user?.clienteId) {
      setClient(api.getClientById(user.clienteId) || null);
      setResponses(api.getCultureResponses(user.clienteId));
    }
  }, [user]);

  if (!client) return <div>Carregando cliente...</div>;

  const urlCultura = `${window.location.origin}/form/cultura/${client.slug}`;
  const urlTemperamento = `${window.location.origin}/form/temperamento/${client.slug}`;

  // Calculate some simple averages
  const totalRespostas = responses.length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {client.logoUrl ? (
          <img src={client.logoUrl} alt={client.nome} style={{ height: '50px' }} />
        ) : (
          <div style={{ width: '50px', height: '50px', background: 'var(--color-primary)', color: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
            {client.nome.charAt(0)}
          </div>
        )}
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-dark)', margin: 0 }}>
          Painel de Gestão - {client.nome}
        </h2>
      </div>
      
      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem', margin: 0 }}>Autoavaliações (Cultura)</p>
              <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-dark)' }}>{totalRespostas}</h3>
            </div>
            <FileText size={32} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem', margin: 0 }}>Momentos Concluídos</p>
              <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-dark)' }}>0</h3>
            </div>
            <CheckCircle size={32} style={{ color: 'var(--color-secondary)', opacity: 0.5 }} />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #f39c12' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.9rem', margin: 0 }}>Aguardando Etapa 3</p>
              <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-dark)' }}>Em breve</h3>
            </div>
            <Clock size={32} color="#f39c12" style={{ opacity: 0.5 }} />
          </div>
        </div>
      </div>

      {/* QR Codes */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-dark)' }}>QR Codes para Compartilhamento</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <QrCode size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
          <h4 style={{ marginBottom: '1.5rem' }}>Momento 1: Cultura</h4>
          <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '1rem' }}>
            <QRCodeSVG value={urlCultura} size={150} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)', wordBreak: 'break-all' }}>{urlCultura}</p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <QrCode size={48} style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }} />
          <h4 style={{ marginBottom: '1.5rem' }}>Momento 2: Temperamento</h4>
          <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '1rem' }}>
            <QRCodeSVG value={urlTemperamento} size={150} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)', wordBreak: 'break-all' }}>{urlTemperamento}</p>
        </div>
      </div>

      {/* Placeholders for Momentos 3, 4, 5 */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-dark)' }}>Pilares Metodológicos (Próximas Etapas)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div className="card" style={{ background: 'rgba(43, 151, 193, 0.03)', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
            <h4 style={{ margin: 0 }}>Avaliação do Supervisor</h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-medium)', margin: 0 }}>Módulo preparado para confrontar autoavaliação com a visão do supervisor imediato.</p>
        </div>

        <div className="card" style={{ background: 'rgba(50, 204, 61, 0.03)', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
            <h4 style={{ margin: 0 }}>Feedback e Alinhamento</h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-medium)', margin: 0 }}>Interface de apoio ao líder para conduzir a devolutiva baseada em gaps de percepção.</p>
        </div>

        <div className="card" style={{ background: '#fafbfc', borderStyle: 'dashed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
            <h4 style={{ margin: 0 }}>R.O.P.A.C</h4>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-medium)', margin: 0 }}>Resultado, Orientação, Prestação de Contas, Apoio e Consequências.</p>
        </div>
      </div>
    </div>
  );
}
