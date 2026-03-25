import { Outlet } from 'react-router-dom'
import { ChatSidebar } from '@/components/ChatSidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import logoImg from '@/assets/image.png'

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-[#FDFDFD] font-sans selection:bg-primary/10 selection:text-primary">
      {/* Desktop Navigation - CRM Sidebar only */}
      <div className="hidden md:block h-screen sticky top-0">
        <ChatSidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={logoImg}
            alt="ADAPTΔONE²⁶"
            className="h-5 w-auto object-contain"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <ChatSidebar className="w-full border-none" />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  )
}
