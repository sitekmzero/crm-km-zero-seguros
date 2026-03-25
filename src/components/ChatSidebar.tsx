import {
  Users,
  LayoutDashboard,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  FolderOpen,
  BookOpen,
  Ticket,
  GraduationCap,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function ChatSidebar({ className }: { className?: string }) {
  const location = useLocation()
  const { signOut, isAdmin } = useAuth()

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border w-[240px] text-sidebar-foreground print:hidden',
        className,
      )}
    >
      <div className="p-4 flex items-center justify-center h-20 border-b border-sidebar-border flex-shrink-0 bg-sidebar-accent/30">
        <img
          src="https://idtvwxzbmnqjcyxquqdk.supabase.co/storage/v1/object/public/Imagem/Logo%20km%20zero%20fundo%20branco%20transparente%20site.svg"
          alt="Km Zero Seguros"
          className="h-10 w-auto object-contain transition-transform hover:scale-105 cursor-pointer"
        />
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          <NavItem
            to="/"
            icon={Users}
            label="Contatos"
            active={location.pathname === '/'}
          />
          <NavItem
            to="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={location.pathname === '/dashboard'}
          />
          <NavItem
            to="/quotations"
            icon={Ticket}
            label="Cotações"
            active={location.pathname === '/quotations'}
          />
          <NavItem
            to="/documents"
            icon={FolderOpen}
            label="Documentos"
            active={location.pathname === '/documents'}
          />
          <NavItem
            to="/reports"
            icon={FileText}
            label="Relatórios"
            active={location.pathname === '/reports'}
          />
          <div className="my-4 border-t border-sidebar-border mx-2" />
          <NavItem
            to="/treinamento"
            icon={GraduationCap}
            label="Treinamento (EAD)"
            active={location.pathname.startsWith('/treinamento')}
          />
          <NavItem
            to="/manual"
            icon={BookOpen}
            label="Manual do CRM"
            active={location.pathname === '/manual'}
          />
          <NavItem
            to="/settings"
            icon={SettingsIcon}
            label="Configurações"
            active={location.pathname === '/settings'}
          />
          {isAdmin && (
            <NavItem
              to="/diagnostico"
              icon={Activity}
              label="Diagnóstico 360"
              active={location.pathname === '/diagnostico'}
            />
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Sair</span>
        </Button>
      </div>
    </aside>
  )
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string
  icon: any
  label: string
  active?: boolean
}) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        'w-full justify-start gap-3 h-10 font-medium transition-all duration-200 px-3',
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90'
          : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md',
      )}
    >
      <Link to={to}>
        <Icon
          className={cn(
            'h-4 w-4',
            active ? 'text-sidebar-primary-foreground' : 'opacity-70',
          )}
        />
        <span className="truncate">{label}</span>
      </Link>
    </Button>
  )
}
