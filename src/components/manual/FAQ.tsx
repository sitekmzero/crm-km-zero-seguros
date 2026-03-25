import { useState } from 'react'
import { faqData } from '@/lib/data-manual'
import { Input } from '@/components/ui/input'
import { Search, HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Link } from 'react-router-dom'

export function FAQ() {
  const [search, setSearch] = useState('')

  const filtered = faqData.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in font-sans text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#C8A24A] pb-4 mb-8">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-[#0B1F3B]" />
          <h1 className="text-3xl font-bold text-[#0B1F3B]">
            Central de Ajuda (FAQ)
          </h1>
        </div>
        <div className="relative w-full md:w-72 print:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar dúvida ou erro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-gray-300 focus-visible:ring-[#C8A24A]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          Nenhuma dúvida encontrada para sua busca.
        </p>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {filtered.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-gray-200 rounded-lg bg-white px-5 shadow-sm print:shadow-none print:border-b print:rounded-none"
            >
              <AccordionTrigger className="text-[#0B1F3B] font-bold hover:text-[#C8A24A] hover:no-underline text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-700 leading-relaxed pb-6 pt-2 text-base">
                <div
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                  className="mb-5 bg-gray-50 p-4 rounded border border-gray-100 print:bg-white print:border-none print:p-0"
                />
                {faq.links && faq.links.length > 0 && (
                  <div className="mt-2 pt-4 border-t border-gray-100 print:hidden">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Links e Atalhos Úteis
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {faq.links.map((link, j) => (
                        <Link
                          key={j}
                          to={link.url}
                          className="text-sm font-medium text-[#C8A24A] hover:text-[#0B1F3B] hover:underline bg-[#C8A24A]/10 px-3 py-1.5 rounded transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
