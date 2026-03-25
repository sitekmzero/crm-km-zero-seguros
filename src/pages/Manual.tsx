import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Download, ChevronRight } from 'lucide-react'
import { manualSectionsData } from '@/lib/data-manual'
import { Glossary } from '@/components/manual/Glossary'
import { FAQ } from '@/components/manual/FAQ'
import { ManualSidebar } from '@/components/manual/ManualSidebar'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Manual() {
  const { section } = useParams()
  const [feedback, setFeedback] = useState('')
  const { toast } = useToast()

  const currentSection = section || 'inicio'
  const dataBlock = manualSectionsData.find((s) => s.id === currentSection)

  const handleFeedback = async () => {
    if (!feedback.trim()) return
    const { error } = await supabase
      .from('manual_feedback')
      .insert({ pagina: currentSection, mensagem: feedback })
    if (!error) {
      toast({
        title: 'Obrigado!',
        description: 'Seu feedback editorial foi enviado.',
      })
      setFeedback('')
    }
  }

  const renderContent = () => {
    if (currentSection === 'glossario') return <Glossary />
    if (currentSection === 'faq') return <FAQ />
    if (dataBlock) {
      return (
        <div className="space-y-6 animate-fade-in font-sans text-gray-800">
          <div className="flex items-center gap-3 border-b-2 border-[#C8A24A] pb-4 mb-8">
            <dataBlock.icon className="h-8 w-8 text-[#0B1F3B]" />
            <h1 className="text-3xl font-bold text-[#0B1F3B]">
              {dataBlock.title}
            </h1>
          </div>
          {dataBlock.content}
        </div>
      )
    }
    return (
      <div className="text-center py-20 text-muted-foreground">
        Seção não encontrada.
      </div>
    )
  }

  const titleForBreadcrumb =
    currentSection === 'glossario'
      ? 'Glossário'
      : currentSection === 'faq'
        ? 'FAQ'
        : dataBlock?.title || 'Início'

  return (
    <div className="flex h-full w-full bg-[#F5F2EA] font-sans selection:bg-[#C8A24A]/30">
      <ManualSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="h-14 bg-white border-b border-border flex items-center px-6 justify-between flex-shrink-0 print:hidden shadow-sm">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/manual/inicio">Manual</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-primary">
                  {titleForBreadcrumb}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="gap-2 text-[#0B1F3B] border-[#0B1F3B] hover:bg-[#0B1F3B] hover:text-white"
          >
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 print:p-0">
          <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-elevation print:shadow-none min-h-[700px] print:w-full print:p-0">
            {/* Header for print only */}
            <div className="hidden print:flex items-center gap-4 mb-8 pb-4 border-b border-gray-200">
              <img
                src="https://idtvwxzbmnqjcyxquqdk.supabase.co/storage/v1/object/public/Imagem/Logo%20km%20zero%20fundo%20branco%20transparente%20site.svg"
                alt="Logo"
                className="h-10"
              />
              <div>
                <h2 className="font-bold text-[#0B1F3B]">
                  Manual Consultivo Km Zero
                </h2>
                <p className="text-xs text-gray-500">
                  Documento Oficial - Atualizado em{' '}
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {renderContent()}

            <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400 print:bottom-0 print:w-full">
              <span>
                © {new Date().getFullYear()} Km Zero Seguros. Uso interno
                exclusivo.
              </span>
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://crm-kmzero.goskip.app/manual&bgcolor=ffffff&color=0B1F3B"
                alt="QR"
                className="h-12 w-12 border p-1 rounded print:hidden"
              />
            </div>
          </div>
        </div>

        {/* Feedback Widget */}
        <div className="absolute bottom-8 right-8 print:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="shadow-2xl rounded-full h-14 w-14 p-0 bg-[#C8A24A] hover:bg-[#b08d40] text-white font-bold text-xl ring-4 ring-white">
                ?
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-5 border-[#C8A24A]/30 shadow-xl"
            >
              <h4 className="font-bold mb-1 text-[#0B1F3B] text-lg">
                Sugerir Melhoria
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                A documentação pode melhorar? Deixe seu feedback editorial.
              </p>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Ex: Faltou explicar a tela de consórcio..."
                className="text-sm mb-3 bg-muted/50 border-border focus-visible:ring-[#C8A24A]"
                rows={4}
              />
              <Button
                onClick={handleFeedback}
                className="w-full bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 font-bold"
              >
                Enviar Contribuição
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
