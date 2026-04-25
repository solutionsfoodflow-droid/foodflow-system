-- Policy to allow anonymous read on culture_items if active
DROP POLICY IF EXISTS "culture_items: public read active" ON public.culture_items;
CREATE POLICY "culture_items: public read active" ON public.culture_items
    FOR SELECT
    TO public
    USING (is_active = true);

-- Policy to allow anonymous read on temperament_questions if active
DROP POLICY IF EXISTS "temp_questions: public read active" ON public.temperament_questions;
CREATE POLICY "temp_questions: public read active" ON public.temperament_questions
    FOR SELECT
    TO public
    USING (is_active = true);
