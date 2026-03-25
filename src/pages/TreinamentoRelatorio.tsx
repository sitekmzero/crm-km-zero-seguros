import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Download,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { trainingModules } from '@/lib/training-data'
import { Progress } from '@/components/ui/progress'

export default function TreinamentoRelatorio() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    // Fetch users
    const { data: users } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .eq('status', 'ativo')
    // Fetch progress
    const { data: progress } = await supabase
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

  if (loading) return <div className="p-8">Carregando relatório...</div>

  const fullyTrained = data.filter((d) => d.percent === 100).length
  const notStarted = data.filter((d) => d.percent === 0).length

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background print:p-0 print:bg-white">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/treinamento">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Relatório da Academia
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe o engajamento e certificação da equipe.
            </p>
          </div>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-border shadow-sm bg-blue-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total de Usuários Ativos
              </p>
              <p className="text-3xl font-bold text-[#0B1F3B]">{data.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-green-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Equipe 100% Treinada
              </p>
              <p className="text-3xl font-bold text-green-700">
                {fullyTrained}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm bg-orange-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Ainda Não Iniciaram
              </p>
              <p className="text-3xl font-bold text-orange-700">{notStarted}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle>Progresso Individual</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead className="text-center">Média Quizzes</TableHead>
                <TableHead className="text-right">Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((u, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="font-semibold text-sm text-[#0B1F3B]">
                      {u.full_name || 'Usuário'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {u.email}
                    </div>
                  </TableCell>
                  <TableCell className="w-[300px]">
                    <div className="flex items-center gap-3">
                      <Progress value={u.percent} className="h-2 flex-1" />
                      <span className="text-xs font-bold w-8">
                        {u.percent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {u.avgScore > 0 ? `${u.avgScore}%` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {u.lastActive}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
