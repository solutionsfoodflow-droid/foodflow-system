-- Add copied_from_item_id to culture_items
ALTER TABLE public.culture_items
ADD COLUMN IF NOT EXISTS copied_from_item_id UUID REFERENCES public.culture_items(id) ON DELETE SET NULL;

-- Remove the old mock responses first to satisfy foreign keys
DELETE FROM public.culture_self_assessment_answers;
DELETE FROM public.culture_self_assessments;

-- Clear old culture items
DELETE FROM public.culture_items;

-- Insert Colombina Items
INSERT INTO public.culture_items (client_id, title, description, display_order, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', 'FOCO NO CLIENTE', 'Entende que o cliente final é quem "paga o salário" de todos. Toma decisões considerando impacto em qualidade, prazo e segurança do produto entregue. Trata reclamações como oportunidade de melhoria, não como ataque pessoal. Age preventivamente para evitar retrabalho, desperdício e não conformidades. Cumpre padrões, procedimentos e especificações pensando no consumidor final.', 1, true),
('a1000000-0000-0000-0000-000000000001', 'CORAGEM', 'Fala a verdade, mesmo quando é desconfortável. Questiona processos ineficientes ou inseguros, com respeito. Assume erros sem tentar esconder ou transferir culpa. Propõe melhorias, mesmo correndo o risco de ser contrariado. Defende o que é certo, mesmo sob pressão por atalhos ou "jeitinhos".', 2, true),
('a1000000-0000-0000-0000-000000000001', 'HUMILDADE', 'Reconhece que sempre há algo a aprender. Ouve operadores, técnicos e colegas antes de tomar decisões. Aceita feedback sem reagir defensivamente. Reconhece erros e aprende com eles. Compartilha conhecimento em vez de usá-lo como poder.', 3, true),
('a1000000-0000-0000-0000-000000000001', 'FAZER ACONTECER', 'Sai do discurso e parte para a ação. Busca soluções em vez de desculpas. Assume responsabilidade pelo resultado, não só pela tarefa. Acompanha até a conclusão, não abandona no meio. Prioriza o que gera impacto real para o negócio.', 4, true),
('a1000000-0000-0000-0000-000000000001', 'COMPROMETIMENTO', 'Cumpre prazos e acordos. Assume responsabilidades como se o negócio fosse seu. Mantém padrão de qualidade mesmo quando não está sendo observado. Respeita regras, procedimentos e pessoas. Entrega o melhor possível, mesmo em cenários adversos.', 5, true),
('a1000000-0000-0000-0000-000000000001', 'ENERGIA POSITIVA', 'Mantém postura construtiva diante de problemas. Influencia o ambiente com atitude, não com reclamação. Colabora com colegas e ajuda quando necessário. Demonstra respeito, educação e empatia. Celebra pequenas conquistas e aprendizados.', 6, true);

-- Insert Alplastic Items
INSERT INTO public.culture_items (client_id, title, description, display_order, is_active) VALUES
('a2000000-0000-0000-0000-000000000002', 'RESULTADO', 'Foco: entrega, metas, performance. Cumprir metas de produção, qualidade e prazo, acompanhando indicadores diariamente. Priorizar atividades que geram maior impacto no resultado, evitando retrabalho e desperdício. Assumir responsabilidade por erros e agir rapidamente para corrigir desvios.', 1, true),
('a2000000-0000-0000-0000-000000000002', 'EXCELÊNCIA OPERACIONAL', 'Foco: eficiência, padronização e melhoria contínua. Seguir rigorosamente procedimentos operacionais padrão, POPs, e boas práticas. Identificar e propor melhorias em processos, com mentalidade de melhoria contínua. Manter organização e limpeza no ambiente de trabalho, 5S na prática.', 2, true),
('a2000000-0000-0000-0000-000000000002', 'RESPEITO AO MEIO AMBIENTE', 'Foco: impacto ambiental e uso consciente de recursos. Reduzir desperdícios de matéria-prima, água e energia durante os processos. Realizar descarte correto de resíduos conforme normas ambientais. Sugerir soluções mais sustentáveis para processos e produto.', 3, true),
('a2000000-0000-0000-0000-000000000002', 'RESPEITO ÀS PESSOAS E DIVERSIDADE', 'Foco: ambiente saudável, inclusivo e seguro. Tratar todos com respeito, independentemente de cargo, gênero, origem ou opinião. Ouvir ativamente colegas e valorizar diferentes pontos de vista. Não tolerar comportamentos discriminatórios ou desrespeitosos.', 4, true),
('a2000000-0000-0000-0000-000000000002', 'INOVAÇÃO', 'Foco: evolução constante e pensamento criativo. Propor novas ideias de produtos, processos ou melhorias operacionais. Testar soluções novas com responsabilidade e aprendizado contínuo. Estar aberto a mudanças e novas tecnologias.', 5, true),
('a2000000-0000-0000-0000-000000000002', 'SUSTENTABILIDADE', 'Foco: visão de longo prazo, econômica, social e ambiental. Tomar decisões considerando impactos futuros, não apenas imediatos. Evitar práticas que gerem custos ocultos, ambientais, operacionais ou humanos. Apoiar iniciativas que tornem o negócio mais duradouro e responsável.', 6, true),
('a2000000-0000-0000-0000-000000000002', 'SATISFAÇÃO DOS CLIENTES E COLABORADORES', 'Foco: experiência e relacionamento. Entregar produtos com qualidade e dentro dos padrões acordados. Atender clientes internos e externos com agilidade e clareza. Contribuir para um ambiente de trabalho positivo, colaborativo e motivador.', 7, true);
