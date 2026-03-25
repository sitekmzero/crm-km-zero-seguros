import { useState } from 'react'
import { Contact, ContactStatus } from '@/stores/useContactsStore'
import { KanbanColumn } from './KanbanColumn'
import useContactsStore from '@/stores/useContactsStore'
import { useToast } from '@/hooks/use-toast'
import { JourneyModal } from './JourneyModal'

interface ContactsBoardProps {
  contacts: Contact[]
  onEdit: (contact: Contact) => void
  onViewDetails?: (contact: Contact) => void
}

export function ContactsBoard({
  contacts,
  onEdit,
  onViewDetails,
}: ContactsBoardProps) {
  const { updateContact } = useContactsStore()
  const { toast } = useToast()
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null)
  const [viewingContact, setViewingContact] = useState<Contact | null>(null)

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

  const handleDrop = async (status: ContactStatus) => {
    if (draggedContactId) {
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
    <>
      <div className="flex h-full w-full overflow-x-auto pb-4 items-stretch min-h-[600px] bg-background">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            contacts={contacts.filter((c) => c.status === col.id)}
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
    </>
  )
}
