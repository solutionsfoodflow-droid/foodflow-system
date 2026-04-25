-- Adicionar coluna hierarchy_level em public_form_links
ALTER TABLE public_form_links
ADD COLUMN IF NOT EXISTS hierarchy_level TEXT DEFAULT 'operacional';

-- Comentário: valores esperados: 'operacional', 'supervisor', 'coordenador', 'gerente'

-- RLS: permitir leitura pública do token (anônimo pode validar)
-- A tabela já tem: form_links: platform_admin full access, form_links: ceo sees links
-- Adicionar policy para leitura anônima (validação de token público)
DROP POLICY IF EXISTS "form_links: anon can validate token" ON public_form_links;
CREATE POLICY "form_links: anon can validate token" ON public_form_links
FOR SELECT
USING (is_active = true);
