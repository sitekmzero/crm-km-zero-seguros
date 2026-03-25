import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Contact } from '@/stores/useContactsStore'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { MessageSquare, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleMeetingDialog } from './ScheduleMeetingDialog'

interface ContactDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact
}

export function ContactDetailsSheet({
  open,
  onOpenChange,
  contact,
}: ContactDetailsSheetProps) {
  const [interactions, setInteractions] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [chatMsg, setChatMsg] = useState('')
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open && contact) {
      fetchInteractions()
      fetchMessages()
    }
  }, [open, contact])

  const fetchInteractions = async () => {
    if (!contact) return
    const { data } = await supabase
      .from('crm_interactions')
      .select('*')
      .eq('contact_id', contact.id)
      .order('data', { ascending: false })

    if (data) setInteractions(data)
  }

  const fetchMessages = async () => {
    if (!contact) return
    const { data } = await supabase
      .from('internal_messages')
      .select('*, user_profiles:user_id(full_name)')
      .eq('contact_id', contact.id)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  const addInteraction = async () => {
    if (!newNote.trim() || !contact || !user) return

    const { error } = await supabase.from('crm_interactions').insert({
      contact_id: contact.id,
      tipo: 'Nota Interna',
      descricao: newNote,
      user_id: user.id,
    })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar.',
        variant: 'destructive',
      })
    } else {
      setNewNote('')
      fetchInteractions()
      toast({ title: 'Sucesso', description: 'Interação registrada.' })
    }
  }

  const sendChatMessage = async () => {
    if (!chatMsg.trim() || !contact || !user) return
    const { error } = await supabase.from('internal_messages').insert({
      contact_id: contact.id,
      user_id: user.id,
      message: chatMsg,
    })
    if (!error) {
      setChatMsg('')
      fetchMessages()
    }
  }

  if (!contact) return null

  return (
    <>
      <ScheduleMeetingDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        contact={contact}
      />

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-background border-border p-0 flex flex-col">
          <div className="p-6 border-b border-border bg-card">
            <SheetHeader>
              <SheetTitle className="text-2xl text-foreground font-bold flex justify-between items-center">
                <span>
                  {contact.firstName} {contact.lastName}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => setIsScheduleOpen(true)}
                  >
                    <Calendar className="h-3 w-3" /> Agendar
                  </Button>
                </div>
              </SheetTitle>
              <SheetDescription className="text-muted-foreground flex items-center gap-2">
                {contact.email} • {contact.phone}
                {contact.leadScore !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold text-white ${contact.leadScore >= 80 ? 'bg-green-500' : contact.leadScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  >
                    Score: {contact.leadScore}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>
          </div>

          <Tabs defaultValue="info" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/20 px-6 h-12">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="interactions">Interações</TabsTrigger>
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Chat Interno
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="info" className="mt-0 space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <h3 className="font-semibold text-foreground mb-3 border-b border-border pb-2">
                    Dados Cadastrais
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <DetailItem label="CPF" value={contact.cpf} />
                    <DetailItem label="CEP" value={contact.cep} />
                    <DetailItem label="Empresa" value={contact.companyName} />
                    <DetailItem
                      label="Produto"
                      value={contact.produto_interesse}
                    />
                    <DetailItem label="Modelo" value={contact.modelo_captura} />
                    <DetailItem
                      label="Status"
                      value={contact.status.replace(/_/g, ' ')}
                      className="capitalize"
                    />
                    <DetailItem
                      label="Probabilidade"
                      value={`${contact.probability || 0}%`}
                    />
                  </div>
                  {contact.observacoes && (
                    <div className="mt-4">
                      <strong className="text-foreground text-sm">
                        Observações:
                      </strong>
                      <p className="text-sm text-muted-foreground mt-1">
                        {contact.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="interactions" className="mt-0 space-y-6">
                <div>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar nota, registro de chamada..."
                    className="mb-3 bg-white"
                  />
                  <Button
                    onClick={addInteraction}
                    size="sm"
                    className="w-full font-semibold"
                  >
                    Registrar Interação
                  </Button>
                </div>
                <div className="space-y-3">
                  {interactions.map((int) => (
                    <div
                      key={int.id}
                      className="bg-card p-3 rounded-lg border border-border shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                          {int.tipo}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(int.data), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">
                        {int.descricao}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="chat"
                className="mt-0 flex flex-col h-full space-y-4"
              >
                <div className="flex-1 space-y-4 bg-muted/10 rounded-lg p-4 border border-border overflow-y-auto max-h-[400px]">
                  {messages.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground">
                      Nenhuma mensagem neste lead ainda.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.user_id === user?.id ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-muted-foreground mb-1">
                          {m.user_profiles?.full_name || 'Usuário'}
                        </span>
                        <div
                          className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${m.user_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                        >
                          {m.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Mencione alguém para ajudar..."
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage}>Enviar</Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  )
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string
  value?: string | null
  className?: string
}) {
  return (
    <p className="text-sm">
      <strong className="text-foreground block mb-0.5">{label}</strong>
      <span className={cn('text-muted-foreground', className)}>
        {value || 'N/A'}
      </span>
    </p>
  )
}
