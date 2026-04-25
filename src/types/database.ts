export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      client_branding: {
        Row: {
          client_id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_branding_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["client_status_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["client_status_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["client_status_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      culture_items: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "culture_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_self_assessment_answers: {
        Row: {
          assessment_id: string
          created_at: string
          culture_item_id: string
          id: string
          justification_text: string | null
          score: number
        }
        Insert: {
          assessment_id: string
          created_at?: string
          culture_item_id: string
          id?: string
          justification_text?: string | null
          score: number
        }
        Update: {
          assessment_id?: string
          created_at?: string
          culture_item_id?: string
          id?: string
          justification_text?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "culture_self_assessment_answers_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "culture_self_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_self_assessment_answers_culture_item_id_fkey"
            columns: ["culture_item_id"]
            isOneToOne: false
            referencedRelation: "culture_items"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_self_assessments: {
        Row: {
          client_id: string
          created_at: string
          department: string | null
          id: string
          respondent_level: string | null
          respondent_name: string
          respondent_org_unit_id: string | null
          respondent_role: string | null
          respondent_user_id: string | null
          submitted_at: string | null
          supervisor_name: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          department?: string | null
          id?: string
          respondent_level?: string | null
          respondent_name: string
          respondent_org_unit_id?: string | null
          respondent_role?: string | null
          respondent_user_id?: string | null
          submitted_at?: string | null
          supervisor_name?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          department?: string | null
          id?: string
          respondent_level?: string | null
          respondent_name?: string
          respondent_org_unit_id?: string | null
          respondent_role?: string | null
          respondent_user_id?: string | null
          submitted_at?: string | null
          supervisor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_self_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_self_assessments_respondent_org_unit_id_fkey"
            columns: ["respondent_org_unit_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_self_assessments_respondent_user_id_fkey"
            columns: ["respondent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_sessions: {
        Row: {
          client_id: string
          created_at: string
          giver_id: string | null
          id: string
          notes: string | null
          org_unit_id: string | null
          receiver_id: string | null
          receiver_name: string
          session_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          giver_id?: string | null
          id?: string
          notes?: string | null
          org_unit_id?: string | null
          receiver_id?: string | null
          receiver_name: string
          session_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          giver_id?: string | null
          id?: string
          notes?: string | null
          org_unit_id?: string | null
          receiver_id?: string | null
          receiver_name?: string
          session_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_sessions_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_sessions_org_unit_id_fkey"
            columns: ["org_unit_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_sessions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_units: {
        Row: {
          client_id: string
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_unit_id: string | null
          unit_type: Database["public"]["Enums"]["org_unit_type_enum"]
          updated_at: string
        }
        Insert: {
          client_id: string
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_unit_id?: string | null
          unit_type: Database["public"]["Enums"]["org_unit_type_enum"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_unit_id?: string | null
          unit_type?: Database["public"]["Enums"]["org_unit_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_units_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_units_parent_unit_id_fkey"
            columns: ["parent_unit_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          global_role: Database["public"]["Enums"]["global_role_enum"] | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          global_role?: Database["public"]["Enums"]["global_role_enum"] | null
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          global_role?: Database["public"]["Enums"]["global_role_enum"] | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      public_form_links: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string | null
          form_type: Database["public"]["Enums"]["form_type_enum"]
          hierarchy_level: string | null
          id: string
          is_active: boolean
          token: string
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at?: string | null
          form_type: Database["public"]["Enums"]["form_type_enum"]
          hierarchy_level?: string | null
          id?: string
          is_active?: boolean
          token?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string | null
          form_type?: Database["public"]["Enums"]["form_type_enum"]
          hierarchy_level?: string | null
          id?: string
          is_active?: boolean
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_form_links_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      ropac_records: {
        Row: {
          acompanhamento: string | null
          client_id: string
          comprometimento: string | null
          created_at: string
          id: string
          objetivo: string | null
          org_unit_id: string | null
          owner_id: string | null
          owner_name: string
          period_ref: string | null
          plano: string | null
          resultado: string | null
          status: string
          updated_at: string
        }
        Insert: {
          acompanhamento?: string | null
          client_id: string
          comprometimento?: string | null
          created_at?: string
          id?: string
          objetivo?: string | null
          org_unit_id?: string | null
          owner_id?: string | null
          owner_name: string
          period_ref?: string | null
          plano?: string | null
          resultado?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          acompanhamento?: string | null
          client_id?: string
          comprometimento?: string | null
          created_at?: string
          id?: string
          objetivo?: string | null
          org_unit_id?: string | null
          owner_id?: string | null
          owner_name?: string
          period_ref?: string | null
          plano?: string | null
          resultado?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ropac_records_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ropac_records_org_unit_id_fkey"
            columns: ["org_unit_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ropac_records_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisor_evaluation_answers: {
        Row: {
          answer_text: string | null
          created_at: string
          evaluation_id: string
          id: string
          question_ref: string
          score: number | null
        }
        Insert: {
          answer_text?: string | null
          created_at?: string
          evaluation_id: string
          id?: string
          question_ref: string
          score?: number | null
        }
        Update: {
          answer_text?: string | null
          created_at?: string
          evaluation_id?: string
          id?: string
          question_ref?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "supervisor_evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisor_evaluations: {
        Row: {
          client_id: string
          created_at: string
          evaluatee_id: string | null
          evaluatee_name: string
          evaluator_id: string | null
          id: string
          org_unit_id: string | null
          period_ref: string | null
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          evaluatee_id?: string | null
          evaluatee_name: string
          evaluator_id?: string | null
          id?: string
          org_unit_id?: string | null
          period_ref?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          evaluatee_id?: string | null
          evaluatee_name?: string
          evaluator_id?: string | null
          id?: string
          org_unit_id?: string | null
          period_ref?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_evaluations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_evaluations_evaluatee_id_fkey"
            columns: ["evaluatee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_evaluations_org_unit_id_fkey"
            columns: ["org_unit_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
        ]
      }
      temperament_answers: {
        Row: {
          answer_text: string | null
          created_at: string
          id: string
          option_id: string | null
          question_id: string
          submission_id: string
        }
        Insert: {
          answer_text?: string | null
          created_at?: string
          id?: string
          option_id?: string | null
          question_id: string
          submission_id: string
        }
        Update: {
          answer_text?: string | null
          created_at?: string
          id?: string
          option_id?: string | null
          question_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temperament_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "temperament_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperament_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "temperament_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperament_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "temperament_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      temperament_options: {
        Row: {
          display_order: number
          id: string
          label: string
          question_id: string
          value: string
          weight: number
        }
        Insert: {
          display_order?: number
          id?: string
          label: string
          question_id: string
          value: string
          weight?: number
        }
        Update: {
          display_order?: number
          id?: string
          label?: string
          question_id?: string
          value?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "temperament_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "temperament_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      temperament_questionnaires: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "temperament_questionnaires_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      temperament_questions: {
        Row: {
          display_order: number
          id: string
          is_active: boolean
          prompt: string
          question_type: string
          questionnaire_id: string
        }
        Insert: {
          display_order?: number
          id?: string
          is_active?: boolean
          prompt: string
          question_type?: string
          questionnaire_id: string
        }
        Update: {
          display_order?: number
          id?: string
          is_active?: boolean
          prompt?: string
          question_type?: string
          questionnaire_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temperament_questions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "temperament_questionnaires"
            referencedColumns: ["id"]
          },
        ]
      }
      temperament_submissions: {
        Row: {
          client_id: string
          created_at: string
          department: string | null
          id: string
          questionnaire_id: string | null
          respondent_level: string | null
          respondent_name: string
          respondent_org_unit_id: string | null
          respondent_role: string | null
          respondent_user_id: string | null
          result_summary: Json | null
          submitted_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          department?: string | null
          id?: string
          questionnaire_id?: string | null
          respondent_level?: string | null
          respondent_name: string
          respondent_org_unit_id?: string | null
          respondent_role?: string | null
          respondent_user_id?: string | null
          result_summary?: Json | null
          submitted_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          department?: string | null
          id?: string
          questionnaire_id?: string | null
          respondent_level?: string | null
          respondent_name?: string
          respondent_org_unit_id?: string | null
          respondent_role?: string | null
          respondent_user_id?: string | null
          result_summary?: Json | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temperament_submissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperament_submissions_questionnaire_id_fkey"
            columns: ["questionnaire_id"]
            isOneToOne: false
            referencedRelation: "temperament_questionnaires"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperament_submissions_respondent_org_unit_id_fkey"
            columns: ["respondent_org_unit_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperament_submissions_respondent_user_id_fkey"
            columns: ["respondent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_client_roles: {
        Row: {
          client_id: string
          client_role: Database["public"]["Enums"]["client_role_enum"]
          created_at: string
          id: string
          status: Database["public"]["Enums"]["user_client_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          client_role: Database["public"]["Enums"]["client_role_enum"]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["user_client_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          client_role?: Database["public"]["Enums"]["client_role_enum"]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["user_client_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_client_roles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_client_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_org_assignments: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_primary: boolean
          org_unit_id: string
          role: Database["public"]["Enums"]["client_role_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          org_unit_id: string
          role: Database["public"]["Enums"]["client_role_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          org_unit_id?: string
          role?: Database["public"]["Enums"]["client_role_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_org_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_org_assignments_org_unit_id_fkey"
            columns: ["org_unit_id"]
            isOneToOne: false
            referencedRelation: "org_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_org_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_get_descendant_unit_ids: {
        Args: { p_unit_id: string }
        Returns: {
          unit_id: string
        }[]
      }
      fn_get_my_client_ids: { Args: never; Returns: string[] }
      fn_get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["client_role_enum"][]
      }
      fn_get_user_client_role: {
        Args: { p_client_id: string }
        Returns: Database["public"]["Enums"]["client_role_enum"]
      }
      fn_get_user_global_role: {
        Args: never
        Returns: Database["public"]["Enums"]["global_role_enum"]
      }
      fn_get_user_primary_client_id: { Args: never; Returns: string }
      fn_get_user_primary_org_unit_id: {
        Args: { p_client_id: string }
        Returns: string
      }
      fn_is_platform_admin: { Args: never; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      client_role_enum:
        | "client_ceo"
        | "client_manager"
        | "client_coordinator"
        | "client_supervisor"
        | "employee_respondent"
      client_status_enum: "active" | "inactive" | "suspended"
      form_type_enum: "culture_self_assessment" | "temperament"
      global_role_enum: "platform_admin"
      org_unit_type_enum:
        | "company"
        | "management"
        | "coordination"
        | "supervision"
      user_client_status_enum: "active" | "inactive" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      client_role_enum: [
        "client_ceo",
        "client_manager",
        "client_coordinator",
        "client_supervisor",
        "employee_respondent",
      ],
      client_status_enum: ["active", "inactive", "suspended"],
      form_type_enum: ["culture_self_assessment", "temperament"],
      global_role_enum: ["platform_admin"],
      org_unit_type_enum: [
        "company",
        "management",
        "coordination",
        "supervision",
      ],
      user_client_status_enum: ["active", "inactive", "pending"],
    },
  },
} as const

export type Client = Database['public']['Tables']['clients']['Row'];
export type CultureItem = Database['public']['Tables']['culture_items']['Row'];
export type TemperamentQuestion = Database['public']['Tables']['temperament_questions']['Row'];
export type TemperamentOption = Database['public']['Tables']['temperament_options']['Row'];
export type OrgUnit = Database['public']['Tables']['org_units']['Row'];
export type OrgUnitType = Database['public']['Enums']['org_unit_type_enum'];
export type GlobalRole = Database['public']['Enums']['global_role_enum'];
export type ClientRole = Database['public']['Enums']['client_role_enum'];

