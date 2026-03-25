import { createContext, useContext, useState, ReactNode } from 'react'

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
}

interface ContactsContextType {
  contacts: Contact[]
  addContact: (
    contact: Omit<
      Contact,
      'id' | 'createdAt' | 'lastActivityDate' | 'companyName'
    > & { companyName?: string },
  ) => void
  updateContact: (
    id: string,
    data: Partial<Omit<Contact, 'id' | 'createdAt'>>,
  ) => void
  deleteContact: (id: string) => void
}

const ContactsContext = createContext<ContactsContextType | undefined>(
  undefined,
)

const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'Brian',
    lastName: 'Halligan (Sample Contact)',
    email: 'brian@hubspot.com',
    phone: '555-0100',
    status: 'lead',
    createdAt: new Date('2026-01-15'),
    lastActivityDate: new Date('2026-01-22T10:00:00'),
    companyName: 'HubSpot',
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Johnson (Sample Contact)',
    email: 'maria@hubspot.com',
    phone: '555-0101',
    status: 'lead',
    createdAt: new Date('2026-01-18'),
    lastActivityDate: new Date('2026-01-22T14:30:00'),
    companyName: 'HubSpot',
  },
]

export const ContactsProvider = ({ children }: { children: ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS)

  const addContact = (
    data: Omit<
      Contact,
      'id' | 'createdAt' | 'lastActivityDate' | 'companyName'
    > & { companyName?: string },
  ) => {
    const newContact: Contact = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      lastActivityDate: new Date(),
      companyName: data.companyName || 'ADAPTΔCRM',
    }
    setContacts((prev) => [newContact, ...prev])
  }

  const updateContact = (
    id: string,
    data: Partial<Omit<Contact, 'id' | 'createdAt'>>,
  ) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, ...data } : contact,
      ),
    )
  }

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
  }

  return (
    <ContactsContext.Provider
      value={{ contacts, addContact, updateContact, deleteContact }}
    >
      {children}
    </ContactsContext.Provider>
  )
}

const useContactsStore = () => {
  const context = useContext(ContactsContext)
  if (!context) {
    throw new Error('useContactsStore must be used within a ContactsProvider')
  }
  return context
}

export default useContactsStore
