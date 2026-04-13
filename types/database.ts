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
  public: {
    Tables: {
      aar_responses: {
        Row: {
          created_at: string
          filled_by: string
          id: string
          project_id: string
          responses: Json
        }
        Insert: {
          created_at?: string
          filled_by: string
          id?: string
          project_id: string
          responses: Json
        }
        Update: {
          created_at?: string
          filled_by?: string
          id?: string
          project_id?: string
          responses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "aar_responses_filled_by_fkey"
            columns: ["filled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aar_responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_evaluation_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "aar_responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_global: boolean
          key_hash: string
          key_preview: string
          label: string
          last_used_at: string | null
          owner_id: string
          provider: Database["public"]["Enums"]["api_provider"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_global?: boolean
          key_hash: string
          key_preview: string
          label: string
          last_used_at?: string | null
          owner_id: string
          provider: Database["public"]["Enums"]["api_provider"]
        }
        Update: {
          created_at?: string
          id?: string
          is_global?: boolean
          key_hash?: string
          key_preview?: string
          label?: string
          last_used_at?: string | null
          owner_id?: string
          provider?: Database["public"]["Enums"]["api_provider"]
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          created_at: string
          decision: Database["public"]["Enums"]["decision_type"]
          id: string
          made_by: string
          project_id: string
          rationale: string
          real_option_data: Json | null
        }
        Insert: {
          created_at?: string
          decision: Database["public"]["Enums"]["decision_type"]
          id?: string
          made_by: string
          project_id: string
          rationale: string
          real_option_data?: Json | null
        }
        Update: {
          created_at?: string
          decision?: Database["public"]["Enums"]["decision_type"]
          id?: string
          made_by?: string
          project_id?: string
          rationale?: string
          real_option_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_made_by_fkey"
            columns: ["made_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_evaluation_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "decisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_criteria: {
        Row: {
          ahp_matrix: Json | null
          created_at: string
          description: string | null
          id: string
          label: string
          order_index: number
          project_id: string | null
          weight: number
          weight_method: Database["public"]["Enums"]["weight_method"]
        }
        Insert: {
          ahp_matrix?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          label: string
          order_index?: number
          project_id?: string | null
          weight: number
          weight_method?: Database["public"]["Enums"]["weight_method"]
        }
        Update: {
          ahp_matrix?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          order_index?: number
          project_id?: string | null
          weight?: number
          weight_method?: Database["public"]["Enums"]["weight_method"]
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_criteria_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_evaluation_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "evaluation_criteria_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          commentary: string
          evaluateur_id: string
          id: string
          project_id: string
          red_team: Json | null
          scores: Json
          submitted_at: string
        }
        Insert: {
          commentary: string
          evaluateur_id: string
          id?: string
          project_id: string
          red_team?: Json | null
          scores?: Json
          submitted_at?: string
        }
        Update: {
          commentary?: string
          evaluateur_id?: string
          id?: string
          project_id?: string
          red_team?: Json | null
          scores?: Json
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluateur_id_fkey"
            columns: ["evaluateur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_evaluation_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "evaluations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          channel: Database["public"]["Enums"]["notif_channel"]
          id: string
          payload: Json | null
          recipient_id: string | null
          sent_at: string
          status: Database["public"]["Enums"]["notif_status"]
          type: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notif_channel"]
          id?: string
          payload?: Json | null
          recipient_id?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["notif_status"]
          type: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notif_channel"]
          id?: string
          payload?: Json | null
          recipient_id?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["notif_status"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_theses: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          horizon: Database["public"]["Enums"]["project_horizon"] | null
          id: string
          status: Database["public"]["Enums"]["thesis_status"]
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          horizon?: Database["public"]["Enums"]["project_horizon"] | null
          id?: string
          status?: Database["public"]["Enums"]["thesis_status"]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          horizon?: Database["public"]["Enums"]["project_horizon"] | null
          id?: string
          status?: Database["public"]["Enums"]["thesis_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_theses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          notification_prefs: Json
          onboarding_step: number
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          notification_prefs?: Json
          onboarding_step?: number
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          notification_prefs?: Json
          onboarding_step?: number
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_evaluation_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          actual_date: string | null
          created_at: string
          id: string
          label: string
          notes: string | null
          project_id: string
          status: Database["public"]["Enums"]["milestone_status"]
          target_date: string
          value_delta: number | null
        }
        Insert: {
          actual_date?: string | null
          created_at?: string
          id?: string
          label: string
          notes?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
          target_date: string
          value_delta?: number | null
        }
        Update: {
          actual_date?: string | null
          created_at?: string
          id?: string
          label?: string
          notes?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          target_date?: string
          value_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_evaluation_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_premortems: {
        Row: {
          aggregation: Json | null
          closed_at: string | null
          created_at: string
          id: string
          project_id: string
          responses: Json
        }
        Insert: {
          aggregation?: Json | null
          closed_at?: string | null
          created_at?: string
          id?: string
          project_id: string
          responses?: Json
        }
        Update: {
          aggregation?: Json | null
          closed_at?: string | null
          created_at?: string
          id?: string
          project_id?: string
          responses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "project_premortems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_evaluation_stats"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_premortems_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          barbell_category: Database["public"]["Enums"]["barbell_cat"] | null
          created_at: string
          decided_at: string | null
          decision_notes: string | null
          description: string | null
          evaluation_deadline: string | null
          governance_speed:
            | Database["public"]["Enums"]["governance_speed"]
            | null
          horizon: Database["public"]["Enums"]["project_horizon"] | null
          id: string
          investment_thesis: Json | null
          is_demo: boolean
          market_research: Json | null
          moic_target: number | null
          outcomes: Json | null
          proposant_id: string
          quorum_required: number
          quorum_type: Database["public"]["Enums"]["quorum_type"]
          repo_url: string | null
          scenarios: Json | null
          sector: string | null
          status: Database["public"]["Enums"]["project_status"]
          tags: string[] | null
          thesis_ids: string[] | null
          title: string
        }
        Insert: {
          barbell_category?: Database["public"]["Enums"]["barbell_cat"] | null
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          description?: string | null
          evaluation_deadline?: string | null
          governance_speed?:
            | Database["public"]["Enums"]["governance_speed"]
            | null
          horizon?: Database["public"]["Enums"]["project_horizon"] | null
          id?: string
          investment_thesis?: Json | null
          is_demo?: boolean
          market_research?: Json | null
          moic_target?: number | null
          outcomes?: Json | null
          proposant_id: string
          quorum_required?: number
          quorum_type?: Database["public"]["Enums"]["quorum_type"]
          repo_url?: string | null
          scenarios?: Json | null
          sector?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          thesis_ids?: string[] | null
          title: string
        }
        Update: {
          barbell_category?: Database["public"]["Enums"]["barbell_cat"] | null
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          description?: string | null
          evaluation_deadline?: string | null
          governance_speed?:
            | Database["public"]["Enums"]["governance_speed"]
            | null
          horizon?: Database["public"]["Enums"]["project_horizon"] | null
          id?: string
          investment_thesis?: Json | null
          is_demo?: boolean
          market_research?: Json | null
          moic_target?: number | null
          outcomes?: Json | null
          proposant_id?: string
          quorum_required?: number
          quorum_type?: Database["public"]["Enums"]["quorum_type"]
          repo_url?: string | null
          scenarios?: Json | null
          sector?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tags?: string[] | null
          thesis_ids?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_proposant_id_fkey"
            columns: ["proposant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_evaluation_stats: {
        Row: {
          avg_score: number | null
          evaluation_count: number | null
          project_id: string | null
          quorum_reached: boolean | null
          quorum_required: number | null
          quorum_type: Database["public"]["Enums"]["quorum_type"] | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      current_user_status: {
        Args: never
        Returns: Database["public"]["Enums"]["user_status"]
      }
    }
    Enums: {
      api_provider: "openai" | "anthropic" | "perplexity" | "other"
      barbell_cat: "core" | "growth" | "moonshot"
      decision_type: "approved" | "rejected" | "deferred"
      governance_speed: "V1" | "V2"
      milestone_status: "pending" | "achieved" | "missed"
      notif_channel: "email" | "whatsapp"
      notif_status: "sent" | "failed" | "pending"
      project_horizon: "H1" | "H2" | "H3"
      project_status:
        | "draft"
        | "pre-mortem"
        | "open"
        | "closed"
        | "decided"
        | "archived"
      quorum_type: "absolute" | "percentage"
      thesis_status: "active" | "archived"
      user_role: "admin" | "evaluateur" | "contributeur"
      user_status: "active" | "suspended"
      weight_method: "manual" | "ahp"
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
      api_provider: ["openai", "anthropic", "perplexity", "other"],
      barbell_cat: ["core", "growth", "moonshot"],
      decision_type: ["approved", "rejected", "deferred"],
      governance_speed: ["V1", "V2"],
      milestone_status: ["pending", "achieved", "missed"],
      notif_channel: ["email", "whatsapp"],
      notif_status: ["sent", "failed", "pending"],
      project_horizon: ["H1", "H2", "H3"],
      project_status: [
        "draft",
        "pre-mortem",
        "open",
        "closed",
        "decided",
        "archived",
      ],
      quorum_type: ["absolute", "percentage"],
      thesis_status: ["active", "archived"],
      user_role: ["admin", "evaluateur", "contributeur"],
      user_status: ["active", "suspended"],
      weight_method: ["manual", "ahp"],
    },
  },
} as const
