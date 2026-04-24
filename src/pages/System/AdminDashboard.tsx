import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Client, CultureItem } from '../../types/database';
import { Plus, Settings, QrCode, RefreshCw, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const APP_BASE_URL = window.location.origin;

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [formLinks, setFormLinks] = useState<{ id: string; form_type: string; token: string; is_active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'clientes' | 'cultura' | 'qrcodes'>('clientes');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // ── Loaders ─────────────────────────────────────────────────

  async function loadClients() {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('name');
    setClients(data ?? []);
    setLoading(false);
  }

  async function loadCultureItems(clientId: string) {
    const { data } = await supabase
      .from('culture_items')
      .select('*')
      .eq('client_id', clientId)
      .order('display_order');
    setCultureItems(data ?? []);
  }

  async function loadFormLinks(clientId: string) {
    const { data } = await supabase
      .from('public_form_links')
      .select('id, form_type, token, is_active')
      .eq('client_id', clientId);
    setFormLinks(data ?? []);
  }

  useEffect(() => { loadClients(); }, []);

  useEffect(() => {
    if (selectedClient) {
      loadCultureItems(selectedClient.id);
      loadFormLinks(selectedClient.id);
    }
  }, [selectedClient]);

  // ── Client actions ───────────────────────────────────────────

  async function toggleClientStatus(client: Client) {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    await supabase.from('clients').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', client.id);
    loadClients();
    if (selectedClient?.id === client.id) setSelectedClient({ ...client, status: newStatus });
  }

  // ── Culture item actions ─────────────────────────────────────

  async function addCultureItem() {
    if (!selectedClient || !newItemTitle.trim()) return;
    const maxOrder = cultureItems.length > 0 ? Math.max(...cultureItems.map(i => i.display_order)) + 1 : 1;
    await supabase.from('culture_items').insert({
      client_id: selectedClient.id,
      title: newItemTitle.trim(),
      description: newItemDesc.trim() || null,
      display_order: maxOrder,
      is_active: true,
    });
    setNewItemTitle('');
    setNewItemDesc('');
    loadCultureItems(selectedClient.id);
  }

  async function updateCultureItem(id: string) {
    await supabase.from('culture_items').update({
      title: editTitle,
      description: editDesc || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    setEditingItem(null);
    if (selectedClient) loadCultureItems(selectedClient.id);
  }

  async function deleteCultureItem(id: string) {
    if (!confirm('Excluir este item?')) return;
    await supabase.from('culture_items').delete().eq('id', id);
    if (selectedClient) loadCultureItems(selectedClient.id);
  }

  // ── QR Code / Form links ─────────────────────────────────────

  async function generateFormLink(formType: 'culture_self_assessment' | 'temperament') {
    if (!selectedClient) return;
    const { data } = await supabase.from('public_form_links').insert({
      client_id: selectedClient.id,
      form_type: formType,
      is_active: true,
    }).select().single();
    if (data) loadFormLinks(selectedClient.id);
  }

  async function toggleFormLink(id: string, current: boolean) {
    await supabase.from('public_form_links').update({ is_active: !current }).eq('id', id);
    if (selectedClient) loadFormLinks(selectedClient.id);
  }

  async function deleteFormLink(id: string) {
    if (!confirm('Excluir este link?')) return;
    await supabase.from('public_form_links').delete().eq('id', id);
    if (selectedClient) loadFormLinks(selectedClient.id);
  }

  // ── Render ───────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
  };

  const tabBtn = (tab: typeof activeTab): React.CSSProperties => ({
    padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
    background: activeTab === tab ? 'var(--color-primary)' : '#f1f5f9',
    color: activeTab === tab ? '#fff' : '#64748b',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-dark)', margin: 0 }}>Painel do Administrador</h1>
        <p style={{ color: 'var(--color-gray-medium)', marginTop: '0.25rem' }}>Gerencie clientes, cultura e formulários</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        {/* Client list */}
        <div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Clientes</h3>
              <button onClick={loadClients} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-medium)' }}>
                <RefreshCw size={16} />
              </button>
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.875rem' }}>Carregando...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {clients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    style={{
                      padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                      border: `2px solid ${selectedClient?.id === client.id ? 'var(--color-primary)' : '#f1f5f9'}`,
                      background: selectedClient?.id === client.id ? 'rgba(43,151,193,0.06)' : '#fafafa',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-dark)' }}>{client.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)' }}>/{client.slug}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleClientStatus(client); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: client.status === 'active' ? '#22c55e' : '#94a3b8' }}
                        title={client.status === 'active' ? 'Inativar' : 'Ativar'}
                      >
                        {client.status === 'active' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </div>
                    <span style={{
                      display: 'inline-block', marginTop: '0.25rem', padding: '0.1rem 0.5rem',
                      borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                      background: client.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: client.status === 'active' ? '#16a34a' : '#dc2626',
                    }}>
                      {client.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div>
          {!selectedClient ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-gray-medium)' }}>
              <Settings size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Selecione um cliente para gerenciar</p>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{selectedClient.name}</h2>
                  <p style={{ color: 'var(--color-gray-medium)', margin: '0.25rem 0 0' }}>Slug: {selectedClient.slug}</p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button style={tabBtn('clientes')} onClick={() => setActiveTab('clientes')}>Visão Geral</button>
                <button style={tabBtn('cultura')} onClick={() => setActiveTab('cultura')}>Itens de Cultura</button>
                <button style={tabBtn('qrcodes')} onClick={() => setActiveTab('qrcodes')}>QR Codes</button>
              </div>

              {/* Tab: Visão Geral */}
              {activeTab === 'clientes' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: 'Itens de Cultura', value: cultureItems.length },
                    { label: 'Links QR Ativos', value: formLinks.filter(f => f.is_active).length },
                    { label: 'Status', value: selectedClient.status === 'active' ? '✅ Ativo' : '❌ Inativo' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{stat.value}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-medium)' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Itens de Cultura */}
              {activeTab === 'cultura' && (
                <div>
                  {/* Add form */}
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem' }}>Novo Item</p>
                    <input
                      placeholder="Título do pilar"
                      value={newItemTitle}
                      onChange={e => setNewItemTitle(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', marginBottom: '0.5rem', boxSizing: 'border-box' }}
                    />
                    <textarea
                      placeholder="Descrição (opcional)"
                      value={newItemDesc}
                      onChange={e => setNewItemDesc(e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={addCultureItem}
                      style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
                    >
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>

                  {/* List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {cultureItems.map(item => (
                      <div key={item.id} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                        {editingItem === item.id ? (
                          <div>
                            <input
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', marginBottom: '0.4rem', boxSizing: 'border-box' }}
                            />
                            <textarea
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              rows={2}
                              style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                              <button onClick={() => updateCultureItem(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}><Check size={14} /> Salvar</button>
                              <button onClick={() => setEditingItem(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}><X size={14} /> Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</div>
                              {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-medium)', marginTop: '0.2rem' }}>{item.description}</div>}
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button onClick={() => { setEditingItem(item.id); setEditTitle(item.title); setEditDesc(item.description ?? ''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}><Edit3 size={15} /></button>
                              <button onClick={() => deleteCultureItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={15} /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {cultureItems.length === 0 && (
                      <p style={{ textAlign: 'center', color: 'var(--color-gray-medium)', fontSize: '0.875rem', padding: '2rem' }}>Nenhum item de cultura cadastrado</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: QR Codes */}
              {activeTab === 'qrcodes' && (
                <div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <button onClick={() => generateFormLink('culture_self_assessment')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                      <QrCode size={16} /> Gerar QR Cultura
                    </button>
                    <button onClick={() => generateFormLink('temperament')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'var(--color-secondary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                      <QrCode size={16} /> Gerar QR Temperamento
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {formLinks.map(link => {
                      const isCulture = link.form_type === 'culture_self_assessment';
                      const url = `${APP_BASE_URL}/form/${isCulture ? 'cultura' : 'temperamento'}/${link.token}`;
                      return (
                        <div key={link.id} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', textAlign: 'center', border: `1px solid ${link.is_active ? '#e2e8f0' : '#fee2e2'}`, opacity: link.is_active ? 1 : 0.6 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isCulture ? 'var(--color-primary)' : 'var(--color-secondary)', marginBottom: '0.75rem' }}>
                            {isCulture ? '📋 Cultura' : '🧠 Temperamento'}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', padding: '0.5rem', background: '#fff', borderRadius: '6px' }}>
                            <QRCodeSVG value={url} size={120} />
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-gray-medium)', wordBreak: 'break-all', marginBottom: '0.75rem' }}>{url}</div>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button onClick={() => toggleFormLink(link.id, link.is_active)} style={{ background: link.is_active ? '#dcfce7' : '#f1f5f9', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.75rem', color: link.is_active ? '#16a34a' : '#64748b' }}>
                              {link.is_active ? 'Ativo' : 'Inativo'}
                            </button>
                            <button onClick={() => deleteFormLink(link.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', cursor: 'pointer', color: '#ef4444' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {formLinks.length === 0 && (
                      <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.875rem', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                        Nenhum QR gerado. Use os botões acima para criar.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
