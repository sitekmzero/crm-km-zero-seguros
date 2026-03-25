import {
  Users,
  Building2,
  Briefcase,
  Ticket,
  ShoppingCart,
  ListFilter,
  Inbox,
  Phone,
  CheckSquare,
  Book,
  FileText,
  Scissors,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ChatSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[#FAFAFA] border-r border-border w-[240px]',
        className,
      )}
    >
      {/* CRM Header */}
      <div className="p-4 flex items-center gap-3 h-16 border-b border-border flex-shrink-0 bg-[#FAFAFA]">
        <div className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          ADAPTΔCRM
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-2 space-y-1">
          <NavItem icon={Users} label="Contatos" active />
          <NavItem icon={Building2} label="Empresas" />
          <NavItem icon={Briefcase} label="Negócios" />
          <NavItem icon={Ticket} label="Tickets" />
          <NavItem icon={ShoppingCart} label="Pedidos" />

          <div className="my-4 border-t border-border/50 mx-2" />

          <NavItem icon={ListFilter} label="Segmentos (listas)" />
          <NavItem icon={Inbox} label="Caixa de entrada" />
          <NavItem icon={Phone} label="Chamadas" />
          <NavItem icon={CheckSquare} label="Tarefas" />

          <div className="my-4 border-t border-border/50 mx-2" />

          <NavItem icon={Book} label="Manuais de atividades" />
          <NavItem icon={FileText} label="Modelos de mensagens" />
          <NavItem icon={Scissors} label="Snippets" />
        </div>
      </ScrollArea>

      {/* Bottom Branding */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground text-center flex-shrink-0 bg-[#FAFAFA]">
        ADAPTΔONE²⁶ CRM v2.0
      </div>
    </aside>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: any
  label: string
  active?: boolean
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start gap-3 h-9 font-medium transition-all duration-200 px-3',
        active
          ? 'bg-primary/10 text-primary hover:bg-primary/15 rounded-md'
          : 'text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-md',
      )}
    >
      <Icon
        className={cn('h-4 w-4', active ? 'text-primary' : 'text-gray-400')}
      />
      <span className="truncate">{label}</span>
    </Button>
  )
}
