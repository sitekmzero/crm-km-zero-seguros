import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trophy, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

export default function Reports() {
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [rankingData, setRankingData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch funnel data
    const { data: contacts } = await supabase
      .from('contacts')
      .select('status, proprietario_id, user_profiles(full_name)')
    if (contacts) {
      const counts: Record<string, number> = {}
      const vendors: Record<string, any> = {}

      contacts.forEach((c) => {
        counts[c.status] = (counts[c.status] || 0) + 1

        if (c.proprietario_id && c.user_profiles) {
          const vId = c.proprietario_id
          if (!vendors[vId])
            vendors[vId] = {
              name: c.user_profiles.full_name || 'Vendedor',
              leads: 0,
              customers: 0,
            }
          vendors[vId].leads++
          if (c.status === 'customer') vendors[vId].customers++
        }
      })

      setFunnelData([
        { name: 'Assinantes', count: counts['subscriber'] || 0 },
        { name: 'Leads', count: counts['lead'] || 0 },
        { name: 'MQL', count: counts['marketing_qualified_lead'] || 0 },
        { name: 'SQL', count: counts['sales_qualified_lead'] || 0 },
        { name: 'Oportunidades', count: counts['opportunity'] || 0 },
        { name: 'Clientes', count: counts['customer'] || 0 },
      ])

      const rank = Object.values(vendors)
        .map((v) => ({
          ...v,
          rate: v.leads > 0 ? Math.round((v.customers / v.leads) * 100) : 0,
        }))
        .sort((a, b) => b.customers - a.customers)

      setRankingData(rank)
    }
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Relatórios Avançados
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de Funil e Ranking de Vendas
          </p>
        </div>
        <Button
          onClick={handleDownload}
          className="gap-2 bg-primary text-primary-foreground"
        >
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Funil de Vendas
            </CardTitle>
            <CardDescription>
              Conversão por estágio no período atual.
            </CardDescription>
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
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--foreground))"
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
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" /> Ranking de
              Vendedores
            </CardTitle>
            <CardDescription>
              Top performers por conversão de clientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rankingData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Dados insuficientes.
                </p>
              ) : (
                rankingData.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {i + 1}º
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{v.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.leads} leads totais
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {v.customers} Vendas
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {v.rate}% conv.
                      </p>
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
