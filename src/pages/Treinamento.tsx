import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  GraduationCap,
  PlayCircle,
  CheckCircle,
  Award,
  BarChart,
  ChevronRight,
  Lightbulb,
  Workflow,
  Printer,
} from 'lucide-react'
import {
  trainingModules,
  bestPractices,
  visualWorkflows,
} from '@/lib/training-data'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

export default function Treinamento() {
  const { user, isAdmin } = useAuth()
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('trilhas')

  useEffect(() => {
    if (user) {
      supabase
        .from('training_progress')
        .select('module_id')
        .eq('user_id', user.id)
        .gte('score', 80)
        .then(({ data }) => {
          if (data) setCompletedModules(data.map((d) => d.module_id))
        })
    }
  }, [user])

  const progressPercentage =
    Math.round((completedModules.length / trainingModules.length) * 100) || 0
  const isFullyCertified = progressPercentage === 100

  const handlePrint = () => {
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F2EA] font-sans">
      <div className="h-14 bg-white border-b border-border flex items-center px-6 print:hidden shadow-sm">
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
              <BreadcrumbPage className="font-semibold text-primary">
                Academia
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 print:p-0 print:bg-white">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-end print:hidden">
            <div>
              <h1 className="text-3xl font-bold text-[#0B1F3B] flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-[#C8A24A]" /> Academia Km
                Zero
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Trilhas de capacitação EAD, guias práticos e certificação.
              </p>
            </div>
            {isAdmin && (
              <Link to="/treinamento/relatorio">
                <Button
                  variant="outline"
                  className="border-[#0B1F3B] text-[#0B1F3B] hover:bg-[#0B1F3B] hover:text-white font-semibold"
                >
                  <BarChart className="h-4 w-4 mr-2" /> Relatório da Equipe
                </Button>
              </Link>
            )}
          </div>

          <Card className="bg-[#0B1F3B] text-white border-none shadow-xl print:hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 w-full space-y-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award className="h-6 w-6 text-[#C8A24A]" /> Progresso de
                  Certificação: {progressPercentage}%
                </h3>
                <Progress
                  value={progressPercentage}
                  className="h-4 bg-white/20"
                />
                <p className="text-sm text-gray-300">
                  {completedModules.length} de {trainingModules.length} módulos
                  concluídos. Complete 100% para emitir seu certificado digital.
                </p>
              </div>
              <div>
                <Button
                  onClick={handlePrint}
                  disabled={!isFullyCertified}
                  className={cn(
                    'font-bold h-12 px-8 text-lg transition-colors',
                    isFullyCertified
                      ? 'bg-[#C8A24A] hover:bg-[#b08d40] text-white'
                      : 'bg-white/10 text-white/50 cursor-not-allowed',
                  )}
                >
                  <Printer className="mr-2 h-5 w-5" /> Gerar Certificado
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="print:hidden"
          >
            <TabsList className="bg-white border border-border p-1 w-full max-w-md h-auto grid grid-cols-3 shadow-sm rounded-lg">
              <TabsTrigger
                value="trilhas"
                className="py-2 data-[state=active]:bg-[#0B1F3B] data-[state=active]:text-white"
              >
                Trilhas
              </TabsTrigger>
              <TabsTrigger
                value="praticas"
                className="py-2 data-[state=active]:bg-[#0B1F3B] data-[state=active]:text-white"
              >
                Práticas
              </TabsTrigger>
              <TabsTrigger
                value="fluxos"
                className="py-2 data-[state=active]:bg-[#0B1F3B] data-[state=active]:text-white"
              >
                Fluxos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trilhas" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                {trainingModules.map((mod, i) => {
                  const isCompleted = completedModules.includes(mod.id)
                  const isLocked =
                    i > 0 &&
                    !completedModules.includes(trainingModules[i - 1].id)

                  return (
                    <Card
                      key={mod.id}
                      className={cn(
                        'flex flex-col border-border shadow-elevation transition-all',
                        isLocked && 'opacity-50 grayscale',
                      )}
                    >
                      <CardHeader className="pb-4 border-b border-border/50 bg-gray-50/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0B1F3B]/10 text-[#0B1F3B] px-2 py-1 rounded">
                            {mod.level}
                          </span>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <CardTitle className="text-xl text-[#0B1F3B] leading-tight">
                          {mod.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5 flex-1 flex flex-col justify-between">
                        <p className="text-sm text-muted-foreground mb-6">
                          Duração: {mod.duration}. Inclui vídeo aula e quiz
                          avaliativo.
                        </p>
                        <Button
                          asChild
                          disabled={isLocked}
                          className={cn(
                            'w-full font-bold',
                            isCompleted
                              ? 'bg-white text-[#0B1F3B] border border-[#0B1F3B] hover:bg-gray-50'
                              : 'bg-[#0B1F3B] text-white hover:bg-[#1a365d]',
                          )}
                        >
                          <Link to={`/treinamento/modulo/${mod.id}`}>
                            <PlayCircle className="h-4 w-4 mr-2" />{' '}
                            {isCompleted ? 'Revisar Conteúdo' : 'Iniciar Aula'}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="praticas" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bestPractices.map((bp) => (
                  <Link
                    key={bp.id}
                    to={`/treinamento/pratica/${bp.id}`}
                    className="block group"
                  >
                    <Card className="h-full border-border shadow-sm hover:border-[#C8A24A] hover:shadow-md transition-all bg-white">
                      <CardContent className="p-6">
                        <Lightbulb className="h-8 w-8 text-[#C8A24A] mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-[#0B1F3B] text-lg mb-2">
                          {bp.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bp.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fluxos" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {visualWorkflows.map((wf) => (
                  <Link
                    key={wf.id}
                    to={`/treinamento/fluxo/${wf.id}`}
                    className="block"
                  >
                    <Card className="border-border shadow-sm hover:border-[#0B1F3B] transition-colors bg-white">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <Workflow className="h-6 w-6 text-[#0B1F3B] mb-2" />
                          <h3 className="font-bold text-[#0B1F3B]">
                            {wf.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {wf.steps.length} etapas visuais
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Print Certificate Template - Visível apenas na impressão */}
          {isFullyCertified && (
            <div
              className="hidden print:flex flex-col items-center justify-center w-[297mm] h-[210mm] border-[15px] border-[#0B1F3B] p-12 relative bg-white"
              style={{ pageBreakAfter: 'always', margin: 0 }}
            >
              <div className="absolute inset-0 border-[3px] border-[#C8A24A] m-3 pointer-events-none" />
              <img
                src="https://idtvwxzbmnqjcyxquqdk.supabase.co/storage/v1/object/public/Imagem/Logo%20km%20zero%20fundo%20branco%20transparente%20site.svg"
                alt="Logo"
                className="h-24 mb-10"
              />
              <h1 className="text-6xl font-serif font-bold text-[#0B1F3B] mb-4 uppercase tracking-[0.2em] text-center">
                Certificado
              </h1>
              <h2 className="text-3xl text-[#C8A24A] mb-16 uppercase tracking-wider font-semibold">
                Excellence in CRM Operations
              </h2>
              <p className="text-xl text-gray-600 mb-6 italic">Conferido a</p>
              <p className="text-5xl font-bold text-[#0B1F3B] mb-8 border-b-2 border-gray-200 pb-4 px-16 text-center w-full max-w-3xl">
                {user?.user_metadata?.name ||
                  user?.email ||
                  'Profissional Certificado'}
              </p>
              <p className="text-xl text-gray-700 max-w-4xl text-center mb-20 leading-relaxed">
                Por concluir com êxito e aprovação o programa completo de
                capacitação operacional do sistema CRM Km Zero Seguros,
                atestando alto nível de proficiência em Gestão de Leads,
                Automações e Pipeline de Vendas.
              </p>
              <div className="flex justify-between w-full max-w-3xl mt-auto">
                <div className="text-center">
                  <div className="border-t border-[#0B1F3B] w-64 mb-3"></div>
                  <p className="text-base font-bold text-[#0B1F3B] uppercase tracking-wider">
                    Diretoria Operacional
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-t border-[#0B1F3B] w-64 mb-3"></div>
                  <p className="text-base font-bold text-[#0B1F3B] uppercase tracking-wider">
                    Data de Certificação
                  </p>
                  <p className="text-lg">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 text-xs text-gray-400 font-mono">
                Autenticação: {user?.id.split('-')[0].toUpperCase()}-
                {Date.now().toString(16).toUpperCase()}-KMZ
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
