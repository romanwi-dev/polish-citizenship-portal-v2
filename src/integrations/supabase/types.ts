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
      ai_conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          tool_call_id: string | null
          tool_calls: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          tool_call_id?: string | null
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          agent_type: string
          case_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          case_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          case_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_document_requests: {
        Row: {
          approximate_year: string | null
          archive_search_id: string | null
          created_at: string | null
          document_id: string | null
          document_type: string
          id: string
          location: string | null
          notes: string | null
          person_first_name: string | null
          person_last_name: string | null
          status: string | null
        }
        Insert: {
          approximate_year?: string | null
          archive_search_id?: string | null
          created_at?: string | null
          document_id?: string | null
          document_type: string
          id?: string
          location?: string | null
          notes?: string | null
          person_first_name?: string | null
          person_last_name?: string | null
          status?: string | null
        }
        Update: {
          approximate_year?: string | null
          archive_search_id?: string | null
          created_at?: string | null
          document_id?: string | null
          document_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          person_first_name?: string | null
          person_last_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_document_requests_archive_search_id_fkey"
            columns: ["archive_search_id"]
            isOneToOne: false
            referencedRelation: "archive_searches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_document_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_searches: {
        Row: {
          archive_country: string | null
          archive_name: string | null
          case_id: string
          created_at: string | null
          document_types: string[] | null
          documents_received_at: string | null
          estimated_completion: string | null
          findings_summary: string | null
          id: string
          letter_generated_at: string | null
          letter_sent_at: string | null
          partner_assigned_to: string | null
          person_type: string
          priority: string | null
          response_received_at: string | null
          search_notes: string | null
          search_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          archive_country?: string | null
          archive_name?: string | null
          case_id: string
          created_at?: string | null
          document_types?: string[] | null
          documents_received_at?: string | null
          estimated_completion?: string | null
          findings_summary?: string | null
          id?: string
          letter_generated_at?: string | null
          letter_sent_at?: string | null
          partner_assigned_to?: string | null
          person_type: string
          priority?: string | null
          response_received_at?: string | null
          search_notes?: string | null
          search_type: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          archive_country?: string | null
          archive_name?: string | null
          case_id?: string
          created_at?: string | null
          document_types?: string[] | null
          documents_received_at?: string | null
          estimated_completion?: string | null
          findings_summary?: string | null
          id?: string
          letter_generated_at?: string | null
          letter_sent_at?: string | null
          partner_assigned_to?: string | null
          person_type?: string
          priority?: string | null
          response_received_at?: string | null
          search_notes?: string | null
          search_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archive_searches_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          backup_date: string
          backup_path: string
          created_at: string | null
          error_message: string | null
          id: string
          status: string | null
          total_cases: number | null
          total_files: number | null
          total_size_mb: number | null
        }
        Insert: {
          backup_date: string
          backup_path: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          total_cases?: number | null
          total_files?: number | null
          total_size_mb?: number | null
        }
        Update: {
          backup_date?: string
          backup_path?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          total_cases?: number | null
          total_files?: number | null
          total_size_mb?: number | null
        }
        Relationships: []
      }
      cases: {
        Row: {
          ancestry: Json | null
          client_code: string | null
          client_name: string
          client_photo_url: string | null
          client_score: number | null
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
          processing_mode: Database["public"]["Enums"]["processing_mode"] | null
          progress: number | null
          push_scheme: string | null
          sort_order: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
          wsc_received: boolean | null
        }
        Insert: {
          ancestry?: Json | null
          client_code?: string | null
          client_name: string
          client_photo_url?: string | null
          client_score?: number | null
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
          processing_mode?:
            | Database["public"]["Enums"]["processing_mode"]
            | null
          progress?: number | null
          push_scheme?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
          wsc_received?: boolean | null
        }
        Update: {
          ancestry?: Json | null
          client_code?: string | null
          client_name?: string
          client_photo_url?: string | null
          client_score?: number | null
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
          processing_mode?:
            | Database["public"]["Enums"]["processing_mode"]
            | null
          progress?: number | null
          push_scheme?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
          wsc_received?: boolean | null
        }
        Relationships: []
      }
      civil_acts_requests: {
        Row: {
          act_number: string | null
          case_id: string
          created_at: string | null
          document_id: string | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_date: string | null
          payment_required: boolean | null
          payment_status: string | null
          person_first_name: string | null
          person_last_name: string | null
          person_maiden_name: string | null
          person_type: string
          received_date: string | null
          registry_city: string
          registry_office: string
          registry_voivodeship: string | null
          request_type: string
          status: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          act_number?: string | null
          case_id: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          person_first_name?: string | null
          person_last_name?: string | null
          person_maiden_name?: string | null
          person_type: string
          received_date?: string | null
          registry_city: string
          registry_office: string
          registry_voivodeship?: string | null
          request_type: string
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          act_number?: string | null
          case_id?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_date?: string | null
          payment_required?: boolean | null
          payment_status?: string | null
          person_first_name?: string | null
          person_last_name?: string | null
          person_maiden_name?: string | null
          person_type?: string
          received_date?: string | null
          registry_city?: string
          registry_office?: string
          registry_voivodeship?: string | null
          request_type?: string
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "civil_acts_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "civil_acts_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
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
          document_type: string | null
          dropbox_file_id: string | null
          dropbox_path: string
          file_extension: string | null
          file_size: number | null
          id: string
          is_translated: boolean | null
          is_verified: boolean | null
          is_verified_by_hac: boolean | null
          language: string | null
          metadata: Json | null
          name: string
          needs_translation: boolean | null
          ocr_confidence: number | null
          ocr_data: Json | null
          ocr_reviewed_at: string | null
          ocr_reviewed_by: string | null
          ocr_status: string | null
          ocr_text: string | null
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
          document_type?: string | null
          dropbox_file_id?: string | null
          dropbox_path: string
          file_extension?: string | null
          file_size?: number | null
          id?: string
          is_translated?: boolean | null
          is_verified?: boolean | null
          is_verified_by_hac?: boolean | null
          language?: string | null
          metadata?: Json | null
          name: string
          needs_translation?: boolean | null
          ocr_confidence?: number | null
          ocr_data?: Json | null
          ocr_reviewed_at?: string | null
          ocr_reviewed_by?: string | null
          ocr_status?: string | null
          ocr_text?: string | null
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
          document_type?: string | null
          dropbox_file_id?: string | null
          dropbox_path?: string
          file_extension?: string | null
          file_size?: number | null
          id?: string
          is_translated?: boolean | null
          is_verified?: boolean | null
          is_verified_by_hac?: boolean | null
          language?: string | null
          metadata?: Json | null
          name?: string
          needs_translation?: boolean | null
          ocr_confidence?: number | null
          ocr_data?: Json | null
          ocr_reviewed_at?: string | null
          ocr_reviewed_by?: string | null
          ocr_status?: string | null
          ocr_text?: string | null
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
          source: string | null
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
          source?: string | null
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
          source?: string | null
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
      local_authorities: {
        Row: {
          address: string | null
          authority_name: string
          authority_type: string | null
          city: string | null
          country: string
          created_at: string | null
          email: string | null
          fees: string | null
          id: string
          notes: string | null
          online_ordering: boolean | null
          phone: string | null
          processing_time: string | null
          state_province: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          authority_name: string
          authority_type?: string | null
          city?: string | null
          country: string
          created_at?: string | null
          email?: string | null
          fees?: string | null
          id?: string
          notes?: string | null
          online_ordering?: boolean | null
          phone?: string | null
          processing_time?: string | null
          state_province?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          authority_name?: string
          authority_type?: string | null
          city?: string | null
          country?: string
          created_at?: string | null
          email?: string | null
          fees?: string | null
          id?: string
          notes?: string | null
          online_ordering?: boolean | null
          phone?: string | null
          processing_time?: string | null
          state_province?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      local_document_requests: {
        Row: {
          apostille_obtained: boolean | null
          apostille_required: boolean | null
          authority_address: string | null
          authority_email: string | null
          authority_phone: string | null
          authority_website: string | null
          case_id: string
          certified_copy: boolean | null
          client_notes: string | null
          created_at: string | null
          document_id: string | null
          document_type: string
          hac_notes: string | null
          id: string
          issuing_authority: string | null
          issuing_country: string
          partner_helping: boolean | null
          partner_name: string | null
          person_type: string
          received_date: string | null
          requested_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          apostille_obtained?: boolean | null
          apostille_required?: boolean | null
          authority_address?: string | null
          authority_email?: string | null
          authority_phone?: string | null
          authority_website?: string | null
          case_id: string
          certified_copy?: boolean | null
          client_notes?: string | null
          created_at?: string | null
          document_id?: string | null
          document_type: string
          hac_notes?: string | null
          id?: string
          issuing_authority?: string | null
          issuing_country: string
          partner_helping?: boolean | null
          partner_name?: string | null
          person_type: string
          received_date?: string | null
          requested_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          apostille_obtained?: boolean | null
          apostille_required?: boolean | null
          authority_address?: string | null
          authority_email?: string | null
          authority_phone?: string | null
          authority_website?: string | null
          case_id?: string
          certified_copy?: boolean | null
          client_notes?: string | null
          created_at?: string | null
          document_id?: string | null
          document_type?: string
          hac_notes?: string | null
          id?: string
          issuing_authority?: string | null
          issuing_country?: string
          partner_helping?: boolean | null
          partner_name?: string | null
          person_type?: string
          received_date?: string | null
          requested_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_document_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_document_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      master_table: {
        Row: {
          act_type_birth: boolean | null
          act_type_marriage: boolean | null
          ancestry_line: string | null
          applicant_address: Json | null
          applicant_current_citizenship: string[] | null
          applicant_date_of_emigration: string | null
          applicant_date_of_naturalization: string | null
          applicant_dob: string | null
          applicant_email: string | null
          applicant_first_name: string | null
          applicant_has_birth_cert: boolean | null
          applicant_has_marriage_cert: boolean | null
          applicant_has_naturalization: boolean | null
          applicant_has_passport: boolean | null
          applicant_is_alive: boolean | null
          applicant_is_married: boolean | null
          applicant_last_name: string | null
          applicant_maiden_name: string | null
          applicant_notes: string | null
          applicant_other_citizenships: Json | null
          applicant_passport_expiry_date: string | null
          applicant_passport_issue_date: string | null
          applicant_passport_issuing_authority: string | null
          applicant_passport_issuing_country: string | null
          applicant_passport_number: string | null
          applicant_pesel: string | null
          applicant_phone: string | null
          applicant_pob: string | null
          applicant_previous_names: Json | null
          applicant_sex: string | null
          attachment_1_included: boolean | null
          attachment_10_included: boolean | null
          attachment_2_included: boolean | null
          attachment_3_included: boolean | null
          attachment_4_included: boolean | null
          attachment_5_included: boolean | null
          attachment_6_included: boolean | null
          attachment_7_included: boolean | null
          attachment_8_included: boolean | null
          attachment_9_included: boolean | null
          birth_act_location: string | null
          birth_act_number: string | null
          birth_act_year: string | null
          case_id: string
          child_1_dob: string | null
          child_1_first_name: string | null
          child_1_is_alive: boolean | null
          child_1_last_name: string | null
          child_1_notes: string | null
          child_1_pob: string | null
          child_1_sex: string | null
          child_10_dob: string | null
          child_10_first_name: string | null
          child_10_is_alive: boolean | null
          child_10_last_name: string | null
          child_10_notes: string | null
          child_10_pob: string | null
          child_10_sex: string | null
          child_2_dob: string | null
          child_2_first_name: string | null
          child_2_is_alive: boolean | null
          child_2_last_name: string | null
          child_2_notes: string | null
          child_2_pob: string | null
          child_2_sex: string | null
          child_3_dob: string | null
          child_3_first_name: string | null
          child_3_is_alive: boolean | null
          child_3_last_name: string | null
          child_3_notes: string | null
          child_3_pob: string | null
          child_3_sex: string | null
          child_4_dob: string | null
          child_4_first_name: string | null
          child_4_is_alive: boolean | null
          child_4_last_name: string | null
          child_4_notes: string | null
          child_4_pob: string | null
          child_4_sex: string | null
          child_5_dob: string | null
          child_5_first_name: string | null
          child_5_is_alive: boolean | null
          child_5_last_name: string | null
          child_5_notes: string | null
          child_5_pob: string | null
          child_5_sex: string | null
          child_6_dob: string | null
          child_6_first_name: string | null
          child_6_is_alive: boolean | null
          child_6_last_name: string | null
          child_6_notes: string | null
          child_6_pob: string | null
          child_6_sex: string | null
          child_7_dob: string | null
          child_7_first_name: string | null
          child_7_is_alive: boolean | null
          child_7_last_name: string | null
          child_7_notes: string | null
          child_7_pob: string | null
          child_7_sex: string | null
          child_8_dob: string | null
          child_8_first_name: string | null
          child_8_is_alive: boolean | null
          child_8_last_name: string | null
          child_8_notes: string | null
          child_8_pob: string | null
          child_8_sex: string | null
          child_9_dob: string | null
          child_9_first_name: string | null
          child_9_is_alive: boolean | null
          child_9_last_name: string | null
          child_9_notes: string | null
          child_9_pob: string | null
          child_9_sex: string | null
          children_count: number | null
          citizenship_change_permission: string | null
          completion_percentage: number | null
          created_at: string
          date_of_marriage: string | null
          family_notes: string | null
          father_date_of_emigration: string | null
          father_date_of_naturalization: string | null
          father_dob: string | null
          father_first_name: string | null
          father_has_birth_cert: boolean | null
          father_has_marriage_cert: boolean | null
          father_has_naturalization: boolean | null
          father_has_passport: boolean | null
          father_is_alive: boolean | null
          father_last_name: string | null
          father_maiden_name: string | null
          father_marital_status: string | null
          father_mother_marriage_date: string | null
          father_mother_marriage_place: string | null
          father_notes: string | null
          father_pesel: string | null
          father_pob: string | null
          father_previous_names: string | null
          foreign_act_location: string | null
          husband_last_name_after_marriage: string | null
          id: string
          important_additional_info: string | null
          language_preference: string | null
          marriage_act_location: string | null
          mgf_citizenship_at_birth: string | null
          mgf_date_of_emigration: string | null
          mgf_date_of_naturalization: string | null
          mgf_dob: string | null
          mgf_first_name: string | null
          mgf_has_birth_cert: boolean | null
          mgf_has_marriage_cert: boolean | null
          mgf_has_naturalization: boolean | null
          mgf_has_passport: boolean | null
          mgf_is_alive: boolean | null
          mgf_last_name: string | null
          mgf_mgm_marriage_date: string | null
          mgf_mgm_marriage_place: string | null
          mgf_notes: string | null
          mgf_pesel: string | null
          mgf_pob: string | null
          mggf_date_of_emigration: string | null
          mggf_date_of_naturalization: string | null
          mggf_dob: string | null
          mggf_first_name: string | null
          mggf_has_birth_cert: boolean | null
          mggf_has_marriage_cert: boolean | null
          mggf_has_naturalization: boolean | null
          mggf_has_passport: boolean | null
          mggf_is_alive: boolean | null
          mggf_last_name: string | null
          mggf_mggm_marriage_date: string | null
          mggf_mggm_marriage_place: string | null
          mggf_notes: string | null
          mggf_pob: string | null
          mggm_date_of_emigration: string | null
          mggm_date_of_naturalization: string | null
          mggm_dob: string | null
          mggm_first_name: string | null
          mggm_has_birth_cert: boolean | null
          mggm_has_marriage_cert: boolean | null
          mggm_has_naturalization: boolean | null
          mggm_has_passport: boolean | null
          mggm_is_alive: boolean | null
          mggm_last_name: string | null
          mggm_maiden_name: string | null
          mggm_notes: string | null
          mggm_pob: string | null
          mgm_date_of_emigration: string | null
          mgm_date_of_naturalization: string | null
          mgm_dob: string | null
          mgm_first_name: string | null
          mgm_has_birth_cert: boolean | null
          mgm_has_marriage_cert: boolean | null
          mgm_has_naturalization: boolean | null
          mgm_has_passport: boolean | null
          mgm_is_alive: boolean | null
          mgm_last_name: string | null
          mgm_maiden_name: string | null
          mgm_notes: string | null
          mgm_pesel: string | null
          mgm_pob: string | null
          minor_children_count: number | null
          mother_date_of_emigration: string | null
          mother_date_of_naturalization: string | null
          mother_dob: string | null
          mother_first_name: string | null
          mother_has_birth_cert: boolean | null
          mother_has_marriage_cert: boolean | null
          mother_has_naturalization: boolean | null
          mother_has_passport: boolean | null
          mother_is_alive: boolean | null
          mother_last_name: string | null
          mother_maiden_name: string | null
          mother_marital_status: string | null
          mother_notes: string | null
          mother_pesel: string | null
          mother_pob: string | null
          mother_previous_names: string | null
          oby_draft_created_at: string | null
          oby_filed_at: string | null
          oby_hac_notes: string | null
          oby_hac_reviewed_at: string | null
          oby_hac_reviewed_by: string | null
          oby_reference_number: string | null
          oby_status: string | null
          oby_submitted_at: string | null
          parents_has_marriage_additional_docs: boolean | null
          parents_has_marriage_cert: boolean | null
          parents_has_marriage_foreign_docs: boolean | null
          pgf_citizenship_at_birth: string | null
          pgf_date_of_emigration: string | null
          pgf_date_of_naturalization: string | null
          pgf_dob: string | null
          pgf_first_name: string | null
          pgf_has_birth_cert: boolean | null
          pgf_has_marriage_cert: boolean | null
          pgf_has_naturalization: boolean | null
          pgf_has_passport: boolean | null
          pgf_is_alive: boolean | null
          pgf_last_name: string | null
          pgf_notes: string | null
          pgf_pesel: string | null
          pgf_pgm_marriage_date: string | null
          pgf_pgm_marriage_place: string | null
          pgf_pob: string | null
          pggf_date_of_emigration: string | null
          pggf_date_of_naturalization: string | null
          pggf_dob: string | null
          pggf_first_name: string | null
          pggf_has_birth_cert: boolean | null
          pggf_has_marriage_cert: boolean | null
          pggf_has_naturalization: boolean | null
          pggf_has_passport: boolean | null
          pggf_is_alive: boolean | null
          pggf_last_name: string | null
          pggf_notes: string | null
          pggf_pggm_marriage_date: string | null
          pggf_pggm_marriage_place: string | null
          pggf_pob: string | null
          pggm_date_of_emigration: string | null
          pggm_date_of_naturalization: string | null
          pggm_dob: string | null
          pggm_first_name: string | null
          pggm_has_birth_cert: boolean | null
          pggm_has_marriage_cert: boolean | null
          pggm_has_naturalization: boolean | null
          pggm_has_passport: boolean | null
          pggm_is_alive: boolean | null
          pggm_last_name: string | null
          pggm_maiden_name: string | null
          pggm_notes: string | null
          pggm_pob: string | null
          pgm_date_of_emigration: string | null
          pgm_date_of_naturalization: string | null
          pgm_dob: string | null
          pgm_first_name: string | null
          pgm_has_birth_cert: boolean | null
          pgm_has_marriage_cert: boolean | null
          pgm_has_naturalization: boolean | null
          pgm_has_passport: boolean | null
          pgm_is_alive: boolean | null
          pgm_last_name: string | null
          pgm_maiden_name: string | null
          pgm_notes: string | null
          pgm_pob: string | null
          place_of_marriage: string | null
          poa_date_filed: string | null
          polish_birth_act_number: string | null
          polish_citizenship_deprivation: boolean | null
          polish_preliminary_docs_info: string | null
          previous_decision_info: string | null
          representative_address: string | null
          representative_address_cont: string | null
          representative_email: string | null
          representative_full_name: string | null
          representative_phone: string | null
          sibling_decision_info: string | null
          spouse_current_citizenship: string[] | null
          spouse_date_of_emigration: string | null
          spouse_date_of_naturalization: string | null
          spouse_dob: string | null
          spouse_email: string | null
          spouse_first_name: string | null
          spouse_has_birth_cert: boolean | null
          spouse_has_marriage_cert: boolean | null
          spouse_has_naturalization: boolean | null
          spouse_has_passport: boolean | null
          spouse_is_alive: boolean | null
          spouse_last_name: string | null
          spouse_maiden_name: string | null
          spouse_notes: string | null
          spouse_passport_number: string | null
          spouse_phone: string | null
          spouse_pob: string | null
          spouse_sex: string | null
          submission_date: string | null
          submission_location: string | null
          updated_at: string
          wife_last_name_after_marriage: string | null
        }
        Insert: {
          act_type_birth?: boolean | null
          act_type_marriage?: boolean | null
          ancestry_line?: string | null
          applicant_address?: Json | null
          applicant_current_citizenship?: string[] | null
          applicant_date_of_emigration?: string | null
          applicant_date_of_naturalization?: string | null
          applicant_dob?: string | null
          applicant_email?: string | null
          applicant_first_name?: string | null
          applicant_has_birth_cert?: boolean | null
          applicant_has_marriage_cert?: boolean | null
          applicant_has_naturalization?: boolean | null
          applicant_has_passport?: boolean | null
          applicant_is_alive?: boolean | null
          applicant_is_married?: boolean | null
          applicant_last_name?: string | null
          applicant_maiden_name?: string | null
          applicant_notes?: string | null
          applicant_other_citizenships?: Json | null
          applicant_passport_expiry_date?: string | null
          applicant_passport_issue_date?: string | null
          applicant_passport_issuing_authority?: string | null
          applicant_passport_issuing_country?: string | null
          applicant_passport_number?: string | null
          applicant_pesel?: string | null
          applicant_phone?: string | null
          applicant_pob?: string | null
          applicant_previous_names?: Json | null
          applicant_sex?: string | null
          attachment_1_included?: boolean | null
          attachment_10_included?: boolean | null
          attachment_2_included?: boolean | null
          attachment_3_included?: boolean | null
          attachment_4_included?: boolean | null
          attachment_5_included?: boolean | null
          attachment_6_included?: boolean | null
          attachment_7_included?: boolean | null
          attachment_8_included?: boolean | null
          attachment_9_included?: boolean | null
          birth_act_location?: string | null
          birth_act_number?: string | null
          birth_act_year?: string | null
          case_id: string
          child_1_dob?: string | null
          child_1_first_name?: string | null
          child_1_is_alive?: boolean | null
          child_1_last_name?: string | null
          child_1_notes?: string | null
          child_1_pob?: string | null
          child_1_sex?: string | null
          child_10_dob?: string | null
          child_10_first_name?: string | null
          child_10_is_alive?: boolean | null
          child_10_last_name?: string | null
          child_10_notes?: string | null
          child_10_pob?: string | null
          child_10_sex?: string | null
          child_2_dob?: string | null
          child_2_first_name?: string | null
          child_2_is_alive?: boolean | null
          child_2_last_name?: string | null
          child_2_notes?: string | null
          child_2_pob?: string | null
          child_2_sex?: string | null
          child_3_dob?: string | null
          child_3_first_name?: string | null
          child_3_is_alive?: boolean | null
          child_3_last_name?: string | null
          child_3_notes?: string | null
          child_3_pob?: string | null
          child_3_sex?: string | null
          child_4_dob?: string | null
          child_4_first_name?: string | null
          child_4_is_alive?: boolean | null
          child_4_last_name?: string | null
          child_4_notes?: string | null
          child_4_pob?: string | null
          child_4_sex?: string | null
          child_5_dob?: string | null
          child_5_first_name?: string | null
          child_5_is_alive?: boolean | null
          child_5_last_name?: string | null
          child_5_notes?: string | null
          child_5_pob?: string | null
          child_5_sex?: string | null
          child_6_dob?: string | null
          child_6_first_name?: string | null
          child_6_is_alive?: boolean | null
          child_6_last_name?: string | null
          child_6_notes?: string | null
          child_6_pob?: string | null
          child_6_sex?: string | null
          child_7_dob?: string | null
          child_7_first_name?: string | null
          child_7_is_alive?: boolean | null
          child_7_last_name?: string | null
          child_7_notes?: string | null
          child_7_pob?: string | null
          child_7_sex?: string | null
          child_8_dob?: string | null
          child_8_first_name?: string | null
          child_8_is_alive?: boolean | null
          child_8_last_name?: string | null
          child_8_notes?: string | null
          child_8_pob?: string | null
          child_8_sex?: string | null
          child_9_dob?: string | null
          child_9_first_name?: string | null
          child_9_is_alive?: boolean | null
          child_9_last_name?: string | null
          child_9_notes?: string | null
          child_9_pob?: string | null
          child_9_sex?: string | null
          children_count?: number | null
          citizenship_change_permission?: string | null
          completion_percentage?: number | null
          created_at?: string
          date_of_marriage?: string | null
          family_notes?: string | null
          father_date_of_emigration?: string | null
          father_date_of_naturalization?: string | null
          father_dob?: string | null
          father_first_name?: string | null
          father_has_birth_cert?: boolean | null
          father_has_marriage_cert?: boolean | null
          father_has_naturalization?: boolean | null
          father_has_passport?: boolean | null
          father_is_alive?: boolean | null
          father_last_name?: string | null
          father_maiden_name?: string | null
          father_marital_status?: string | null
          father_mother_marriage_date?: string | null
          father_mother_marriage_place?: string | null
          father_notes?: string | null
          father_pesel?: string | null
          father_pob?: string | null
          father_previous_names?: string | null
          foreign_act_location?: string | null
          husband_last_name_after_marriage?: string | null
          id?: string
          important_additional_info?: string | null
          language_preference?: string | null
          marriage_act_location?: string | null
          mgf_citizenship_at_birth?: string | null
          mgf_date_of_emigration?: string | null
          mgf_date_of_naturalization?: string | null
          mgf_dob?: string | null
          mgf_first_name?: string | null
          mgf_has_birth_cert?: boolean | null
          mgf_has_marriage_cert?: boolean | null
          mgf_has_naturalization?: boolean | null
          mgf_has_passport?: boolean | null
          mgf_is_alive?: boolean | null
          mgf_last_name?: string | null
          mgf_mgm_marriage_date?: string | null
          mgf_mgm_marriage_place?: string | null
          mgf_notes?: string | null
          mgf_pesel?: string | null
          mgf_pob?: string | null
          mggf_date_of_emigration?: string | null
          mggf_date_of_naturalization?: string | null
          mggf_dob?: string | null
          mggf_first_name?: string | null
          mggf_has_birth_cert?: boolean | null
          mggf_has_marriage_cert?: boolean | null
          mggf_has_naturalization?: boolean | null
          mggf_has_passport?: boolean | null
          mggf_is_alive?: boolean | null
          mggf_last_name?: string | null
          mggf_mggm_marriage_date?: string | null
          mggf_mggm_marriage_place?: string | null
          mggf_notes?: string | null
          mggf_pob?: string | null
          mggm_date_of_emigration?: string | null
          mggm_date_of_naturalization?: string | null
          mggm_dob?: string | null
          mggm_first_name?: string | null
          mggm_has_birth_cert?: boolean | null
          mggm_has_marriage_cert?: boolean | null
          mggm_has_naturalization?: boolean | null
          mggm_has_passport?: boolean | null
          mggm_is_alive?: boolean | null
          mggm_last_name?: string | null
          mggm_maiden_name?: string | null
          mggm_notes?: string | null
          mggm_pob?: string | null
          mgm_date_of_emigration?: string | null
          mgm_date_of_naturalization?: string | null
          mgm_dob?: string | null
          mgm_first_name?: string | null
          mgm_has_birth_cert?: boolean | null
          mgm_has_marriage_cert?: boolean | null
          mgm_has_naturalization?: boolean | null
          mgm_has_passport?: boolean | null
          mgm_is_alive?: boolean | null
          mgm_last_name?: string | null
          mgm_maiden_name?: string | null
          mgm_notes?: string | null
          mgm_pesel?: string | null
          mgm_pob?: string | null
          minor_children_count?: number | null
          mother_date_of_emigration?: string | null
          mother_date_of_naturalization?: string | null
          mother_dob?: string | null
          mother_first_name?: string | null
          mother_has_birth_cert?: boolean | null
          mother_has_marriage_cert?: boolean | null
          mother_has_naturalization?: boolean | null
          mother_has_passport?: boolean | null
          mother_is_alive?: boolean | null
          mother_last_name?: string | null
          mother_maiden_name?: string | null
          mother_marital_status?: string | null
          mother_notes?: string | null
          mother_pesel?: string | null
          mother_pob?: string | null
          mother_previous_names?: string | null
          oby_draft_created_at?: string | null
          oby_filed_at?: string | null
          oby_hac_notes?: string | null
          oby_hac_reviewed_at?: string | null
          oby_hac_reviewed_by?: string | null
          oby_reference_number?: string | null
          oby_status?: string | null
          oby_submitted_at?: string | null
          parents_has_marriage_additional_docs?: boolean | null
          parents_has_marriage_cert?: boolean | null
          parents_has_marriage_foreign_docs?: boolean | null
          pgf_citizenship_at_birth?: string | null
          pgf_date_of_emigration?: string | null
          pgf_date_of_naturalization?: string | null
          pgf_dob?: string | null
          pgf_first_name?: string | null
          pgf_has_birth_cert?: boolean | null
          pgf_has_marriage_cert?: boolean | null
          pgf_has_naturalization?: boolean | null
          pgf_has_passport?: boolean | null
          pgf_is_alive?: boolean | null
          pgf_last_name?: string | null
          pgf_notes?: string | null
          pgf_pesel?: string | null
          pgf_pgm_marriage_date?: string | null
          pgf_pgm_marriage_place?: string | null
          pgf_pob?: string | null
          pggf_date_of_emigration?: string | null
          pggf_date_of_naturalization?: string | null
          pggf_dob?: string | null
          pggf_first_name?: string | null
          pggf_has_birth_cert?: boolean | null
          pggf_has_marriage_cert?: boolean | null
          pggf_has_naturalization?: boolean | null
          pggf_has_passport?: boolean | null
          pggf_is_alive?: boolean | null
          pggf_last_name?: string | null
          pggf_notes?: string | null
          pggf_pggm_marriage_date?: string | null
          pggf_pggm_marriage_place?: string | null
          pggf_pob?: string | null
          pggm_date_of_emigration?: string | null
          pggm_date_of_naturalization?: string | null
          pggm_dob?: string | null
          pggm_first_name?: string | null
          pggm_has_birth_cert?: boolean | null
          pggm_has_marriage_cert?: boolean | null
          pggm_has_naturalization?: boolean | null
          pggm_has_passport?: boolean | null
          pggm_is_alive?: boolean | null
          pggm_last_name?: string | null
          pggm_maiden_name?: string | null
          pggm_notes?: string | null
          pggm_pob?: string | null
          pgm_date_of_emigration?: string | null
          pgm_date_of_naturalization?: string | null
          pgm_dob?: string | null
          pgm_first_name?: string | null
          pgm_has_birth_cert?: boolean | null
          pgm_has_marriage_cert?: boolean | null
          pgm_has_naturalization?: boolean | null
          pgm_has_passport?: boolean | null
          pgm_is_alive?: boolean | null
          pgm_last_name?: string | null
          pgm_maiden_name?: string | null
          pgm_notes?: string | null
          pgm_pob?: string | null
          place_of_marriage?: string | null
          poa_date_filed?: string | null
          polish_birth_act_number?: string | null
          polish_citizenship_deprivation?: boolean | null
          polish_preliminary_docs_info?: string | null
          previous_decision_info?: string | null
          representative_address?: string | null
          representative_address_cont?: string | null
          representative_email?: string | null
          representative_full_name?: string | null
          representative_phone?: string | null
          sibling_decision_info?: string | null
          spouse_current_citizenship?: string[] | null
          spouse_date_of_emigration?: string | null
          spouse_date_of_naturalization?: string | null
          spouse_dob?: string | null
          spouse_email?: string | null
          spouse_first_name?: string | null
          spouse_has_birth_cert?: boolean | null
          spouse_has_marriage_cert?: boolean | null
          spouse_has_naturalization?: boolean | null
          spouse_has_passport?: boolean | null
          spouse_is_alive?: boolean | null
          spouse_last_name?: string | null
          spouse_maiden_name?: string | null
          spouse_notes?: string | null
          spouse_passport_number?: string | null
          spouse_phone?: string | null
          spouse_pob?: string | null
          spouse_sex?: string | null
          submission_date?: string | null
          submission_location?: string | null
          updated_at?: string
          wife_last_name_after_marriage?: string | null
        }
        Update: {
          act_type_birth?: boolean | null
          act_type_marriage?: boolean | null
          ancestry_line?: string | null
          applicant_address?: Json | null
          applicant_current_citizenship?: string[] | null
          applicant_date_of_emigration?: string | null
          applicant_date_of_naturalization?: string | null
          applicant_dob?: string | null
          applicant_email?: string | null
          applicant_first_name?: string | null
          applicant_has_birth_cert?: boolean | null
          applicant_has_marriage_cert?: boolean | null
          applicant_has_naturalization?: boolean | null
          applicant_has_passport?: boolean | null
          applicant_is_alive?: boolean | null
          applicant_is_married?: boolean | null
          applicant_last_name?: string | null
          applicant_maiden_name?: string | null
          applicant_notes?: string | null
          applicant_other_citizenships?: Json | null
          applicant_passport_expiry_date?: string | null
          applicant_passport_issue_date?: string | null
          applicant_passport_issuing_authority?: string | null
          applicant_passport_issuing_country?: string | null
          applicant_passport_number?: string | null
          applicant_pesel?: string | null
          applicant_phone?: string | null
          applicant_pob?: string | null
          applicant_previous_names?: Json | null
          applicant_sex?: string | null
          attachment_1_included?: boolean | null
          attachment_10_included?: boolean | null
          attachment_2_included?: boolean | null
          attachment_3_included?: boolean | null
          attachment_4_included?: boolean | null
          attachment_5_included?: boolean | null
          attachment_6_included?: boolean | null
          attachment_7_included?: boolean | null
          attachment_8_included?: boolean | null
          attachment_9_included?: boolean | null
          birth_act_location?: string | null
          birth_act_number?: string | null
          birth_act_year?: string | null
          case_id?: string
          child_1_dob?: string | null
          child_1_first_name?: string | null
          child_1_is_alive?: boolean | null
          child_1_last_name?: string | null
          child_1_notes?: string | null
          child_1_pob?: string | null
          child_1_sex?: string | null
          child_10_dob?: string | null
          child_10_first_name?: string | null
          child_10_is_alive?: boolean | null
          child_10_last_name?: string | null
          child_10_notes?: string | null
          child_10_pob?: string | null
          child_10_sex?: string | null
          child_2_dob?: string | null
          child_2_first_name?: string | null
          child_2_is_alive?: boolean | null
          child_2_last_name?: string | null
          child_2_notes?: string | null
          child_2_pob?: string | null
          child_2_sex?: string | null
          child_3_dob?: string | null
          child_3_first_name?: string | null
          child_3_is_alive?: boolean | null
          child_3_last_name?: string | null
          child_3_notes?: string | null
          child_3_pob?: string | null
          child_3_sex?: string | null
          child_4_dob?: string | null
          child_4_first_name?: string | null
          child_4_is_alive?: boolean | null
          child_4_last_name?: string | null
          child_4_notes?: string | null
          child_4_pob?: string | null
          child_4_sex?: string | null
          child_5_dob?: string | null
          child_5_first_name?: string | null
          child_5_is_alive?: boolean | null
          child_5_last_name?: string | null
          child_5_notes?: string | null
          child_5_pob?: string | null
          child_5_sex?: string | null
          child_6_dob?: string | null
          child_6_first_name?: string | null
          child_6_is_alive?: boolean | null
          child_6_last_name?: string | null
          child_6_notes?: string | null
          child_6_pob?: string | null
          child_6_sex?: string | null
          child_7_dob?: string | null
          child_7_first_name?: string | null
          child_7_is_alive?: boolean | null
          child_7_last_name?: string | null
          child_7_notes?: string | null
          child_7_pob?: string | null
          child_7_sex?: string | null
          child_8_dob?: string | null
          child_8_first_name?: string | null
          child_8_is_alive?: boolean | null
          child_8_last_name?: string | null
          child_8_notes?: string | null
          child_8_pob?: string | null
          child_8_sex?: string | null
          child_9_dob?: string | null
          child_9_first_name?: string | null
          child_9_is_alive?: boolean | null
          child_9_last_name?: string | null
          child_9_notes?: string | null
          child_9_pob?: string | null
          child_9_sex?: string | null
          children_count?: number | null
          citizenship_change_permission?: string | null
          completion_percentage?: number | null
          created_at?: string
          date_of_marriage?: string | null
          family_notes?: string | null
          father_date_of_emigration?: string | null
          father_date_of_naturalization?: string | null
          father_dob?: string | null
          father_first_name?: string | null
          father_has_birth_cert?: boolean | null
          father_has_marriage_cert?: boolean | null
          father_has_naturalization?: boolean | null
          father_has_passport?: boolean | null
          father_is_alive?: boolean | null
          father_last_name?: string | null
          father_maiden_name?: string | null
          father_marital_status?: string | null
          father_mother_marriage_date?: string | null
          father_mother_marriage_place?: string | null
          father_notes?: string | null
          father_pesel?: string | null
          father_pob?: string | null
          father_previous_names?: string | null
          foreign_act_location?: string | null
          husband_last_name_after_marriage?: string | null
          id?: string
          important_additional_info?: string | null
          language_preference?: string | null
          marriage_act_location?: string | null
          mgf_citizenship_at_birth?: string | null
          mgf_date_of_emigration?: string | null
          mgf_date_of_naturalization?: string | null
          mgf_dob?: string | null
          mgf_first_name?: string | null
          mgf_has_birth_cert?: boolean | null
          mgf_has_marriage_cert?: boolean | null
          mgf_has_naturalization?: boolean | null
          mgf_has_passport?: boolean | null
          mgf_is_alive?: boolean | null
          mgf_last_name?: string | null
          mgf_mgm_marriage_date?: string | null
          mgf_mgm_marriage_place?: string | null
          mgf_notes?: string | null
          mgf_pesel?: string | null
          mgf_pob?: string | null
          mggf_date_of_emigration?: string | null
          mggf_date_of_naturalization?: string | null
          mggf_dob?: string | null
          mggf_first_name?: string | null
          mggf_has_birth_cert?: boolean | null
          mggf_has_marriage_cert?: boolean | null
          mggf_has_naturalization?: boolean | null
          mggf_has_passport?: boolean | null
          mggf_is_alive?: boolean | null
          mggf_last_name?: string | null
          mggf_mggm_marriage_date?: string | null
          mggf_mggm_marriage_place?: string | null
          mggf_notes?: string | null
          mggf_pob?: string | null
          mggm_date_of_emigration?: string | null
          mggm_date_of_naturalization?: string | null
          mggm_dob?: string | null
          mggm_first_name?: string | null
          mggm_has_birth_cert?: boolean | null
          mggm_has_marriage_cert?: boolean | null
          mggm_has_naturalization?: boolean | null
          mggm_has_passport?: boolean | null
          mggm_is_alive?: boolean | null
          mggm_last_name?: string | null
          mggm_maiden_name?: string | null
          mggm_notes?: string | null
          mggm_pob?: string | null
          mgm_date_of_emigration?: string | null
          mgm_date_of_naturalization?: string | null
          mgm_dob?: string | null
          mgm_first_name?: string | null
          mgm_has_birth_cert?: boolean | null
          mgm_has_marriage_cert?: boolean | null
          mgm_has_naturalization?: boolean | null
          mgm_has_passport?: boolean | null
          mgm_is_alive?: boolean | null
          mgm_last_name?: string | null
          mgm_maiden_name?: string | null
          mgm_notes?: string | null
          mgm_pesel?: string | null
          mgm_pob?: string | null
          minor_children_count?: number | null
          mother_date_of_emigration?: string | null
          mother_date_of_naturalization?: string | null
          mother_dob?: string | null
          mother_first_name?: string | null
          mother_has_birth_cert?: boolean | null
          mother_has_marriage_cert?: boolean | null
          mother_has_naturalization?: boolean | null
          mother_has_passport?: boolean | null
          mother_is_alive?: boolean | null
          mother_last_name?: string | null
          mother_maiden_name?: string | null
          mother_marital_status?: string | null
          mother_notes?: string | null
          mother_pesel?: string | null
          mother_pob?: string | null
          mother_previous_names?: string | null
          oby_draft_created_at?: string | null
          oby_filed_at?: string | null
          oby_hac_notes?: string | null
          oby_hac_reviewed_at?: string | null
          oby_hac_reviewed_by?: string | null
          oby_reference_number?: string | null
          oby_status?: string | null
          oby_submitted_at?: string | null
          parents_has_marriage_additional_docs?: boolean | null
          parents_has_marriage_cert?: boolean | null
          parents_has_marriage_foreign_docs?: boolean | null
          pgf_citizenship_at_birth?: string | null
          pgf_date_of_emigration?: string | null
          pgf_date_of_naturalization?: string | null
          pgf_dob?: string | null
          pgf_first_name?: string | null
          pgf_has_birth_cert?: boolean | null
          pgf_has_marriage_cert?: boolean | null
          pgf_has_naturalization?: boolean | null
          pgf_has_passport?: boolean | null
          pgf_is_alive?: boolean | null
          pgf_last_name?: string | null
          pgf_notes?: string | null
          pgf_pesel?: string | null
          pgf_pgm_marriage_date?: string | null
          pgf_pgm_marriage_place?: string | null
          pgf_pob?: string | null
          pggf_date_of_emigration?: string | null
          pggf_date_of_naturalization?: string | null
          pggf_dob?: string | null
          pggf_first_name?: string | null
          pggf_has_birth_cert?: boolean | null
          pggf_has_marriage_cert?: boolean | null
          pggf_has_naturalization?: boolean | null
          pggf_has_passport?: boolean | null
          pggf_is_alive?: boolean | null
          pggf_last_name?: string | null
          pggf_notes?: string | null
          pggf_pggm_marriage_date?: string | null
          pggf_pggm_marriage_place?: string | null
          pggf_pob?: string | null
          pggm_date_of_emigration?: string | null
          pggm_date_of_naturalization?: string | null
          pggm_dob?: string | null
          pggm_first_name?: string | null
          pggm_has_birth_cert?: boolean | null
          pggm_has_marriage_cert?: boolean | null
          pggm_has_naturalization?: boolean | null
          pggm_has_passport?: boolean | null
          pggm_is_alive?: boolean | null
          pggm_last_name?: string | null
          pggm_maiden_name?: string | null
          pggm_notes?: string | null
          pggm_pob?: string | null
          pgm_date_of_emigration?: string | null
          pgm_date_of_naturalization?: string | null
          pgm_dob?: string | null
          pgm_first_name?: string | null
          pgm_has_birth_cert?: boolean | null
          pgm_has_marriage_cert?: boolean | null
          pgm_has_naturalization?: boolean | null
          pgm_has_passport?: boolean | null
          pgm_is_alive?: boolean | null
          pgm_last_name?: string | null
          pgm_maiden_name?: string | null
          pgm_notes?: string | null
          pgm_pob?: string | null
          place_of_marriage?: string | null
          poa_date_filed?: string | null
          polish_birth_act_number?: string | null
          polish_citizenship_deprivation?: boolean | null
          polish_preliminary_docs_info?: string | null
          previous_decision_info?: string | null
          representative_address?: string | null
          representative_address_cont?: string | null
          representative_email?: string | null
          representative_full_name?: string | null
          representative_phone?: string | null
          sibling_decision_info?: string | null
          spouse_current_citizenship?: string[] | null
          spouse_date_of_emigration?: string | null
          spouse_date_of_naturalization?: string | null
          spouse_dob?: string | null
          spouse_email?: string | null
          spouse_first_name?: string | null
          spouse_has_birth_cert?: boolean | null
          spouse_has_marriage_cert?: boolean | null
          spouse_has_naturalization?: boolean | null
          spouse_has_passport?: boolean | null
          spouse_is_alive?: boolean | null
          spouse_last_name?: string | null
          spouse_maiden_name?: string | null
          spouse_notes?: string | null
          spouse_passport_number?: string | null
          spouse_phone?: string | null
          spouse_pob?: string | null
          spouse_sex?: string | null
          submission_date?: string | null
          submission_location?: string | null
          updated_at?: string
          wife_last_name_after_marriage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_table_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      master_table_audit_log: {
        Row: {
          case_id: string
          change_reason: string | null
          changed_at: string
          changed_by: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          case_id: string
          change_reason?: string | null
          changed_at?: string
          changed_by: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          case_id?: string
          change_reason?: string | null
          changed_at?: string
          changed_by?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_table_audit_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
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
      migration_logs: {
        Row: {
          can_undo: boolean | null
          changes_made: Json | null
          error_message: string | null
          executed_at: string
          executed_by: string | null
          id: string
          metadata: Json | null
          migration_type: string
          status: string
          undone_at: string | null
          undone_by: string | null
        }
        Insert: {
          can_undo?: boolean | null
          changes_made?: Json | null
          error_message?: string | null
          executed_at?: string
          executed_by?: string | null
          id?: string
          metadata?: Json | null
          migration_type: string
          status?: string
          undone_at?: string | null
          undone_by?: string | null
        }
        Update: {
          can_undo?: boolean | null
          changes_made?: Json | null
          error_message?: string | null
          executed_at?: string
          executed_by?: string | null
          id?: string
          metadata?: Json | null
          migration_type?: string
          status?: string
          undone_at?: string | null
          undone_by?: string | null
        }
        Relationships: []
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
      ocr_processing_logs: {
        Row: {
          case_id: string | null
          completed_at: string | null
          confidence: number | null
          created_at: string | null
          document_id: string | null
          error_message: string | null
          extracted_fields: Json | null
          id: string
          image_deleted_at: string | null
          image_size_bytes: number | null
          memory_used_mb: number | null
          processed_by: string | null
          processing_duration_ms: number | null
          started_at: string
          status: string | null
        }
        Insert: {
          case_id?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          extracted_fields?: Json | null
          id?: string
          image_deleted_at?: string | null
          image_size_bytes?: number | null
          memory_used_mb?: number | null
          processed_by?: string | null
          processing_duration_ms?: number | null
          started_at?: string
          status?: string | null
        }
        Update: {
          case_id?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          extracted_fields?: Json | null
          id?: string
          image_deleted_at?: string | null
          image_size_bytes?: number | null
          memory_used_mb?: number | null
          processed_by?: string | null
          processing_duration_ms?: number | null
          started_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_processing_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_processing_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      passport_applications: {
        Row: {
          applicant_dob: string | null
          applicant_first_name: string | null
          applicant_last_name: string | null
          applicant_type: string
          appointment_confirmed: boolean | null
          appointment_date: string | null
          approved_date: string | null
          case_id: string
          checklist_document_id: string | null
          checklist_generated: boolean | null
          collection_method: string | null
          consulate_country: string | null
          consulate_location: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issued_date: string | null
          notes: string | null
          passport_number: string | null
          received_date: string | null
          status: string | null
          submitted_date: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_dob?: string | null
          applicant_first_name?: string | null
          applicant_last_name?: string | null
          applicant_type: string
          appointment_confirmed?: boolean | null
          appointment_date?: string | null
          approved_date?: string | null
          case_id: string
          checklist_document_id?: string | null
          checklist_generated?: boolean | null
          collection_method?: string | null
          consulate_country?: string | null
          consulate_location?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issued_date?: string | null
          notes?: string | null
          passport_number?: string | null
          received_date?: string | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_dob?: string | null
          applicant_first_name?: string | null
          applicant_last_name?: string | null
          applicant_type?: string
          appointment_confirmed?: boolean | null
          appointment_date?: string | null
          approved_date?: string | null
          case_id?: string
          checklist_document_id?: string | null
          checklist_generated?: boolean | null
          collection_method?: string | null
          consulate_country?: string | null
          consulate_location?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issued_date?: string | null
          notes?: string | null
          passport_number?: string | null
          received_date?: string | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passport_applications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passport_applications_checklist_document_id_fkey"
            columns: ["checklist_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      poa: {
        Row: {
          case_id: string
          client_ip_address: string | null
          client_signature_date: string | null
          client_signature_url: string | null
          client_signed: boolean | null
          client_signed_at: string | null
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
          client_signature_url?: string | null
          client_signed?: boolean | null
          client_signed_at?: string | null
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
          client_signature_url?: string | null
          client_signed?: boolean | null
          client_signed_at?: string | null
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
      rate_limit_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          error_code: string | null
          event_type: string
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          error_code?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          error_code?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      security_scan_results: {
        Row: {
          created_at: string | null
          critical_issues: number
          high_issues: number
          id: string
          info_issues: number
          low_issues: number
          medium_issues: number
          overall_score: number
          performed_by: string | null
          results: Json
          scan_date: string
          scan_duration_ms: number
        }
        Insert: {
          created_at?: string | null
          critical_issues?: number
          high_issues?: number
          id?: string
          info_issues?: number
          low_issues?: number
          medium_issues?: number
          overall_score: number
          performed_by?: string | null
          results?: Json
          scan_date?: string
          scan_duration_ms: number
        }
        Update: {
          created_at?: string | null
          critical_issues?: number
          high_issues?: number
          id?: string
          info_issues?: number
          low_issues?: number
          medium_issues?: number
          overall_score?: number
          performed_by?: string | null
          results?: Json
          scan_date?: string
          scan_duration_ms?: number
        }
        Relationships: []
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
      usc_requests: {
        Row: {
          application_details: Json | null
          case_id: string
          completed_at: string | null
          created_at: string
          document_type: string
          id: string
          letter_generated_at: string | null
          letter_sent_at: string | null
          notes: string | null
          person_type: string
          registry_city: string | null
          registry_office: string | null
          registry_voivodeship: string | null
          request_type: string
          response_received_at: string | null
          result_document_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          application_details?: Json | null
          case_id: string
          completed_at?: string | null
          created_at?: string
          document_type: string
          id?: string
          letter_generated_at?: string | null
          letter_sent_at?: string | null
          notes?: string | null
          person_type: string
          registry_city?: string | null
          registry_office?: string | null
          registry_voivodeship?: string | null
          request_type: string
          response_received_at?: string | null
          result_document_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          application_details?: Json | null
          case_id?: string
          completed_at?: string | null
          created_at?: string
          document_type?: string
          id?: string
          letter_generated_at?: string | null
          letter_sent_at?: string | null
          notes?: string | null
          person_type?: string
          registry_city?: string | null
          registry_office?: string | null
          registry_voivodeship?: string | null
          request_type?: string
          response_received_at?: string | null
          result_document_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usc_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usc_requests_result_document_id_fkey"
            columns: ["result_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
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
      check_rls_status: {
        Args: never
        Returns: {
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      get_case_document_count: { Args: { case_uuid: string }; Returns: number }
      get_cases_with_counts: {
        Args: never
        Returns: {
          client_code: string
          client_name: string
          client_score: number
          completed_task_count: number
          country: string
          created_at: string
          document_count: number
          dropbox_path: string
          generation: Database["public"]["Enums"]["case_generation"]
          id: string
          is_vip: boolean
          notes: string
          processing_mode: Database["public"]["Enums"]["processing_mode"]
          progress: number
          sort_order: number
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
      log_security_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_error_code?: string
          p_event_type: string
          p_ip_address?: string
          p_resource_id?: string
          p_resource_type?: string
          p_severity: string
          p_success?: boolean
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      record_security_metric: {
        Args: {
          p_metadata?: Json
          p_metric_type: string
          p_metric_value: number
        }
        Returns: string
      }
      update_case_sort_orders: {
        Args: { case_orders: Json }
        Returns: undefined
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
      processing_mode: "standard" | "expedited" | "vip" | "vip_plus"
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
      processing_mode: ["standard", "expedited", "vip", "vip_plus"],
    },
  },
} as const
