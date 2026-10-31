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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      avatar_forge_blocks: {
        Row: {
          blocked_at: string
          generation_id: string | null
          prompt: string | null
          reason: string
          status_code: number
          user_id: string
        }
        Insert: {
          blocked_at?: string
          generation_id?: string | null
          prompt?: string | null
          reason: string
          status_code: number
          user_id: string
        }
        Update: {
          blocked_at?: string
          generation_id?: string | null
          prompt?: string | null
          reason?: string
          status_code?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatar_forge_blocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_events: {
        Row: {
          action: string
          id: string
          points: number
          source_key: string
          user_id: string
          verified_at: string
        }
        Insert: {
          action: string
          id?: string
          points: number
          source_key: string
          user_id: string
          verified_at?: string
        }
        Update: {
          action?: string
          id?: string
          points?: number
          source_key?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      overchat_messages: {
        Row: {
          body: string
          created_at: string
          display_name: string
          id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          display_name: string
          id?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          display_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      participant_avatars: {
        Row: {
          prompt: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          prompt: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          prompt?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_avatars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_rewards: {
        Row: {
          bracket_stage: number
          bracket_wins: number
          points: number
          rank_key: string
          rank_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bracket_stage?: number
          bracket_wins?: number
          points?: number
          rank_key?: string
          rank_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bracket_stage?: number
          bracket_wins?: number
          points?: number
          rank_key?: string
          rank_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_key: string
          avatar_key: string
          created_at: string
          display_name: string
          font_key: string
          id: string
          leaderboard_visible: boolean
          participant_type: string
        }
        Insert: {
          accent_key?: string
          avatar_key?: string
          created_at?: string
          display_name?: string
          font_key?: string
          id: string
          leaderboard_visible?: boolean
          participant_type?: string
        }
        Update: {
          accent_key?: string
          avatar_key?: string
          created_at?: string
          display_name?: string
          font_key?: string
          id?: string
          leaderboard_visible?: boolean
          participant_type?: string
        }
        Relationships: []
      }
      registration_control: {
        Row: {
          id: boolean
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      registration_control_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      schedule_helper_ai_state: {
        Row: {
          id: string
          message: string
          status: number
          updated_at: string
        }
        Insert: {
          id: string
          message: string
          status: number
          updated_at?: string
        }
        Update: {
          id?: string
          message?: string
          status?: number
          updated_at?: string
        }
        Relationships: []
      }
      title_votes: {
        Row: {
          created_at: string
          id: string
          season: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          season: string
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          season?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_registrations: {
        Row: {
          callsign: string
          created_at: string
          id: string
          lane: number
          payment_status: string
          pricing_option: string
          quoted_fee_cents: number
          terms_accepted: boolean
          user_id: string
        }
        Insert: {
          callsign: string
          created_at?: string
          id?: string
          lane: number
          payment_status?: string
          pricing_option: string
          quoted_fee_cents: number
          terms_accepted: boolean
          user_id: string
        }
        Update: {
          callsign?: string
          created_at?: string
          id?: string
          lane?: number
          payment_status?: string
          pricing_option?: string
          quoted_fee_cents?: number
          terms_accepted?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vault_registrations: {
        Row: {
          age_confirmed: boolean
          callsign: string
          created_at: string
          date_of_birth: string
          email: string
          id: string
          identity_verification_provider: string | null
          identity_verification_reference: string | null
          identity_verification_status: string
          mock_verification_status: string
          terms_accepted: boolean
        }
        Insert: {
          age_confirmed: boolean
          callsign: string
          created_at?: string
          date_of_birth: string
          email: string
          id?: string
          identity_verification_provider?: string | null
          identity_verification_reference?: string | null
          identity_verification_status?: string
          mock_verification_status?: string
          terms_accepted: boolean
        }
        Update: {
          age_confirmed?: boolean
          callsign?: string
          created_at?: string
          date_of_birth?: string
          email?: string
          id?: string
          identity_verification_provider?: string | null
          identity_verification_reference?: string | null
          identity_verification_status?: string
          mock_verification_status?: string
          terms_accepted?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_lane_entry_counts: {
        Args: never
        Returns: {
          entries: number
          lane: number
        }[]
      }
      admin_monitoring_snapshot: { Args: never; Returns: Json }
      award_verified_engagement: {
        Args: { _action: string; _source_key: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      title_vote_totals: {
        Args: { _season: string }
        Returns: {
          title: string
          votes: number
        }[]
      }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
