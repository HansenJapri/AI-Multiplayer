export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      cli_installs: {
        Row: {
          created_at: string;
          id: string;
          revoked_at: string | null;
          token_hash: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          revoked_at?: string | null;
          token_hash: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          revoked_at?: string | null;
          token_hash?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cli_installs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cli_installs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      deposits: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          id: string;
          paid_at: string | null;
          plan: string;
          provider: string;
          provider_reference: string | null;
          seats: number;
          started_by: string;
          status: string;
          workspace_id: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          id?: string;
          paid_at?: string | null;
          plan: string;
          provider: string;
          provider_reference?: string | null;
          seats: number;
          started_by: string;
          status?: string;
          workspace_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          paid_at?: string | null;
          plan?: string;
          provider?: string;
          provider_reference?: string | null;
          seats?: number;
          started_by?: string;
          status?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deposits_started_by_fkey";
            columns: ["started_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "deposits_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          actor_id: string | null;
          created_at: string;
          id: string;
          name: string;
          props: NonNullable<Json>;
          run_id: string | null;
          workspace_id: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          props?: NonNullable<Json>;
          run_id?: string | null;
          workspace_id: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          props?: NonNullable<Json>;
          run_id?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      hook_events: {
        Row: {
          cli_install_id: string;
          hook_event_name: string;
          id: string;
          payload: NonNullable<Json>;
          received_at: string;
          run_id: string;
          workspace_id: string;
        };
        Insert: {
          cli_install_id: string;
          hook_event_name: string;
          id?: string;
          payload: NonNullable<Json>;
          received_at?: string;
          run_id: string;
          workspace_id: string;
        };
        Update: {
          cli_install_id?: string;
          hook_event_name?: string;
          id?: string;
          payload?: NonNullable<Json>;
          received_at?: string;
          run_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hook_events_workspace_id_cli_install_id_fkey";
            columns: ["workspace_id", "cli_install_id"];
            isOneToOne: false;
            referencedRelation: "cli_installs";
            referencedColumns: ["workspace_id", "id"];
          },
          {
            foreignKeyName: "hook_events_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hook_events_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      run_checkpoints: {
        Row: {
          cli_install_id: string;
          commit_sha: string;
          created_at: string;
          id: string;
          run_id: string;
          sequence: number;
          uploaded_at: string | null;
          workspace_id: string;
        };
        Insert: {
          cli_install_id: string;
          commit_sha: string;
          created_at?: string;
          id?: string;
          run_id: string;
          sequence: number;
          uploaded_at?: string | null;
          workspace_id: string;
        };
        Update: {
          cli_install_id?: string;
          commit_sha?: string;
          created_at?: string;
          id?: string;
          run_id?: string;
          sequence?: number;
          uploaded_at?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_checkpoints_workspace_id_cli_install_id_fkey";
            columns: ["workspace_id", "cli_install_id"];
            isOneToOne: false;
            referencedRelation: "cli_installs";
            referencedColumns: ["workspace_id", "id"];
          },
          {
            foreignKeyName: "run_checkpoints_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      run_comments: {
        Row: {
          audience: string;
          author_id: string;
          body: string;
          created_at: string;
          hook_event_id: string | null;
          id: string;
          run_id: string;
          workspace_id: string;
        };
        Insert: {
          audience?: string;
          author_id: string;
          body: string;
          created_at?: string;
          hook_event_id?: string | null;
          id?: string;
          run_id: string;
          workspace_id: string;
        };
        Update: {
          audience?: string;
          author_id?: string;
          body?: string;
          created_at?: string;
          hook_event_id?: string | null;
          id?: string;
          run_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_comments_workspace_id_hook_event_id_fkey";
            columns: ["workspace_id", "hook_event_id"];
            isOneToOne: false;
            referencedRelation: "hook_events";
            referencedColumns: ["workspace_id", "id"];
          },
          {
            foreignKeyName: "run_comments_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      run_guest_invites: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          run_id: string;
          token_hash: string;
          workspace_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          run_id: string;
          token_hash: string;
          workspace_id: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          run_id?: string;
          token_hash?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_guest_invites_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_guest_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_guest_invites_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      run_guests: {
        Row: {
          created_at: string;
          invited_by: string;
          run_id: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          invited_by: string;
          run_id: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          invited_by?: string;
          run_id?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_guests_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_guests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_guests_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      run_holds: {
        Row: {
          id: string;
          raised_at: string;
          raised_by: string;
          reason: string;
          released_at: string | null;
          released_by: string | null;
          run_id: string;
          workspace_id: string;
        };
        Insert: {
          id?: string;
          raised_at?: string;
          raised_by: string;
          reason?: string;
          released_at?: string | null;
          released_by?: string | null;
          run_id: string;
          workspace_id: string;
        };
        Update: {
          id?: string;
          raised_at?: string;
          raised_by?: string;
          reason?: string;
          released_at?: string | null;
          released_by?: string | null;
          run_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_holds_raised_by_fkey";
            columns: ["raised_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_holds_released_by_fkey";
            columns: ["released_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_holds_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      run_participants: {
        Row: {
          first_seen_at: string;
          role: string;
          run_id: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          first_seen_at?: string;
          role: string;
          run_id: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          first_seen_at?: string;
          role?: string;
          run_id?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "run_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "run_participants_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      runs: {
        Row: {
          claude_session_id: string;
          created_at: string;
          id: string;
          workspace_id: string;
        };
        Insert: {
          claude_session_id: string;
          created_at?: string;
          id?: string;
          workspace_id: string;
        };
        Update: {
          claude_session_id?: string;
          created_at?: string;
          id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "runs_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      steer_messages: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          delivered_at: string | null;
          id: string;
          run_id: string;
          workspace_id: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          run_id: string;
          workspace_id: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          delivered_at?: string | null;
          id?: string;
          run_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "steer_messages_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "steer_messages_workspace_id_run_id_fkey";
            columns: ["workspace_id", "run_id"];
            isOneToOne: false;
            referencedRelation: "runs";
            referencedColumns: ["workspace_id", "id"];
          },
        ];
      };
      workspace_invites: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string;
          token_hash: string;
          workspace_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by: string;
          token_hash: string;
          workspace_id: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string;
          token_hash?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_invites_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_members: {
        Row: {
          created_at: string;
          role: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string;
          role: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          role?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      workspaces: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_run_guest_invite: {
        Args: { p_token_hash: string; p_user_email: string; p_user_id: string };
        Returns: string;
      };
      accept_workspace_invite: {
        Args: { p_token_hash: string; p_user_email: string; p_user_id: string };
        Returns: string;
      };
      approve_cli_device_login: {
        Args: { p_user_code: string; p_user_id: string; p_workspace_id: string };
        Returns: boolean;
      };
      claim_cli_device_login: {
        Args: { p_device_code_hash: string; p_install_token_hash: string };
        Returns: string;
      };
      cli_device_login_status: { Args: { p_device_code_hash: string }; Returns: string };
      complete_deposit: {
        Args: { p_deposit_id: string; p_provider_reference: string };
        Returns: boolean;
      };
      complete_run_checkpoint: {
        Args: { p_checkpoint_id: string; p_token_hash: string };
        Returns: boolean;
      };
      create_run_checkpoint: {
        Args: { p_claude_session_id: string; p_commit_sha: string; p_token_hash: string };
        Returns: Json;
      };
      create_run_guest_invite: {
        Args: { p_email: string; p_inviter_id: string; p_run_id: string; p_token_hash: string };
        Returns: string;
      };
      create_workspace_invite: {
        Args: {
          p_email: string;
          p_inviter_id: string;
          p_token_hash: string;
          p_workspace_id: string;
        };
        Returns: string;
      };
      create_workspace_with_owner: {
        Args: { p_name: string; p_owner_id: string };
        Returns: string;
      };
      ingest_hook_event: {
        Args: {
          p_claude_session_id: string;
          p_hook_event_name: string;
          p_payload: Json;
          p_token_hash: string;
        };
        Returns: Json;
      };
      post_run_comment: {
        Args: {
          p_audience?: string;
          p_author_id: string;
          p_body: string;
          p_hook_event_id: string;
          p_run_id: string;
        };
        Returns: string;
      };
      queue_steer_message: {
        Args: { p_author_id: string; p_body: string; p_run_id: string };
        Returns: string;
      };
      raise_run_hold: {
        Args: { p_reason: string; p_run_id: string; p_user_id: string };
        Returns: boolean;
      };
      record_run_view: { Args: { p_run_id: string; p_user_id: string }; Returns: string };
      release_run_hold: { Args: { p_run_id: string; p_user_id: string }; Returns: boolean };
      resolve_checkpoint_for_resume: {
        Args: { p_run_id: string; p_sequence: number; p_token_hash: string };
        Returns: Json;
      };
      start_cli_device_login: {
        Args: { p_device_code_hash: string; p_user_code: string };
        Returns: undefined;
      };
      start_deposit: {
        Args: {
          p_amount_cents: number;
          p_currency: string;
          p_plan: string;
          p_provider: string;
          p_seats: number;
          p_user_id: string;
          p_workspace_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
