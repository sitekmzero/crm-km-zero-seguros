import { useParams, Link } from 'react-router-dom'
import { visualWorkflows } from '@/lib/training-data'
import { Card, CardContent } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { ArrowLeft, Workflow, ChevronRight, ArrowDown } from 'lucide-react'

export default function TreinamentoFluxo() {
  const { id } = useParams()
  const flow = visualWorkflows.find((f) => f.id === id)

  if (!flow) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Fluxo não encontrado.
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
                Fluxos Operacionais
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

          <div className="mb-10 text-center">
            <div className="inline-flex h-16 w-16 bg-white rounded-full items-center justify-center shadow-md border border-gray-100 mb-4">
              <Workflow className="h-8 w-8 text-[#C8A24A]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3B]">
              {flow.title}
            </h1>
            <p className="text-gray-500 mt-2">
              Diagrama de execução operacional em {flow.steps.length} etapas.
            </p>
          </div>

          <div className="space-y-4">
            {flow.steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <Card className="w-full bg-white shadow-sm border border-gray-200 hover:border-[#C8A24A] transition-colors">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#0B1F3B] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#0B1F3B]">
                        {step.name}
                      </h3>
                      <p className="text-gray-600 mt-1">{step.detail}</p>
                    </div>
                  </CardContent>
                </Card>
                {index < flow.steps.length - 1 && (
                  <div className="py-2">
                    <ArrowDown className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
