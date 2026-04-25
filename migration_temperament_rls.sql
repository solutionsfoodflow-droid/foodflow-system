-- Permitir INSERT em temperament_questionnaires para platform_admin
DROP POLICY IF EXISTS "temp_questionnaires: platform_admin insert" ON temperament_questionnaires;
CREATE POLICY "temp_questionnaires: platform_admin insert" ON temperament_questionnaires
FOR INSERT
WITH CHECK (fn_is_platform_admin());

-- Permitir UPDATE em temperament_questionnaires para platform_admin
DROP POLICY IF EXISTS "temp_questionnaires: platform_admin update" ON temperament_questionnaires;
CREATE POLICY "temp_questionnaires: platform_admin update" ON temperament_questionnaires
FOR UPDATE
USING (fn_is_platform_admin());

-- Permitir DELETE em temperament_questionnaires para platform_admin
DROP POLICY IF EXISTS "temp_questionnaires: platform_admin delete" ON temperament_questionnaires;
CREATE POLICY "temp_questionnaires: platform_admin delete" ON temperament_questionnaires
FOR DELETE
USING (fn_is_platform_admin());

-- Permitir INSERT em temperament_questions para platform_admin
DROP POLICY IF EXISTS "temp_questions: platform_admin insert" ON temperament_questions;
CREATE POLICY "temp_questions: platform_admin insert" ON temperament_questions
FOR INSERT
WITH CHECK (fn_is_platform_admin());

-- Permitir UPDATE em temperament_questions para platform_admin
DROP POLICY IF EXISTS "temp_questions: platform_admin update" ON temperament_questions;
CREATE POLICY "temp_questions: platform_admin update" ON temperament_questions
FOR UPDATE
USING (fn_is_platform_admin());

-- Permitir DELETE em temperament_questions para platform_admin
DROP POLICY IF EXISTS "temp_questions: platform_admin delete" ON temperament_questions;
CREATE POLICY "temp_questions: platform_admin delete" ON temperament_questions
FOR DELETE
USING (fn_is_platform_admin());
