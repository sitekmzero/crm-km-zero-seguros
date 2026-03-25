import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Link } from 'react-router-dom'
import { ChevronRight, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const SAMPLE_DATA: Record<string, string> = {
  nome_cliente: 'João Silva',
  email_cliente: 'joao@exemplo.com',
  telefone_cliente: '(11) 99999-9999',
  produto: 'Seguro Auto Completo',
  valor_cotacao: '2.450,00',
  data_proposta: '25/10/2023',
  link_cotacao: 'https://kmzero.com/proposta/123',
  nome_vendedor: 'Seu Nome',
}

export default function ExemplosTemplates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await supabase
        .from('email_templates')
        .select('*')
        .eq('status', 'publicado')
        .order('name')
      if (data) setTemplates(data)
      setLoading(false)
    }
    fetchTemplates()
  }, [])

  const renderPreview = (text: string) => {
    let preview = text.replace(/\n/g, '<br/>')
    Object.keys(SAMPLE_DATA).forEach((key) => {
      preview = preview.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        `<strong style="color: #C8A24A;">${SAMPLE_DATA[key]}</strong>`,
      )
    })
    return preview
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F2EA] font-sans">
      <div className="h-14 bg-white border-b border-border flex items-center px-6 shadow-sm flex-shrink-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/treinamento">Academia</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary">
                Galeria de Templates
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/treinamento"
            className="inline-flex items-center text-sm font-semibold text-[#0B1F3B] hover:text-[#C8A24A] mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Academia
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#0B1F3B] flex items-center gap-3">
              <Mail className="h-8 w-8 text-[#C8A24A]" /> Galeria de Templates
              Oficiais
            </h1>
            <p className="text-gray-600 mt-2">
              Modelos de alta conversão pré-configurados pela equipe de
              administração. Estes templates são utilizados nas automações e
              disparos diários para garantir comunicação profissional.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">
              Sincronizando biblioteca de templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
              Nenhum template publicado no momento. Solicite ao administrador a
              configuração inicial.
            </div>
          ) : (
            <div className="space-y-8">
              {templates.map((t) => (
                <Card
                  key={t.id}
                  className="overflow-hidden border-none shadow-md bg-white"
                >
                  <div className="bg-[#0B1F3B] p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">{t.name}</h3>
                    <Badge
                      variant="outline"
                      className="text-white border-white/30 bg-white/10 shadow-none"
                    >
                      Oficial Km Zero
                    </Badge>
                  </div>
                  <CardContent className="p-0 grid md:grid-cols-2">
                    <div className="p-6 border-r border-gray-100 bg-gray-50/50">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Informações do Template
                      </h4>

                      <div className="space-y-4 text-sm">
                        <div>
                          <strong className="block text-[#0B1F3B] mb-1">
                            Assunto Padrão:
                          </strong>
                          <div className="bg-white p-3 border rounded-md text-gray-700 shadow-sm">
                            {t.subject}
                          </div>
                        </div>

                        <div>
                          <strong className="block text-[#0B1F3B] mb-2">
                            Variáveis Utilizadas (Preenchimento Automático):
                          </strong>
                          <div className="flex flex-wrap gap-2">
                            {t.variables_used?.map((v: string) => (
                              <Badge
                                key={v}
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border-blue-100 shadow-none"
                              >
                                {`{{${v}}}`}
                              </Badge>
                            ))}
                            {(!t.variables_used ||
                              t.variables_used.length === 0) && (
                              <span className="text-gray-400 italic">
                                Nenhuma variável dinâmica
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-5 border-t border-gray-200 mt-6">
                          <p className="text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            Este modelo está otimizado para não cair na caixa de
                            spam e gerar engajamento rápido através das
                            automações do sistema.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        Pré-visualização Renderizada
                      </h4>
                      <div
                        className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-sm text-gray-800 leading-relaxed shadow-inner min-h-[200px]"
                        dangerouslySetInnerHTML={{
                          __html: renderPreview(t.body),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
