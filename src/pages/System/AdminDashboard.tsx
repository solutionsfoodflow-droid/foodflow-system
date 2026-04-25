import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Client, CultureItem } from '../../types/database';
import { Trash2, LayoutDashboard, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const APP_BASE_URL = window.location.origin;

type TabType = 'visao_geral' | 'cultura' | 'temperamento' | 'qrcodes' | 'configuracoes';

type ClientWithBranding = Client & { client_branding?: { logo_url?: string | null } | { logo_url?: string | null }[] | null };

export default function AdminDashboard() {
  const [clients, setClients] = useState<ClientWithBranding[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithBranding | null>(null);
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [tempQuestions, setTempQuestions] = useState<any[]>([]);
  const [formLinks, setFormLinks] = useState<{ id: string; form_type: string; token: string; is_active: boolean; hierarchy_level: string }[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('visao_geral');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Estados de Edição
  const [editingItem, setEditingItem] = useState<CultureItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Estados para Cópia de Itens
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceClientId, setCopySourceClientId] = useState('');
  const [sourceCultureItems, setSourceCultureItems] = useState<CultureItem[]>([]);
  const [copyingItem, setCopyingItem] = useState(false);

  // ── Loaders ─────────────────────────────────────────────────
  async function loadClients() {
    const { data } = await supabase.from('clients').select('*, client_branding(logo_url)').order('name');
    setClients(data as any ?? []);
  }

  async function loadCultureItems(clientId: string) {
    const { data } = await supabase.from('culture_items').select('*').eq('client_id', clientId).order('display_order');
    setCultureItems(data ?? []);
  }

  async function loadTempQuestions(clientId: string) {
    // Busca ou cria o questionário do cliente
    let { data: quest } = await supabase.from('temperament_questionnaires').select('id').eq('client_id', clientId).single();
    if (!quest) {
      const { data: newQuest } = await supabase.from('temperament_questionnaires').insert({ client_id: clientId, title: 'Temperamento' }).select('id').single();
      quest = newQuest;
    }
    if (quest) {
      const { data } = await supabase.from('temperament_questions').select('*').eq('questionnaire_id', quest.id).order('display_order');
      setTempQuestions(data ?? []);
    }
  }

  async function loadFormLinks(clientId: string) {
    const { data } = await supabase.from('public_form_links').select('*').eq('client_id', clientId);
    setFormLinks((data ?? []).map(l => ({ ...l, hierarchy_level: l.hierarchy_level || 'operacional' })));
  }

  useEffect(() => { loadClients(); }, []);

  useEffect(() => {
    if (selectedClient) {
      loadCultureItems(selectedClient.id);
      loadTempQuestions(selectedClient.id);
      loadFormLinks(selectedClient.id);
    }
  }, [selectedClient]);

  // ── Actions ───────────────────────────────────────────
  async function toggleClientStatus(client: Client) {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    await supabase.from('clients').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', client.id);
    loadClients();
    if (selectedClient?.id === client.id) setSelectedClient({ ...client, status: newStatus });
  }

  async function addCultureItem() {
    if (!selectedClient || !newItemTitle.trim()) return;
    const maxOrder = cultureItems.length > 0 ? Math.max(...cultureItems.map(i => i.display_order)) + 1 : 1;
    await supabase.from('culture_items').insert({ client_id: selectedClient.id, title: newItemTitle.trim(), description: newItemDesc.trim() || null, display_order: maxOrder, is_active: true });
    setNewItemTitle(''); setNewItemDesc(''); loadCultureItems(selectedClient.id);
  }

  async function deleteCultureItem(id: string) {
    if (!confirm('Excluir?')) return;
    await supabase.from('culture_items').delete().eq('id', id);
    if (selectedClient) loadCultureItems(selectedClient.id);
  }

  async function loadSourceCultureItems(clientId: string) {
    const { data } = await supabase.from('culture_items').select('*').eq('client_id', clientId).order('display_order');
    setSourceCultureItems(data ?? []);
  }

  async function copyCultureItem(sourceItem: CultureItem) {
    if (!selectedClient) return;
    setCopyingItem(true);
    const maxOrder = cultureItems.length > 0 ? Math.max(...cultureItems.map(i => i.display_order)) + 1 : 1;
    const { data } = await supabase.from('culture_items').insert({ 
      client_id: selectedClient.id, 
      title: sourceItem.title, 
      description: sourceItem.description, 
      display_order: maxOrder, 
      is_active: true,
      copied_from_item_id: sourceItem.id
    }).select().single();
    
    await loadCultureItems(selectedClient.id);
    setCopyingItem(false);
    setShowCopyModal(false);
    
    if (data) {
      setEditingItem(data);
      setEditTitle(data.title);
      setEditDesc(data.description || '');
    }
  }

  async function updateCultureItem() {
    if (!editingItem || !selectedClient) return;
    await supabase.from('culture_items').update({
      title: editTitle.trim(),
      description: editDesc.trim() || null,
      updated_at: new Date().toISOString()
    }).eq('id', editingItem.id);
    setEditingItem(null);
    loadCultureItems(selectedClient.id);
  }

  async function addTempQuestion() {
    if (!selectedClient || !newItemTitle.trim()) return;
    const { data: quest } = await supabase.from('temperament_questionnaires').select('id').eq('client_id', selectedClient.id).single();
    if (!quest) return;
    const maxOrder = tempQuestions.length > 0 ? Math.max(...tempQuestions.map(i => i.display_order)) + 1 : 1;
    await supabase.from('temperament_questions').insert({ questionnaire_id: quest.id, prompt: newItemTitle.trim(), question_type: 'multiple_choice', display_order: maxOrder, is_active: true });
    setNewItemTitle(''); loadTempQuestions(selectedClient.id);
  }

  async function deleteTempQuestion(id: string) {
    if (!confirm('Excluir pergunta?')) return;
    await supabase.from('temperament_questions').delete().eq('id', id);
    if (selectedClient) loadTempQuestions(selectedClient.id);
  }

  async function generateFormLink(formType: "culture_self_assessment" | "temperament") {
    if (!selectedClient) return;
    await supabase.from('public_form_links').insert({ client_id: selectedClient.id, form_type: formType, is_active: true, hierarchy_level: '' });
    loadFormLinks(selectedClient.id);
  }

  async function toggleFormLink(id: string, current: boolean) {
    await supabase.from('public_form_links').update({ is_active: !current }).eq('id', id);
    if (selectedClient) loadFormLinks(selectedClient.id);
  }

  async function deleteFormLink(id: string) {
    if (!confirm('Excluir?')) return;
    await supabase.from('public_form_links').delete().eq('id', id);
    if (selectedClient) loadFormLinks(selectedClient.id);
  }

  // ── Render Helpers ───────────────────────────────────────────────
  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' };
  const tabBtn = (tab: TabType, label: string) => (
    <button style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: activeTab === tab ? 'var(--color-primary)' : '#f1f5f9', color: activeTab === tab ? '#fff' : '#64748b' }} onClick={() => setActiveTab(tab)}>{label}</button>
  );

  const renderLinks = () => {
    return (
      <div style={{ marginBottom: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 1rem', color: 'var(--color-dark)', fontSize: '1.1rem' }}>QR Codes Únicos</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>O nível do respondente será solicitado dentro do formulário.</p>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => generateFormLink('culture_self_assessment')} style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>+ QR Cultura</button>
          <button onClick={() => generateFormLink('temperament')} style={{ padding: '0.5rem 1rem', background: 'var(--color-secondary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>+ QR Temperamento</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {formLinks.map(link => {
            const isCulture = link.form_type === 'culture_self_assessment';
            const url = `${APP_BASE_URL}/form/${isCulture ? 'cultura' : 'temperamento'}/${link.token}`;
            return (
              <div key={link.id} style={{ background: '#fff', borderRadius: '10px', padding: '1rem', textAlign: 'center', border: `1px solid ${link.is_active ? '#e2e8f0' : '#fee2e2'}`, opacity: link.is_active ? 1 : 0.6 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isCulture ? 'var(--color-primary)' : 'var(--color-secondary)', marginBottom: '0.75rem' }}>
                  {isCulture ? '📋 Cultura' : '🧠 Temperamento'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px' }}>
                  <QRCodeSVG value={url} size={120} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                   <input readOnly value={url} style={{ fontSize: '0.65rem', padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '4px', width: '100%' }} />
                   <button onClick={() => navigator.clipboard.writeText(url)} title="Copiar link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Copy size={14}/></button>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                  <button onClick={() => toggleFormLink(link.id, link.is_active)} style={{ background: link.is_active ? '#dcfce7' : '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', color: link.is_active ? '#16a34a' : '#64748b' }}>{link.is_active ? 'Ativo' : 'Inativo'}</button>
                  <button onClick={() => deleteFormLink(link.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
          {formLinks.length === 0 && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Nenhum QR Code gerado para este cliente.</p>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)', margin: 0 }}>Painel do Administrador</h1>
          <p style={{ color: 'var(--color-gray-medium)', marginTop: '0.25rem' }}>Gerencie clientes, cultura e formulários</p>
        </div>
        {selectedClient && (
          <button onClick={() => setSelectedClient(null)} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>
            Voltar para Todos os Clientes
          </button>
        )}
      </div>

      {!selectedClient ? (
        <div style={{ ...cardStyle }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Lista de Clientes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {clients.map(c => {
               const branding = Array.isArray(c.client_branding) ? c.client_branding[0] : c.client_branding;
               return (
              <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {branding?.logo_url ? <img src={branding.logo_url} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} /> : <LayoutDashboard size={32} color="#94a3b8" />}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{c.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/{c.slug}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button onClick={() => { setSelectedClient(c); setActiveTab('visao_geral'); }} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>Visão Geral</button>
                  <button onClick={() => { setSelectedClient(c); setActiveTab('cultura'); }} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>Cultura</button>
                  <button onClick={() => { setSelectedClient(c); setActiveTab('temperamento'); }} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>Temp.</button>
                  <button onClick={() => { setSelectedClient(c); setActiveTab('qrcodes'); }} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>QR Codes</button>
                  <button onClick={() => { setSelectedClient(c); setActiveTab('configuracoes'); }} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>Config</button>
                </div>
              </div>
            )})}
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{selectedClient.name}</h2>
              <p style={{ color: 'var(--color-gray-medium)', margin: '0.25rem 0 0' }}>Slug: {selectedClient.slug}</p>
            </div>
            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, background: selectedClient.status === 'active' ? '#dcfce7' : '#fee2e2', color: selectedClient.status === 'active' ? '#16a34a' : '#dc2626' }}>
              {selectedClient.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {tabBtn('visao_geral', 'Visão Geral')}
            {tabBtn('cultura', 'Itens de Cultura')}
            {tabBtn('temperamento', 'Itens de Temperamento')}
            {tabBtn('qrcodes', 'QR Codes')}
            {tabBtn('configuracoes', 'Configurações')}
          </div>

          {activeTab === 'visao_geral' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}><h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-primary)' }}>{cultureItems.length}</h3><p style={{ margin: 0, color: '#64748b' }}>Itens de Cultura</p></div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}><h3 style={{ margin: 0, fontSize: '2rem', color: 'var(--color-secondary)' }}>{tempQuestions.length}</h3><p style={{ margin: 0, color: '#64748b' }}>Perguntas de Temp.</p></div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}><h3 style={{ margin: 0, fontSize: '2rem', color: '#10b981' }}>{formLinks.length}</h3><p style={{ margin: 0, color: '#64748b' }}>QR Codes Gerados</p></div>
            </div>
          )}

          {activeTab === 'cultura' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button onClick={() => { setShowCopyModal(true); setCopySourceClientId(''); setSourceCultureItems([]); }} style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Copy size={16}/> Copiar de outro cliente</button>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                <input placeholder="Título do pilar" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.5rem' }} />
                <textarea placeholder="Descrição (opcional)" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                <button onClick={addCultureItem} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Adicionar Cultura</button>
              </div>
              {cultureItems.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{idx + 1}. {item.title}</strong>
                    {item.description && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{item.description}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => { setEditingItem(item); setEditTitle(item.title); setEditDesc(item.description || ''); }} style={{ padding: '0.35rem 0.6rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Editar</button>
                    <button onClick={() => deleteCultureItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'temperamento' && (
            <div>
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                <input placeholder="Nova pergunta de temperamento" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                <button onClick={addTempQuestion} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--color-secondary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Adicionar Pergunta</button>
              </div>
              {tempQuestions.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div><strong>{item.prompt}</strong><div style={{ fontSize: '0.85rem', color: '#64748b' }}>Múltipla escolha</div></div>
                  <button onClick={() => deleteTempQuestion(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'qrcodes' && renderLinks()}

          {activeTab === 'configuracoes' && (
            <div style={{ maxWidth: '600px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Configurações do Cliente</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nome do Cliente</label>
                <input disabled value={selectedClient.name} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Slug (URL)</label>
                <input disabled value={selectedClient.slug} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Status</label>
                <button onClick={() => toggleClientStatus(selectedClient)} style={{ padding: '0.5rem 1rem', background: selectedClient.status === 'active' ? '#fee2e2' : '#dcfce7', color: selectedClient.status === 'active' ? '#dc2626' : '#16a34a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                  {selectedClient.status === 'active' ? 'Inativar Cliente' : 'Ativar Cliente'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição de Cultura */}
      {editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem' }}>Editar Item de Cultura</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Título</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Descrição</label>
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingItem(null)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={updateCultureItem} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cópia */}
      {showCopyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Copiar Item de Cultura</h2>
              <button onClick={() => setShowCopyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>Fechar</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>Selecione o Cliente de Origem</label>
              <select 
                value={copySourceClientId} 
                onChange={e => { setCopySourceClientId(e.target.value); loadSourceCultureItems(e.target.value); }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
              >
                <option value="">Selecione...</option>
                {clients.filter(c => c.id !== selectedClient?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {copySourceClientId && sourceCultureItems.length === 0 && (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Este cliente não possui itens de cultura cadastrados.</p>
            )}

            {sourceCultureItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>Selecione o item para copiar:</p>
                {sourceCultureItems.map(item => (
                  <div key={item.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{item.description}</div>
                    </div>
                    <button 
                      onClick={() => copyCultureItem(item)} 
                      disabled={copyingItem}
                      style={{ padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '1rem' }}
                    >
                      Copiar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
