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
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      configs: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          ai_active: boolean
          created_at: string
          id: string
          name: string
          phone: string
          status: Database['public']['Enums']['lead_status']
          updated_at: string
        }
        Insert: {
          ai_active?: boolean
          created_at?: string
          id?: string
          name: string
          phone: string
          status?: Database['public']['Enums']['lead_status']
          updated_at?: string
        }
        Update: {
          ai_active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string
          status?: Database['public']['Enums']['lead_status']
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_draft: boolean | null
          lead_id: string
          sender: Database['public']['Enums']['message_sender']
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_draft?: boolean | null
          lead_id: string
          sender: Database['public']['Enums']['message_sender']
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_draft?: boolean | null
          lead_id?: string
          sender?: Database['public']['Enums']['message_sender']
        }
        Relationships: [
          {
            foreignKeyName: 'messages_lead_id_fkey'
            columns: ['lead_id']
            isOneToOne: false
            referencedRelation: 'leads'
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
      lead_status:
        | 'novo'
        | 'seguro_qualificado'
        | 'consorcio_qualificado'
        | 'financiamento_qualificado'
        | 'em_atendimento_humano'
        | 'perdido'
      message_sender: 'lead' | 'ia' | 'humano'
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
    Enums: {
      lead_status: [
        'novo',
        'seguro_qualificado',
        'consorcio_qualificado',
        'financiamento_qualificado',
        'em_atendimento_humano',
        'perdido',
      ],
      message_sender: ['lead', 'ia', 'humano'],
    },
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
// Table: configs
//   id: uuid (not null, default: gen_random_uuid())
//   key: text (not null)
//   value: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: leads
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   phone: text (not null)
//   status: lead_status (not null, default: 'novo'::lead_status)
//   ai_active: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: messages
//   id: uuid (not null, default: gen_random_uuid())
//   lead_id: uuid (not null)
//   sender: message_sender (not null)
//   content: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   is_draft: boolean (nullable, default: false)

// --- CONSTRAINTS ---
// Table: configs
//   UNIQUE configs_key_key: UNIQUE (key)
//   PRIMARY KEY configs_pkey: PRIMARY KEY (id)
// Table: leads
//   UNIQUE leads_phone_key: UNIQUE (phone)
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
// Table: messages
//   FOREIGN KEY messages_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: configs
//   Policy "anon_select_configs" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all_configs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: leads
//   Policy "anon_insert_leads" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "anon_select_leads" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "anon_update_leads" (UPDATE, PERMISSIVE) roles={anon}
//     USING: true
//     WITH CHECK: true
//   Policy "authenticated_all_leads" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: messages
//   Policy "anon_insert_messages" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: true
//   Policy "anon_select_messages" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all_messages" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- INDEXES ---
// Table: configs
//   CREATE UNIQUE INDEX configs_key_key ON public.configs USING btree (key)
// Table: leads
//   CREATE UNIQUE INDEX leads_phone_key ON public.leads USING btree (phone)
