import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, DollarSign, Target, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalContacts: 0,
    newLeads: 0,
    conversions: 0,
    estimatedRevenue: 0,
    avgScore: 0,
  })
  const [funnelData, setFunnelData] = useState<any[]>([])

  useEffect(() => {
    if (user) fetchDashboardData()
  }, [user, isAdmin])

  const fetchDashboardData = async () => {
    // Check localStorage cache first
    const cacheKey = `dash_data_${user?.id}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < 300000) {
        // 5 mins cache
        setMetrics(parsed.metrics)
        setFunnelData(parsed.funnelData)
        setLoading(false)
      }
    }

    let query = supabase
      .from('contacts')
      .select('status, created_at, produto_interesse, lead_score')
    if (!isAdmin) query = query.eq('proprietario_id', user?.id)

    const { data } = await query

    if (data) {
      const thisMonth = new Date().getMonth()
      const newLeads = data.filter(
        (c) => new Date(c.created_at).getMonth() === thisMonth,
      ).length
      const clients = data.filter((c) => c.status === 'customer').length

      const scoreSum = data.reduce(
        (acc, curr) => acc + (curr.lead_score || 0),
        0,
      )
      const avgScore = data.length > 0 ? Math.round(scoreSum / data.length) : 0

      const newMetrics = {
        totalContacts: data.length,
        newLeads,
        conversions: clients,
        estimatedRevenue: clients * 1200,
        avgScore,
      }

      const statusCounts = data.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})

      const newFunnel = [
        { name: 'Assinantes', count: statusCounts['subscriber'] || 0 },
        { name: 'Leads', count: statusCounts['lead'] || 0 },
        { name: 'MQL', count: statusCounts['marketing_qualified_lead'] || 0 },
        { name: 'SQL', count: statusCounts['sales_qualified_lead'] || 0 },
        { name: 'Oportunidades', count: statusCounts['opportunity'] || 0 },
        { name: 'Clientes', count: statusCounts['customer'] || 0 },
      ]

      setMetrics(newMetrics)
      setFunnelData(newFunnel)
      setLoading(false)

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          metrics: newMetrics,
          funnelData: newFunnel,
          timestamp: Date.now(),
        }),
      )
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Estratégico
        </h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Visão Geral da Corretora' : 'Meu Desempenho de Vendas'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total de Contatos"
          value={metrics.totalContacts}
          desc="No pipeline atual"
          icon={Users}
          color="text-primary"
        />
        <MetricCard
          title="Novos Leads (Mês)"
          value={metrics.newLeads}
          desc="Capturados recentemente"
          icon={TrendingUp}
          color="text-blue-500"
        />
        <MetricCard
          title="Conversões"
          value={metrics.conversions}
          desc={`${metrics.totalContacts > 0 ? Math.round((metrics.conversions / metrics.totalContacts) * 100) : 0}% taxa de conversão`}
          icon={Target}
          color="text-green-500"
        />
        <MetricCard
          title="Lead Score Médio"
          value={metrics.avgScore}
          desc="Qualidade geral da base"
          icon={Activity}
          color="text-yellow-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Funil de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{
                count: { label: 'Contatos', color: 'hsl(var(--primary))' },
              }}
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
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                    }}
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
      </div>
    </div>
  )
}

function MetricCard({ title, value, desc, icon: Icon, color }: any) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </CardContent>
    </Card>
  )
}
