import { useState } from 'react'
import { glossaryData } from '@/lib/data-manual'
import { Input } from '@/components/ui/input'
import { Search, BookA } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function Glossary() {
  const [search, setSearch] = useState('')

  const filtered = glossaryData.filter(
    (g) =>
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.definition.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in font-sans text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#C8A24A] pb-4 mb-8">
        <div className="flex items-center gap-3">
          <BookA className="h-8 w-8 text-[#0B1F3B]" />
          <h1 className="text-3xl font-bold text-[#0B1F3B]">
            Glossário Técnico
          </h1>
        </div>
        <div className="relative w-full md:w-72 print:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar termo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-gray-300 focus-visible:ring-[#C8A24A]"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Nenhum termo encontrado.
          </p>
        ) : (
          filtered.map((item, i) => (
            <Card
              key={i}
              className="border-border shadow-sm print:shadow-none print:border-b print:rounded-none"
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#0B1F3B] mb-2">
                  {item.term}
                </h3>
                <p className="text-gray-700 mb-4 text-base">
                  {item.definition}
                </p>
                <div className="bg-gray-50 p-4 rounded-md text-sm border border-gray-200 print:bg-white print:border-gray-300">
                  <p className="mb-2">
                    <strong className="text-[#C8A24A] uppercase tracking-wider text-[10px]">
                      Contexto no CRM:
                    </strong>
                    <br />
                    <span className="text-gray-800">{item.context}</span>
                  </p>
                  <p>
                    <strong className="text-[#0B1F3B] uppercase tracking-wider text-[10px]">
                      Exemplo de uso:
                    </strong>
                    <br />
                    <span className="text-gray-800">{item.example}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
