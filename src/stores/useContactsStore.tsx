import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export type ContactStatus =
  | 'subscriber'
  | 'lead'
  | 'marketing_qualified_lead'
  | 'sales_qualified_lead'
  | 'opportunity'
  | 'customer'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: ContactStatus
  createdAt: Date
  lastActivityDate: Date
  companyName: string
  cpf?: string
  cep?: string
  produto_interesse?: string
  modelo_captura?: string
  observacoes?: string
  proprietario_id?: string
  leadScore?: number
  probability?: number
  stageUpdatedAt?: Date
}

interface ContactsContextType {
  contacts: Contact[]
  addContact: (data: Partial<Contact>) => Promise<void>
  updateContact: (id: string, data: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  refreshContacts: () => Promise<void>
}

const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined,
)

const mapDbToContact = (row: any): Contact => ({
  id: row.id,
  firstName: row.first_name || '',
  lastName: row.last_name || '',
  email: row.email || '',
  phone: row.phone || '',
  status: row.status as ContactStatus,
  createdAt: new Date(row.created_at),
  lastActivityDate: new Date(row.last_activity_date),
  companyName: row.company_name || '',
  cpf: row.cpf,
  cep: row.cep,
  produto_interesse: row.produto_interesse,
  modelo_captura: row.modelo_captura,
  observacoes: row.observacoes,
  proprietario_id: row.proprietario_id,
  leadScore: row.lead_score || 0,
  probability: row.probability || 0,
  stageUpdatedAt: row.stage_updated_at
    ? new Date(row.stage_updated_at)
    : new Date(row.created_at),
})

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const { user } = useAuth()

  const fetchContacts = async () => {
    if (!user) return
    const { data, error } = await supabase
      .schema('crm' as any)
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setContacts(data.map(mapDbToContact))
    }
  }

  useEffect(() => {
    if (!user) {
      setContacts([])
      return
    }

    fetchContacts()

    const channel = supabase
      .channel('crm:contacts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'crm', table: 'contacts' },
        () => {
          fetchContacts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const addContact = async (data: Partial<Contact>) => {
    const { error } = await supabase
      .schema('crm' as any)
      .from('contacts')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName,
        status: data.status || 'subscriber',
        cpf: data.cpf,
        cep: data.cep,
        produto_interesse: data.produto_interesse,
        modelo_captura: data.modelo_captura,
        observacoes: data.observacoes,
        proprietario_id: user?.id,
      })
    if (error) console.error(error)
  }

  const updateContact = async (id: string, data: Partial<Contact>) => {
    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...(data as any) } : c)),
    )

    const updateData: any = {}
    if (data.firstName !== undefined) updateData.first_name = data.firstName
    if (data.lastName !== undefined) updateData.last_name = data.lastName
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.companyName !== undefined)
      updateData.company_name = data.companyName
    if (data.status !== undefined) updateData.status = data.status
    if (data.cpf !== undefined) updateData.cpf = data.cpf
    if (data.cep !== undefined) updateData.cep = data.cep
    if (data.produto_interesse !== undefined)
      updateData.produto_interesse = data.produto_interesse
    if (data.modelo_captura !== undefined)
      updateData.modelo_captura = data.modelo_captura
    if (data.observacoes !== undefined)
      updateData.observacoes = data.observacoes

    const { error } = await supabase
      .schema('crm' as any)
      .from('contacts')
      .update(updateData)
      .eq('id', id)
    if (error) {
      console.error(error)
      fetchContacts() // revert on error
    }
  }

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .schema('crm' as any)
      .from('contacts')
      .delete()
      .eq('id', id)
    if (error) console.error(error)
  }

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        addContact,
        updateContact,
        deleteContact,
        refreshContacts: fetchContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  )
}

export const useContactsStore = () => {
  const context = useContext(ContactsContext)
  if (!context) {
    throw new Error('useContactsStore must be used within a ContactsProvider')
  }
  return context
}

export default useContactsStore
