import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MessageCircle, Settings, BarChart3 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Database } from '@/lib/supabase/types'

type Lead = Database['public']['Tables']['leads']['Row']
type Message = Database['public']['Tables']['messages']['Row'] & {
  is_draft?: boolean
  feedback?: 'positive' | 'negative' | null
}

export function MetricasView({
  leads,
  messages,
}: {
  leads: Lead[]
  messages: Record<string, Message[]>
}) {
  const allMessages = Object.values(messages).flat()
  const iaCount = allMessages.filter((m) => m.sender === 'ia').length
  const humanoCount = allMessages.filter((m) => m.sender === 'humano').length
  const leadCount = allMessages.filter((m) => m.sender === 'lead').length
  const outboundCount = iaCount + humanoCount
  const iaResponseRate =
    outboundCount > 0 ? Math.round((iaCount / outboundCount) * 100) : 0

  const statusCounts = leads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace(/_/g, ' '),
    count,
  }))

  const engajados = leads
    .map((l) => ({
      ...l,
      msgCount: (messages[l.id] || []).length,
    }))
    .sort((a, b) => b.msgCount - a.msgCount)
    .slice(0, 5)

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/20 w-full h-full">
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <h2 className="text-2xl font-bold tracking-tight">
          Dashboard de Métricas
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Volume de Mensagens
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allMessages.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {leadCount} leads, {iaCount} IA, {humanoCount} humanos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Resposta IA
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{iaResponseRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                das mensagens ativas são da IA
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Leads Ativos (24h)
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  Object.keys(messages).filter((leadId) => {
                    const leadMessages = messages[leadId]
                    if (!leadMessages || leadMessages.length === 0) return false
                    const lastMsg = leadMessages[leadMessages.length - 1]
                    const lastMsgDate = new Date(lastMsg.created_at)
                    const hours24Ago = new Date(
                      Date.now() - 24 * 60 * 60 * 1000,
                    )
                    return lastMsgDate > hours24Ago
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                com interação recente
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Qualificação de Leads</CardTitle>
              <CardDescription>Quantidade de leads por status</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  count: { label: 'Leads', color: 'hsl(var(--primary))' },
                }}
                className="h-full w-full"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="status"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Contatos Mais Engajados</CardTitle>
              <CardDescription>Top 5 leads com mais interações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engajados.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {lead.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          {lead.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lead.phone}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium text-xs bg-secondary px-2.5 py-1 rounded-md text-foreground">
                      {lead.msgCount} msgs
                    </div>
                  </div>
                ))}
                {engajados.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Nenhum dado disponível.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
