import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/AuthContext';
import type { OrgUnit, OrgUnitType } from '../../types/database';
import { BarChart2, Users, FileText, ClipboardList, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type ViewRole = 'client_ceo' | 'client_manager' | 'client_coordinator' | 'client_supervisor';

interface Stats { cultureResponses: number; temperamentResponses: number; orgUnits: number; }

const ROLE_LABELS: Record<ViewRole, string> = { client_ceo: 'CEO', client_manager: 'Gerente', client_coordinator: 'Coordenador', client_supervisor: 'Supervisor' };
const ROLE_SCOPE: Record<ViewRole, string> = { client_ceo: 'Visão geral de toda a empresa', client_manager: 'Visão da sua gerência e subordinados', client_coordinator: 'Visão da sua coordenação', client_supervisor: 'Visão da sua equipe direta' };

export default function ClientDashboard() {
  const { clientId: paramClientId } = useParams<{ clientId: string }>();
  const { clientRole, clientId: authClientId, globalRole } = useAuth();
  const isAdmin = globalRole === 'platform_admin';
  const activeClientId = paramClientId ?? authClientId ?? '';

  const [viewRole, setViewRole] = useState<ViewRole>(isAdmin ? 'client_ceo' : ((clientRole as ViewRole) ?? 'client_ceo'));
  const [activeTab, setActiveTab] = useState<'unidades' | 'dashboards' | 'relatorios'>('unidades');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const [clientName, setClientName] = useState('');
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<OrgUnit | null>(null);
  const [stats, setStats] = useState<Stats>({ cultureResponses: 0, temperamentResponses: 0, orgUnits: 0 });
  const [loading, setLoading] = useState(true);

  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<{
    avgByItem: { name: string; media: number }[];
    scoreDist: { name: string; value: number }[];
    justifications: { item: string; text: string; score: number }[];
  }>({ avgByItem: [], scoreDist: [], justifications: [] });

  useEffect(() => {
    if (!activeClientId) return;
    loadClientData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClientId, viewRole, filterLevel]);

  async function loadClientData() {
    setLoading(true);
    const { data: client } = await supabase.from('clients').select('name').eq('id', activeClientId).single();
    setClientName(client?.name ?? '');

    const unitTypeFilter = getUnitTypeForRole(viewRole);
    const { data: units } = await supabase.from('org_units').select('*').eq('client_id', activeClientId).eq('is_active', true).in('unit_type', unitTypeFilter).order('name');
    setOrgUnits(units ?? []);
    setSelectedOrgUnit(units?.[0] ?? null);

    const [cultureRes, temperamentRes, orgRes, recentCult, dashboardRes] = await Promise.all([
      supabase.from('culture_self_assessments').select('id', { count: 'exact', head: true }).eq('client_id', activeClientId),
      supabase.from('temperament_submissions').select('id', { count: 'exact', head: true }).eq('client_id', activeClientId),
      supabase.from('org_units').select('id', { count: 'exact', head: true }).eq('client_id', activeClientId).eq('is_active', true),
      supabase.from('culture_self_assessments').select('id, respondent_name, respondent_level, submitted_at, respondent_org_unit_id').eq('client_id', activeClientId).order('submitted_at', { ascending: false }).limit(20),
      supabase.from('culture_self_assessment_answers').select('score, justification_text, culture_item_id, culture_items(title), culture_self_assessments!inner(client_id, respondent_level)').eq('culture_self_assessments.client_id', activeClientId)
    ]);

    setStats({ cultureResponses: cultureRes.count ?? 0, temperamentResponses: temperamentRes.count ?? 0, orgUnits: orgRes.count ?? 0 });
    setRecentReports(recentCult.data ?? []);
    
    const answers = (dashboardRes.data as any[]) ?? [];
    const itemMap = new Map<string, { sum: number; count: number }>();
    const distMap = { '1 - Péssimo': 0, '2 - Ruim': 0, '3 - Moderado': 0, '4 - Ótimo': 0, '5 - Excelente': 0 };
    const justs: any[] = [];

    answers.forEach(ans => {
      // Filtro de nível
      if (filterLevel !== 'all' && ans.culture_self_assessments?.respondent_level !== filterLevel) return;

      const title = ans.culture_items?.title || 'Desconhecido';
      const score = ans.score;
      
      if (!itemMap.has(title)) itemMap.set(title, { sum: 0, count: 0 });
      const im = itemMap.get(title)!;
      im.sum += score;
      im.count += 1;

      if (score === 1) distMap['1 - Péssimo']++;
      if (score === 2) distMap['2 - Ruim']++;
      if (score === 3) distMap['3 - Moderado']++;
      if (score === 4) distMap['4 - Ótimo']++;
      if (score === 5) distMap['5 - Excelente']++;

      if (ans.justification_text && ans.justification_text.trim().length > 0) {
        justs.push({ item: title, text: ans.justification_text, score });
      }
    });

    const avgByItem = Array.from(itemMap.entries()).map(([k, v]) => ({ name: k, media: Number((v.sum / v.count).toFixed(1)) })).sort((a,b) => b.media - a.media);
    const scoreDist = Object.entries(distMap).map(([k, v]) => ({ name: k, value: v })).filter(d => d.value > 0);

    setDashboardData({ avgByItem, scoreDist, justifications: justs });
    setLoading(false);
  }

  function getUnitTypeForRole(role: ViewRole): OrgUnitType[] {
    if (role === 'client_ceo') return ['company', 'management', 'coordination', 'supervision'];
    if (role === 'client_manager') return ['management', 'coordination', 'supervision'];
    if (role === 'client_coordinator') return ['coordination', 'supervision'];
    return ['supervision'];
  }

  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' };
  const statCard = (icon: React.ReactNode, label: string, value: number | string, color: string) => (
    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-medium)', marginTop: '0.2rem' }}>{label}</div>
      </div>
    </div>
  );

  const tabBtn = (tab: typeof activeTab, label: string) => (
    <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: activeTab === tab ? 'var(--color-primary)' : '#f1f5f9', color: activeTab === tab ? '#fff' : '#64748b' }} onClick={() => setActiveTab(tab)}>{label}</button>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)', margin: 0 }}>{clientName || 'Carregando...'}</h1>
          <p style={{ color: 'var(--color-gray-medium)', marginTop: '0.25rem', fontSize: '0.9rem' }}>{ROLE_SCOPE[viewRole]}</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(Object.entries(ROLE_LABELS) as [ViewRole, string][]).map(([role, label]) => (
              <button key={role} onClick={() => setViewRole(role)} style={{ padding: '0.4rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: viewRole === role ? 'var(--color-primary)' : '#f1f5f9', color: viewRole === role ? '#fff' : '#64748b', transition: 'all 0.15s' }}>{label}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabBtn('unidades', 'Unidades Visíveis')}
        {tabBtn('dashboards', 'Dashboards')}
        {tabBtn('relatorios', 'Relatórios')}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-gray-medium)' }}>Carregando dados...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {statCard(<BarChart2 size={22} />, 'Avaliações de Cultura', stats.cultureResponses, '#2b97c1')}
            {statCard(<ClipboardList size={22} />, 'Avaliações de Temperamento', stats.temperamentResponses, '#8b5cf6')}
            {statCard(<Users size={22} />, 'Unidades Organizacionais', stats.orgUnits, '#f59e0b')}
          </div>

          {activeTab === 'unidades' && (
            <div style={{ display: 'grid', gridTemplateColumns: orgUnits.length > 0 ? '240px 1fr' : '1fr', gap: '1.5rem' }}>
              {orgUnits.length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-medium)' }}>Unidades Visíveis</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {orgUnits.map(unit => (
                      <div key={unit.id} onClick={() => setSelectedOrgUnit(unit)} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer', border: `2px solid ${selectedOrgUnit?.id === unit.id ? 'var(--color-primary)' : 'transparent'}`, background: selectedOrgUnit?.id === unit.id ? 'rgba(43,151,193,0.06)' : '#fafafa', transition: 'all 0.15s' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{unit.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gray-medium)', marginTop: '0.1rem', textTransform: 'capitalize' }}>{unit.unit_type.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={cardStyle}>
                {selectedOrgUnit ? <UnitDetail orgUnit={selectedOrgUnit} clientId={activeClientId} /> : <EmptyUnitState viewRole={viewRole} />}
              </div>
            </div>
          )}

          {activeTab === 'dashboards' && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Dashboards Executivos</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Filtrar Nível:</label>
                  <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <option value="all">Todos</option>
                    <option value="operacional">Operacional</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="coordenador">Coordenador</option>
                    <option value="gerente">Gerente</option>
                    <option value="ceo">CEO / Diretoria</option>
                  </select>
                </div>
              </div>

              {stats.cultureResponses === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                   <TrendingUp size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                   <p>Ainda não há dados suficientes para gerar os dashboards.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#1e293b' }}>Nota Média por Valor Cultural</h3>
                     <div style={{ height: '300px', width: '100%' }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={dashboardData.avgByItem} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                           <XAxis type="number" domain={[0, 5]} ticks={[1,2,3,4,5]} />
                           <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                           <Tooltip cursor={{ fill: '#f1f5f9' }} />
                           <Bar dataKey="media" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                  </div>

                  <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#1e293b' }}>Distribuição das Notas</h3>
                     <div style={{ height: '300px', width: '100%' }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={dashboardData.scoreDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                             {dashboardData.scoreDist.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'][parseInt(entry.name.charAt(0)) - 1]} />
                             ))}
                           </Pie>
                           <Tooltip />
                           <Legend />
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                  </div>

                  {dashboardData.justifications.length > 0 && (
                    <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e293b' }}>Justificativas em Destaque</h3>
                      <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dashboardData.justifications.map((j, idx) => (
                          <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid ${['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'][j.score - 1]}` }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{j.item} (Nota {j.score})</div>
                            <div style={{ fontSize: '0.9rem', color: '#334155' }}>"{j.text}"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'relatorios' && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Relatórios Recentes</h2>
                 <button style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>Exportar Excel</button>
              </div>
              {recentReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                   <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                   <p>Nenhum formulário submetido até o momento.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569' }}>Data</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569' }}>Colaborador</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569' }}>Nível</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: '#475569' }}>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.map(rep => (
                        <tr key={rep.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem' }}>{new Date(rep.submitted_at).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 500 }}>{rep.respondent_name}</td>
                          <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{rep.respondent_level?.replace('client_', '') || 'Operacional'}</td>
                          <td style={{ padding: '0.75rem' }}><span style={{ padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0284c7', borderRadius: '4px', fontSize: '0.75rem' }}>Cultura</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UnitDetail({ orgUnit, clientId }: { orgUnit: OrgUnit; clientId: string }) {
  const [cultureCount, setCultureCount] = useState<number | null>(null);
  const [temperamentCount, setTemperamentCount] = useState<number | null>(null);
  const [recentCulture, setRecentCulture] = useState<{ respondent_name: string; submitted_at: string | null }[]>([]);

  useEffect(() => {
    async function load() {
      const [cRes, tRes, recent] = await Promise.all([
        supabase.from('culture_self_assessments').select('id', { count: 'exact', head: true }).eq('client_id', clientId).eq('respondent_org_unit_id', orgUnit.id),
        supabase.from('temperament_submissions').select('id', { count: 'exact', head: true }).eq('client_id', clientId).eq('respondent_org_unit_id', orgUnit.id),
        supabase.from('culture_self_assessments').select('respondent_name, submitted_at').eq('client_id', clientId).eq('respondent_org_unit_id', orgUnit.id).order('submitted_at', { ascending: false }).limit(5),
      ]);
      setCultureCount(cRes.count ?? 0); setTemperamentCount(tRes.count ?? 0); setRecentCulture(recent.data ?? []);
    }
    load();
  }, [orgUnit.id, clientId]);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}><h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{orgUnit.name}</h2><span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)', textTransform: 'capitalize' }}>Tipo: {orgUnit.unit_type.replace(/_/g, ' ')}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[{ label: 'Avaliações de Cultura', value: cultureCount, color: '#2b97c1', icon: <FileText size={16} /> }, { label: 'Avaliações de Temperamento', value: temperamentCount, color: '#8b5cf6', icon: <ClipboardList size={16} /> }].map(s => (
          <div key={s.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: s.color }}>{s.icon}</span><div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-dark)' }}>{s.value ?? '—'}</div><div style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)' }}>{s.label}</div></div></div>
        ))}
      </div>
      {recentCulture.length > 0 && (
        <div><h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-medium)' }}>Últimas avaliações de cultura</h4><div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>{recentCulture.map((r, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}><span style={{ fontWeight: 500 }}>{r.respondent_name}</span><span style={{ color: 'var(--color-gray-medium)' }}>{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('pt-BR') : 'Pendente'}</span></div>))}</div></div>
      )}
      {recentCulture.length === 0 && cultureCount === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray-medium)', fontSize: '0.875rem' }}><FileText size={32} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />Nenhuma avaliação ainda nesta unidade</div>
      )}
    </div>
  );
}

function EmptyUnitState({ viewRole }: { viewRole: ViewRole }) {
  return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray-medium)' }}><Users size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} /><p>Nenhuma unidade visível para <strong>{ROLE_LABELS[viewRole]}</strong></p></div>;
}
