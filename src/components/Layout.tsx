import { Outlet } from 'react-router-dom'
import { ChatSidebar } from '@/components/ChatSidebar'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RealtimeNotifications } from '@/components/RealtimeNotifications'

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <RealtimeNotifications />

      {/* Desktop Navigation */}
      <div className="hidden md:block h-screen sticky top-0">
        <ChatSidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <img
            src="https://lxfdqudvexpktlesfkro.supabase.co/storage/v1/object/public/Logos/Corretora/Logo%20vertical%20fundo%20azul%20transparente%20site.png"
            alt="Km Zero"
            className="h-10 w-auto object-contain"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px] border-none">
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            <ChatSidebar className="w-full border-none" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden pt-16 md:pt-0 bg-background">
        <Outlet />
      </main>
    </div>
  )
}
