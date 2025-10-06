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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          ancestry: Json | null
          client_code: string | null
          client_name: string
          country: string | null
          created_at: string
          current_stage: string | null
          decision_received: boolean | null
          dropbox_folder_id: string | null
          dropbox_path: string
          generation: Database["public"]["Enums"]["case_generation"] | null
          id: string
          intake_completed: boolean | null
          is_vip: boolean | null
          kpi_docs_percentage: number | null
          kpi_tasks_completed: number | null
          kpi_tasks_total: number | null
          last_synced_at: string | null
          metadata: Json | null
          notes: string | null
          oby_filed: boolean | null
          poa_approved: boolean | null
          progress: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
          wsc_received: boolean | null
        }
        Insert: {
          ancestry?: Json | null
          client_code?: string | null
          client_name: string
          country?: string | null
          created_at?: string
          current_stage?: string | null
          decision_received?: boolean | null
          dropbox_folder_id?: string | null
          dropbox_path: string
          generation?: Database["public"]["Enums"]["case_generation"] | null
          id?: string
          intake_completed?: boolean | null
          is_vip?: boolean | null
          kpi_docs_percentage?: number | null
          kpi_tasks_completed?: number | null
          kpi_tasks_total?: number | null
          last_synced_at?: string | null
          metadata?: Json | null
          notes?: string | null
          oby_filed?: boolean | null
          poa_approved?: boolean | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
          wsc_received?: boolean | null
        }
        Update: {
          ancestry?: Json | null
          client_code?: string | null
          client_name?: string
          country?: string | null
          created_at?: string
          current_stage?: string | null
          decision_received?: boolean | null
          dropbox_folder_id?: string | null
          dropbox_path?: string
          generation?: Database["public"]["Enums"]["case_generation"] | null
          id?: string
          intake_completed?: boolean | null
          is_vip?: boolean | null
          kpi_docs_percentage?: number | null
          kpi_tasks_completed?: number | null
          kpi_tasks_total?: number | null
          last_synced_at?: string | null
          metadata?: Json | null
          notes?: string | null
          oby_filed?: boolean | null
          poa_approved?: boolean | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
          wsc_received?: boolean | null
        }
        Relationships: []
      }
      client_portal_access: {
        Row: {
          case_id: string
          created_at: string
          id: string
          last_login: string | null
          login_count: number | null
          magic_link_expires_at: string | null
          magic_link_token: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          last_login?: string | null
          login_count?: number | null
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          last_login?: string | null
          login_count?: number | null
          magic_link_expires_at?: string | null
          magic_link_token?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_access_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string
          category: string | null
          created_at: string
          dropbox_file_id: string | null
          dropbox_path: string
          file_extension: string | null
          file_size: number | null
          id: string
          is_translated: boolean | null
          is_verified: boolean | null
          is_verified_by_hac: boolean | null
          metadata: Json | null
          name: string
          needs_translation: boolean | null
          person_type: string | null
          translation_required: boolean | null
          type: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          case_id: string
          category?: string | null
          created_at?: string
          dropbox_file_id?: string | null
          dropbox_path: string
          file_extension?: string | null
          file_size?: number | null
          id?: string
          is_translated?: boolean | null
          is_verified?: boolean | null
          is_verified_by_hac?: boolean | null
          metadata?: Json | null
          name: string
          needs_translation?: boolean | null
          person_type?: string | null
          translation_required?: boolean | null
          type?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          case_id?: string
          category?: string | null
          created_at?: string
          dropbox_file_id?: string | null
          dropbox_path?: string
          file_extension?: string | null
          file_size?: number | null
          id?: string
          is_translated?: boolean | null
          is_verified?: boolean | null
          is_verified_by_hac?: boolean | null
          metadata?: Json | null
          name?: string
          needs_translation?: boolean | null
          person_type?: string | null
          translation_required?: boolean | null
          type?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      hac_logs: {
        Row: {
          action_details: string | null
          action_type: string
          case_id: string
          id: string
          metadata: Json | null
          performed_at: string
          performed_by: string
          related_oby_id: string | null
          related_poa_id: string | null
          related_wsc_id: string | null
        }
        Insert: {
          action_details?: string | null
          action_type: string
          case_id: string
          id?: string
          metadata?: Json | null
          performed_at?: string
          performed_by: string
          related_oby_id?: string | null
          related_poa_id?: string | null
          related_wsc_id?: string | null
        }
        Update: {
          action_details?: string | null
          action_type?: string
          case_id?: string
          id?: string
          metadata?: Json | null
          performed_at?: string
          performed_by?: string
          related_oby_id?: string | null
          related_poa_id?: string | null
          related_wsc_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hac_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hac_logs_related_oby_id_fkey"
            columns: ["related_oby_id"]
            isOneToOne: false
            referencedRelation: "oby_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hac_logs_related_poa_id_fkey"
            columns: ["related_poa_id"]
            isOneToOne: false
            referencedRelation: "poa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hac_logs_related_wsc_id_fkey"
            columns: ["related_wsc_id"]
            isOneToOne: false
            referencedRelation: "wsc_letters"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_data: {
        Row: {
          address: Json | null
          ancestry_line: string | null
          autosave_data: Json | null
          case_id: string
          completion_percentage: number | null
          created_at: string
          current_citizenship: string[] | null
          date_of_birth: string | null
          email: string | null
          father_dob: string | null
          father_first_name: string | null
          father_last_name: string | null
          father_pob: string | null
          first_name: string | null
          id: string
          language_preference: string | null
          last_name: string | null
          maiden_name: string | null
          mgf_dob: string | null
          mgf_first_name: string | null
          mgf_last_name: string | null
          mgf_pob: string | null
          mgm_dob: string | null
          mgm_first_name: string | null
          mgm_last_name: string | null
          mgm_maiden_name: string | null
          mgm_pob: string | null
          mother_dob: string | null
          mother_first_name: string | null
          mother_last_name: string | null
          mother_maiden_name: string | null
          mother_pob: string | null
          passport_expiry_date: string | null
          passport_issue_date: string | null
          passport_issuing_country: string | null
          passport_number: string | null
          pgf_dob: string | null
          pgf_first_name: string | null
          pgf_last_name: string | null
          pgf_pob: string | null
          pgm_dob: string | null
          pgm_first_name: string | null
          pgm_last_name: string | null
          pgm_maiden_name: string | null
          pgm_pob: string | null
          phone: string | null
          place_of_birth: string | null
          sex: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          ancestry_line?: string | null
          autosave_data?: Json | null
          case_id: string
          completion_percentage?: number | null
          created_at?: string
          current_citizenship?: string[] | null
          date_of_birth?: string | null
          email?: string | null
          father_dob?: string | null
          father_first_name?: string | null
          father_last_name?: string | null
          father_pob?: string | null
          first_name?: string | null
          id?: string
          language_preference?: string | null
          last_name?: string | null
          maiden_name?: string | null
          mgf_dob?: string | null
          mgf_first_name?: string | null
          mgf_last_name?: string | null
          mgf_pob?: string | null
          mgm_dob?: string | null
          mgm_first_name?: string | null
          mgm_last_name?: string | null
          mgm_maiden_name?: string | null
          mgm_pob?: string | null
          mother_dob?: string | null
          mother_first_name?: string | null
          mother_last_name?: string | null
          mother_maiden_name?: string | null
          mother_pob?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_issuing_country?: string | null
          passport_number?: string | null
          pgf_dob?: string | null
          pgf_first_name?: string | null
          pgf_last_name?: string | null
          pgf_pob?: string | null
          pgm_dob?: string | null
          pgm_first_name?: string | null
          pgm_last_name?: string | null
          pgm_maiden_name?: string | null
          pgm_pob?: string | null
          phone?: string | null
          place_of_birth?: string | null
          sex?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          ancestry_line?: string | null
          autosave_data?: Json | null
          case_id?: string
          completion_percentage?: number | null
          created_at?: string
          current_citizenship?: string[] | null
          date_of_birth?: string | null
          email?: string | null
          father_dob?: string | null
          father_first_name?: string | null
          father_last_name?: string | null
          father_pob?: string | null
          first_name?: string | null
          id?: string
          language_preference?: string | null
          last_name?: string | null
          maiden_name?: string | null
          mgf_dob?: string | null
          mgf_first_name?: string | null
          mgf_last_name?: string | null
          mgf_pob?: string | null
          mgm_dob?: string | null
          mgm_first_name?: string | null
          mgm_last_name?: string | null
          mgm_maiden_name?: string | null
          mgm_pob?: string | null
          mother_dob?: string | null
          mother_first_name?: string | null
          mother_last_name?: string | null
          mother_maiden_name?: string | null
          mother_pob?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_issuing_country?: string | null
          passport_number?: string | null
          pgf_dob?: string | null
          pgf_first_name?: string | null
          pgf_last_name?: string | null
          pgf_pob?: string | null
          pgm_dob?: string | null
          pgm_first_name?: string | null
          pgm_last_name?: string | null
          pgm_maiden_name?: string | null
          pgm_pob?: string | null
          phone?: string | null
          place_of_birth?: string | null
          sex?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_data_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          case_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_text: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          case_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          case_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_text?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      oby_forms: {
        Row: {
          auto_populated_fields: string[] | null
          case_id: string
          created_at: string
          filed_date: string | null
          filed_to: string | null
          form_data: Json | null
          hac_approved: boolean | null
          hac_approved_at: string | null
          hac_approved_by: string | null
          hac_notes: string | null
          id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          auto_populated_fields?: string[] | null
          case_id: string
          created_at?: string
          filed_date?: string | null
          filed_to?: string | null
          form_data?: Json | null
          hac_approved?: boolean | null
          hac_approved_at?: string | null
          hac_approved_by?: string | null
          hac_notes?: string | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          auto_populated_fields?: string[] | null
          case_id?: string
          created_at?: string
          filed_date?: string | null
          filed_to?: string | null
          form_data?: Json | null
          hac_approved?: boolean | null
          hac_approved_at?: string | null
          hac_approved_by?: string | null
          hac_notes?: string | null
          id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oby_forms_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      poa: {
        Row: {
          case_id: string
          client_ip_address: string | null
          client_signature_date: string | null
          client_signed: boolean | null
          created_at: string
          dropbox_path: string | null
          generated_at: string | null
          hac_approved: boolean | null
          hac_approved_at: string | null
          hac_approved_by: string | null
          hac_notes: string | null
          id: string
          pdf_url: string | null
          poa_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          client_ip_address?: string | null
          client_signature_date?: string | null
          client_signed?: boolean | null
          created_at?: string
          dropbox_path?: string | null
          generated_at?: string | null
          hac_approved?: boolean | null
          hac_approved_at?: string | null
          hac_approved_by?: string | null
          hac_notes?: string | null
          id?: string
          pdf_url?: string | null
          poa_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          client_ip_address?: string | null
          client_signature_date?: string | null
          client_signed?: boolean | null
          created_at?: string
          dropbox_path?: string | null
          generated_at?: string | null
          hac_approved?: boolean | null
          hac_approved_at?: string | null
          hac_approved_by?: string | null
          hac_notes?: string | null
          id?: string
          pdf_url?: string | null
          poa_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poa_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          items_failed: number | null
          items_processed: number | null
          metadata: Json | null
          status: string
          sync_type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          metadata?: Json | null
          status: string
          sync_type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          items_failed?: number | null
          items_processed?: number | null
          metadata?: Json | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          case_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string | null
          related_document_id: string | null
          related_person: string | null
          status: string | null
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_document_id?: string | null
          related_person?: string | null
          status?: string | null
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          related_document_id?: string | null
          related_person?: string | null
          status?: string | null
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_related_document_id_fkey"
            columns: ["related_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wsc_letters: {
        Row: {
          case_id: string
          created_at: string
          deadline: string | null
          dropbox_path: string | null
          file_url: string | null
          hac_notes: string | null
          hac_reviewed: boolean | null
          hac_reviewed_at: string | null
          hac_reviewed_by: string | null
          id: string
          letter_date: string | null
          ocr_text: string | null
          reference_number: string | null
          strategy: string | null
          strategy_notes: string | null
          strategy_set_at: string | null
          strategy_set_by: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          deadline?: string | null
          dropbox_path?: string | null
          file_url?: string | null
          hac_notes?: string | null
          hac_reviewed?: boolean | null
          hac_reviewed_at?: string | null
          hac_reviewed_by?: string | null
          id?: string
          letter_date?: string | null
          ocr_text?: string | null
          reference_number?: string | null
          strategy?: string | null
          strategy_notes?: string | null
          strategy_set_at?: string | null
          strategy_set_by?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          deadline?: string | null
          dropbox_path?: string | null
          file_url?: string | null
          hac_notes?: string | null
          hac_reviewed?: boolean | null
          hac_reviewed_at?: string | null
          hac_reviewed_by?: string | null
          id?: string
          letter_date?: string | null
          ocr_text?: string | null
          reference_number?: string | null
          strategy?: string | null
          strategy_notes?: string | null
          strategy_set_at?: string | null
          strategy_set_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wsc_letters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_case_document_count: {
        Args: { case_uuid: string }
        Returns: number
      }
      get_cases_with_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_code: string
          client_name: string
          completed_task_count: number
          country: string
          created_at: string
          document_count: number
          dropbox_path: string
          generation: Database["public"]["Enums"]["case_generation"]
          id: string
          is_vip: boolean
          notes: string
          progress: number
          start_date: string
          status: Database["public"]["Enums"]["case_status"]
          task_count: number
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "assistant" | "client"
      case_generation:
        | "third"
        | "fourth"
        | "fifth"
        | "ten"
        | "global"
        | "vip"
        | "work"
        | "other"
      case_status:
        | "lead"
        | "active"
        | "on_hold"
        | "finished"
        | "failed"
        | "suspended"
        | "bad"
        | "name_change"
        | "other"
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
  public: {
    Enums: {
      app_role: ["admin", "assistant", "client"],
      case_generation: [
        "third",
        "fourth",
        "fifth",
        "ten",
        "global",
        "vip",
        "work",
        "other",
      ],
      case_status: [
        "lead",
        "active",
        "on_hold",
        "finished",
        "failed",
        "suspended",
        "bad",
        "name_change",
        "other",
      ],
    },
  },
} as const
