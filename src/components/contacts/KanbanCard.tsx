import { format } from 'date-fns'
import {
  Mail,
  Sparkles,
  PanelRight,
  FileEdit,
  Phone,
  Calendar,
  CheckSquare,
} from 'lucide-react'
import { Contact } from '@/stores/useContactsStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface KanbanCardProps {
  contact: Contact
  onDragStart: (id: string) => void
  onViewJourney?: (contact: Contact) => void
}

export function KanbanCard({
  contact,
  onDragStart,
  onViewJourney,
}: KanbanCardProps) {
  // Mock activity selection based on contact ID for variety
  const getActivitySnippet = (id: string) => {
    const activities = [
      { text: 'Chamada há 5 horas', icon: Phone, highlight: 'Chamada' },
      { text: 'Reunião em 3 dias', icon: Calendar, highlight: 'Reunião' },
      { text: 'Tarefa há 3 horas', icon: CheckSquare, highlight: 'Tarefa' },
    ]
    const index = parseInt(id.charCodeAt(0).toString()) % activities.length
    return activities[index]
  }

  const activity = getActivitySnippet(contact.id)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(contact.id)}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group animate-fade-in"
    >
      <div className="flex flex-col space-y-3">
        {/* Header: Name */}
        <div>
          <h4 className="font-bold text-[#1e293b] text-[15px] leading-tight hover:text-primary cursor-pointer transition-colors">
            {contact.firstName} {contact.lastName}
          </h4>
        </div>

        {/* Last Contact */}
        <p className="text-xs text-muted-foreground">
          Último contato:{' '}
          {format(new Date(contact.lastActivityDate), 'dd/MM/yyyy')}
        </p>

        <div className="border-t border-gray-100 my-2" />

        {/* Company / Brand */}
        <div className="flex items-center gap-2">
          <img
            src={`https://img.usecurling.com/i?q=${contact.companyName}&size=32`}
            alt={contact.companyName}
            className="w-4 h-4 object-contain opacity-70"
            onError={(e) => {
              // Fallback if image fails
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <span className="text-xs text-muted-foreground font-medium underline decoration-gray-300 underline-offset-2">
            {contact.companyName}
          </span>
        </div>

        {/* Activity Snippet */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
          <span
            className={cn(
              'underline decoration-dotted',
              activity.highlight === 'Chamada' &&
                'decoration-green-400 text-green-700',
              activity.highlight === 'Reunião' &&
                'decoration-blue-400 text-blue-700',
              activity.highlight === 'Tarefa' &&
                'decoration-orange-400 text-orange-700',
            )}
          >
            {activity.highlight}
          </span>
          <span className="text-muted-foreground">
            {activity.text.replace(activity.highlight, '').trim()}
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-1 mt-2 pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-700"
          >
            <PanelRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={() => onViewJourney?.(contact)}
            title="Ver Jornada do Cliente"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-700"
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-700"
          >
            <FileEdit className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
