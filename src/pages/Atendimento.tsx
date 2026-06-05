import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bot,
  User,
  Phone,
  ArrowLeft,
  Send,
  Search,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Lead = Database['public']['Tables']['leads']['Row']
type Message = Database['public']['Tables']['messages']['Row']

function StatusBadge({
  status,
  aiActive,
}: {
  status: string
  aiActive: boolean
}) {
  const map: Record<string, { label: string; className: string }> = {
    novo: {
      label: 'Novo',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    seguro_qualificado: {
      label: 'Seguro',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    consorcio_qualificado: {
      label: 'Consórcio',
      className: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    financiamento_qualificado: {
      label: 'Financiam.',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    em_atendimento_humano: {
      label: 'Atend.',
      className: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    perdido: {
      label: 'Perdido',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  }
  const badge = map[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded-sm border font-medium whitespace-nowrap',
          badge.className,
        )}
      >
        {badge.label}
      </span>
      {aiActive && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-sm border bg-indigo-100 text-indigo-800 border-indigo-200 font-medium flex items-center gap-1 whitespace-nowrap">
          <Bot className="h-3 w-3" /> IA
        </span>
      )}
    </div>
  )
}

export default function Atendimento() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchInitialData()

    const leadsSub = supabase
      .channel('public:leads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads((prev) => [payload.new as Lead, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setLeads((prev) =>
              prev.map((l) =>
                l.id === payload.new.id ? (payload.new as Lead) : l,
              ),
            )
          }
        },
      )
      .subscribe()

    const msgsSub = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => ({
            ...prev,
            [newMsg.lead_id]: [...(prev[newMsg.lead_id] || []), newMsg],
          }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(leadsSub)
      supabase.removeChannel(msgsSub)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, selectedLeadId])

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

    const { data: msgsData, error: msgsError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
    if (msgsError) {
      toast({
        title: 'Erro',
        description: msgsError.message,
        variant: 'destructive',
      })
    } else {
      const grouped = (msgsData || []).reduce(
        (acc: Record<string, Message[]>, msg) => {
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedLeadId) return
    const text = inputText.trim()
    setInputText('')

    const { error } = await supabase.functions.invoke('send-whatsapp', {
      body: { lead_id: selectedLeadId, content: text, sender: 'humano' },
    })

    if (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      })
      setInputText(text)
    }
  }

  const sortedLeads = [...leads]
    .filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search),
    )
    .sort((a, b) => {
      const aLastMsg = messages[a.id]?.slice(-1)[0]
      const bLastMsg = messages[b.id]?.slice(-1)[0]
      const aTime = aLastMsg
        ? new Date(aLastMsg.created_at).getTime()
        : new Date(a.updated_at).getTime()
      const bTime = bLastMsg
        ? new Date(bLastMsg.created_at).getTime()
        : new Date(b.updated_at).getTime()
      return bTime - aTime
    })

  const selectedLead = leads.find((l) => l.id === selectedLeadId)
  const currentMessages = selectedLeadId ? messages[selectedLeadId] || [] : []

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen w-full bg-background overflow-hidden border-t md:border-t-0 border-border">
      {/* Sidebar */}
      <div
        className={cn(
          'w-full md:w-[320px] lg:w-[380px] border-r flex flex-col bg-card',
          selectedLeadId ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Conversas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-none h-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : sortedLeads.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            sortedLeads.map((lead) => {
              const lastMsg = messages[lead.id]?.slice(-1)[0]
              const isSelected = selectedLeadId === lead.id
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={cn(
                    'w-full text-left p-4 border-b border-border/50 transition-colors hover:bg-secondary/40 flex gap-3 items-start',
                    isSelected && 'bg-secondary/60',
                  )}
                >
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {lead.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-medium text-sm truncate pr-2 text-foreground">
                        {lead.name}
                      </h3>
                      {lastMsg && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {new Date(lastMsg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="mb-2 text-xs text-muted-foreground truncate">
                      {lastMsg ? (
                        <span className="flex items-center gap-1">
                          {lastMsg.sender === 'ia' && (
                            <Bot className="h-3 w-3" />
                          )}
                          {lastMsg.sender === 'humano' && (
                            <User className="h-3 w-3" />
                          )}
                          {lastMsg.content}
                        </span>
                      ) : (
                        'Nenhuma mensagem'
                      )}
                    </div>
                    <StatusBadge
                      status={lead.status}
                      aiActive={lead.ai_active}
                    />
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          'flex-1 flex flex-col bg-background relative',
          selectedLeadId ? 'flex' : 'hidden md:flex',
        )}
      >
        {selectedLead ? (
          <>
            <div className="h-16 border-b flex items-center px-4 bg-card shrink-0 gap-3 shadow-sm z-10">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedLeadId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedLead.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-sm text-foreground">
                  {selectedLead.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {selectedLead.phone}
                </div>
              </div>
              <div className="hidden sm:block">
                <StatusBadge
                  status={selectedLead.status}
                  aiActive={selectedLead.ai_active}
                />
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20"
              ref={scrollRef}
            >
              {currentMessages.map((msg) => {
                const isLead = msg.sender === 'lead'
                const isIA = msg.sender === 'ia'
                const isHumano = msg.sender === 'humano'
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex w-full',
                      isLead ? 'justify-start' : 'justify-end',
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-sm',
                        isLead
                          ? 'bg-card text-foreground rounded-tl-sm border border-border'
                          : isIA
                            ? 'bg-[#C8A24A]/10 text-foreground border border-[#C8A24A]/20 rounded-tr-sm'
                            : 'bg-primary text-primary-foreground rounded-tr-sm',
                      )}
                    >
                      <div
                        className={cn(
                          'text-[11px] mb-1 flex items-center gap-1 font-medium opacity-80',
                          isHumano
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground',
                        )}
                      >
                        {isIA && (
                          <>
                            <Bot className="h-3 w-3" /> IA
                          </>
                        )}
                        {isHumano && (
                          <>
                            <User className="h-3 w-3" /> Você
                          </>
                        )}
                        {isLead && <>{selectedLead.name}</>}
                      </div>
                      <div className="whitespace-pre-wrap text-[13px] sm:text-sm leading-relaxed">
                        {msg.content}
                      </div>
                      <div
                        className={cn(
                          'text-[10px] mt-1 text-right opacity-60',
                          isHumano
                            ? 'text-primary-foreground/60'
                            : 'text-muted-foreground',
                        )}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
              {currentMessages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground text-sm max-w-sm mx-auto p-6 bg-card rounded-xl border border-border/50 shadow-sm">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p>Nenhuma mensagem nesta conversa ainda.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-card border-t shrink-0">
              <form
                onSubmit={handleSend}
                className="flex gap-2 max-w-4xl mx-auto"
              >
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 h-12 bg-background rounded-full px-5 focus-visible:ring-1 focus-visible:ring-[#C8A24A]"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim()}
                  size="icon"
                  className="h-12 w-12 rounded-full shrink-0 bg-[#C8A24A] hover:bg-[#C8A24A]/90 text-white shadow-md transition-transform active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-4">
            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p>Selecione uma conversa para iniciar o atendimento</p>
          </div>
        )}
      </div>
    </div>
  )
}
