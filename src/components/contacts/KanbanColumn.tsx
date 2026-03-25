import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Contact, ContactStatus } from '@/stores/useContactsStore'
import { KanbanCard } from './KanbanCard'
import { Button } from '@/components/ui/button'

interface KanbanColumnProps {
  id: ContactStatus
  title: string
  contacts: Contact[]
  onDrop: (status: ContactStatus) => void
  onDragStart: (id: string) => void
  onViewJourney?: (contact: Contact) => void
}

export function KanbanColumn({
  id,
  title,
  contacts,
  onDrop,
  onDragStart,
  onViewJourney,
}: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(id)
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full transition-all duration-300 flex-shrink-0 bg-gray-50/50',
        isCollapsed ? 'w-12' : 'w-[300px] min-w-[300px]',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center px-3 py-2 border-y border-r border-gray-200 bg-gray-100/50 h-10 select-none',
          isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {isCollapsed ? (
          <div
            className="h-full w-full flex items-center justify-center cursor-pointer hover:bg-gray-200/50"
            onClick={() => setIsCollapsed(false)}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-600">
                {contacts.length}
              </span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 overflow-hidden">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide truncate">
                {title}
              </h3>
              <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold">
                {contacts.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1 text-gray-400 hover:text-gray-700"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      {/* Drop Area */}
      <div
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-3 border-r border-gray-200 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent transition-colors',
          isDragOver
            ? 'bg-primary/5 ring-inset ring-2 ring-primary/20'
            : 'bg-[#f5f5f5]/30',
          isCollapsed && 'hidden',
        )}
      >
        {contacts.map((contact) => (
          <KanbanCard
            key={contact.id}
            contact={contact}
            onDragStart={onDragStart}
            onViewJourney={onViewJourney}
          />
        ))}
        {contacts.length === 0 && !isCollapsed && (
          <div className="h-24 rounded-lg border-2 border-dashed border-gray-100 flex items-center justify-center text-xs text-gray-400">
            Arraste contatos aqui
          </div>
        )}
      </div>

      {/* Collapsed Vertical Title */}
      {isCollapsed && (
        <div className="flex-1 flex items-center justify-center border-r border-gray-200 bg-[#f5f5f5]/30">
          <span className="transform -rotate-90 whitespace-nowrap text-xs font-bold text-gray-400 tracking-wider">
            {title}
          </span>
        </div>
      )}
    </div>
  )
}
