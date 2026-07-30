export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      Ladda_admin_profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["ladda_admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["ladda_admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["ladda_admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      Ladda_ai_usage: {
        Row: {
          actual_model: string | null
          conversation_id: string | null
          created_at: string
          error_code: string | null
          id: string
          latency_ms: number | null
          message_id: string | null
          outcome: string
          provider_route: string | null
          requested_model: string | null
          retry_count: number
          updated_at: string
        }
        Insert: {
          actual_model?: string | null
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          id?: string
          latency_ms?: number | null
          message_id?: string | null
          outcome: string
          provider_route?: string | null
          requested_model?: string | null
          retry_count?: number
          updated_at?: string
        }
        Update: {
          actual_model?: string | null
          conversation_id?: string | null
          created_at?: string
          error_code?: string | null
          id?: string
          latency_ms?: number | null
          message_id?: string | null
          outcome?: string
          provider_route?: string | null
          requested_model?: string | null
          retry_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_ai_usage_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "Ladda_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Ladda_ai_usage_message_conversation_fkey"
            columns: ["message_id", "conversation_id"]
            isOneToOne: false
            referencedRelation: "Ladda_messages"
            referencedColumns: ["id", "conversation_id"]
          },
        ]
      }
      Ladda_audit_logs: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          after_value: Json | null
          before_value: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          outcome: string
        }
        Insert: {
          action: string
          actor_type: string
          actor_user_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          outcome: string
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          outcome?: string
        }
        Relationships: []
      }
      Ladda_conversations: {
        Row: {
          assigned_admin_id: string | null
          created_at: string
          customer_id: string
          customer_identity_id: string
          id: string
          last_customer_message_at: string | null
          last_reply_at: string | null
          manual_until: string | null
          mode: Database["public"]["Enums"]["ladda_conversation_mode"]
          status: Database["public"]["Enums"]["ladda_conversation_status"]
          updated_at: string
          version: number
        }
        Insert: {
          assigned_admin_id?: string | null
          created_at?: string
          customer_id: string
          customer_identity_id: string
          id?: string
          last_customer_message_at?: string | null
          last_reply_at?: string | null
          manual_until?: string | null
          mode?: Database["public"]["Enums"]["ladda_conversation_mode"]
          status?: Database["public"]["Enums"]["ladda_conversation_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          assigned_admin_id?: string | null
          created_at?: string
          customer_id?: string
          customer_identity_id?: string
          id?: string
          last_customer_message_at?: string | null
          last_reply_at?: string | null
          manual_until?: string | null
          mode?: Database["public"]["Enums"]["ladda_conversation_mode"]
          status?: Database["public"]["Enums"]["ladda_conversation_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Ladda_conversations_customer_identity_id_customer_id_fkey"
            columns: ["customer_identity_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customer_identities"
            referencedColumns: ["id", "customer_id"]
          },
        ]
      }
      Ladda_customer_facts: {
        Row: {
          confidence: number
          created_at: string
          customer_id: string
          fact_type: string
          fact_value: Json
          id: string
          review_status: Database["public"]["Enums"]["ladda_fact_review_status"]
          reviewed_at: string | null
          reviewed_by: string | null
          source_message_id: string
          updated_at: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          confidence: number
          created_at?: string
          customer_id: string
          fact_type: string
          fact_value: Json
          id?: string
          review_status?: Database["public"]["Enums"]["ladda_fact_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_message_id: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          customer_id?: string
          fact_type?: string
          fact_value?: Json
          id?: string
          review_status?: Database["public"]["Enums"]["ladda_fact_review_status"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_message_id?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_customer_facts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Ladda_customer_facts_source_message_customer_fkey"
            columns: ["source_message_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_messages"
            referencedColumns: ["id", "customer_id"]
          },
        ]
      }
      Ladda_customer_identities: {
        Row: {
          blocked_at: string | null
          channel_type: string
          created_at: string
          customer_id: string
          display_name_snapshot: string | null
          first_seen_at: string
          id: string
          last_seen_at: string
          line_channel_id: string
          line_provider_id: string
          line_user_id: string
          picture_url_snapshot: string | null
          updated_at: string
        }
        Insert: {
          blocked_at?: string | null
          channel_type?: string
          created_at?: string
          customer_id: string
          display_name_snapshot?: string | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          line_channel_id: string
          line_provider_id: string
          line_user_id: string
          picture_url_snapshot?: string | null
          updated_at?: string
        }
        Update: {
          blocked_at?: string | null
          channel_type?: string
          created_at?: string
          customer_id?: string
          display_name_snapshot?: string | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          line_channel_id?: string
          line_provider_id?: string
          line_user_id?: string
          picture_url_snapshot?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_customer_identities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      Ladda_customer_tags: {
        Row: {
          created_at: string
          created_by: string
          customer_id: string
          id: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_customer_tags_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Ladda_customer_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "Ladda_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      Ladda_customers: {
        Row: {
          created_at: string
          deleted_at: string | null
          district: string | null
          first_contact_at: string
          id: string
          last_contact_at: string
          merged_into_customer_id: string | null
          phone: string | null
          preferred_name: string | null
          province: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          first_contact_at?: string
          id?: string
          last_contact_at?: string
          merged_into_customer_id?: string | null
          phone?: string | null
          preferred_name?: string | null
          province?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          first_contact_at?: string
          id?: string
          last_contact_at?: string
          merged_into_customer_id?: string | null
          phone?: string | null
          preferred_name?: string | null
          province?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_customers_merged_into_customer_id_fkey"
            columns: ["merged_into_customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      Ladda_feature_flags: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          id: string
          key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      Ladda_follow_up_tasks: {
        Row: {
          assigned_admin_id: string | null
          completed_at: string | null
          conversation_id: string | null
          created_at: string
          created_by: string
          customer_id: string
          detail: string | null
          due_at: string
          id: string
          status: Database["public"]["Enums"]["ladda_task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_admin_id?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          detail?: string | null
          due_at: string
          id?: string
          status?: Database["public"]["Enums"]["ladda_task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_admin_id?: string | null
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          detail?: string | null
          due_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ladda_task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_follow_up_tasks_conversation_customer_fkey"
            columns: ["conversation_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_conversations"
            referencedColumns: ["id", "customer_id"]
          },
          {
            foreignKeyName: "Ladda_follow_up_tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      Ladda_message_media: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          message_id: string
          mime_type: string | null
          sha256: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["ladda_media_status"]
          storage_bucket: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          message_id: string
          mime_type?: string | null
          sha256?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["ladda_media_status"]
          storage_bucket: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          message_id?: string
          mime_type?: string | null
          sha256?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["ladda_media_status"]
          storage_bucket?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_message_media_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "Ladda_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      Ladda_messages: {
        Row: {
          actual_model: string | null
          conversation_id: string
          created_at: string
          customer_id: string
          delivery_status: Database["public"]["Enums"]["ladda_delivery_status"]
          direction: Database["public"]["Enums"]["ladda_message_direction"]
          failure_code: string | null
          id: string
          line_message_id: string | null
          message_type: string
          reply_to_message_id: string | null
          requested_model: string | null
          sender_admin_id: string | null
          sender_type: Database["public"]["Enums"]["ladda_sender_type"]
          sent_at: string | null
          text_content: string | null
          updated_at: string
          webhook_event_id: string | null
        }
        Insert: {
          actual_model?: string | null
          conversation_id: string
          created_at?: string
          customer_id: string
          delivery_status: Database["public"]["Enums"]["ladda_delivery_status"]
          direction: Database["public"]["Enums"]["ladda_message_direction"]
          failure_code?: string | null
          id?: string
          line_message_id?: string | null
          message_type: string
          reply_to_message_id?: string | null
          requested_model?: string | null
          sender_admin_id?: string | null
          sender_type: Database["public"]["Enums"]["ladda_sender_type"]
          sent_at?: string | null
          text_content?: string | null
          updated_at?: string
          webhook_event_id?: string | null
        }
        Update: {
          actual_model?: string | null
          conversation_id?: string
          created_at?: string
          customer_id?: string
          delivery_status?: Database["public"]["Enums"]["ladda_delivery_status"]
          direction?: Database["public"]["Enums"]["ladda_message_direction"]
          failure_code?: string | null
          id?: string
          line_message_id?: string | null
          message_type?: string
          reply_to_message_id?: string | null
          requested_model?: string | null
          sender_admin_id?: string | null
          sender_type?: Database["public"]["Enums"]["ladda_sender_type"]
          sent_at?: string | null
          text_content?: string | null
          updated_at?: string
          webhook_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_messages_conversation_customer_fkey"
            columns: ["conversation_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_conversations"
            referencedColumns: ["id", "customer_id"]
          },
          {
            foreignKeyName: "Ladda_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Ladda_messages_reply_customer_fkey"
            columns: ["reply_to_message_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_messages"
            referencedColumns: ["id", "customer_id"]
          },
          {
            foreignKeyName: "Ladda_messages_webhook_event_id_fkey"
            columns: ["webhook_event_id"]
            isOneToOne: false
            referencedRelation: "Ladda_webhook_events"
            referencedColumns: ["id"]
          },
        ]
      }
      Ladda_notes: {
        Row: {
          body: string
          conversation_id: string | null
          created_at: string
          created_by: string
          customer_id: string
          id: string
          updated_at: string
        }
        Insert: {
          body: string
          conversation_id?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          body?: string
          conversation_id?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Ladda_notes_conversation_customer_fkey"
            columns: ["conversation_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_conversations"
            referencedColumns: ["id", "customer_id"]
          },
          {
            foreignKeyName: "Ladda_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "Ladda_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      Ladda_system_health: {
        Row: {
          checked_at: string
          created_at: string
          detail: Json
          id: string
          latency_ms: number | null
          queue_depth: number | null
          service: string
          status: string
          updated_at: string
        }
        Insert: {
          checked_at?: string
          created_at?: string
          detail?: Json
          id?: string
          latency_ms?: number | null
          queue_depth?: number | null
          service: string
          status: string
          updated_at?: string
        }
        Update: {
          checked_at?: string
          created_at?: string
          detail?: Json
          id?: string
          latency_ms?: number | null
          queue_depth?: number | null
          service?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      Ladda_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Ladda_webhook_events: {
        Row: {
          attempt_count: number
          created_at: string
          error_code: string | null
          event_id: string
          event_type: string
          id: string
          line_message_id: string | null
          processed_at: string | null
          received_at: string
          source_id: string
          source_type: string
          status: Database["public"]["Enums"]["ladda_webhook_status"]
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          error_code?: string | null
          event_id: string
          event_type: string
          id?: string
          line_message_id?: string | null
          processed_at?: string | null
          received_at?: string
          source_id: string
          source_type: string
          status?: Database["public"]["Enums"]["ladda_webhook_status"]
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          error_code?: string | null
          event_id?: string
          event_type?: string
          id?: string
          line_message_id?: string | null
          processed_at?: string | null
          received_at?: string
          source_id?: string
          source_type?: string
          status?: Database["public"]["Enums"]["ladda_webhook_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dblink: { Args: { "": string }; Returns: Record<string, unknown>[] }
      dblink_cancel_query: { Args: { "": string }; Returns: string }
      dblink_close: { Args: { "": string }; Returns: string }
      dblink_connect: { Args: { "": string }; Returns: string }
      dblink_connect_u: { Args: { "": string }; Returns: string }
      dblink_current_query: { Args: never; Returns: string }
      dblink_disconnect:
        | { Args: never; Returns: string }
        | { Args: { "": string }; Returns: string }
      dblink_error_message: { Args: { "": string }; Returns: string }
      dblink_exec: { Args: { "": string }; Returns: string }
      dblink_fdw_validator: {
        Args: { catalog: unknown; options: string[] }
        Returns: undefined
      }
      dblink_get_connections: { Args: never; Returns: string[] }
      dblink_get_notify:
        | { Args: { conname: string }; Returns: Record<string, unknown>[] }
        | { Args: never; Returns: Record<string, unknown>[] }
      dblink_get_pkey: {
        Args: { "": string }
        Returns: Database["public"]["CompositeTypes"]["dblink_pkey_results"][]
        SetofOptions: {
          from: "*"
          to: "dblink_pkey_results"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      dblink_get_result: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      dblink_is_busy: { Args: { "": string }; Returns: number }
      ladda_bot_reply_allowed: {
        Args: { conversation_id: string; expected_version: number }
        Returns: boolean
      }
      ladda_claim_conversation: {
        Args: { conversation_id: string }
        Returns: boolean
      }
      ladda_expire_manual_leases: { Args: never; Returns: string[] }
      ladda_extend_manual_lease: {
        Args: { conversation_id: string }
        Returns: boolean
      }
      ladda_is_admin: { Args: never; Returns: boolean }
      ladda_is_staff: { Args: never; Returns: boolean }
      ladda_release_conversation: {
        Args: { conversation_id: string }
        Returns: boolean
      }
      ladda_transfer_conversation: {
        Args: { conversation_id: string; target_admin_id: string }
        Returns: boolean
      }
    }
    Enums: {
      ladda_admin_role: "admin" | "viewer"
      ladda_conversation_mode: "bot" | "manual"
      ladda_conversation_status: "open" | "closed"
      ladda_delivery_status:
        | "received"
        | "queued"
        | "processing"
        | "sent"
        | "delivered"
        | "failed"
        | "cancelled"
      ladda_fact_review_status: "confirmed" | "pending" | "rejected"
      ladda_media_status: "pending" | "stored" | "failed" | "deleted"
      ladda_message_direction: "inbound" | "outbound"
      ladda_sender_type: "customer" | "bot" | "admin" | "system"
      ladda_task_status: "open" | "done" | "cancelled"
      ladda_webhook_status: "received" | "queued" | "processed" | "failed"
    }
    CompositeTypes: {
      dblink_pkey_results: {
        position: number | null
        colname: string | null
      }
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
      ladda_admin_role: ["admin", "viewer"],
      ladda_conversation_mode: ["bot", "manual"],
      ladda_conversation_status: ["open", "closed"],
      ladda_delivery_status: [
        "received",
        "queued",
        "processing",
        "sent",
        "delivered",
        "failed",
        "cancelled",
      ],
      ladda_fact_review_status: ["confirmed", "pending", "rejected"],
      ladda_media_status: ["pending", "stored", "failed", "deleted"],
      ladda_message_direction: ["inbound", "outbound"],
      ladda_sender_type: ["customer", "bot", "admin", "system"],
      ladda_task_status: ["open", "done", "cancelled"],
      ladda_webhook_status: ["received", "queued", "processed", "failed"],
    },
  },
} as const
