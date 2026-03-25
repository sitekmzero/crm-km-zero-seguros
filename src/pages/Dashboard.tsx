import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  ShieldAlert,
  Trophy,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [metrics, setMetrics] = useState<any>({
    total: 0,
    conv: 0,
    revenue: 0,
    rate: 0,
    goalProg: 0,
  })
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [productData, setProductData] = useState<any[]>([])
  const [ranking, setRanking] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])

  useEffect(() => {
    if (user) fetchData()
  }, [user, isAdmin, period])

  const fetchData = async () => {
    setLoading(true)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    let query = supabase
      .from('contacts')
      .select('status, created_at, produto_interesse, proprietario_id')
      .gte('created_at', startDate.toISOString())
    if (!isAdmin) query = query.eq('proprietario_id', user?.id)

    const { data } = await query
    if (data) {
      const clients = data.filter((c) => c.status === 'customer').length
      const avgTicket = 1200 // Mock value
      const goal = 20 // Fixed goal for demonstration

      setMetrics({
        total: data.length,
        conv: clients,
        revenue: clients * avgTicket,
        rate: data.length > 0 ? Math.round((clients / data.length) * 100) : 0,
        goalProg: Math.min(Math.round((clients / goal) * 100), 100),
      })

      const statusCounts = data.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})
      setFunnelData([
        { name: 'Leads', count: statusCounts['lead'] || 0 },
        { name: 'MQL', count: statusCounts['marketing_qualified_lead'] || 0 },
        { name: 'SQL', count: statusCounts['sales_qualified_lead'] || 0 },
        { name: 'Clientes', count: statusCounts['customer'] || 0 },
      ])

      const prodCounts = data.reduce((acc: any, curr) => {
        if (curr.produto_interesse)
          acc[curr.produto_interesse] = (acc[curr.produto_interesse] || 0) + 1
        return acc
      }, {})
      setProductData(
        Object.entries(prodCounts).map(([name, value]) => ({ name, value })),
      )

      if (isAdmin) {
        const { data: profs } = await supabase
          .from('user_profiles')
          .select('id, full_name')
        const rankMap: any = {}
        data.forEach((c) => {
          if (!c.proprietario_id) return
          if (!rankMap[c.proprietario_id])
            rankMap[c.proprietario_id] = {
              leads: 0,
              convs: 0,
              name:
                profs?.find((p) => p.id === c.proprietario_id)?.full_name ||
                'Usuário',
            }
          rankMap[c.proprietario_id].leads++
          if (c.status === 'customer') rankMap[c.proprietario_id].convs++
        })
        setRanking(
          Object.values(rankMap).sort((a: any, b: any) => b.convs - a.convs),
        )
      }
    }

    const next30 = new Date()
    next30.setDate(next30.getDate() + 30)
    const { data: pol } = await supabase
      .from('policies')
      .select('*, contacts(first_name)')
      .lte('expiration_date', next30.toISOString())
    if (pol) setPolicies(pol)

    setLoading(false)
  }

  const handleExport = () => window.print()

  if (loading)
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    )

  const COLORS = [
    'hsl(var(--primary))',
    '#3b82f6',
    '#f59e0b',
    '#10b981',
    '#6366f1',
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background print:p-0 print:bg-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Estratégico
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Visão Consolidada da Equipe' : 'Meu Progresso e Metas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExport}
            className="bg-[#0B1F3B] hover:bg-[#0B1F3B]/90 text-white"
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Novos Leads"
          value={metrics.total}
          desc="No período selecionado"
          icon={Users}
        />
        <MetricCard
          title="Conversões"
          value={metrics.conv}
          desc={`${metrics.rate}% de taxa de conversão`}
          icon={Target}
        />
        <MetricCard
          title="Receita Gerada"
          value={`R$ ${metrics.revenue.toLocaleString('pt-BR')}`}
          desc="Ticket médio R$ 1.200"
          icon={DollarSign}
        />
        <MetricCard
          title="Meta de Vendas"
          value={`${metrics.goalProg}%`}
          desc={`${metrics.conv} / 20 esperadas`}
          icon={TrendingUp}
          progress={metrics.goalProg}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{ count: { label: 'Contatos', color: '#C8A24A' } }}
              className="h-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle>Por Produto</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {productData.length === 0 ? (
              <p className="text-muted-foreground">Sem dados.</p>
            ) : (
              <ChartContainer config={{}} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {productData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {isAdmin && (
          <Card className="shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" /> Ranking da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {ranking.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {i + 1}º
                      </div>
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.leads} leads recebidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {r.convs} Vendas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="bg-red-50/50 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-lg text-red-700">
              <ShieldAlert className="h-5 w-5" /> Renovações Próximas (30 dias)
            </CardTitle>
            <CardDescription>
              Apólices que precisam de contato imediato.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
              {policies.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Nenhuma apólice vencendo.
                </div>
              ) : (
                policies.map((p, i) => (
                  <div
                    key={i}
                    className="p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        {p.contacts?.first_name}{' '}
                        <span className="text-muted-foreground font-normal">
                          ({p.product_type})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Apólice: {p.policy_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {format(new Date(p.expiration_date), 'dd/MM/yyyy')}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 mt-1 text-xs"
                      >
                        Renovar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, desc, icon: Icon, progress }: any) {
  return (
    <Card className="border-border shadow-sm print:break-inside-avoid">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-[#C8A24A]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#0B1F3B]">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        {progress !== undefined && (
          <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
