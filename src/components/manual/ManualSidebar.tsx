import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { manualSectionsData } from '@/lib/data-manual'
import { BookA, HelpCircle } from 'lucide-react'

export function ManualSidebar() {
  const location = useLocation()

  return (
    <div className="w-[260px] border-r border-border bg-white h-full flex flex-col print:hidden shadow-sm flex-shrink-0">
      <div className="h-14 border-b border-border flex items-center px-6 font-bold text-[#0B1F3B] bg-gray-50/50">
        Navegação do Manual
      </div>
      <ScrollArea className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {manualSectionsData.map((sec) => {
            const isActive = location.pathname.includes(sec.id)
            return (
              <Link
                key={sec.id}
                to={`/manual/${sec.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0B1F3B] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#0B1F3B]',
                )}
              >
                <sec.icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-[#C8A24A]' : 'text-gray-400',
                  )}
                />
                {sec.title}
              </Link>
            )
          })}
          <div className="my-4 border-t border-border mx-3" />
          <Link
            to="/manual/glossario"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname.includes('glossario')
                ? 'bg-[#C8A24A] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#C8A24A]',
            )}
          >
            <BookA
              className={cn(
                'h-4 w-4',
                location.pathname.includes('glossario')
                  ? 'text-white'
                  : 'text-gray-400',
              )}
            />
            Glossário Técnico
          </Link>
          <Link
            to="/manual/faq"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname.includes('faq')
                ? 'bg-[#C8A24A] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#C8A24A]',
            )}
          >
            <HelpCircle
              className={cn(
                'h-4 w-4',
                location.pathname.includes('faq')
                  ? 'text-white'
                  : 'text-gray-400',
              )}
            />
            FAQ / Ajuda
          </Link>
        </div>
      </ScrollArea>
    </div>
  )
}
