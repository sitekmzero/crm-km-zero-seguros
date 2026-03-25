// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          id: string
          login_attempt_time: string | null
          success: boolean | null
          user_email: string
        }
        Insert: {
          id?: string
          login_attempt_time?: string | null
          success?: boolean | null
          user_email: string
        }
        Update: {
          id?: string
          login_attempt_time?: string | null
          success?: boolean | null
          user_email?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          ativo: boolean | null
          avatar_url: string | null
          comentario: string
          created_at: string | null
          email: string | null
          id: string
          nome_cliente: string
          nota: number | null
          product_type: string | null
        }
        Insert: {
          ativo?: boolean | null
          avatar_url?: string | null
          comentario: string
          created_at?: string | null
          email?: string | null
          id?: string
          nome_cliente: string
          nota?: number | null
          product_type?: string | null
        }
        Update: {
          ativo?: boolean | null
          avatar_url?: string | null
          comentario?: string
          created_at?: string | null
          email?: string | null
          id?: string
          nome_cliente?: string
          nota?: number | null
          product_type?: string | null
        }
        Relationships: []
      }
      candidatos: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          resume_url: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          resume_url?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          resume_url?: string | null
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          bot_response: string | null
          created_at: string
          crisp_session_id: string
          id: string
          rating: number | null
          user_message: string
        }
        Insert: {
          bot_response?: string | null
          created_at?: string
          crisp_session_id: string
          id?: string
          rating?: number | null
          user_message: string
        }
        Update: {
          bot_response?: string | null
          created_at?: string
          crisp_session_id?: string
          id?: string
          rating?: number | null
          user_message?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          renewal_date: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          renewal_date?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          renewal_date?: string | null
          status?: string
        }
        Relationships: []
      }
      conversion_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          lead_id: string | null
          metadata: Json | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          lead_id?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'conversion_events_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      corretora_config: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          color_blue: string | null
          color_gold: string | null
          email: string | null
          gemini_api_key: string | null
          id: string
          logo_url: string | null
          name: string | null
          phone: string | null
          resend_api_key: string | null
          slack_webhook: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          color_blue?: string | null
          color_gold?: string | null
          email?: string | null
          gemini_api_key?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          resend_api_key?: string | null
          slack_webhook?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          color_blue?: string | null
          color_gold?: string | null
          email?: string | null
          gemini_api_key?: string | null
          id?: string
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          resend_api_key?: string | null
          slack_webhook?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      cotacoes: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          quote_value: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          quote_value?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          quote_value?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'cotacoes_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          client_id: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          client_id: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          client_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      email_campaigns: {
        Row: {
          created_at: string | null
          id: string
          name: string
          status: string | null
          template: string
          trigger_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          status?: string | null
          template: string
          trigger_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          status?: string | null
          template?: string
          trigger_type?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          client_id: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          client_id?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          client_id?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'email_logs_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'email_campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'email_logs_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      interactions: {
        Row: {
          client_id: string | null
          id: string
          interaction_date: string | null
          interaction_type: string | null
          next_follow_up: string | null
          notes: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          id?: string
          interaction_date?: string | null
          interaction_type?: string | null
          next_follow_up?: string | null
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          id?: string
          interaction_date?: string | null
          interaction_type?: string | null
          next_follow_up?: string | null
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'interactions_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'interactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'user_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          birth_date: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          expiration_date: string | null
          file_url: string | null
          gender: string | null
          id: string
          insurance_subtype: string | null
          lead_source: string | null
          message: string | null
          metadata: Json | null
          name: string | null
          person_type: string | null
          phone: string | null
          preferred_time: string | null
          product_type: string | null
          profession: string | null
          status: string | null
          user_id: string | null
          variant_used: string | null
          vehicle_brand: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_usage: string | null
          vehicle_year: string | null
          zip_code: string | null
        }
        Insert: {
          birth_date?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          expiration_date?: string | null
          file_url?: string | null
          gender?: string | null
          id?: string
          insurance_subtype?: string | null
          lead_source?: string | null
          message?: string | null
          metadata?: Json | null
          name?: string | null
          person_type?: string | null
          phone?: string | null
          preferred_time?: string | null
          product_type?: string | null
          profession?: string | null
          status?: string | null
          user_id?: string | null
          variant_used?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_usage?: string | null
          vehicle_year?: string | null
          zip_code?: string | null
        }
        Update: {
          birth_date?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          expiration_date?: string | null
          file_url?: string | null
          gender?: string | null
          id?: string
          insurance_subtype?: string | null
          lead_source?: string | null
          message?: string | null
          metadata?: Json | null
          name?: string | null
          person_type?: string | null
          phone?: string | null
          preferred_time?: string | null
          product_type?: string | null
          profession?: string | null
          status?: string | null
          user_id?: string | null
          variant_used?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_usage?: string | null
          vehicle_year?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      notificacoes_vendas: {
        Row: {
          created_at: string
          id: string
          status: string | null
          tipo: string | null
          venda_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          tipo?: string | null
          venda_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          tipo?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notificacoes_vendas_venda_id_fkey'
            columns: ['venda_id']
            isOneToOne: false
            referencedRelation: 'vendas_online'
            referencedColumns: ['id']
          },
        ]
      }
      otp_validacoes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          estimated_price: number | null
          id: string
          image_url: string | null
          name: string
          status: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          estimated_price?: number | null
          id?: string
          image_url?: string | null
          name: string
          status?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          estimated_price?: number | null
          id?: string
          image_url?: string | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      reactivation_requests: {
        Row: {
          id: string
          request_date: string | null
          status: string | null
          user_email: string
        }
        Insert: {
          id?: string
          request_date?: string | null
          status?: string | null
          user_email: string
        }
        Update: {
          id?: string
          request_date?: string | null
          status?: string | null
          user_email?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_email: string
          referred_name: string
          referrer_id: string | null
          reward_value: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referred_email: string
          referred_name: string
          referrer_id?: string | null
          reward_value?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referred_email?: string
          referred_name?: string
          referrer_id?: string | null
          reward_value?: number | null
          status?: string | null
        }
        Relationships: []
      }
      seguradoras: {
        Row: {
          app_android_link: string | null
          app_ios_link: string | null
          area_cliente_link: string | null
          chat_online_link: string | null
          created_at: string
          id: string
          logo_url: string | null
          nome: string
          produtos_oferecidos: string[] | null
          sac_link: string | null
          whatsapp_link: string | null
        }
        Insert: {
          app_android_link?: string | null
          app_ios_link?: string | null
          area_cliente_link?: string | null
          chat_online_link?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          nome: string
          produtos_oferecidos?: string[] | null
          sac_link?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          app_android_link?: string | null
          app_ios_link?: string | null
          area_cliente_link?: string | null
          chat_online_link?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          nome?: string
          produtos_oferecidos?: string[] | null
          sac_link?: string | null
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
      vendas_online: {
        Row: {
          cliente_id: string | null
          cotacao_dados: Json | null
          created_at: string
          data_cotacao: string | null
          data_emissao: string | null
          data_proposta: string | null
          id: string
          produto_tipo: string | null
          proposta_numero: string | null
          seguradora_id: string | null
          status: string | null
          valor_total: number | null
        }
        Insert: {
          cliente_id?: string | null
          cotacao_dados?: Json | null
          created_at?: string
          data_cotacao?: string | null
          data_emissao?: string | null
          data_proposta?: string | null
          id?: string
          produto_tipo?: string | null
          proposta_numero?: string | null
          seguradora_id?: string | null
          status?: string | null
          valor_total?: number | null
        }
        Update: {
          cliente_id?: string | null
          cotacao_dados?: Json | null
          created_at?: string
          data_cotacao?: string | null
          data_emissao?: string | null
          data_proposta?: string | null
          id?: string
          produto_tipo?: string | null
          proposta_numero?: string | null
          seguradora_id?: string | null
          status?: string | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'vendas_online_seguradora_id_fkey'
            columns: ['seguradora_id']
            isOneToOne: false
            referencedRelation: 'seguradoras'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: access_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_email: text (not null)
//   success: boolean (nullable)
//   login_attempt_time: timestamp with time zone (nullable, default: now())
// Table: avaliacoes
//   id: uuid (not null, default: gen_random_uuid())
//   nome_cliente: text (not null)
//   nota: integer (nullable)
//   comentario: text (not null)
//   ativo: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   avatar_url: text (nullable)
//   email: text (nullable)
//   product_type: text (nullable, default: 'outro'::text)
// Table: candidatos
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (not null)
//   resume_url: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: chatbot_conversations
//   id: uuid (not null, default: gen_random_uuid())
//   crisp_session_id: text (not null)
//   user_message: text (not null)
//   bot_response: text (nullable)
//   rating: integer (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (not null)
//   name: text (not null)
//   status: text (not null, default: 'active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   renewal_date: date (nullable)
// Table: conversion_events
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   event_type: text (not null)
//   metadata: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: corretora_config
//   id: uuid (not null, default: '00000000-0000-0000-0000-000000000000'::uuid)
//   name: text (nullable, default: 'KM Zero Seguros'::text)
//   color_gold: text (nullable, default: '#C8A24A'::text)
//   color_blue: text (nullable, default: '#0B1F3B'::text)
//   updated_at: timestamp with time zone (nullable, default: now())
//   address: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   zip_code: text (nullable)
//   phone: text (nullable)
//   email: text (nullable)
//   cnpj: text (nullable)
//   logo_url: text (nullable)
//   slack_webhook: text (nullable)
//   resend_api_key: text (nullable)
//   gemini_api_key: text (nullable)
// Table: cotacoes
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (nullable)
//   quote_value: numeric (nullable)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: documents
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: uuid (not null)
//   file_name: text (not null)
//   file_path: text (not null)
//   document_type: text (not null)
//   uploaded_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: email_campaigns
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   template: text (not null)
//   trigger_type: text (nullable)
//   status: text (nullable, default: 'ativo'::text)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: email_logs
//   id: uuid (not null, default: gen_random_uuid())
//   campaign_id: uuid (nullable)
//   client_id: uuid (nullable)
//   sent_at: timestamp with time zone (nullable, default: now())
//   opened_at: timestamp with time zone (nullable)
//   clicked_at: timestamp with time zone (nullable)
// Table: interactions
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: uuid (nullable)
//   user_id: uuid (nullable)
//   interaction_type: text (nullable)
//   notes: text (nullable)
//   interaction_date: timestamp with time zone (nullable, default: now())
//   next_follow_up: date (nullable)
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (nullable)
//   email: text (nullable)
//   phone: text (nullable)
//   product_type: text (nullable)
//   status: text (nullable, default: 'novo'::text)
//   user_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   insurance_subtype: text (nullable)
//   vehicle_brand: text (nullable)
//   vehicle_model: text (nullable)
//   vehicle_year: text (nullable)
//   vehicle_plate: text (nullable)
//   vehicle_usage: text (nullable)
//   birth_date: text (nullable)
//   zip_code: text (nullable)
//   gender: text (nullable)
//   profession: text (nullable)
//   variant_used: text (nullable)
//   message: text (nullable)
//   lead_source: text (nullable, default: 'website'::text)
//   file_url: text (nullable)
//   expiration_date: date (nullable)
//   preferred_time: text (nullable)
//   metadata: jsonb (nullable, default: '{}'::jsonb)
//   person_type: text (nullable)
//   cnpj: text (nullable)
// Table: notificacoes_vendas
//   id: uuid (not null, default: gen_random_uuid())
//   venda_id: uuid (nullable)
//   tipo: text (nullable)
//   status: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: otp_validacoes
//   id: uuid (not null, default: gen_random_uuid())
//   email: text (not null)
//   code: text (not null)
//   expires_at: timestamp with time zone (not null)
//   used: boolean (nullable, default: false)
//   created_at: timestamp with time zone (not null, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (not null)
//   category: text (not null)
//   status: text (nullable, default: 'ativo'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   estimated_price: numeric (nullable, default: 0)
//   image_url: text (nullable)
// Table: reactivation_requests
//   id: uuid (not null, default: gen_random_uuid())
//   user_email: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   request_date: timestamp with time zone (nullable, default: now())
// Table: referrals
//   id: uuid (not null, default: gen_random_uuid())
//   referrer_id: uuid (nullable)
//   referred_name: text (not null)
//   referred_email: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   reward_value: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: seguradoras
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   logo_url: text (nullable)
//   area_cliente_link: text (nullable)
//   app_ios_link: text (nullable)
//   app_android_link: text (nullable)
//   whatsapp_link: text (nullable)
//   chat_online_link: text (nullable)
//   sac_link: text (nullable)
//   produtos_oferecidos: _text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_profiles
//   id: uuid (not null)
//   full_name: text (nullable)
//   is_admin: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: vendas_online
//   id: uuid (not null, default: gen_random_uuid())
//   cliente_id: uuid (nullable)
//   seguradora_id: uuid (nullable)
//   produto_tipo: text (nullable)
//   cotacao_dados: jsonb (nullable)
//   proposta_numero: text (nullable)
//   status: text (nullable)
//   valor_total: numeric (nullable)
//   data_cotacao: timestamp with time zone (nullable)
//   data_proposta: timestamp with time zone (nullable)
//   data_emissao: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: access_logs
//   PRIMARY KEY access_logs_pkey: PRIMARY KEY (id)
// Table: avaliacoes
//   CHECK avaliacoes_nota_check: CHECK (((nota >= 1) AND (nota <= 5)))
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
// Table: candidatos
//   PRIMARY KEY candidatos_pkey: PRIMARY KEY (id)
// Table: chatbot_conversations
//   PRIMARY KEY chatbot_conversations_pkey: PRIMARY KEY (id)
// Table: clients
//   UNIQUE clients_email_key: UNIQUE (email)
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
//   CHECK clients_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'inactive'::text])))
// Table: conversion_events
//   FOREIGN KEY conversion_events_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY conversion_events_pkey: PRIMARY KEY (id)
// Table: corretora_config
//   PRIMARY KEY corretora_config_pkey: PRIMARY KEY (id)
// Table: cotacoes
//   FOREIGN KEY cotacoes_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id)
//   PRIMARY KEY cotacoes_pkey: PRIMARY KEY (id)
// Table: documents
//   FOREIGN KEY documents_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   CHECK documents_document_type_check: CHECK ((document_type = ANY (ARRAY['apólice'::text, 'documento_pessoal'::text, 'contrato'::text, 'comprovante'::text])))
//   PRIMARY KEY documents_pkey: PRIMARY KEY (id)
// Table: email_campaigns
//   PRIMARY KEY email_campaigns_pkey: PRIMARY KEY (id)
//   CHECK email_campaigns_status_check: CHECK ((status = ANY (ARRAY['ativo'::text, 'inativo'::text])))
//   CHECK email_campaigns_trigger_type_check: CHECK ((trigger_type = ANY (ARRAY['boas-vindas'::text, 'renovação'::text, 'follow-up'::text])))
// Table: email_logs
//   FOREIGN KEY email_logs_campaign_id_fkey: FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE
//   FOREIGN KEY email_logs_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY email_logs_pkey: PRIMARY KEY (id)
// Table: interactions
//   FOREIGN KEY interactions_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   CHECK interactions_interaction_type_check: CHECK ((interaction_type = ANY (ARRAY['chamada'::text, 'email'::text, 'mensagem'::text, 'visita'::text])))
//   PRIMARY KEY interactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY interactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL
// Table: leads
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
//   FOREIGN KEY leads_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id)
// Table: notificacoes_vendas
//   PRIMARY KEY notificacoes_vendas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notificacoes_vendas_venda_id_fkey: FOREIGN KEY (venda_id) REFERENCES vendas_online(id)
// Table: otp_validacoes
//   PRIMARY KEY otp_validacoes_pkey: PRIMARY KEY (id)
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: reactivation_requests
//   PRIMARY KEY reactivation_requests_pkey: PRIMARY KEY (id)
//   CHECK reactivation_requests_status_check: CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
// Table: referrals
//   PRIMARY KEY referrals_pkey: PRIMARY KEY (id)
//   FOREIGN KEY referrals_referrer_id_fkey: FOREIGN KEY (referrer_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: seguradoras
//   PRIMARY KEY seguradoras_pkey: PRIMARY KEY (id)
// Table: user_profiles
//   FOREIGN KEY user_profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY user_profiles_pkey: PRIMARY KEY (id)
// Table: vendas_online
//   PRIMARY KEY vendas_online_pkey: PRIMARY KEY (id)
//   FOREIGN KEY vendas_online_seguradora_id_fkey: FOREIGN KEY (seguradora_id) REFERENCES seguradoras(id)
//   CHECK vendas_online_status_check: CHECK ((status = ANY (ARRAY['cotacao'::text, 'proposta'::text, 'emissao'::text, 'cancelada'::text])))

// --- ROW LEVEL SECURITY POLICIES ---
// Table: access_logs
//   Policy "access_logs_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
// Table: avaliacoes
//   Policy "avaliacoes_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: candidatos
//   Policy "candidatos_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "candidatos_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "candidatos_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "candidatos_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: chatbot_conversations
//   Policy "Admins can access all chatbot convos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
//   Policy "Anon can insert chatbot convos" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
// Table: clients
//   Policy "clients_anon_insert_policy" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "clients_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "clients_insert_policy" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "clients_select_policy" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "clients_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: conversion_events
//   Policy "Allow anon insert on conversion_events" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
// Table: corretora_config
//   Policy "config_admin_all" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
//   Policy "config_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: cotacoes
//   Policy "cotacoes_insert" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
// Table: documents
//   Policy "Admins can do everything on documents" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
//   Policy "Clients can delete their own documents" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (client_id = auth.uid())
//   Policy "Clients can insert their own documents" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (client_id = auth.uid())
//   Policy "Clients can see their own documents" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (client_id = auth.uid())
//   Policy "Clients can update their own documents" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (client_id = auth.uid())
//     WITH CHECK: (client_id = auth.uid())
// Table: email_campaigns
//   Policy "admins_all_campaigns" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
// Table: email_logs
//   Policy "admins_all_logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
// Table: interactions
//   Policy "admins_all_interactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
//   Policy "clients_own_interactions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (client_id = auth.uid())
// Table: leads
//   Policy "Allow anon insert on leads" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
//   Policy "Allow authenticated delete on leads" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow authenticated select on leads" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow authenticated update on leads" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: notificacoes_vendas
//   Policy "notificacoes_vendas_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: otp_validacoes
//   Policy "otp_validacoes_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true
// Table: products
//   Policy "products_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "products_insert_policy" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "products_select_policy" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "products_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: reactivation_requests
//   Policy "reactivation_requests_anon_insert_policy" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "reactivation_requests_delete_policy" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "reactivation_requests_select_policy" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "reactivation_requests_update_policy" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: referrals
//   Policy "Admins can access all referrals" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
//   Policy "Users can insert own referrals" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (referrer_id = auth.uid())
//   Policy "Users can view own referrals" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (referrer_id = auth.uid())
// Table: seguradoras
//   Policy "seguradoras_select" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: user_profiles
//   Policy "Users can read own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
// Table: vendas_online
//   Policy "vendas_online_all" (ALL, PERMISSIVE) roles={public}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION rls_auto_enable()
//   CREATE OR REPLACE FUNCTION public.rls_auto_enable()
//    RETURNS event_trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'pg_catalog'
//   AS $function$
//   DECLARE
//     cmd record;
//   BEGIN
//     FOR cmd IN
//       SELECT *
//       FROM pg_event_trigger_ddl_commands()
//       WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
//         AND object_type IN ('table','partitioned table')
//     LOOP
//        IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
//         BEGIN
//           EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
//           RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
//         EXCEPTION
//           WHEN OTHERS THEN
//             RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
//         END;
//        ELSE
//           RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
//        END IF;
//     END LOOP;
//   END;
//   $function$
//
// FUNCTION trigger_send_welcome_email()
//   CREATE OR REPLACE FUNCTION public.trigger_send_welcome_email()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     BEGIN
//       PERFORM net.http_post(
//         url := 'https://lxfdqudvexpktlesfkro.supabase.co/functions/v1/send-welcome-email',
//         headers := '{"Content-Type": "application/json"}',
//         body := jsonb_build_object('record', row_to_json(NEW))
//       );
//     EXCEPTION WHEN OTHERS THEN
//       -- Fallback silently if pg_net fails
//     END;
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: clients
//   on_client_created_welcome: CREATE TRIGGER on_client_created_welcome AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION trigger_send_welcome_email()

// --- INDEXES ---
// Table: clients
//   CREATE UNIQUE INDEX clients_email_key ON public.clients USING btree (email)
