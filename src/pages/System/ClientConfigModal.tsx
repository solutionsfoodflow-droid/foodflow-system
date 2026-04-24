import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import { api, type Client, type CultureItem } from '../../store/mockDB';

interface ClientConfigModalProps {
  clientId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function ClientConfigModal({ clientId, onClose, onUpdated }: ClientConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'cultura' | 'branding'>('cultura');
  const [client, setClient] = useState<Client | null>(null);
  
  // Cultura State
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<CultureItem> | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);

  // Branding State
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState<string>('#32cc3d');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = () => {
    const c = api.getClientById(clientId);
    if (c) {
      setClient(c);
      setLogoBase64(c.logoUrl || '');
      setPrimaryColor(c.primaryColor || '#32cc3d');
    }
    setCultureItems(api.getAllCultureItems(clientId).sort((a, b) => a.ordem - b.ordem));
  };

  if (!client) return null;

  // -- Handlers Cultura --
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.titulo || !editingItem?.descricao) return;

    if (editingItem.id) {
      api.updateCultureItem(editingItem.id, editingItem);
    } else {
      api.addCultureItem({
        clienteId: clientId,
        titulo: editingItem.titulo,
        descricao: editingItem.descricao,
        ordem: editingItem.ordem || 1,
        ativo: editingItem.ativo ?? true,
      });
    }
    setShowItemForm(false);
    setEditingItem(null);
    loadData();
    onUpdated();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item de cultura?')) {
      api.deleteCultureItem(id);
      loadData();
      onUpdated();
    }
  };

  // -- Handlers Branding --
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = () => {
    api.updateClient(clientId, {
      logoUrl: logoBase64,
      primaryColor: primaryColor
    });
    alert('Identidade visual salva com sucesso!');
    loadData();
    onUpdated();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: '900px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', padding: 0
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-gray-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-dark)' }}>Configuração do Cliente</h2>
            <p style={{ margin: 0, color: 'var(--color-gray-medium)', fontSize: '0.9rem' }}>{client.nome}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-medium)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-gray-light)', background: '#fafafa' }}>
          <button 
            onClick={() => setActiveTab('cultura')}
            style={{ 
              padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'cultura' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'cultura' ? 'var(--color-primary)' : 'var(--color-gray-medium)',
              fontWeight: activeTab === 'cultura' ? 600 : 400
            }}
          >
            Cultura Organizacional
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            style={{ 
              padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === 'branding' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'branding' ? 'var(--color-primary)' : 'var(--color-gray-medium)',
              fontWeight: activeTab === 'branding' ? 600 : 400
            }}
          >
            Identidade Visual
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Taba: Cultura */}
          {activeTab === 'cultura' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--color-dark)' }}>Itens / Pilares da Cultura</h3>
                {!showItemForm && (
                  <button className="btn btn-primary" onClick={() => { setEditingItem({ ativo: true, ordem: cultureItems.length + 1 }); setShowItemForm(true); }}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Adicionar Item
                  </button>
                )}
              </div>

              {showItemForm ? (
                <form onSubmit={handleSaveItem} style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--color-gray-light)' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>{editingItem?.id ? 'Editar Item' : 'Novo Item'}</h4>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Título do Item / Pilar</label>
                    <input 
                      type="text" 
                      className="input" 
                      required 
                      value={editingItem?.titulo || ''} 
                      onChange={e => setEditingItem(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Foco no Cliente"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descrição Explicativa</label>
                    <textarea 
                      className="input" 
                      required 
                      rows={3}
                      value={editingItem?.descricao || ''} 
                      onChange={e => setEditingItem(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o que significa este pilar para a empresa"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Ordem de Exibição</label>
                      <input 
                        type="number" 
                        className="input" 
                        required 
                        min="1"
                        value={editingItem?.ordem || 1} 
                        onChange={e => setEditingItem(prev => ({ ...prev, ordem: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Status</label>
                      <select 
                        className="input" 
                        value={editingItem?.ativo ? 'ativo' : 'inativo'}
                        onChange={e => setEditingItem(prev => ({ ...prev, ativo: e.target.value === 'ativo' }))}
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview the culture item */}
                  <div style={{ padding: '1rem', background: 'white', border: '1px dashed #ccc', borderRadius: '4px', marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--color-gray-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Eye size={14}/> Preview de como aparecerá no formulário do cliente:</p>
                    <div style={{ borderLeft: `4px solid ${client.primaryColor || 'var(--color-primary)'}`, paddingLeft: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-dark)' }}>{editingItem?.titulo || '[Título do Item]'}</h4>
                      <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.95rem' }}>{editingItem?.descricao || '[Descrição do Item]'}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} style={{ width: '35px', height: '35px', borderRadius: '50%', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.9rem' }}>{n}</div>
                        ))}
                      </div>
                      <input type="text" className="input" placeholder="Justifique (Exemplo de atitude...)" disabled />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowItemForm(false); setEditingItem(null); }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Salvar Item</button>
                  </div>
                </form>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-gray-light)' }}>
                        <th style={{ padding: '1rem', width: '60px' }}>Ordem</th>
                        <th style={{ padding: '1rem' }}>Pilar / Título</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cultureItems.length === 0 ? (
                         <tr>
                           <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-gray-medium)' }}>Nenhum item cadastrado.</td>
                         </tr>
                      ) : cultureItems.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-gray-light)', opacity: item.ativo ? 1 : 0.6 }}>
                          <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-gray-medium)' }}>#{item.ordem}</td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-dark)', marginBottom: '0.25rem' }}>{item.titulo}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.descricao}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', background: item.ativo ? 'rgba(50,204,61,0.1)' : '#eee', color: item.ativo ? 'var(--color-secondary)' : '#666', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                              {item.ativo ? 'ATIVO' : 'INATIVO'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => { setEditingItem(item); setShowItemForm(true); }} title="Editar">
                              <Edit2 size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', color: '#e74c3c', borderColor: '#e74c3c' }} onClick={() => handleDeleteItem(item.id)} title="Excluir">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab: Branding */}
          {activeTab === 'branding' && (
            <div style={{ maxWidth: '600px' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-dark)' }}>Identidade Visual do Cliente</h3>
              <p style={{ color: 'var(--color-gray-medium)', marginBottom: '2rem' }}>
                A logo e as cores configuradas aqui refletirão no painel do cliente, formulários de cultura e QR Codes associados a ele, garantindo uma personalização institucional (co-branding).
              </p>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                <div style={{ width: '150px', height: '150px', border: '2px dashed var(--color-gray-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', overflow: 'hidden', position: 'relative' }}>
                  {logoBase64 ? (
                    <img src={logoBase64} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-gray-medium)' }}>
                      <ImageIcon size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '0.8rem' }}>Sem logo</div>
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Logo / Marca do Cliente</label>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>Para melhor resultado, use uma imagem PNG com fundo transparente (quadrada ou retangular).</p>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleLogoUpload}
                  />
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                      {logoBase64 ? 'Substituir Imagem' : 'Fazer Upload'}
                    </button>
                    {logoBase64 && (
                      <button className="btn btn-outline" style={{ color: '#e74c3c', borderColor: '#e74c3c' }} onClick={() => setLogoBase64('')}>
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                 <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cor de Apoio (Opcional)</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)}
                      style={{ width: '50px', height: '40px', padding: 0, border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                   />
                   <span style={{ color: '#666', fontSize: '0.9rem' }}>Essa cor será usada em botões e detalhes no painel do cliente.</span>
                 </div>
              </div>

              <button className="btn btn-primary" onClick={handleSaveBranding}>
                Salvar Identidade Visual
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
