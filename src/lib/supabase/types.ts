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
      app_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
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
      contacts: {
        Row: {
          cep: string | null
          channel: string | null
          company_name: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_activity_date: string | null
          last_name: string | null
          lead_score: number | null
          modelo_captura: string | null
          observacoes: string | null
          phone: string | null
          probability: number | null
          produto_interesse: string | null
          proprietario_id: string | null
          stage_updated_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cep?: string | null
          channel?: string | null
          company_name?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_activity_date?: string | null
          last_name?: string | null
          lead_score?: number | null
          modelo_captura?: string | null
          observacoes?: string | null
          phone?: string | null
          probability?: number | null
          produto_interesse?: string | null
          proprietario_id?: string | null
          stage_updated_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cep?: string | null
          channel?: string | null
          company_name?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_activity_date?: string | null
          last_name?: string | null
          lead_score?: number | null
          modelo_captura?: string | null
          observacoes?: string | null
          phone?: string | null
          probability?: number | null
          produto_interesse?: string | null
          proprietario_id?: string | null
          stage_updated_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          contact_id: string | null
          file_name: string
          file_path: string
          id: string
          uploaded_at: string
        }
        Insert: {
          contact_id?: string | null
          file_name: string
          file_path: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          contact_id?: string | null
          file_name?: string
          file_path?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
        ]
      }
      leads: {
        Row: {
          ai_active: boolean
          channel: string | null
          created_at: string
          id: string
          name: string
          phone: string
          status: Database['public']['Enums']['lead_status']
          updated_at: string
        }
        Insert: {
          ai_active?: boolean
          channel?: string | null
          created_at?: string
          id?: string
          name: string
          phone: string
          status?: Database['public']['Enums']['lead_status']
          updated_at?: string
        }
        Update: {
          ai_active?: boolean
          channel?: string | null
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
          feedback: string | null
          id: string
          is_draft: boolean | null
          lead_id: string
          sender: Database['public']['Enums']['message_sender']
        }
        Insert: {
          content: string
          created_at?: string
          feedback?: string | null
          id?: string
          is_draft?: boolean | null
          lead_id: string
          sender: Database['public']['Enums']['message_sender']
        }
        Update: {
          content?: string
          created_at?: string
          feedback?: string | null
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
      quotations: {
        Row: {
          contact_id: string | null
          dados_cotacao: Json
          data_criacao: string
          id: string
          status: string
          tipo_produto: string
        }
        Insert: {
          contact_id?: string | null
          dados_cotacao?: Json
          data_criacao?: string
          id?: string
          status?: string
          tipo_produto: string
        }
        Update: {
          contact_id?: string | null
          dados_cotacao?: Json
          data_criacao?: string
          id?: string
          status?: string
          tipo_produto?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quotations_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
        ]
      }
      training_progress: {
        Row: {
          created_at: string
          id: string
          module_id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean | null
          role: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_admin?: boolean | null
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean | null
          role?: string | null
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
// Table: app_notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   message: text (not null)
//   type: text (not null, default: 'info'::text)
//   priority: text (not null, default: 'normal'::text)
//   read: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
// Table: configs
//   id: uuid (not null, default: gen_random_uuid())
//   key: text (not null)
//   value: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: contacts
//   id: uuid (not null, default: gen_random_uuid())
//   first_name: text (nullable)
//   last_name: text (nullable)
//   email: text (nullable)
//   phone: text (nullable)
//   company_name: text (nullable)
//   status: text (nullable, default: 'subscriber'::text)
//   cpf: text (nullable)
//   cep: text (nullable)
//   produto_interesse: text (nullable)
//   modelo_captura: text (nullable)
//   observacoes: text (nullable)
//   proprietario_id: uuid (nullable)
//   lead_score: integer (nullable, default: 0)
//   probability: integer (nullable, default: 0)
//   stage_updated_at: timestamp with time zone (nullable, default: now())
//   last_activity_date: timestamp with time zone (nullable, default: now())
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: documents
//   id: uuid (not null, default: gen_random_uuid())
//   contact_id: uuid (nullable)
//   file_name: text (not null)
//   file_path: text (not null)
//   uploaded_at: timestamp with time zone (not null, default: now())
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
//   feedback: text (nullable)
// Table: quotations
//   id: uuid (not null, default: gen_random_uuid())
//   contact_id: uuid (nullable)
//   tipo_produto: text (not null)
//   dados_cotacao: jsonb (not null, default: '{}'::jsonb)
//   status: text (not null, default: 'pendente'::text)
//   data_criacao: timestamp with time zone (not null, default: now())
// Table: training_progress
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   module_id: text (not null)
//   score: integer (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: user_profiles
//   id: uuid (not null)
//   is_admin: boolean (nullable, default: false)
//   role: text (nullable, default: 'user'::text)
//   created_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: app_notifications
//   PRIMARY KEY app_notifications_pkey: PRIMARY KEY (id)
//   FOREIGN KEY app_notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: configs
//   UNIQUE configs_key_key: UNIQUE (key)
//   PRIMARY KEY configs_pkey: PRIMARY KEY (id)
// Table: contacts
//   PRIMARY KEY contacts_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contacts_proprietario_id_fkey: FOREIGN KEY (proprietario_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: documents
//   FOREIGN KEY documents_contact_id_fkey: FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
//   PRIMARY KEY documents_pkey: PRIMARY KEY (id)
// Table: leads
//   UNIQUE leads_phone_key: UNIQUE (phone)
//   PRIMARY KEY leads_pkey: PRIMARY KEY (id)
// Table: messages
//   CHECK messages_feedback_check: CHECK ((feedback = ANY (ARRAY['positive'::text, 'negative'::text])))
//   FOREIGN KEY messages_lead_id_fkey: FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
//   PRIMARY KEY messages_pkey: PRIMARY KEY (id)
// Table: quotations
//   FOREIGN KEY quotations_contact_id_fkey: FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
//   PRIMARY KEY quotations_pkey: PRIMARY KEY (id)
// Table: training_progress
//   PRIMARY KEY training_progress_pkey: PRIMARY KEY (id)
//   FOREIGN KEY training_progress_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: user_profiles
//   FOREIGN KEY user_profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY user_profiles_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: app_notifications
//   Policy "Authenticated can insert notifications" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Users can update their own notifications" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view their own notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "authenticated_all_notifications" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: configs
//   Policy "anon_select_configs" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "authenticated_all_configs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: contacts
//   Policy "authenticated_all_contacts" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: documents
//   Policy "authenticated_all_documents" (ALL, PERMISSIVE) roles={authenticated}
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
//   Policy "authenticated_select_leads" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_leads" (UPDATE, PERMISSIVE) roles={authenticated}
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
//   Policy "authenticated_select_messages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: quotations
//   Policy "authenticated_all_quotations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: training_progress
//   Policy "Admins can view all training progress" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM user_profiles   WHERE ((user_profiles.id = auth.uid()) AND (user_profiles.is_admin = true))))
//   Policy "Users can insert their own training progress" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can update their own training progress" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view their own training progress" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: user_profiles
//   Policy "authenticated_read_profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

// --- INDEXES ---
// Table: configs
//   CREATE UNIQUE INDEX configs_key_key ON public.configs USING btree (key)
// Table: leads
//   CREATE UNIQUE INDEX leads_phone_key ON public.leads USING btree (phone)
