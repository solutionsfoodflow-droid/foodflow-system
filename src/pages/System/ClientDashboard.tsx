import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/AuthContext';
import type { OrgUnit, OrgUnitType } from '../../types/database';
import { BarChart2, Users, FileText, ClipboardList } from 'lucide-react';

// ── Tipos locais ─────────────────────────────────────────────

type ViewRole = 'client_ceo' | 'client_manager' | 'client_coordinator' | 'client_supervisor';

interface Stats {
  cultureResponses: number;
  temperamentResponses: number;
  orgUnits: number;
}

// ── Helpers ──────────────────────────────────────────────────

const ROLE_LABELS: Record<ViewRole, string> = {
  client_ceo: 'CEO',
  client_manager: 'Gerente',
  client_coordinator: 'Coordenador',
  client_supervisor: 'Supervisor',
};

const ROLE_SCOPE: Record<ViewRole, string> = {
  client_ceo: 'Visão geral de toda a empresa',
  client_manager: 'Visão da sua gerência e subordinados',
  client_coordinator: 'Visão da sua coordenação',
  client_supervisor: 'Visão da sua equipe direta',
};

// ── Componente ───────────────────────────────────────────────

export default function ClientDashboard() {
  const { clientId: paramClientId } = useParams<{ clientId: string }>();
  const { clientRole, clientId: authClientId, globalRole } = useAuth();

  // Admin pode simular qualquer role
  const isAdmin = globalRole === 'platform_admin';
  const activeClientId = paramClientId ?? authClientId ?? '';

  // Role efetivo: se admin, começa em CEO; senão usa role real
  const [viewRole, setViewRole] = useState<ViewRole>(
    isAdmin ? 'client_ceo' : ((clientRole as ViewRole) ?? 'client_ceo')
  );

  const [clientName, setClientName] = useState('');
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<OrgUnit | null>(null);
  const [stats, setStats] = useState<Stats>({ cultureResponses: 0, temperamentResponses: 0, orgUnits: 0 });
  const [loading, setLoading] = useState(true);

  // ── Loaders ─────────────────────────────────────────────────

  useEffect(() => {
    if (!activeClientId) return;
    loadClientData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClientId, viewRole]);

  async function loadClientData() {
    setLoading(true);

    // Nome do cliente
    const { data: client } = await supabase
      .from('clients')
      .select('name')
      .eq('id', activeClientId)
      .single();
    setClientName(client?.name ?? '');

    // Unidades org filtradas por tipo compatível com o role
    const unitTypeFilter = getUnitTypeForRole(viewRole);
    const { data: units } = await supabase
      .from('org_units')
      .select('*')
      .eq('client_id', activeClientId)
      .eq('is_active', true)
      .in('unit_type', unitTypeFilter)
      .order('name');
    setOrgUnits(units ?? []);
    setSelectedOrgUnit(units?.[0] ?? null);

    // Stats gerais do cliente
    const [cultureRes, temperamentRes, orgRes] = await Promise.all([
      supabase.from('culture_self_assessments').select('id', { count: 'exact', head: true }).eq('client_id', activeClientId),
      supabase.from('temperament_submissions').select('id', { count: 'exact', head: true }).eq('client_id', activeClientId),
      supabase.from('org_units').select('id', { count: 'exact', head: true }).eq('client_id', activeClientId).eq('is_active', true),
    ]);

    setStats({
      cultureResponses: cultureRes.count ?? 0,
      temperamentResponses: temperamentRes.count ?? 0,
      orgUnits: orgRes.count ?? 0,
    });

    setLoading(false);
  }

  function getUnitTypeForRole(role: ViewRole): OrgUnitType[] {
    if (role === 'client_ceo') return ['company', 'management', 'coordination', 'supervision'];
    if (role === 'client_manager') return ['management', 'coordination', 'supervision'];
    if (role === 'client_coordinator') return ['coordination', 'supervision'];
    return ['supervision'];
  }

  // ── Render ───────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
  };

  const statCard = (icon: React.ReactNode, label: string, value: number | string, color: string) => (
    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-medium)', marginTop: '0.2rem' }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)', margin: 0 }}>
            {clientName || 'Carregando...'}
          </h1>
          <p style={{ color: 'var(--color-gray-medium)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {ROLE_SCOPE[viewRole]}
          </p>
        </div>

        {/* Admin: seletor de role para simular */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(Object.entries(ROLE_LABELS) as [ViewRole, string][]).map(([role, label]) => (
              <button
                key={role}
                onClick={() => setViewRole(role)}
                style={{
                  padding: '0.4rem 0.85rem', borderRadius: '20px', border: 'none',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  background: viewRole === role ? 'var(--color-primary)' : '#f1f5f9',
                  color: viewRole === role ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-gray-medium)' }}>Carregando dados...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {statCard(<BarChart2 size={22} />, 'Avaliações de Cultura', stats.cultureResponses, '#2b97c1')}
            {statCard(<ClipboardList size={22} />, 'Avaliações de Temperamento', stats.temperamentResponses, '#8b5cf6')}
            {statCard(<Users size={22} />, 'Unidades Organizacionais', stats.orgUnits, '#f59e0b')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: orgUnits.length > 0 ? '240px 1fr' : '1fr', gap: '1.5rem' }}>
            {/* Org units list */}
            {orgUnits.length > 0 && (
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-medium)' }}>
                  Unidades Visíveis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {orgUnits.map(unit => (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedOrgUnit(unit)}
                      style={{
                        padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
                        border: `2px solid ${selectedOrgUnit?.id === unit.id ? 'var(--color-primary)' : 'transparent'}`,
                        background: selectedOrgUnit?.id === unit.id ? 'rgba(43,151,193,0.06)' : '#fafafa',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{unit.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-medium)', marginTop: '0.1rem', textTransform: 'capitalize' }}>
                        {unit.unit_type.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unit detail / responses */}
            <div style={cardStyle}>
              {selectedOrgUnit ? (
                <UnitDetail orgUnit={selectedOrgUnit} clientId={activeClientId} />
              ) : (
                <EmptyUnitState viewRole={viewRole} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Unit Detail ──────────────────────────────────────────────

function UnitDetail({ orgUnit, clientId }: { orgUnit: OrgUnit; clientId: string }) {
  const [cultureCount, setCultureCount] = useState<number | null>(null);
  const [temperamentCount, setTemperamentCount] = useState<number | null>(null);
  const [recentCulture, setRecentCulture] = useState<{ respondent_name: string; submitted_at: string | null }[]>([]);

  useEffect(() => {
    async function load() {
      const [cRes, tRes, recent] = await Promise.all([
        supabase.from('culture_self_assessments').select('id', { count: 'exact', head: true })
          .eq('client_id', clientId).eq('respondent_org_unit_id', orgUnit.id),
        supabase.from('temperament_submissions').select('id', { count: 'exact', head: true })
          .eq('client_id', clientId).eq('respondent_org_unit_id', orgUnit.id),
        supabase.from('culture_self_assessments')
          .select('respondent_name, submitted_at')
          .eq('client_id', clientId).eq('respondent_org_unit_id', orgUnit.id)
          .order('submitted_at', { ascending: false }).limit(5),
      ]);
      setCultureCount(cRes.count ?? 0);
      setTemperamentCount(tRes.count ?? 0);
      setRecentCulture(recent.data ?? []);
    }
    load();
  }, [orgUnit.id, clientId]);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{orgUnit.name}</h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', textTransform: 'capitalize' }}>
          Tipo: {orgUnit.unit_type.replace(/_/g, ' ')}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Avaliações de Cultura', value: cultureCount, color: '#2b97c1', icon: <FileText size={16} /> },
          { label: 'Avaliações de Temperamento', value: temperamentCount, color: '#8b5cf6', icon: <ClipboardList size={16} /> },
        ].map(s => (
          <div key={s.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-dark)' }}>{s.value ?? '—'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {recentCulture.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-medium)' }}>
            Últimas avaliações de cultura
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recentCulture.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 500 }}>{r.respondent_name}</span>
                <span style={{ color: 'var(--color-gray-medium)' }}>
                  {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('pt-BR') : 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentCulture.length === 0 && cultureCount === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-medium)', fontSize: '0.875rem' }}>
          <FileText size={32} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
          Nenhuma avaliação ainda nesta unidade
        </div>
      )}
    </div>
  );
}

function EmptyUnitState({ viewRole }: { viewRole: ViewRole }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-medium)' }}>
      <Users size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
      <p>Nenhuma unidade organizacional visível para o nível <strong>{ROLE_LABELS[viewRole]}</strong></p>
    </div>
  );
}
