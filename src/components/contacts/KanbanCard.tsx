import { format } from 'date-fns'
import {
  Mail,
  Sparkles,
  PanelRight,
  Phone,
  CheckSquare,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Contact } from '@/stores/useContactsStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface KanbanCardProps {
  contact: Contact
  onDragStart: (id: string) => void
  onViewJourney?: (contact: Contact) => void
  onViewDetails?: (contact: Contact) => void
}

export function KanbanCard({
  contact,
  onDragStart,
  onViewJourney,
  onViewDetails,
}: KanbanCardProps) {
  const getActivitySnippet = (id: string) => {
    const activities = [
      { text: 'Novo contato recebido', icon: Sparkles, highlight: 'Novo' },
      { text: 'Aguardando contato', icon: Phone, highlight: 'Aguardando' },
      { text: 'Tarefa pendente', icon: CheckSquare, highlight: 'Tarefa' },
    ]
    const index =
      parseInt(id.replace(/\D/g, '') || '0') % activities.length || 0
    return activities[index]
  }

  const activity = getActivitySnippet(contact.id)

  const score = contact.leadScore || 0
  const scoreColor =
    score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  const daysInStage = Math.floor(
    (new Date().getTime() -
      (contact.stageUpdatedAt?.getTime() || contact.createdAt.getTime())) /
      (1000 * 3600 * 24),
  )

  return (
    <div
      draggable
      onDragStart={() => onDragStart(contact.id)}
      className="bg-card p-4 rounded-lg shadow-sm border border-border cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30 transition-all group animate-fade-in relative overflow-hidden"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${scoreColor} opacity-70`}
      ></div>
      <div className="flex flex-col space-y-3 pl-1">
        <div className="flex justify-between items-start">
          <div>
            <h4
              className="font-bold text-foreground text-[15px] leading-tight hover:text-primary cursor-pointer transition-colors"
              onClick={() => onViewDetails?.(contact)}
            >
              {contact.firstName} {contact.lastName}
            </h4>
            {contact.produto_interesse && (
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider mt-1 block">
                {contact.produto_interesse}
              </span>
            )}
          </div>

          {contact.proprietario_id && (
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${contact.proprietario_id}`}
                  />
                  <AvatarFallback className="text-[8px]">V</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>Vendedor Responsável</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
              <TrendingUp className="h-3 w-3" />
              <span className="font-medium">{contact.probability || 0}%</span>
            </TooltipTrigger>
            <TooltipContent>Probabilidade de Conversão</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded-md">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{daysInStage}d</span>
            </TooltipTrigger>
            <TooltipContent>Dias neste estágio</TooltipContent>
          </Tooltip>
        </div>

        <div className="border-t border-border my-1" />

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <activity.icon className="h-3.5 w-3.5" />
          <span
            className={cn(
              'font-medium',
              activity.highlight === 'Novo' && 'text-primary',
              activity.highlight === 'Aguardando' && 'text-blue-600',
              activity.highlight === 'Tarefa' && 'text-orange-600',
            )}
          >
            {activity.highlight}
          </span>
          <span className="truncate">
            {activity.text.replace(activity.highlight, '').trim()}
          </span>
        </div>

        <div className="flex items-center justify-end gap-1 mt-2 pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => onViewDetails?.(contact)}
            title="Ver Detalhes"
          >
            <PanelRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={() => onViewJourney?.(contact)}
            title="Ver Jornada do Cliente"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Mail className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
