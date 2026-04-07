import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import {
  Download,
  Users,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Search,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { trainingModules } from '@/lib/training-data'
import { Progress } from '@/components/ui/progress'

export default function TreinamentoRelatorio() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('status', 'ativo')
    const { data: progress } = await supabase
      .schema('crm' as any)
      .from('training_progress')
      .select('*')

    if (users && progress) {
      const report = users
        .map((u) => {
          const userProg = progress.filter(
            (p) => p.user_id === u.id && p.score >= 80,
          )
          const completed = userProg.length
          const total = trainingModules.length
          const avgScore =
            userProg.length > 0
              ? Math.round(
                  userProg.reduce((a, b) => a + b.score, 0) / userProg.length,
                )
              : 0

          return {
            ...u,
            completed,
            total,
            percent: Math.round((completed / total) * 100),
            avgScore,
            lastActive:
              userProg.length > 0
                ? new Date(
                    Math.max(
                      ...userProg.map((p) =>
                        new Date(p.completed_at).getTime(),
                      ),
                    ),
                  ).toLocaleDateString('pt-BR')
                : '-',
          }
        })
        .sort((a, b) => b.percent - a.percent)

      setData(report)
    }
    setLoading(false)
  }

  const handlePrint = () => window.print()

  if (loading)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Sincronizando dados da Academia...
      </div>
    )

  const fullyTrained = data.filter((d) => d.percent === 100).length
  const notStarted = data.filter((d) => d.percent === 0).length
  const abandoned = data.filter((d) => d.percent > 0 && d.percent < 100).length

  const filteredData = data.filter(
    (u) =>
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F2EA] font-sans">
      <div className="h-14 bg-white border-b border-border flex items-center px-6 shadow-sm flex-shrink-0 print:hidden">
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
                <Link to="/treinamento">Academia</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary">
                Relatório de Engajamento
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 print:p-0 print:bg-white">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold text-[#0B1F3B]">
                Relatório de Capacitação
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe o nível de certificação e engajamento da equipe
                comercial.
              </p>
            </div>
            <Button
              onClick={handlePrint}
              className="bg-[#0B1F3B] hover:bg-[#1a365d] text-white"
            >
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
          </div>

          {/* Cabeçalho para Impressão */}
          <div className="hidden print:block text-center border-b-2 border-[#0B1F3B] pb-6 mb-8">
            <h1 className="text-3xl font-bold text-[#0B1F3B] uppercase tracking-wider">
              Relatório de Capacitação Corporativa
            </h1>
            <p className="text-gray-500 mt-2">
              CRM Km Zero Seguros • Gerado em{' '}
              {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-border shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Time Ativo
                    </p>
                    <p className="text-3xl font-bold text-[#0B1F3B]">
                      {data.length}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      100% Treinados
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {fullyTrained}
                    </p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Em Andamento
                    </p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {abandoned}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">
                      Não Iniciaram
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {notStarted}
                    </p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#C8A24A]/30 bg-yellow-50/50 shadow-sm print:break-inside-avoid">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0B1F3B] text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#C8A24A]" /> Ações
                Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                {notStarted > 0 && (
                  <li>
                    <strong>{notStarted} colaboradores</strong> ainda não
                    acessaram a Academia. Recomendamos o envio de um lembrete
                    via sistema interno.
                  </li>
                )}
                {abandoned > 0 && (
                  <li>
                    <strong>{abandoned} colaboradores</strong> iniciaram mas
                    pausaram o treinamento. Verifique se estão com dúvidas
                    técnicas ou operacionais.
                  </li>
                )}
                {fullyTrained === data.length && data.length > 0 && (
                  <li>
                    Toda a equipe está certificada! Excelente trabalho de
                    capacitação e engajamento.
                  </li>
                )}
                {fullyTrained < data.length && (
                  <li>
                    Configure gatilhos na aba de notificações para premiar
                    automaticamente os colaboradores ao atingirem 100% de
                    conclusão.
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border bg-white print:shadow-none print:border-none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4 print:hidden">
              <div>
                <CardTitle className="text-[#0B1F3B]">
                  Progresso Individual
                </CardTitle>
                <CardDescription>
                  Status detalhado por consultor
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar consultor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-gray-50"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-[#0B1F3B]">
                      Colaborador
                    </TableHead>
                    <TableHead className="font-semibold text-[#0B1F3B] w-[30%]">
                      Conclusão EAD
                    </TableHead>
                    <TableHead className="font-semibold text-[#0B1F3B] text-center">
                      Score Médio
                    </TableHead>
                    <TableHead className="font-semibold text-[#0B1F3B] text-right">
                      Último Módulo
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        Nenhum registro encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((u, i) => (
                      <TableRow key={i} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="font-bold text-[#0B1F3B]">
                            {u.full_name || 'Usuário Sem Nome'}
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress
                              value={u.percent}
                              className="h-2.5 flex-1 bg-gray-200"
                            />
                            <span
                              className={cn(
                                'text-xs font-bold w-10',
                                u.percent === 100
                                  ? 'text-green-600'
                                  : 'text-gray-600',
                              )}
                            >
                              {u.percent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              'inline-block px-2 py-1 rounded text-xs font-bold',
                              u.avgScore >= 80
                                ? 'bg-green-100 text-green-700'
                                : u.avgScore > 0
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'text-gray-400',
                            )}
                          >
                            {u.avgScore > 0 ? `${u.avgScore} pts` : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-600 text-sm font-medium">
                          {u.lastActive}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="hidden print:block mt-12 text-center text-xs text-gray-400 border-t pt-4">
            Documento Confidencial - Km Zero Corretora de Seguros
          </div>
        </div>
      </div>
    </div>
  )
}
