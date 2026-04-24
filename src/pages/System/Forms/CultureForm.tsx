import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import type { CultureItem } from '../../../types/database';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

// ── Form state ───────────────────────────────────────────────

interface RespondentInfo {
  name: string;
  role: string;
  level: string;
  department: string;
  supervisorName: string;
}

type FormAnswer = { score: number; justification: string };

type TokenStatus = 'validating' | 'valid' | 'invalid' | 'expired';

// ── Component ────────────────────────────────────────────────

export default function CultureForm() {
  const { token } = useParams<{ token: string }>();

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('validating');
  const [clientId, setClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [step, setStep] = useState<'info' | 'form' | 'done'>('info');
  const [respondent, setRespondent] = useState<RespondentInfo>({
    name: '', role: '', level: '', department: '', supervisorName: '',
  });
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Validação do token ───────────────────────────────────────

  useEffect(() => {
    if (!token) { setTokenStatus('invalid'); return; }
    validateToken(token);
  }, [token]);

  async function validateToken(tok: string) {
    const { data, error } = await supabase
      .from('public_form_links')
      .select('client_id, form_type, is_active, expires_at')
      .eq('token', tok)
      .single();

    if (error || !data) { setTokenStatus('invalid'); return; }
    if (!data.is_active) { setTokenStatus('invalid'); return; }
    if (data.form_type !== 'culture_self_assessment') { setTokenStatus('invalid'); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setTokenStatus('expired'); return; }

    setClientId(data.client_id);

    // Carregar dados do cliente
    const { data: client } = await supabase
      .from('clients')
      .select('name, client_branding(logo_url)')
      .eq('id', data.client_id)
      .single();

    if (client) {
      setClientName(client.name);
      const branding = Array.isArray(client.client_branding) ? client.client_branding[0] : client.client_branding;
      setLogoUrl(branding?.logo_url ?? null);
    }

    // Carregar itens de cultura ativos
    const { data: items } = await supabase
      .from('culture_items')
      .select('*')
      .eq('client_id', data.client_id)
      .eq('is_active', true)
      .order('display_order');

    setCultureItems(items ?? []);
    setTokenStatus('valid');
  }

  // ── Submit ───────────────────────────────────────────────────

  async function handleSubmit() {
    if (!clientId) return;
    setSubmitting(true);

    // Inserir a avaliação principal
    const { data: assessment, error } = await supabase
      .from('culture_self_assessments')
      .insert({
        client_id: clientId,
        respondent_name: respondent.name,
        respondent_role: respondent.role,
        respondent_level: respondent.level,
        department: respondent.department,
        supervisor_name: respondent.supervisorName,
        respondent_user_id: null, // anônimo — vínculo futuro via Edge Function
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !assessment) {
      console.error('Erro ao salvar avaliação:', error);
      setSubmitting(false);
      return;
    }

    // Inserir respostas por item
    const answerRows = Object.entries(answers).map(([itemId, ans]) => ({
      assessment_id: assessment.id,
      culture_item_id: itemId,
      score: ans.score,
      justification_text: ans.justification || null,
    }));

    if (answerRows.length > 0) {
      await supabase.from('culture_self_assessment_answers').insert(answerRows);
    }

    setStep('done');
    setSubmitting(false);
  }

  const allAnswered = cultureItems.length > 0 && cultureItems.every(i => answers[i.id]?.score > 0);
  const infoComplete = respondent.name.trim() && respondent.level;

  // ── Renders ──────────────────────────────────────────────────

  if (tokenStatus === 'validating') {
    return <FormShell><div style={centered}>Verificando acesso...</div></FormShell>;
  }

  if (tokenStatus === 'invalid') {
    return (
      <FormShell>
        <div style={{ ...centered, color: '#ef4444' }}>
          <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
          <h2>Link inválido</h2>
          <p>Este QR Code não é válido ou foi desativado.</p>
        </div>
      </FormShell>
    );
  }

  if (tokenStatus === 'expired') {
    return (
      <FormShell>
        <div style={{ ...centered, color: '#f59e0b' }}>
          <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
          <h2>Link expirado</h2>
          <p>Este formulário não está mais disponível.</p>
        </div>
      </FormShell>
    );
  }

  if (step === 'done') {
    return (
      <FormShell logoUrl={logoUrl} clientName={clientName}>
        <div style={{ ...centered, color: '#22c55e' }}>
          <CheckCircle size={56} style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#14532d', margin: '0 0 0.5rem' }}>Obrigado!</h2>
          <p style={{ color: '#15803d' }}>Sua avaliação foi registrada com sucesso.</p>
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell logoUrl={logoUrl} clientName={clientName}>
      {step === 'info' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-dark)' }}>
            Avaliação de Cultura Organizacional
          </h2>
          <p style={{ color: 'var(--color-gray-medium)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Antes de começar, nos informe alguns dados sobre você.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Seu nome completo *', key: 'name', placeholder: 'Nome completo', type: 'text' },
              { label: 'Seu cargo', key: 'role', placeholder: 'Ex: Operador de Produção', type: 'text' },
              { label: 'Setor / Departamento', key: 'department', placeholder: 'Ex: Produção', type: 'text' },
              { label: 'Nome do supervisor direto', key: 'supervisorName', placeholder: 'Ex: João da Silva', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: '#475569' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={respondent[field.key as keyof RespondentInfo]}
                  onChange={e => setRespondent(p => ({ ...p, [field.key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.7rem 0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: '#475569' }}>Seu nível hierárquico *</label>
              <select
                value={respondent.level}
                onChange={e => setRespondent(p => ({ ...p, level: e.target.value }))}
                style={{ width: '100%', padding: '0.7rem 0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value="">Selecione...</option>
                <option value="client_supervisor">Supervisor</option>
                <option value="client_coordinator">Coordenador</option>
                <option value="client_manager">Gerente</option>
                <option value="client_ceo">CEO / Diretoria</option>
                <option value="employee_respondent">Colaborador</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setStep('form')}
            disabled={!infoComplete}
            style={{
              marginTop: '1.5rem', width: '100%', padding: '0.9rem',
              background: infoComplete ? 'var(--color-primary)' : '#e2e8f0',
              color: infoComplete ? '#fff' : '#94a3b8',
              border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600,
              cursor: infoComplete ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            Iniciar Avaliação <ChevronRight size={18} />
          </button>
        </div>
      )}

      {step === 'form' && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-dark)' }}>
            Avalie cada pilar cultural
          </h2>
          <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Nota 1 = Discordo totalmente · Nota 5 = Concordo totalmente
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cultureItems.map((item, idx) => (
              <div key={item.id} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem 1.125rem', border: answers[item.id]?.score ? '1px solid #bfdbfe' : '1px solid #f1f5f9' }}>
                <p style={{ fontWeight: 700, margin: '0 0 0.25rem', fontSize: '0.9rem' }}>
                  {idx + 1}. {item.title}
                </p>
                {item.description && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.75rem' }}>{item.description}</p>
                )}

                {/* Score buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setAnswers(p => ({ ...p, [item.id]: { ...p[item.id], score: n, justification: p[item.id]?.justification ?? '' } }))}
                      style={{
                        width: '40px', height: '40px', borderRadius: '8px', border: 'none',
                        fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                        background: answers[item.id]?.score === n ? 'var(--color-primary)' : '#e2e8f0',
                        color: answers[item.id]?.score === n ? '#fff' : '#475569',
                        transition: 'all 0.15s',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Justificativa (opcional)"
                  value={answers[item.id]?.justification ?? ''}
                  onChange={e => setAnswers(p => ({ ...p, [item.id]: { score: p[item.id]?.score ?? 0, justification: e.target.value } }))}
                  rows={2}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box', background: '#fff' }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setStep('info')}
              style={{ padding: '0.85rem 1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer', color: '#64748b', fontWeight: 600 }}
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              style={{
                flex: 1, padding: '0.85rem',
                background: allAnswered && !submitting ? 'var(--color-primary)' : '#e2e8f0',
                color: allAnswered && !submitting ? '#fff' : '#94a3b8',
                border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 600,
                cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed',
              }}
            >
              {submitting ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </div>
      )}
    </FormShell>
  );
}

// ── Shell ────────────────────────────────────────────────────

function FormShell({ children, logoUrl, clientName }: { children: React.ReactNode; logoUrl?: string | null; clientName?: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <img src="/imgs/Logotipo_Perfil Instagram 01.png" alt="FoodFlow" style={{ height: '32px', borderRadius: '4px' }} />
        {logoUrl && <img src={logoUrl} alt={clientName} style={{ height: '32px', borderRadius: '4px', objectFit: 'contain' }} />}
        {!logoUrl && clientName && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>{clientName}</span>}
      </div>

      <div style={{
        width: '100%', maxWidth: '560px', background: '#fff',
        borderRadius: '16px', padding: '2rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {children}
      </div>
    </div>
  );
}

const centered: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', textAlign: 'center', padding: '2rem',
};

import React from 'react';
