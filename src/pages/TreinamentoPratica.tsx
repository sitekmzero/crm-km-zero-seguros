import { useParams, Link } from 'react-router-dom'
import { bestPractices } from '@/lib/training-data'
import { Card, CardContent } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, Lightbulb, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function TreinamentoPratica() {
  const { id } = useParams()
  const practice = bestPractices.find((p) => p.id === id)

  if (!practice) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Prática não encontrada.
      </div>
    )
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
                Boas Práticas
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/treinamento"
            className="inline-flex items-center text-sm font-semibold text-[#0B1F3B] hover:text-[#C8A24A] mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Academia
          </Link>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <div className="h-32 bg-[#0B1F3B] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-black/10" />
              <Lightbulb className="h-16 w-16 text-[#C8A24A] relative z-10" />
            </div>
            <CardContent className="p-8 md:p-10">
              <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3B] mb-4">
                {practice.title}
              </h1>

              <div className="bg-gray-50 border-l-4 border-[#C8A24A] p-5 mb-8 rounded-r-md">
                <p className="text-lg text-gray-700 italic font-medium">
                  "{practice.desc}"
                </p>
              </div>

              <div className="prose prose-lg text-gray-700 max-w-none">
                <h3 className="text-xl font-bold text-[#0B1F3B] flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />{' '}
                  Detalhamento do Procedimento
                </h3>
                <p className="leading-relaxed">{practice.fullContent}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
