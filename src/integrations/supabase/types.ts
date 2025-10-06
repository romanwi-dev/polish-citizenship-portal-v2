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
          dropbox_folder_id: string | null
          dropbox_path: string
          generation: Database["public"]["Enums"]["case_generation"] | null
          id: string
          is_vip: boolean | null
          last_synced_at: string | null
          metadata: Json | null
          notes: string | null
          progress: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          ancestry?: Json | null
          client_code?: string | null
          client_name: string
          country?: string | null
          created_at?: string
          dropbox_folder_id?: string | null
          dropbox_path: string
          generation?: Database["public"]["Enums"]["case_generation"] | null
          id?: string
          is_vip?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          notes?: string | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          ancestry?: Json | null
          client_code?: string | null
          client_name?: string
          country?: string | null
          created_at?: string
          dropbox_folder_id?: string | null
          dropbox_path?: string
          generation?: Database["public"]["Enums"]["case_generation"] | null
          id?: string
          is_vip?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          notes?: string | null
          progress?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: []
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
          metadata: Json | null
          name: string
          translation_required: boolean | null
          type: string | null
          updated_at: string
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
          metadata?: Json | null
          name: string
          translation_required?: boolean | null
          type?: string | null
          updated_at?: string
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
          metadata?: Json | null
          name?: string
          translation_required?: boolean | null
          type?: string | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
