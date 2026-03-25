import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react'
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

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [metrics, setMetrics] = useState({
    totalContacts: 0,
    newLeads: 0,
    conversions: 0,
    estimatedRevenue: 0,
  })
  const [funnelData, setFunnelData] = useState<any[]>([])

  useEffect(() => {
    if (user) fetchDashboardData()
  }, [user, isAdmin])

  const fetchDashboardData = async () => {
    let query = supabase
      .from('contacts')
      .select('status, created_at, produto_interesse')
    if (!isAdmin) {
      query = query.eq('proprietario_id', user?.id)
    }

    const { data } = await query

    if (data) {
      const thisMonth = new Date().getMonth()
      const newLeads = data.filter(
        (c) => new Date(c.created_at).getMonth() === thisMonth,
      ).length
      const clients = data.filter((c) => c.status === 'customer').length

      setMetrics({
        totalContacts: data.length,
        newLeads,
        conversions: clients,
        estimatedRevenue: clients * 1200, // Mock avg ticket
      })

      const statusCounts = data.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})

      setFunnelData([
        { name: 'Assinantes', count: statusCounts['subscriber'] || 0 },
        { name: 'Leads', count: statusCounts['lead'] || 0 },
        { name: 'MQL', count: statusCounts['marketing_qualified_lead'] || 0 },
        { name: 'SQL', count: statusCounts['sales_qualified_lead'] || 0 },
        { name: 'Oportunidades', count: statusCounts['opportunity'] || 0 },
        { name: 'Clientes', count: statusCounts['customer'] || 0 },
      ])
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Visão Geral da Corretora' : 'Meu Desempenho de Vendas'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Contatos
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.totalContacts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              No seu pipeline atual
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Novos Leads (Mês)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.newLeads}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Capturados recentemente
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversões (Clientes)
            </CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {metrics.conversions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalContacts > 0
                ? Math.round(
                    (metrics.conversions / metrics.totalContacts) * 100,
                  )
                : 0}
              % taxa de conversão
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Estimada
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R${' '}
              {metrics.estimatedRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado nos negócios fechados
            </p>
          </CardContent>
        </Card>
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
