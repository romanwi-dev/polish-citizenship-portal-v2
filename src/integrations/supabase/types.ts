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
      agent_approvals: {
        Row: {
          ai_explanation: string
          auto_approve_after: string | null
          conversation_id: string | null
          id: string
          requested_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          status: string | null
          tool_arguments: Json
          tool_name: string
        }
        Insert: {
          ai_explanation: string
          auto_approve_after?: string | null
          conversation_id?: string | null
          id?: string
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          status?: string | null
          tool_arguments: Json
          tool_name: string
        }
        Update: {
          ai_explanation?: string
          auto_approve_after?: string | null
          conversation_id?: string | null
          id?: string
          requested_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          status?: string | null
          tool_arguments?: Json
          tool_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_approvals_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_knowledge_snippets: {
        Row: {
          agent_type: string
          created_at: string | null
          created_by: string | null
          id: string
          snippet: string
          source_conversation_id: string | null
          topic: string
          usefulness_score: number | null
          verified: boolean | null
        }
        Insert: {
          agent_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          snippet: string
          source_conversation_id?: string | null
          topic: string
          usefulness_score?: number | null
          verified?: boolean | null
        }
        Update: {
          agent_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          snippet?: string
          source_conversation_id?: string | null
          topic?: string
          usefulness_score?: number | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_knowledge_snippets_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory: {
        Row: {
          agent_type: string
          case_id: string | null
          context_window: Json | null
          created_at: string | null
          expires_at: string | null
          id: string
          memory_key: string
          memory_value: Json
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          case_id?: string | null
          context_window?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          memory_key: string
          memory_value: Json
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          case_id?: string | null
          context_window?: Json | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          memory_key?: string
          memory_value?: Json
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_notifications: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string
          notification_type: string | null
          read: boolean | null
          read_at: string | null
          recipient_user_id: string | null
          severity: string | null
          title: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          notification_type?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_user_id?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_user_id?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_orchestration: {
        Row: {
          child_agent_type: string
          child_conversation_id: string | null
          completed_at: string | null
          created_at: string | null
          delegation_prompt: string
          id: string
          parent_conversation_id: string | null
          result_summary: string | null
          status: string | null
        }
        Insert: {
          child_agent_type: string
          child_conversation_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delegation_prompt: string
          id?: string
          parent_conversation_id?: string | null
          result_summary?: string | null
          status?: string | null
        }
        Update: {
          child_agent_type?: string
          child_conversation_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          delegation_prompt?: string
          id?: string
          parent_conversation_id?: string | null
          result_summary?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_orchestration_child_conversation_id_fkey"
            columns: ["child_conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_orchestration_parent_conversation_id_fkey"
            columns: ["parent_conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_test_cases: {
        Row: {
          agent_type: string
          created_at: string | null
          expected_outcome: string | null
          expected_tools: string[] | null
          id: string
          last_run_at: string | null
          last_run_result: Json | null
          status: string | null
          test_name: string
          test_prompt: string
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          created_at?: string | null
          expected_outcome?: string | null
          expected_tools?: string[] | null
          id?: string
          last_run_at?: string | null
          last_run_result?: Json | null
          status?: string | null
          test_name: string
          test_prompt: string
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          created_at?: string | null
          expected_outcome?: string | null
          expected_tools?: string[] | null
          id?: string
          last_run_at?: string | null
          last_run_result?: Json | null
          status?: string | null
          test_name?: string
          test_prompt?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_agent_activity: {
        Row: {
          agent_type: string
          case_id: string | null
          completion_tokens: number | null
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          prompt_tokens: number | null
          response_time_ms: number | null
          success: boolean | null
          tools_executed: number | null
          tools_failed: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          agent_type: string
          case_id?: string | null
          completion_tokens?: number | null
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          prompt_tokens?: number | null
          response_time_ms?: number | null
          success?: boolean | null
          tools_executed?: number | null
          tools_failed?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          agent_type?: string
          case_id?: string | null
          completion_tokens?: number | null
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          prompt_tokens?: number | null
          response_time_ms?: number | null
          success?: boolean | null
          tools_executed?: number | null
          tools_failed?: number | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_activity_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_activity_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_metrics: {
        Row: {
          agent_type: string
          avg_response_time_ms: number | null
          created_at: string | null
          failed_requests: number | null
          id: string
          metadata: Json | null
          period_end: string
          period_start: string
          successful_requests: number | null
          total_requests: number | null
          total_tokens_used: number | null
          total_tools_executed: number | null
        }
        Insert: {
          agent_type: string
          avg_response_time_ms?: number | null
          created_at?: string | null
          failed_requests?: number | null
          id?: string
          metadata?: Json | null
          period_end: string
          period_start: string
          successful_requests?: number | null
          total_requests?: number | null
          total_tokens_used?: number | null
          total_tools_executed?: number | null
        }
        Update: {
          agent_type?: string
          avg_response_time_ms?: number | null
          created_at?: string | null
          failed_requests?: number | null
          id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          successful_requests?: number | null
          total_requests?: number | null
          total_tokens_used?: number | null
          total_tools_executed?: number | null
        }
        Relationships: []
      }
      ai_confidence_overrides: {
        Row: {
          ai_classification: string
          ai_confidence: number | null
          ai_detected_person: string | null
          case_id: string
          created_at: string | null
          document_id: string
          human_classification: string | null
          human_override: string | null
          id: string
          metadata: Json | null
          updated_at: string | null
          verification_reason: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_classification: string
          ai_confidence?: number | null
          ai_detected_person?: string | null
          case_id: string
          created_at?: string | null
          document_id: string
          human_classification?: string | null
          human_override?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          verification_reason?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_classification?: string
          ai_confidence?: number | null
          ai_detected_person?: string | null
          case_id?: string
          created_at?: string | null
          document_id?: string
          human_classification?: string | null
          human_override?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          verification_reason?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_confidence_overrides_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_confidence_overrides_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          feedback_at: string | null
          id: string
          metadata: Json | null
          role: string
          tool_call_id: string | null
          tool_calls: Json | null
          user_feedback: string | null
          user_rating: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          feedback_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          tool_call_id?: string | null
          tool_calls?: Json | null
          user_feedback?: string | null
          user_rating?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          feedback_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          tool_call_id?: string | null
          tool_calls?: Json | null
          user_feedback?: string | null
          user_rating?: number | null
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
          completed_at: string | null
          created_at: string | null
          id: string
          started_at: string | null
          status: string | null
          tools_completed: string[] | null
          tools_failed: string[] | null
          tools_pending: string[] | null
          updated_at: string | null
        }
        Insert: {
          agent_type: string
          case_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          tools_completed?: string[] | null
          tools_failed?: string[] | null
          tools_pending?: string[] | null
          updated_at?: string | null
        }
        Update: {
          agent_type?: string
          case_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          tools_completed?: string[] | null
          tools_failed?: string[] | null
          tools_pending?: string[] | null
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
      ai_pii_processing_logs: {
        Row: {
          ai_provider: string
          case_id: string
          created_at: string | null
          document_id: string | null
          id: string
          operation_type: string
          pii_fields_sent: Json
          user_id: string | null
        }
        Insert: {
          ai_provider: string
          case_id: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          operation_type: string
          pii_fields_sent: Json
          user_id?: string | null
        }
        Update: {
          ai_provider?: string
          case_id?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          operation_type?: string
          pii_fields_sent?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_pii_processing_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_pii_processing_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_verification_results: {
        Row: {
          case_id: string
          consensus_confidence: number | null
          consensus_valid: boolean | null
          created_at: string
          disagreements: Json | null
          form_type: string
          gemini_completeness: number | null
          gemini_confidence: number | null
          gemini_is_valid: boolean | null
          gemini_issues: Json | null
          gemini_raw_response: Json | null
          gemini_suggestions: Json | null
          hac_approved: boolean | null
          hac_notes: string | null
          hac_reviewed_at: string | null
          hac_reviewed_by: string | null
          id: string
          openai_completeness: number | null
          openai_confidence: number | null
          openai_is_valid: boolean | null
          openai_issues: Json | null
          openai_raw_response: Json | null
          openai_suggestions: Json | null
          updated_at: string
        }
        Insert: {
          case_id: string
          consensus_confidence?: number | null
          consensus_valid?: boolean | null
          created_at?: string
          disagreements?: Json | null
          form_type: string
          gemini_completeness?: number | null
          gemini_confidence?: number | null
          gemini_is_valid?: boolean | null
          gemini_issues?: Json | null
          gemini_raw_response?: Json | null
          gemini_suggestions?: Json | null
          hac_approved?: boolean | null
          hac_notes?: string | null
          hac_reviewed_at?: string | null
          hac_reviewed_by?: string | null
          id?: string
          openai_completeness?: number | null
          openai_confidence?: number | null
          openai_is_valid?: boolean | null
          openai_issues?: Json | null
          openai_raw_response?: Json | null
          openai_suggestions?: Json | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          consensus_confidence?: number | null
          consensus_valid?: boolean | null
          created_at?: string
          disagreements?: Json | null
          form_type?: string
          gemini_completeness?: number | null
          gemini_confidence?: number | null
          gemini_is_valid?: boolean | null
          gemini_issues?: Json | null
          gemini_raw_response?: Json | null
          gemini_suggestions?: Json | null
          hac_approved?: boolean | null
          hac_notes?: string | null
          hac_reviewed_at?: string | null
          hac_reviewed_by?: string | null
          id?: string
          openai_completeness?: number | null
          openai_confidence?: number | null
          openai_is_valid?: boolean | null
          openai_issues?: Json | null
          openai_raw_response?: Json | null
          openai_suggestions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_verification_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_verifications: {
        Row: {
          case_id: string | null
          created_at: string
          critical_issues: string[] | null
          description: string
          files_affected: string[]
          id: string
          implemented_at: string | null
          openai_score: number
          proposal_type: string
          recommendation: string
          suggestions: string[] | null
          user_decision: string | null
          warnings: string[] | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          critical_issues?: string[] | null
          description: string
          files_affected: string[]
          id?: string
          implemented_at?: string | null
          openai_score: number
          proposal_type: string
          recommendation: string
          suggestions?: string[] | null
          user_decision?: string | null
          warnings?: string[] | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          critical_issues?: string[] | null
          description?: string
          files_affected?: string[]
          id?: string
          implemented_at?: string | null
          openai_score?: number
          proposal_type?: string
          recommendation?: string
          suggestions?: string[] | null
          user_decision?: string | null
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_verifications_case_id_fkey"
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
          stage_entered_at: string | null
          stage_history: Json | null
          status: string
          updated_at: string | null
          workflow_stage: string | null
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
          stage_entered_at?: string | null
          stage_history?: Json | null
          status?: string
          updated_at?: string | null
          workflow_stage?: string | null
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
          stage_entered_at?: string | null
          stage_history?: Json | null
          status?: string
          updated_at?: string | null
          workflow_stage?: string | null
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
      case_workflow_state: {
        Row: {
          case_id: string
          created_at: string | null
          current_step: number
          expires_at: string | null
          form_data: Json | null
          id: string
          metadata: Json | null
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          current_step?: number
          expires_at?: string | null
          form_data?: Json | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          current_step?: number
          expires_at?: string | null
          form_data?: Json | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      cases: {
        Row: {
          active_workflows: Json | null
          admin_notes: string | null
          ai_consent_given_at: string | null
          ai_consent_given_by: string | null
          ai_processing_consent: boolean | null
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
          payment_status: string | null
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
          active_workflows?: Json | null
          admin_notes?: string | null
          ai_consent_given_at?: string | null
          ai_consent_given_by?: string | null
          ai_processing_consent?: boolean | null
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
          payment_status?: string | null
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
          active_workflows?: Json | null
          admin_notes?: string | null
          ai_consent_given_at?: string | null
          ai_consent_given_by?: string | null
          ai_processing_consent?: boolean | null
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
          payment_status?: string | null
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
      crash_reports: {
        Row: {
          case_id: string | null
          component_stack: string | null
          created_at: string
          error_message: string
          error_stack: string | null
          id: string
          metadata: Json | null
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          component_stack?: string | null
          created_at?: string
          error_message: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          component_stack?: string | null
          created_at?: string
          error_message?: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crash_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      crash_states: {
        Row: {
          component_stack: string | null
          crash_data: Json
          created_at: string
          error_message: string | null
          expires_at: string
          id: string
          recovered_at: string | null
          session_id: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          crash_data: Json
          created_at?: string
          error_message?: string | null
          expires_at?: string
          id?: string
          recovered_at?: string | null
          session_id: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          crash_data?: Json
          created_at?: string
          error_message?: string | null
          expires_at?: string
          id?: string
          recovered_at?: string | null
          session_id?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_batch_uploads: {
        Row: {
          batch_id: string
          case_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          document_ids: string[] | null
          error_details: Json | null
          failed_count: number | null
          id: string
          status: string
          total_files: number
          uploaded_count: number | null
        }
        Insert: {
          batch_id: string
          case_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_ids?: string[] | null
          error_details?: Json | null
          failed_count?: number | null
          id?: string
          status?: string
          total_files: number
          uploaded_count?: number | null
        }
        Update: {
          batch_id?: string
          case_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_ids?: string[] | null
          error_details?: Json | null
          failed_count?: number | null
          id?: string
          status?: string
          total_files?: number
          uploaded_count?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          ai_corrections: Json | null
          ai_description: string | null
          ai_detected_person: string | null
          ai_detected_type: string | null
          ai_generated_name: string | null
          ai_summary: string | null
          applied_at: string | null
          applied_by: string | null
          archival_significance: string | null
          case_id: string
          category: string | null
          created_at: string
          data_applied_to_forms: boolean | null
          deleted_at: string | null
          detection_confidence: number | null
          document_tags: string[] | null
          document_type: string | null
          document_version: number | null
          dropbox_file_id: string | null
          dropbox_path: string
          edit_count: number | null
          fedex_label_url: string | null
          file_extension: string | null
          file_size: number | null
          folder_category: string | null
          id: string
          is_translated: boolean | null
          is_verified: boolean | null
          is_verified_by_hac: boolean | null
          language: string | null
          last_edited_at: string | null
          legal_validity: string | null
          locked_at: string | null
          metadata: Json | null
          name: string
          name_confidence: number | null
          needs_translation: boolean | null
          ocr_confidence: number | null
          ocr_data: Json | null
          ocr_error_message: string | null
          ocr_next_retry_at: string | null
          ocr_retry_count: number | null
          ocr_reviewed_at: string | null
          ocr_reviewed_by: string | null
          ocr_status: string | null
          ocr_text: string | null
          pdf_edited_url: string | null
          pdf_locked_url: string | null
          pdf_original_url: string | null
          pdf_status: Database["public"]["Enums"]["pdf_status"] | null
          person_type: string | null
          post_verification_result: Json | null
          post_verification_score: number | null
          pre_verification_result: Json | null
          pre_verification_score: number | null
          received_at: string | null
          replaced_by: string | null
          sent_at: string | null
          signature_data: string | null
          signed_at: string | null
          status_updated_at: string | null
          subfolder_path: string | null
          tracking_number: string | null
          translated_text_english: string | null
          translated_text_polish: string | null
          translation_confidence: number | null
          translation_required: boolean | null
          type: string | null
          updated_at: string
          user_overrode_detection: boolean | null
          validation_errors: Json | null
          validation_passed: boolean | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          version: number | null
        }
        Insert: {
          ai_corrections?: Json | null
          ai_description?: string | null
          ai_detected_person?: string | null
          ai_detected_type?: string | null
          ai_generated_name?: string | null
          ai_summary?: string | null
          applied_at?: string | null
          applied_by?: string | null
          archival_significance?: string | null
          case_id: string
          category?: string | null
          created_at?: string
          data_applied_to_forms?: boolean | null
          deleted_at?: string | null
          detection_confidence?: number | null
          document_tags?: string[] | null
          document_type?: string | null
          document_version?: number | null
          dropbox_file_id?: string | null
          dropbox_path: string
          edit_count?: number | null
          fedex_label_url?: string | null
          file_extension?: string | null
          file_size?: number | null
          folder_category?: string | null
          id?: string
          is_translated?: boolean | null
          is_verified?: boolean | null
          is_verified_by_hac?: boolean | null
          language?: string | null
          last_edited_at?: string | null
          legal_validity?: string | null
          locked_at?: string | null
          metadata?: Json | null
          name: string
          name_confidence?: number | null
          needs_translation?: boolean | null
          ocr_confidence?: number | null
          ocr_data?: Json | null
          ocr_error_message?: string | null
          ocr_next_retry_at?: string | null
          ocr_retry_count?: number | null
          ocr_reviewed_at?: string | null
          ocr_reviewed_by?: string | null
          ocr_status?: string | null
          ocr_text?: string | null
          pdf_edited_url?: string | null
          pdf_locked_url?: string | null
          pdf_original_url?: string | null
          pdf_status?: Database["public"]["Enums"]["pdf_status"] | null
          person_type?: string | null
          post_verification_result?: Json | null
          post_verification_score?: number | null
          pre_verification_result?: Json | null
          pre_verification_score?: number | null
          received_at?: string | null
          replaced_by?: string | null
          sent_at?: string | null
          signature_data?: string | null
          signed_at?: string | null
          status_updated_at?: string | null
          subfolder_path?: string | null
          tracking_number?: string | null
          translated_text_english?: string | null
          translated_text_polish?: string | null
          translation_confidence?: number | null
          translation_required?: boolean | null
          type?: string | null
          updated_at?: string
          user_overrode_detection?: boolean | null
          validation_errors?: Json | null
          validation_passed?: boolean | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version?: number | null
        }
        Update: {
          ai_corrections?: Json | null
          ai_description?: string | null
          ai_detected_person?: string | null
          ai_detected_type?: string | null
          ai_generated_name?: string | null
          ai_summary?: string | null
          applied_at?: string | null
          applied_by?: string | null
          archival_significance?: string | null
          case_id?: string
          category?: string | null
          created_at?: string
          data_applied_to_forms?: boolean | null
          deleted_at?: string | null
          detection_confidence?: number | null
          document_tags?: string[] | null
          document_type?: string | null
          document_version?: number | null
          dropbox_file_id?: string | null
          dropbox_path?: string
          edit_count?: number | null
          fedex_label_url?: string | null
          file_extension?: string | null
          file_size?: number | null
          folder_category?: string | null
          id?: string
          is_translated?: boolean | null
          is_verified?: boolean | null
          is_verified_by_hac?: boolean | null
          language?: string | null
          last_edited_at?: string | null
          legal_validity?: string | null
          locked_at?: string | null
          metadata?: Json | null
          name?: string
          name_confidence?: number | null
          needs_translation?: boolean | null
          ocr_confidence?: number | null
          ocr_data?: Json | null
          ocr_error_message?: string | null
          ocr_next_retry_at?: string | null
          ocr_retry_count?: number | null
          ocr_reviewed_at?: string | null
          ocr_reviewed_by?: string | null
          ocr_status?: string | null
          ocr_text?: string | null
          pdf_edited_url?: string | null
          pdf_locked_url?: string | null
          pdf_original_url?: string | null
          pdf_status?: Database["public"]["Enums"]["pdf_status"] | null
          person_type?: string | null
          post_verification_result?: Json | null
          post_verification_score?: number | null
          pre_verification_result?: Json | null
          pre_verification_score?: number | null
          received_at?: string | null
          replaced_by?: string | null
          sent_at?: string | null
          signature_data?: string | null
          signed_at?: string | null
          status_updated_at?: string | null
          subfolder_path?: string | null
          tracking_number?: string | null
          translated_text_english?: string | null
          translated_text_polish?: string | null
          translation_confidence?: number | null
          translation_required?: boolean | null
          type?: string | null
          updated_at?: string
          user_overrode_detection?: boolean | null
          validation_errors?: Json | null
          validation_passed?: boolean | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      edge_function_healing_log: {
        Row: {
          details: string | null
          function_name: string
          healing_action: string
          id: string
          performed_at: string
          result: string
        }
        Insert: {
          details?: string | null
          function_name: string
          healing_action: string
          id?: string
          performed_at?: string
          result: string
        }
        Update: {
          details?: string | null
          function_name?: string
          healing_action?: string
          id?: string
          performed_at?: string
          result?: string
        }
        Relationships: []
      }
      edge_function_health: {
        Row: {
          check_timestamp: string
          created_at: string
          degraded_count: number
          down_count: number
          health_report: Json
          healthy_count: number
          id: string
          overall_status: string
          total_functions: number
        }
        Insert: {
          check_timestamp?: string
          created_at?: string
          degraded_count: number
          down_count: number
          health_report: Json
          healthy_count: number
          id?: string
          overall_status: string
          total_functions: number
        }
        Update: {
          check_timestamp?: string
          created_at?: string
          degraded_count?: number
          down_count?: number
          health_report?: Json
          healthy_count?: number
          id?: string
          overall_status?: string
          total_functions?: number
        }
        Relationships: []
      }
      edge_function_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          function_name: string
          id: string
          metadata: Json | null
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          function_name: string
          id?: string
          metadata?: Json | null
          status: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          function_name?: string
          id?: string
          metadata?: Json | null
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      form_field_sources: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          case_id: string
          confidence: number | null
          created_at: string | null
          field_name: string
          id: string
          locked: boolean | null
          metadata: Json | null
          source_document_id: string | null
          source_type: string
          updated_at: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          case_id: string
          confidence?: number | null
          created_at?: string | null
          field_name: string
          id?: string
          locked?: boolean | null
          metadata?: Json | null
          source_document_id?: string | null
          source_type: string
          updated_at?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          case_id?: string
          confidence?: number | null
          created_at?: string | null
          field_name?: string
          id?: string
          locked?: boolean | null
          metadata?: Json | null
          source_document_id?: string | null
          source_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_field_sources_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_field_sources_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_documents: {
        Row: {
          artifact_key: string | null
          case_id: string
          created_at: string | null
          created_by: string | null
          id: string
          path: string
          size_bytes: number | null
          template_type: string
        }
        Insert: {
          artifact_key?: string | null
          case_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          path: string
          size_bytes?: number | null
          template_type: string
        }
        Update: {
          artifact_key?: string | null
          case_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          path?: string
          size_bytes?: number | null
          template_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_generated_documents_case"
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
          applicant_has_minor_children: string | null
          applicant_has_naturalization: boolean | null
          applicant_has_passport: boolean | null
          applicant_is_alive: boolean | null
          applicant_is_married: boolean | null
          applicant_last_name: string | null
          applicant_maiden_name: string | null
          applicant_marital_status: string | null
          applicant_notes: string | null
          applicant_number_of_children: string | null
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
          father_is_polish: boolean | null
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
          mgf_is_polish: boolean | null
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
          mggf_is_polish: boolean | null
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
          mggm_is_polish: boolean | null
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
          mgm_is_polish: boolean | null
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
          mother_is_polish: boolean | null
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
          pgf_is_polish: boolean | null
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
          pggf_is_polish: boolean | null
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
          pggm_is_polish: boolean | null
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
          pgm_is_polish: boolean | null
          pgm_last_name: string | null
          pgm_maiden_name: string | null
          pgm_notes: string | null
          pgm_pob: string | null
          place_of_marriage: string | null
          poa_date_filed: string | null
          polish_birth_act_number: string | null
          polish_bloodline_side: string | null
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
          applicant_has_minor_children?: string | null
          applicant_has_naturalization?: boolean | null
          applicant_has_passport?: boolean | null
          applicant_is_alive?: boolean | null
          applicant_is_married?: boolean | null
          applicant_last_name?: string | null
          applicant_maiden_name?: string | null
          applicant_marital_status?: string | null
          applicant_notes?: string | null
          applicant_number_of_children?: string | null
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
          father_is_polish?: boolean | null
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
          mgf_is_polish?: boolean | null
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
          mggf_is_polish?: boolean | null
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
          mggm_is_polish?: boolean | null
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
          mgm_is_polish?: boolean | null
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
          mother_is_polish?: boolean | null
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
          pgf_is_polish?: boolean | null
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
          pggf_is_polish?: boolean | null
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
          pggm_is_polish?: boolean | null
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
          pgm_is_polish?: boolean | null
          pgm_last_name?: string | null
          pgm_maiden_name?: string | null
          pgm_notes?: string | null
          pgm_pob?: string | null
          place_of_marriage?: string | null
          poa_date_filed?: string | null
          polish_birth_act_number?: string | null
          polish_bloodline_side?: string | null
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
          applicant_has_minor_children?: string | null
          applicant_has_naturalization?: boolean | null
          applicant_has_passport?: boolean | null
          applicant_is_alive?: boolean | null
          applicant_is_married?: boolean | null
          applicant_last_name?: string | null
          applicant_maiden_name?: string | null
          applicant_marital_status?: string | null
          applicant_notes?: string | null
          applicant_number_of_children?: string | null
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
          father_is_polish?: boolean | null
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
          mgf_is_polish?: boolean | null
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
          mggf_is_polish?: boolean | null
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
          mggm_is_polish?: boolean | null
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
          mgm_is_polish?: boolean | null
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
          mother_is_polish?: boolean | null
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
          pgf_is_polish?: boolean | null
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
          pggf_is_polish?: boolean | null
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
          pggm_is_polish?: boolean | null
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
          pgm_is_polish?: boolean | null
          pgm_last_name?: string | null
          pgm_maiden_name?: string | null
          pgm_notes?: string | null
          pgm_pob?: string | null
          place_of_marriage?: string | null
          poa_date_filed?: string | null
          polish_birth_act_number?: string | null
          polish_bloodline_side?: string | null
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
      ocr_conflicts: {
        Row: {
          case_id: string
          created_at: string | null
          document_id: string
          field_name: string
          id: string
          manual_value: string | null
          ocr_confidence: number | null
          ocr_value: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          document_id: string
          field_name: string
          id?: string
          manual_value?: string | null
          ocr_confidence?: number | null
          ocr_value?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          document_id?: string
          field_name?: string
          id?: string
          manual_value?: string | null
          ocr_confidence?: number | null
          ocr_value?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_conflicts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_conflicts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_patterns_memory: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          pattern_data: Json
          pattern_key: string
          success_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data: Json
          pattern_key: string
          success_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          pattern_data?: Json
          pattern_key?: string
          success_count?: number | null
        }
        Relationships: []
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
          stage_entered_at: string | null
          stage_history: Json | null
          status: string | null
          submitted_date: string | null
          updated_at: string | null
          workflow_stage: string | null
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
          stage_entered_at?: string | null
          stage_history?: Json | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
          workflow_stage?: string | null
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
          stage_entered_at?: string | null
          stage_history?: Json | null
          status?: string | null
          submitted_date?: string | null
          updated_at?: string | null
          workflow_stage?: string | null
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
      pdf_artifacts: {
        Row: {
          artifact_key: string
          created_at: string
          id: number
          path: string
          size_bytes: number
        }
        Insert: {
          artifact_key: string
          created_at?: string
          id?: number
          path: string
          size_bytes: number
        }
        Update: {
          artifact_key?: string
          created_at?: string
          id?: number
          path?: string
          size_bytes?: number
        }
        Relationships: []
      }
      pdf_cleanup_logs: {
        Row: {
          bytes_freed: number
          cleanup_date: string
          created_at: string
          deleted_duplicates: number
          deleted_old: number
          duration_ms: number
          errors: number
          id: string
          kept_locked: number
          total_scanned: number
        }
        Insert: {
          bytes_freed?: number
          cleanup_date?: string
          created_at?: string
          deleted_duplicates?: number
          deleted_old?: number
          duration_ms: number
          errors?: number
          id?: string
          kept_locked?: number
          total_scanned?: number
        }
        Update: {
          bytes_freed?: number
          cleanup_date?: string
          created_at?: string
          deleted_duplicates?: number
          deleted_old?: number
          duration_ms?: number
          errors?: number
          id?: string
          kept_locked?: number
          total_scanned?: number
        }
        Relationships: []
      }
      pdf_dead_letters: {
        Row: {
          artifact_key: string | null
          created_at: string
          id: number
          job_id: number | null
          last_error: string | null
          payload: Json | null
        }
        Insert: {
          artifact_key?: string | null
          created_at?: string
          id?: number
          job_id?: number | null
          last_error?: string | null
          payload?: Json | null
        }
        Update: {
          artifact_key?: string | null
          created_at?: string
          id?: number
          job_id?: number | null
          last_error?: string | null
          payload?: Json | null
        }
        Relationships: []
      }
      pdf_generation_queue: {
        Row: {
          case_id: string
          created_at: string
          error_message: string | null
          id: string
          pdf_url: string | null
          processed_at: string | null
          retry_count: number | null
          status: string
          template_type: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          pdf_url?: string | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string
          template_type: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          pdf_url?: string | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string
          template_type?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_generation_queue_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_history: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          document_id: string
          id: string
          metadata: Json | null
          new_status: Database["public"]["Enums"]["pdf_status"] | null
          old_status: Database["public"]["Enums"]["pdf_status"] | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          document_id: string
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["pdf_status"] | null
          old_status?: Database["public"]["Enums"]["pdf_status"] | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          document_id?: string
          id?: string
          metadata?: Json | null
          new_status?: Database["public"]["Enums"]["pdf_status"] | null
          old_status?: Database["public"]["Enums"]["pdf_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_jobs: {
        Row: {
          artifact_key: string
          attempts: number
          case_id: string
          created_at: string
          id: number
          last_error: string | null
          status: string
          template_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_key: string
          attempts?: number
          case_id: string
          created_at?: string
          id?: number
          last_error?: string | null
          status?: string
          template_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_key?: string
          attempts?: number
          case_id?: string
          created_at?: string
          id?: number
          last_error?: string | null
          status?: string
          template_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pdf_queue: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          pdf_url: string | null
          retry_count: number | null
          status: string
          template_type: string
          updated_at: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          pdf_url?: string | null
          retry_count?: number | null
          status?: string
          template_type: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          pdf_url?: string | null
          retry_count?: number | null
          status?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_queue_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_rate_limits: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          request_count: number | null
          window_start: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          window_start?: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          window_start?: string
        }
        Relationships: []
      }
      performance_logs: {
        Row: {
          connection_type: string | null
          created_at: string | null
          id: string
          metric_type: string
          page: string
          user_agent: string | null
          value: number
        }
        Insert: {
          connection_type?: string | null
          created_at?: string | null
          id?: string
          metric_type: string
          page: string
          user_agent?: string | null
          value: number
        }
        Update: {
          connection_type?: string | null
          created_at?: string | null
          id?: string
          metric_type?: string
          page?: string
          user_agent?: string | null
          value?: number
        }
        Relationships: []
      }
      phase_a_analyses: {
        Row: {
          agent_name: string
          analysis_result: Json | null
          context: Json | null
          created_at: string | null
          created_by: string | null
          critical_issues: Json | null
          dependencies: Json | null
          domain: string
          edge_cases: Json | null
          id: string
          proposed_changes: string
          proposed_solution: string | null
          rollback_plan: string | null
          root_cause: string | null
          total_issues: number | null
          warnings: Json | null
        }
        Insert: {
          agent_name: string
          analysis_result?: Json | null
          context?: Json | null
          created_at?: string | null
          created_by?: string | null
          critical_issues?: Json | null
          dependencies?: Json | null
          domain: string
          edge_cases?: Json | null
          id?: string
          proposed_changes: string
          proposed_solution?: string | null
          rollback_plan?: string | null
          root_cause?: string | null
          total_issues?: number | null
          warnings?: Json | null
        }
        Update: {
          agent_name?: string
          analysis_result?: Json | null
          context?: Json | null
          created_at?: string | null
          created_by?: string | null
          critical_issues?: Json | null
          dependencies?: Json | null
          domain?: string
          edge_cases?: Json | null
          id?: string
          proposed_changes?: string
          proposed_solution?: string | null
          rollback_plan?: string | null
          root_cause?: string | null
          total_issues?: number | null
          warnings?: Json | null
        }
        Relationships: []
      }
      phase_b_verifications: {
        Row: {
          aggregated_findings: Json | null
          confidence: number | null
          consensus: string | null
          created_at: string | null
          created_by: string | null
          id: string
          models: Json | null
          overall_score: number | null
          passed: boolean | null
          phase_a_id: string | null
          recommendation: string | null
          score_variance: number | null
        }
        Insert: {
          aggregated_findings?: Json | null
          confidence?: number | null
          consensus?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          models?: Json | null
          overall_score?: number | null
          passed?: boolean | null
          phase_a_id?: string | null
          recommendation?: string | null
          score_variance?: number | null
        }
        Update: {
          aggregated_findings?: Json | null
          confidence?: number | null
          consensus?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          models?: Json | null
          overall_score?: number | null
          passed?: boolean | null
          phase_a_id?: string | null
          recommendation?: string | null
          score_variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "phase_b_verifications_phase_a_id_fkey"
            columns: ["phase_a_id"]
            isOneToOne: false
            referencedRelation: "phase_a_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_ex_executions: {
        Row: {
          changes_applied: Json | null
          completed_at: string | null
          created_at: string | null
          errors: Json | null
          executed_by: string | null
          execution_duration_ms: number | null
          id: string
          phase_a_id: string | null
          phase_b_id: string | null
          rollback_completed: boolean | null
          success: boolean | null
        }
        Insert: {
          changes_applied?: Json | null
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          executed_by?: string | null
          execution_duration_ms?: number | null
          id?: string
          phase_a_id?: string | null
          phase_b_id?: string | null
          rollback_completed?: boolean | null
          success?: boolean | null
        }
        Update: {
          changes_applied?: Json | null
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          executed_by?: string | null
          execution_duration_ms?: number | null
          id?: string
          phase_a_id?: string | null
          phase_b_id?: string | null
          rollback_completed?: boolean | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "phase_ex_executions_phase_a_id_fkey"
            columns: ["phase_a_id"]
            isOneToOne: false
            referencedRelation: "phase_a_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phase_ex_executions_phase_b_id_fkey"
            columns: ["phase_b_id"]
            isOneToOne: false
            referencedRelation: "phase_b_verifications"
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
          estimated_delivery_date: string | null
          fedex_label_url: string | null
          fedex_tracking_number: string | null
          generated_at: string | null
          hac_approved: boolean | null
          hac_approved_at: string | null
          hac_approved_by: string | null
          hac_notes: string | null
          id: string
          manual_review_required: boolean | null
          ocr_birth_cert_confidence: number | null
          ocr_extracted_at: string | null
          ocr_passport_confidence: number | null
          pdf_url: string | null
          poa_type: string
          shipped_at: string | null
          shipping_status: string | null
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
          estimated_delivery_date?: string | null
          fedex_label_url?: string | null
          fedex_tracking_number?: string | null
          generated_at?: string | null
          hac_approved?: boolean | null
          hac_approved_at?: string | null
          hac_approved_by?: string | null
          hac_notes?: string | null
          id?: string
          manual_review_required?: boolean | null
          ocr_birth_cert_confidence?: number | null
          ocr_extracted_at?: string | null
          ocr_passport_confidence?: number | null
          pdf_url?: string | null
          poa_type: string
          shipped_at?: string | null
          shipping_status?: string | null
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
          estimated_delivery_date?: string | null
          fedex_label_url?: string | null
          fedex_tracking_number?: string | null
          generated_at?: string | null
          hac_approved?: boolean | null
          hac_approved_at?: string | null
          hac_approved_by?: string | null
          hac_notes?: string | null
          id?: string
          manual_review_required?: boolean | null
          ocr_birth_cert_confidence?: number | null
          ocr_extracted_at?: string | null
          ocr_passport_confidence?: number | null
          pdf_url?: string | null
          poa_type?: string
          shipped_at?: string | null
          shipping_status?: string | null
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
      project_decisions: {
        Row: {
          alternatives_considered: Json | null
          created_at: string | null
          created_by: string | null
          decision_type: string
          description: string
          id: string
          implementation_details: Json | null
          rationale: string
          related_files: string[] | null
          status: string | null
          superseded_by: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alternatives_considered?: Json | null
          created_at?: string | null
          created_by?: string | null
          decision_type: string
          description: string
          id?: string
          implementation_details?: Json | null
          rationale: string
          related_files?: string[] | null
          status?: string | null
          superseded_by?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alternatives_considered?: Json | null
          created_at?: string | null
          created_by?: string | null
          decision_type?: string
          description?: string
          id?: string
          implementation_details?: Json | null
          rationale?: string
          related_files?: string[] | null
          status?: string | null
          superseded_by?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_decisions_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "project_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_metrics_history: {
        Row: {
          accuracy_score: number | null
          blocker_count: number | null
          case_id: string
          completeness_score: number | null
          confidence_score: number | null
          created_at: string | null
          document_id: string | null
          id: string
          info_count: number | null
          metrics_data: Json | null
          overall_score: number | null
          snapshot_at: string | null
          stage: string | null
          total_checks: number | null
          warning_count: number | null
          workflow_run_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          blocker_count?: number | null
          case_id: string
          completeness_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          info_count?: number | null
          metrics_data?: Json | null
          overall_score?: number | null
          snapshot_at?: string | null
          stage?: string | null
          total_checks?: number | null
          warning_count?: number | null
          workflow_run_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          blocker_count?: number | null
          case_id?: string
          completeness_score?: number | null
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          info_count?: number | null
          metrics_data?: Json | null
          overall_score?: number | null
          snapshot_at?: string | null
          stage?: string | null
          total_checks?: number | null
          warning_count?: number | null
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_metrics_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_metrics_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_metrics_history_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
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
      sworn_translators: {
        Row: {
          certification_number: string | null
          created_at: string | null
          email: string
          full_name: string
          hourly_rate_pln: number | null
          id: string
          is_active: boolean | null
          languages: Json | null
          notes: string | null
          phone: string | null
          rating: number | null
          total_jobs_completed: number | null
          updated_at: string | null
        }
        Insert: {
          certification_number?: string | null
          created_at?: string | null
          email: string
          full_name: string
          hourly_rate_pln?: number | null
          id?: string
          is_active?: boolean | null
          languages?: Json | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
        }
        Update: {
          certification_number?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          hourly_rate_pln?: number | null
          id?: string
          is_active?: boolean | null
          languages?: Json | null
          notes?: string | null
          phone?: string | null
          rating?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
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
      translation_agencies: {
        Row: {
          contact_person: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          languages: Json | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          total_jobs_completed: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          contact_person?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          languages?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          contact_person?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          languages?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      translation_requests: {
        Row: {
          actual_cost_pln: number | null
          assigned_at: string | null
          assigned_translator_id: string | null
          case_id: string
          certified_translation_document_id: string | null
          client_visible: boolean | null
          completed_at: string | null
          created_at: string | null
          deadline: string | null
          document_id: string
          estimated_cost_pln: number | null
          estimated_days: number | null
          id: string
          internal_notes: string | null
          priority: string | null
          source_language: string
          stage_entered_at: string | null
          stage_history: Json | null
          started_at: string | null
          status: string | null
          target_language: string
          updated_at: string | null
          word_count: number | null
          workflow_stage: string | null
        }
        Insert: {
          actual_cost_pln?: number | null
          assigned_at?: string | null
          assigned_translator_id?: string | null
          case_id: string
          certified_translation_document_id?: string | null
          client_visible?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          document_id: string
          estimated_cost_pln?: number | null
          estimated_days?: number | null
          id?: string
          internal_notes?: string | null
          priority?: string | null
          source_language: string
          stage_entered_at?: string | null
          stage_history?: Json | null
          started_at?: string | null
          status?: string | null
          target_language?: string
          updated_at?: string | null
          word_count?: number | null
          workflow_stage?: string | null
        }
        Update: {
          actual_cost_pln?: number | null
          assigned_at?: string | null
          assigned_translator_id?: string | null
          case_id?: string
          certified_translation_document_id?: string | null
          client_visible?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          deadline?: string | null
          document_id?: string
          estimated_cost_pln?: number | null
          estimated_days?: number | null
          id?: string
          internal_notes?: string | null
          priority?: string | null
          source_language?: string
          stage_entered_at?: string | null
          stage_history?: Json | null
          started_at?: string | null
          status?: string | null
          target_language?: string
          updated_at?: string | null
          word_count?: number | null
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "translation_requests_assigned_translator_id_fkey"
            columns: ["assigned_translator_id"]
            isOneToOne: false
            referencedRelation: "sworn_translators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_requests_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_requests_certified_translation_document_id_fkey"
            columns: ["certified_translation_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "translation_requests_document_id_fkey"
            columns: ["document_id"]
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
          stage_entered_at: string | null
          stage_history: Json | null
          status: string
          updated_at: string
          workflow_stage: string | null
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
          stage_entered_at?: string | null
          stage_history?: Json | null
          status?: string
          updated_at?: string
          workflow_stage?: string | null
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
          stage_entered_at?: string | null
          stage_history?: Json | null
          status?: string
          updated_at?: string
          workflow_stage?: string | null
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
      verification_alerts: {
        Row: {
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          description: string
          details: Json | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          verification_run_id: string | null
        }
        Insert: {
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          description: string
          details?: Json | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          title: string
          verification_run_id?: string | null
        }
        Update: {
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          description?: string
          details?: Json | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          verification_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_alerts_verification_run_id_fkey"
            columns: ["verification_run_id"]
            isOneToOne: false
            referencedRelation: "verification_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_phase_results: {
        Row: {
          case_id: string | null
          created_at: string | null
          created_by: string | null
          focus_areas: string[] | null
          id: string
          models_used: string[] | null
          phase_a_completed: boolean | null
          phase_a_completed_at: string | null
          phase_a_files_analyzed: Json | null
          phase_a_issues: Json | null
          phase_b_all_models_100: boolean | null
          phase_b_completed: boolean | null
          phase_b_completed_at: string | null
          phase_b_response: Json | null
          phase_b_score: number | null
          phase_ex_authorized: boolean | null
          phase_ex_authorized_at: string | null
          phase_ex_completed: boolean | null
          phase_ex_completed_at: string | null
          updated_at: string | null
          verification_run_id: string | null
          workflow_type: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string | null
          created_by?: string | null
          focus_areas?: string[] | null
          id?: string
          models_used?: string[] | null
          phase_a_completed?: boolean | null
          phase_a_completed_at?: string | null
          phase_a_files_analyzed?: Json | null
          phase_a_issues?: Json | null
          phase_b_all_models_100?: boolean | null
          phase_b_completed?: boolean | null
          phase_b_completed_at?: string | null
          phase_b_response?: Json | null
          phase_b_score?: number | null
          phase_ex_authorized?: boolean | null
          phase_ex_authorized_at?: string | null
          phase_ex_completed?: boolean | null
          phase_ex_completed_at?: string | null
          updated_at?: string | null
          verification_run_id?: string | null
          workflow_type: string
        }
        Update: {
          case_id?: string | null
          created_at?: string | null
          created_by?: string | null
          focus_areas?: string[] | null
          id?: string
          models_used?: string[] | null
          phase_a_completed?: boolean | null
          phase_a_completed_at?: string | null
          phase_a_files_analyzed?: Json | null
          phase_a_issues?: Json | null
          phase_b_all_models_100?: boolean | null
          phase_b_completed?: boolean | null
          phase_b_completed_at?: string | null
          phase_b_response?: Json | null
          phase_b_score?: number | null
          phase_ex_authorized?: boolean | null
          phase_ex_authorized_at?: string | null
          phase_ex_completed?: boolean | null
          phase_ex_completed_at?: string | null
          updated_at?: string | null
          verification_run_id?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_phase_results_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_runs: {
        Row: {
          action_items: Json | null
          author: string | null
          average_score: number | null
          branch: string | null
          changed_files: string[] | null
          claude_result: Json | null
          claude_score: number | null
          claude_status: string | null
          commit_message: string | null
          commit_sha: string | null
          completed_at: string | null
          consensus_level: string | null
          created_at: string
          critical_findings: Json | null
          duration_ms: number | null
          error_details: Json | null
          error_message: string | null
          files_analyzed: number | null
          gemini_result: Json | null
          gemini_score: number | null
          gemini_status: string | null
          gpt5_result: Json | null
          gpt5_score: number | null
          gpt5_status: string | null
          id: string
          started_at: string | null
          status: string
          successful_models: number | null
          total_blockers: number | null
          total_models: number | null
          trigger_metadata: Json | null
          trigger_type: string
          updated_at: string
          verification_scope: string
        }
        Insert: {
          action_items?: Json | null
          author?: string | null
          average_score?: number | null
          branch?: string | null
          changed_files?: string[] | null
          claude_result?: Json | null
          claude_score?: number | null
          claude_status?: string | null
          commit_message?: string | null
          commit_sha?: string | null
          completed_at?: string | null
          consensus_level?: string | null
          created_at?: string
          critical_findings?: Json | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          files_analyzed?: number | null
          gemini_result?: Json | null
          gemini_score?: number | null
          gemini_status?: string | null
          gpt5_result?: Json | null
          gpt5_score?: number | null
          gpt5_status?: string | null
          id?: string
          started_at?: string | null
          status?: string
          successful_models?: number | null
          total_blockers?: number | null
          total_models?: number | null
          trigger_metadata?: Json | null
          trigger_type: string
          updated_at?: string
          verification_scope: string
        }
        Update: {
          action_items?: Json | null
          author?: string | null
          average_score?: number | null
          branch?: string | null
          changed_files?: string[] | null
          claude_result?: Json | null
          claude_score?: number | null
          claude_status?: string | null
          commit_message?: string | null
          commit_sha?: string | null
          completed_at?: string | null
          consensus_level?: string | null
          created_at?: string
          critical_findings?: Json | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          files_analyzed?: number | null
          gemini_result?: Json | null
          gemini_score?: number | null
          gemini_status?: string | null
          gpt5_result?: Json | null
          gpt5_score?: number | null
          gpt5_status?: string | null
          id?: string
          started_at?: string | null
          status?: string
          successful_models?: number | null
          total_blockers?: number | null
          total_models?: number | null
          trigger_metadata?: Json | null
          trigger_type?: string
          updated_at?: string
          verification_scope?: string
        }
        Relationships: []
      }
      verification_trends: {
        Row: {
          change_percent: number | null
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          previous_value: number | null
          trend: string | null
          verification_run_id: string | null
          verification_scope: string
        }
        Insert: {
          change_percent?: number | null
          created_at?: string
          id?: string
          metric_name: string
          metric_value: number
          previous_value?: number | null
          trend?: string | null
          verification_run_id?: string | null
          verification_scope: string
        }
        Update: {
          change_percent?: number | null
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          previous_value?: number | null
          trend?: string | null
          verification_run_id?: string | null
          verification_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_trends_verification_run_id_fkey"
            columns: ["verification_run_id"]
            isOneToOne: false
            referencedRelation: "verification_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_card_descriptions: {
        Row: {
          card_id: string
          created_at: string
          description: string
          id: string
          updated_at: string
          workflow_name: string
        }
        Insert: {
          card_id: string
          created_at?: string
          description: string
          id?: string
          updated_at?: string
          workflow_name: string
        }
        Update: {
          card_id?: string
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
          workflow_name?: string
        }
        Relationships: []
      }
      workflow_checkpoints: {
        Row: {
          case_id: string
          checkpoint_label: string
          created_at: string
          current_stage: string
          id: string
          retry_count: number
          selected_document_ids: string[]
          status: string
          steps: Json
          workflow_run_id: string | null
        }
        Insert: {
          case_id: string
          checkpoint_label: string
          created_at?: string
          current_stage: string
          id?: string
          retry_count?: number
          selected_document_ids?: string[]
          status: string
          steps?: Json
          workflow_run_id?: string | null
        }
        Update: {
          case_id?: string
          checkpoint_label?: string
          created_at?: string
          current_stage?: string
          id?: string
          retry_count?: number
          selected_document_ids?: string[]
          status?: string
          steps?: Json
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_checkpoints_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_definitions: {
        Row: {
          assignment_rules: Json | null
          auto_assign: boolean | null
          created_at: string | null
          default_sla_days: number | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          stages: Json
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          assignment_rules?: Json | null
          auto_assign?: boolean | null
          created_at?: string | null
          default_sla_days?: number | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          stages?: Json
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          assignment_rules?: Json | null
          auto_assign?: boolean | null
          created_at?: string | null
          default_sla_days?: number | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          stages?: Json
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_errors: {
        Row: {
          created_at: string
          document_id: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          retry_count: number | null
          stage: string
          workflow_run_id: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number | null
          stage: string
          workflow_run_id?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          retry_count?: number | null
          stage?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_errors_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_errors_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_instances: {
        Row: {
          approved_by_user_id: string | null
          approved_for_generation_at: string | null
          assigned_at: string | null
          assigned_to: string | null
          case_id: string
          completed_at: string | null
          created_at: string | null
          current_stage: string
          deadline: string | null
          id: string
          metadata: Json | null
          pdf_generation_status: string | null
          priority: string | null
          sla_violated: boolean | null
          source_id: string
          source_table: string
          started_at: string | null
          status: Database["public"]["Enums"]["workflow_status"] | null
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          approved_by_user_id?: string | null
          approved_for_generation_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          case_id: string
          completed_at?: string | null
          created_at?: string | null
          current_stage: string
          deadline?: string | null
          id?: string
          metadata?: Json | null
          pdf_generation_status?: string | null
          priority?: string | null
          sla_violated?: boolean | null
          source_id: string
          source_table: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          approved_by_user_id?: string | null
          approved_for_generation_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          case_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_stage?: string
          deadline?: string | null
          id?: string
          metadata?: Json | null
          pdf_generation_status?: string | null
          priority?: string | null
          sla_violated?: boolean | null
          source_id?: string
          source_table?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["workflow_status"] | null
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_instances_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_instances_workflow_type_fkey"
            columns: ["workflow_type"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["workflow_type"]
          },
        ]
      }
      workflow_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          recipient_email: string | null
          recipient_user_id: string | null
          sent_at: string | null
          sent_via_email: boolean | null
          sent_via_in_app: boolean | null
          sent_via_sms: boolean | null
          severity: string
          title: string
          workflow_instance_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_user_id?: string | null
          sent_at?: string | null
          sent_via_email?: boolean | null
          sent_via_in_app?: boolean | null
          sent_via_sms?: boolean | null
          severity: string
          title: string
          workflow_instance_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_user_id?: string | null
          sent_at?: string | null
          sent_via_email?: boolean | null
          sent_via_in_app?: boolean | null
          sent_via_sms?: boolean | null
          severity?: string
          title?: string
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_notifications_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_persistence: {
        Row: {
          case_id: string
          created_at: string
          current_stage: string
          has_consent: boolean
          id: string
          last_error: string | null
          retry_count: number
          selected_document_ids: string[]
          status: string
          steps: Json
          updated_at: string
          workflow_run_id: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          current_stage: string
          has_consent?: boolean
          id?: string
          last_error?: string | null
          retry_count?: number
          selected_document_ids?: string[]
          status: string
          steps?: Json
          updated_at?: string
          workflow_run_id?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          current_stage?: string
          has_consent?: boolean
          id?: string
          last_error?: string | null
          retry_count?: number
          selected_document_ids?: string[]
          status?: string
          steps?: Json
          updated_at?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_persistence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_preflight_logs: {
        Row: {
          blocked_transition: boolean | null
          case_id: string
          check_name: string
          check_passed: boolean
          check_type: string
          checked_at: string | null
          created_at: string | null
          details: Json | null
          document_id: string | null
          id: string
          message: string | null
          severity: string
          stage: string
          workflow_run_id: string
        }
        Insert: {
          blocked_transition?: boolean | null
          case_id: string
          check_name: string
          check_passed: boolean
          check_type: string
          checked_at?: string | null
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          message?: string | null
          severity: string
          stage: string
          workflow_run_id: string
        }
        Update: {
          blocked_transition?: boolean | null
          case_id?: string
          check_name?: string
          check_passed?: boolean
          check_type?: string
          checked_at?: string | null
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          message?: string | null
          severity?: string
          stage?: string
          workflow_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_preflight_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_preflight_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_preflight_logs_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_reviews: {
        Row: {
          created_at: string
          duration_seconds: number | null
          files_count: number | null
          id: string
          metadata: Json | null
          overall_score: number | null
          results: Json
          status: string
          total_blockers: number | null
          triggered_by: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          files_count?: number | null
          id?: string
          metadata?: Json | null
          overall_score?: number | null
          results: Json
          status?: string
          total_blockers?: number | null
          triggered_by: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          files_count?: number | null
          id?: string
          metadata?: Json | null
          overall_score?: number | null
          results?: Json
          status?: string
          total_blockers?: number | null
          triggered_by?: string
        }
        Relationships: []
      }
      workflow_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          metadata: Json | null
          priority: number | null
          rule_description: string
          rule_name: string
          success_count: number | null
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          metadata?: Json | null
          priority?: number | null
          rule_description: string
          rule_name: string
          success_count?: number | null
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          metadata?: Json | null
          priority?: number | null
          rule_description?: string
          rule_name?: string
          success_count?: number | null
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          case_id: string
          completed_at: string | null
          completed_steps: number
          created_at: string
          current_stage: string
          document_ids: string[]
          id: string
          last_error: string | null
          max_retries: number
          paused_at: string | null
          processed_documents: Json
          progress_percentage: number
          retry_count: number
          started_at: string | null
          status: string
          steps: Json
          total_steps: number
          updated_at: string
          workflow_type: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          completed_steps?: number
          created_at?: string
          current_stage: string
          document_ids?: string[]
          id?: string
          last_error?: string | null
          max_retries?: number
          paused_at?: string | null
          processed_documents?: Json
          progress_percentage?: number
          retry_count?: number
          started_at?: string | null
          status: string
          steps?: Json
          total_steps?: number
          updated_at?: string
          workflow_type?: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          completed_steps?: number
          created_at?: string
          current_stage?: string
          document_ids?: string[]
          id?: string
          last_error?: string | null
          max_retries?: number
          paused_at?: string | null
          processed_documents?: Json
          progress_percentage?: number
          retry_count?: number
          started_at?: string | null
          status?: string
          steps?: Json
          total_steps?: number
          updated_at?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_sla_rules: {
        Row: {
          created_at: string | null
          escalate_to_role: string | null
          id: string
          is_active: boolean | null
          max_duration_hours: number
          send_notification: boolean | null
          stage: string
          updated_at: string | null
          warning_threshold_hours: number | null
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          escalate_to_role?: string | null
          id?: string
          is_active?: boolean | null
          max_duration_hours: number
          send_notification?: boolean | null
          stage: string
          updated_at?: string | null
          warning_threshold_hours?: number | null
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          escalate_to_role?: string | null
          id?: string
          is_active?: boolean | null
          max_duration_hours?: number
          send_notification?: boolean | null
          stage?: string
          updated_at?: string | null
          warning_threshold_hours?: number | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_sla_rules_workflow_type_fkey"
            columns: ["workflow_type"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["workflow_type"]
          },
        ]
      }
      workflow_sla_violations: {
        Row: {
          actual_completion: string | null
          created_at: string | null
          delay_hours: number | null
          escalated: boolean | null
          escalated_at: string | null
          escalated_to: string | null
          expected_completion: string | null
          id: string
          metadata: Json | null
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          stage: string | null
          violation_type: string
          workflow_instance_id: string
        }
        Insert: {
          actual_completion?: string | null
          created_at?: string | null
          delay_hours?: number | null
          escalated?: boolean | null
          escalated_at?: string | null
          escalated_to?: string | null
          expected_completion?: string | null
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          stage?: string | null
          violation_type: string
          workflow_instance_id: string
        }
        Update: {
          actual_completion?: string | null
          created_at?: string | null
          delay_hours?: number | null
          escalated?: boolean | null
          escalated_at?: string | null
          escalated_to?: string | null
          expected_completion?: string | null
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          stage?: string | null
          violation_type?: string
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_sla_violations_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_stage_transitions: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          from_stage: string | null
          id: string
          metadata: Json | null
          to_stage: string
          transition_reason: string | null
          transitioned_by: string | null
          workflow_instance_id: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          from_stage?: string | null
          id?: string
          metadata?: Json | null
          to_stage: string
          transition_reason?: string | null
          transitioned_by?: string | null
          workflow_instance_id: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          from_stage?: string | null
          id?: string
          metadata?: Json | null
          to_stage?: string
          transition_reason?: string | null
          transitioned_by?: string | null
          workflow_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_stage_transitions_workflow_instance_id_fkey"
            columns: ["workflow_instance_id"]
            isOneToOne: false
            referencedRelation: "workflow_instances"
            referencedColumns: ["id"]
          },
        ]
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
      acquire_document_lock_v7: {
        Args: {
          p_document_id: string
          p_lock_timeout?: number
          p_worker_id: string
        }
        Returns: Json
      }
      atomic_create_document_workflow: {
        Args: {
          p_case_id: string
          p_document_id: string
          p_initial_version: number
        }
        Returns: Json
      }
      calculate_verification_trend: {
        Args: {
          p_current_value: number
          p_metric_name: string
          p_scope: string
          p_verification_run_id: string
        }
        Returns: undefined
      }
      check_ai_consent: { Args: { p_case_id: string }; Returns: boolean }
      check_rls_status: {
        Args: never
        Returns: {
          policy_count: number
          rls_enabled: boolean
          table_name: string
        }[]
      }
      check_workflow_sla_violations: {
        Args: never
        Returns: {
          delay_hours: number
          violation_type: string
          workflow_id: string
        }[]
      }
      check_workflow_sla_warnings: {
        Args: never
        Returns: {
          hours_remaining: number
          workflow_id: string
        }[]
      }
      cleanup_expired_agent_memory: { Args: never; Returns: undefined }
      cleanup_expired_crash_states: { Args: never; Returns: undefined }
      cleanup_expired_locks_v7: {
        Args: { p_timeout_seconds?: number }
        Returns: {
          case_id: string
          document_id: string
          lock_age_seconds: number
          locked_at: string
          locked_by: string
        }[]
      }
      cleanup_old_health_data: { Args: never; Returns: undefined }
      cleanup_old_pdf_queue_jobs: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      cleanup_rate_limit_logs: { Args: never; Returns: undefined }
      clear_pending_documents: { Args: { p_case_id: string }; Returns: Json }
      create_batch_upload: {
        Args: { p_batch_id: string; p_case_id: string; p_total_files: number }
        Returns: Json
      }
      create_verification_alert: {
        Args: {
          p_alert_type: string
          p_description: string
          p_details?: Json
          p_severity: string
          p_title: string
          p_verification_run_id: string
        }
        Returns: string
      }
      get_agent_activity_summary: {
        Args: never
        Returns: {
          agent_type: string
          response_time_ms: number
          success: boolean
        }[]
      }
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
      get_cleanup_stats: {
        Args: { days_back?: number }
        Returns: {
          avg_duration_ms: number
          last_cleanup: string
          total_bytes_freed: number
          total_cleanups: number
          total_files_deleted: number
        }[]
      }
      get_high_token_usage_cases: {
        Args: { since_timestamp: string; token_threshold: number }
        Returns: {
          case_id: string
          total_tokens: number
        }[]
      }
      get_latest_verification_for_case: {
        Args: { p_case_id: string }
        Returns: {
          case_id: string | null
          created_at: string | null
          created_by: string | null
          focus_areas: string[] | null
          id: string
          models_used: string[] | null
          phase_a_completed: boolean | null
          phase_a_completed_at: string | null
          phase_a_files_analyzed: Json | null
          phase_a_issues: Json | null
          phase_b_all_models_100: boolean | null
          phase_b_completed: boolean | null
          phase_b_completed_at: string | null
          phase_b_response: Json | null
          phase_b_score: number | null
          phase_ex_authorized: boolean | null
          phase_ex_authorized_at: string | null
          phase_ex_completed: boolean | null
          phase_ex_completed_at: string | null
          updated_at: string | null
          verification_run_id: string | null
          workflow_type: string
        }
        SetofOptions: {
          from: "*"
          to: "verification_phase_results"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_next_case_sequence: {
        Args: { sequence_name: string }
        Returns: number
      }
      get_pending_document_count: {
        Args: { p_case_id: string }
        Returns: number
      }
      get_project_memory: {
        Args: never
        Returns: {
          agent_type: string
          created_at: string
          id: string
          memory_key: string
          memory_value: Json
          updated_at: string
        }[]
      }
      get_verification_history: {
        Args: { p_limit?: number; p_workflow_type?: string }
        Returns: {
          case_id: string
          case_name: string
          created_at: string
          id: string
          phase_a_completed: boolean
          phase_b_all_models_100: boolean
          phase_b_completed: boolean
          phase_b_score: number
          phase_ex_authorized: boolean
          workflow_type: string
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
      log_workflow_error: {
        Args: {
          p_document_id: string
          p_error_details?: Json
          p_error_message: string
          p_stage: string
          p_workflow_run_id: string
        }
        Returns: string
      }
      mark_workflow_for_retry: {
        Args: {
          p_error_message: string
          p_error_phase: string
          p_retry_delay_minutes?: number
          p_workflow_instance_id: string
        }
        Returns: Json
      }
      record_security_metric: {
        Args: {
          p_metadata?: Json
          p_metric_type: string
          p_metric_value: number
        }
        Returns: string
      }
      release_document_lock_v7: {
        Args: { p_document_id: string }
        Returns: Json
      }
      reset_stuck_pdf_jobs: { Args: never; Returns: undefined }
      safe_document_reupload: {
        Args: {
          p_case_id: string
          p_document_name: string
          p_file_extension: string
          p_new_dropbox_path: string
        }
        Returns: string
      }
      send_workflow_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_notification_type: string
          p_recipient_user_id: string
          p_severity: string
          p_title: string
          p_workflow_instance_id: string
        }
        Returns: string
      }
      transition_workflow_stage: {
        Args: {
          p_reason?: string
          p_to_stage: string
          p_transitioned_by?: string
          p_workflow_instance_id: string
        }
        Returns: Json
      }
      update_batch_upload_progress: {
        Args: {
          p_batch_id: string
          p_document_id: string
          p_error_message?: string
          p_success: boolean
        }
        Returns: Json
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
      pdf_status:
        | "generated"
        | "edited"
        | "printed"
        | "signed"
        | "sent"
        | "received"
        | "archived"
        | "locked_for_print"
        | "downloaded"
      processing_mode: "standard" | "expedited" | "vip" | "vip_plus"
      workflow_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "review"
        | "approved"
        | "completed"
        | "blocked"
        | "cancelled"
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
      pdf_status: [
        "generated",
        "edited",
        "printed",
        "signed",
        "sent",
        "received",
        "archived",
        "locked_for_print",
        "downloaded",
      ],
      processing_mode: ["standard", "expedited", "vip", "vip_plus"],
      workflow_status: [
        "pending",
        "assigned",
        "in_progress",
        "review",
        "approved",
        "completed",
        "blocked",
        "cancelled",
      ],
    },
  },
} as const
