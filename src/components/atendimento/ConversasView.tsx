import { useState, useRef, useEffect } from 'react'
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
  Check,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

type Lead = Database['public']['Tables']['leads']['Row']
type Message = Database['public']['Tables']['messages']['Row'] & {
  is_draft?: boolean
  feedback?: 'positive' | 'negative' | null
}

interface ConversasViewProps {
  leads: Lead[]
  messages: Record<string, Message[]>
  loading: boolean
}

export function ConversasView({
  leads,
  messages: globalMessages,
  loading,
}: ConversasViewProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 3. CONSULTA INICIAL (SELECT) E 4. TRATAMENTO DO REALTIME NO FRONTEND
  useEffect(() => {
    if (!selectedLeadId) {
      setActiveMessages([])
      return
    }

    const fetchActiveMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', selectedLeadId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Erro ao buscar mensagens do chat:', error)
      } else if (data) {
        setActiveMessages(data)
      }
    }

    fetchActiveMessages()

    const channel = supabase
      .channel(`chat-lead-${selectedLeadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${selectedLeadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setActiveMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${selectedLeadId}`,
        },
        (payload) => {
          const updMsg = payload.new as Message
          setActiveMessages((prev) =>
            prev.map((m) => (m.id === updMsg.id ? updMsg : m)),
          )
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${selectedLeadId}`,
        },
        (payload) => {
          setActiveMessages((prev) =>
            prev.filter((m) => m.id !== payload.old.id),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedLeadId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeMessages, selectedLeadId])

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

  const handleApproveDraft = async (msg: Message) => {
    const { error } = await supabase.functions.invoke('send-whatsapp', {
      body: {
        lead_id: msg.lead_id,
        content: msg.content,
        sender: 'ia',
        message_id: msg.id,
      },
    })
    if (error) {
      toast({
        title: 'Erro ao aprovar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Mensagem aprovada e enviada!' })
    }
  }

  const handleDeleteDraft = async (msgId: string) => {
    const { error } = await supabase
      .schema('public')
      .from('messages')
      .delete()
      .eq('id', msgId)
    if (error) {
      toast({
        title: 'Erro ao excluir rascunho',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Rascunho excluído com sucesso!' })
    }
  }

  const handleFeedback = async (
    msgId: string,
    feedback: 'positive' | 'negative',
  ) => {
    const { error } = await supabase
      .schema('public')
      .from('messages')
      .update({ feedback } as any)
      .eq('id', msgId)
    if (error) {
      toast({
        title: 'Erro ao salvar feedback',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Feedback registrado!' })
    }
  }

  const sortedLeads = [...leads]
    .filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search),
    )
    .sort((a, b) => {
      // Para a ordenação da lista lateral e a pré-visualização,
      // usamos o globalMessages (que já vem do Atendimento.tsx ou do cache).
      // Se tiver activeMessages do próprio lead (pois está selecionado), pode usar também, mas o global funciona para todos.
      const aMessages =
        a.id === selectedLeadId && activeMessages.length > 0
          ? activeMessages
          : globalMessages[a.id] || []
      const bMessages =
        b.id === selectedLeadId && activeMessages.length > 0
          ? activeMessages
          : globalMessages[b.id] || []

      const aLastMsg = aMessages.slice(-1)[0]
      const bLastMsg = bMessages.slice(-1)[0]
      const aTime = aLastMsg
        ? new Date(aLastMsg.created_at).getTime()
        : new Date(a.updated_at).getTime()
      const bTime = bLastMsg
        ? new Date(bLastMsg.created_at).getTime()
        : new Date(b.updated_at).getTime()
      return bTime - aTime
    })

  const selectedLead = leads.find((l) => l.id === selectedLeadId)
  const currentMessages = activeMessages

  return (
    <div className="flex w-full h-full">
      <div
        className={cn(
          'w-full md:w-[320px] lg:w-[380px] border-r flex flex-col bg-card',
          selectedLeadId ? 'hidden md:flex' : 'flex',
        )}
      >
        <div className="p-4 border-b">
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
              const leadMessages =
                lead.id === selectedLeadId && activeMessages.length > 0
                  ? activeMessages
                  : globalMessages[lead.id] || []
              const lastMsg = leadMessages.slice(-1)[0]
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
                          {lastMsg.is_draft ? (
                            <span className="text-[#C8A24A] font-medium">
                              [Rascunho]
                            </span>
                          ) : null}
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
                // 1. CORREÇÃO DE MAPEAMENTO DE ENUM NO FRONTEND
                // 'lead' -> balão à esquerda (branco/claro do cliente)
                // 'ia' ou 'humano' -> balão à direita (escuro/colorido da empresa)
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
                            ? msg.is_draft
                              ? 'bg-[#C8A24A]/5 text-foreground border-2 border-dashed border-[#C8A24A]/40 rounded-tr-sm'
                              : 'bg-[#C8A24A]/10 text-foreground border border-[#C8A24A]/20 rounded-tr-sm'
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
                            <Bot className="h-3 w-3" /> IA{' '}
                            {msg.is_draft && (
                              <span className="text-[#C8A24A]">
                                (Aprovação Pendente)
                              </span>
                            )}
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
                        {/* 2. CORREÇÃO DA COLUNA DE TEXTO */}
                        {msg.content}
                      </div>
                      {msg.is_draft && isIA && (
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => handleDeleteDraft(msg.id)}
                            title="Excluir Rascunho"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs bg-white hover:bg-white/90 border border-[#C8A24A]/30 text-foreground"
                            onClick={() => handleApproveDraft(msg)}
                          >
                            <Check className="h-3 w-3 mr-1 text-[#C8A24A]" />{' '}
                            Aprovar e Enviar
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1 pt-1">
                        <div className="flex items-center gap-1">
                          {!msg.is_draft && isIA && (
                            <>
                              <button
                                onClick={() =>
                                  handleFeedback(msg.id, 'positive')
                                }
                                className={cn(
                                  'p-1 rounded transition-colors',
                                  msg.feedback === 'positive'
                                    ? 'bg-green-500/20 text-green-700'
                                    : 'hover:bg-secondary text-muted-foreground/50 hover:text-foreground',
                                )}
                                title="Boa resposta"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handleFeedback(msg.id, 'negative')
                                }
                                className={cn(
                                  'p-1 rounded transition-colors',
                                  msg.feedback === 'negative'
                                    ? 'bg-red-500/20 text-red-700'
                                    : 'hover:bg-secondary text-muted-foreground/50 hover:text-foreground',
                                )}
                                title="Resposta inadequada"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                        <div
                          className={cn(
                            'text-[10px] text-right opacity-60',
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
