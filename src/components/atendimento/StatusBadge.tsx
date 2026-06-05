import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatusBadge({
  status,
  aiActive,
}: {
  status: string
  aiActive: boolean
}) {
  const map: Record<string, { label: string; className: string }> = {
    novo: {
      label: 'Novo',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    seguro_qualificado: {
      label: 'Seguro',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    consorcio_qualificado: {
      label: 'Consórcio',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    financiamento_qualificado: {
      label: 'Financiam.',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    em_atendimento_humano: {
      label: 'Atend.',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    perdido: {
      label: 'Perdido',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  }
  const badge = map[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-sm border font-medium whitespace-nowrap',
          badge.className,
        )}
      >
        {badge.label}
      </span>
      {aiActive && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-sm border bg-indigo-100 text-indigo-800 border-indigo-200 font-medium flex items-center gap-1 whitespace-nowrap">
          <Bot className="h-3 w-3" /> IA
        </span>
      )}
    </div>
  )
}
