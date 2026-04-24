import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import type { TemperamentQuestion, TemperamentOption } from '../../../types/database';
import { CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

// ── Tipos ────────────────────────────────────────────────────

type TokenStatus = 'validating' | 'valid' | 'invalid' | 'expired';

interface RespondentInfo {
  name: string;
  role: string;
  level: string;
  department: string;
}

interface QuestionWithOptions extends TemperamentQuestion {
  temperament_options: TemperamentOption[];
}

// ── Component ────────────────────────────────────────────────

export default function TemperamentForm() {
  const { token } = useParams<{ token: string }>();

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('validating');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);

  const [step, setStep] = useState<'info' | 'form' | 'done'>('info');
  const [respondent, setRespondent] = useState<RespondentInfo>({ name: '', role: '', level: '', department: '' });
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId or text
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
    if (data.form_type !== 'temperament') { setTokenStatus('invalid'); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setTokenStatus('expired'); return; }

    setClientId(data.client_id);

    // Dados do cliente
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

    // Carregar questionário ativo do cliente (ou global)
    const { data: questionnaire } = await supabase
      .from('temperament_questionnaires')
      .select('id')
      .or(`client_id.eq.${data.client_id},client_id.is.null`)
      .eq('is_active', true)
      .order('client_id', { ascending: false }) // prefere o do cliente
      .limit(1)
      .single();

    if (questionnaire) {
      setQuestionnaireId(questionnaire.id);

      // Carregar perguntas + opções
      const { data: qs } = await supabase
        .from('temperament_questions')
        .select('*, temperament_options(*)')
        .eq('questionnaire_id', questionnaire.id)
        .eq('is_active', true)
        .order('display_order');

      setQuestions((qs as QuestionWithOptions[]) ?? []);
    }

    setTokenStatus('valid');
  }

  // ── Submit ───────────────────────────────────────────────────

  async function handleSubmit() {
    if (!clientId) return;
    setSubmitting(true);

    const { data: submission, error } = await supabase
      .from('temperament_submissions')
      .insert({
        client_id: clientId,
        questionnaire_id: questionnaireId,
        respondent_name: respondent.name,
        respondent_role: respondent.role,
        respondent_level: respondent.level,
        department: respondent.department,
        respondent_user_id: null, // anônimo
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !submission) {
      console.error('Erro ao salvar submissão:', error);
      setSubmitting(false);
      return;
    }

    // Inserir respostas
    const answerRows = Object.entries(answers).map(([questionId, value]) => {
      const question = questions.find(q => q.id === questionId);
      const isOption = question?.question_type !== 'text';
      return {
        submission_id: submission.id,
        question_id: questionId,
        option_id: isOption ? value : null,
        answer_text: !isOption ? value : null,
      };
    });

    if (answerRows.length > 0) {
      await supabase.from('temperament_answers').insert(answerRows);
    }

    setStep('done');
    setSubmitting(false);
  }

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id]);
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
          <p style={{ color: '#15803d' }}>Sua avaliação de temperamento foi registrada.</p>
        </div>
      </FormShell>
    );
  }

  return (
    <FormShell logoUrl={logoUrl} clientName={clientName}>
      {step === 'info' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-dark)' }}>
            Avaliação de Temperamento
          </h2>
          <p style={{ color: 'var(--color-gray-medium)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {questionnaireId ? 'Responda honestamente. Não há respostas certas ou erradas.' : 'Nenhum questionário ativo encontrado para este cliente.'}
          </p>

          {!questionnaireId ? (
            <div style={{ textAlign: 'center', color: '#f59e0b', padding: '2rem' }}>
              <AlertCircle size={32} />
              <p>Nenhum questionário de temperamento ativo foi configurado.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'Seu nome completo *', key: 'name', placeholder: 'Nome completo' },
                  { label: 'Seu cargo', key: 'role', placeholder: 'Ex: Técnico de Qualidade' },
                  { label: 'Setor / Departamento', key: 'department', placeholder: 'Ex: Qualidade' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem', color: '#475569' }}>{field.label}</label>
                    <input
                      type="text"
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
            </>
          )}
        </div>
      )}

      {step === 'form' && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Responda cada afirmação
          </h2>
          <p style={{ color: 'var(--color-gray-medium)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Escolha a opção que melhor representa você.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {questions.map((q, idx) => (
              <div key={q.id} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem 1.125rem', border: answers[q.id] ? '1px solid #bfdbfe' : '1px solid #f1f5f9' }}>
                <p style={{ fontWeight: 700, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
                  {idx + 1}. {q.prompt}
                </p>

                {q.question_type === 'multiple_choice' && q.temperament_options.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[...q.temperament_options].sort((a, b) => a.display_order - b.display_order).map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setAnswers(p => ({ ...p, [q.id]: opt.id }))}
                        style={{
                          textAlign: 'left', padding: '0.6rem 0.875rem',
                          borderRadius: '8px', border: '2px solid',
                          borderColor: answers[q.id] === opt.id ? 'var(--color-primary)' : '#e2e8f0',
                          background: answers[q.id] === opt.id ? 'rgba(43,151,193,0.08)' : '#fff',
                          cursor: 'pointer', fontSize: '0.875rem', fontWeight: answers[q.id] === opt.id ? 600 : 400,
                          color: 'var(--color-dark)', transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  // Scale 1-5 para outros tipos
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setAnswers(p => ({ ...p, [q.id]: String(n) }))}
                        style={{
                          width: '42px', height: '42px', borderRadius: '8px', border: 'none',
                          fontWeight: 700, cursor: 'pointer',
                          background: answers[q.id] === String(n) ? 'var(--color-primary)' : '#e2e8f0',
                          color: answers[q.id] === String(n) ? '#fff' : '#475569',
                          transition: 'all 0.15s',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
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
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <img src="/imgs/Logotipo_Perfil Instagram 01.png" alt="FoodFlow" style={{ height: '32px', borderRadius: '4px' }} />
        {logoUrl && <img src={logoUrl} alt={clientName} style={{ height: '32px', borderRadius: '4px', objectFit: 'contain' }} />}
        {!logoUrl && clientName && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>{clientName}</span>}
      </div>
      <div style={{ width: '100%', maxWidth: '560px', background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
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
