import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConversasView } from '@/components/atendimento/ConversasView'
import { MetricasView } from '@/components/atendimento/MetricasView'
import { ConfigView } from '@/components/atendimento/ConfigView'

type Lead = Database['public']['Tables']['leads']['Row']
type Message = Database['public']['Tables']['messages']['Row'] & {
  is_draft?: boolean
  feedback?: 'positive' | 'negative' | null
}

export default function Atendimento() {
  const [activeTab, setActiveTab] = useState('conversas')
  const [leads, setLeads] = useState<Lead[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchInitialData()

    // Mantemos um listener global apenas para atualizar as últimas mensagens
    // e os cards da barra lateral de conversas de forma reativa.
    // O chat detalhado e a query eq('lead_id', activeLeadId) já estão no ConversasView.tsx
    const messagesChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            const list = prev[newMsg.lead_id] || []
            if (list.some((m) => m.id === newMsg.id)) return prev
            return {
              ...prev,
              [newMsg.lead_id]: [...list, newMsg],
            }
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updMsg = payload.new as Message
          setMessages((prev) => {
            const list = prev[updMsg.lead_id] || []
            return {
              ...prev,
              [updMsg.lead_id]: list.map((m) =>
                m.id === updMsg.id ? updMsg : m,
              ),
            }
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          setMessages((prev) => {
            const newState = { ...prev }
            for (const leadId in newState) {
              newState[leadId] = newState[leadId].filter(
                (m) => m.id !== payload.old.id,
              )
            }
            return newState
          })
        },
      )
      .subscribe()

    const leadsChannel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          setLeads((prev) =>
            prev.map((l) =>
              l.id === payload.new.id ? { ...l, ...(payload.new as Lead) } : l,
            ),
          )
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          setLeads((prev) => {
            if (prev.some((l) => l.id === payload.new.id)) return prev
            return [payload.new as Lead, ...prev]
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          setLeads((prev) => prev.filter((l) => l.id !== payload.old.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(leadsChannel)
    }
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')

    if (leadsError) {
      toast({
        title: 'Erro',
        description: leadsError.message,
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    setLeads(leadsData || [])

    // Busca de mensagens recentes para a barra lateral (últimas interações)
    // O SELECT detalhado por lead já está em ConversasView.tsx para cumprir:
    // supabase.from('messages').select('*').eq('lead_id', activeLeadId)
    const { data: msgsData, error: msgsError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (msgsError) {
      console.error('Falha ao buscar histórico global de mensagens:', msgsError)
    } else {
      const grouped = (msgsData || []).reduce(
        (acc: Record<string, Message[]>, msg: any) => {
          if (!acc[msg.lead_id]) acc[msg.lead_id] = []
          acc[msg.lead_id].push(msg)
          return acc
        },
        {},
      )
      setMessages(grouped)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen w-full bg-background overflow-hidden border-t md:border-t-0 border-border">
      <div className="px-4 py-2 border-b shrink-0 flex items-center bg-card z-20 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-[500px] grid-cols-3 bg-muted/50">
            <TabsTrigger
              value="conversas"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Conversas
            </TabsTrigger>
            <TabsTrigger
              value="metricas"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Métricas
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Configuração IA
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden relative flex">
        {activeTab === 'conversas' && (
          <ConversasView leads={leads} messages={messages} loading={loading} />
        )}
        {activeTab === 'metricas' && (
          <MetricasView leads={leads} messages={messages} />
        )}
        {activeTab === 'config' && <ConfigView />}
      </div>
    </div>
  )
}
