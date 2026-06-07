import { useState, useEffect } from 'react'
import { Contact, ContactStatus } from '@/stores/useContactsStore'
import { KanbanColumn } from './KanbanColumn'
import useContactsStore from '@/stores/useContactsStore'
import { useToast } from '@/hooks/use-toast'
import { JourneyModal } from './JourneyModal'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter } from 'lucide-react'

interface ContactsBoardProps {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
  onViewDetails?: (contact: Contact) => void
}

export function ContactsBoard({
  contacts: initialContacts,
  onEdit,
  onViewDetails,
}: ContactsBoardProps) {
  const { updateContact } = useContactsStore()
  const { toast } = useToast()
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null)
  const [viewingContact, setViewingContact] = useState<Contact | null>(null)
  const [localContacts, setLocalContacts] = useState<Contact[]>(initialContacts)
  const [channelFilter, setChannelFilter] = useState<string>('todos')

  // Sincroniza o state local com as props iniciais (ex. ao carregar via fetch)
  useEffect(() => {
    setLocalContacts(initialContacts)
  }, [initialContacts])

  // 2. ASSINATURA REALTIME NO KANBAN (Dashboard):
  useEffect(() => {
    // Inscreve-se nas atualizações das entidades do Kanban (tabela contacts)
    const contactsChannel = supabase
      .channel('contacts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          setLocalContacts((prev) =>
            prev.map((c) =>
              c.id === payload.new.id ? { ...c, ...payload.new } : c,
            ),
          )
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          setLocalContacts((prev) => {
            if (prev.some((c) => c.id === payload.new.id)) return prev
            return [payload.new as Contact, ...prev]
          })
        },
      )
      .subscribe()

    // Inscreve-se nos eventos UPDATE da tabela leads como especificamente solicitado
    const leadsChannel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          // Escuta os updates da tabela leads (caso as entidades fluam para o kanban)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(contactsChannel)
      supabase.removeChannel(leadsChannel)
    }
  }, [])

  const columns: { id: ContactStatus; title: string }[] = [
    { id: 'subscriber', title: 'Assinante' },
    { id: 'lead', title: 'Lead' },
    { id: 'marketing_qualified_lead', title: 'MQL' },
    { id: 'sales_qualified_lead', title: 'SQL' },
    { id: 'opportunity', title: 'Oportunidade' },
    { id: 'customer', title: 'Cliente' },
  ]

  const handleDragStart = (id: string) => {
    setDraggedContactId(id)
  }

  const filteredContacts = localContacts.filter(
    (c) => channelFilter === 'todos' || c.channel === channelFilter,
  )

  const handleDrop = async (status: ContactStatus) => {
    if (draggedContactId) {
      // Optimistic update para mover o cartão de coluna instantaneamente
      setLocalContacts((prev) =>
        prev.map((c) => (c.id === draggedContactId ? { ...c, status } : c)),
      )

      await updateContact(draggedContactId, { status })
      toast({
        title: 'Status atualizado',
        description:
          'O status do contato foi atualizado com sucesso no pipeline.',
        duration: 2000,
      })
      setDraggedContactId(null)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-end px-2 print:hidden">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[180px] h-9 bg-background">
              <SelectValue placeholder="Filtrar por Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Canais</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-1 w-full overflow-x-auto pb-4 items-stretch min-h-[600px] bg-background rounded-md border border-border/50 p-2">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            contacts={filteredContacts.filter((c) => c.status === col.id)}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onViewJourney={setViewingContact}
            onViewDetails={onViewDetails}
          />
        ))}
        <div className="w-4 flex-shrink-0" />
      </div>

      <JourneyModal
        isOpen={!!viewingContact}
        onClose={() => setViewingContact(null)}
        contact={viewingContact}
      />
    </div>
  )
}
