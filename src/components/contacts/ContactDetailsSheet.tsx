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
import {
  MessageSquare,
  Calendar,
  FolderOpen,
  Download,
  MessageCircle,
} from 'lucide-react'
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
  const [documents, setDocuments] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [chatMsg, setChatMsg] = useState('')
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open && contact) {
      fetchInteractions()
      fetchMessages()
      fetchDocs()
    }
  }, [open, contact])

  const fetchInteractions = async () => {
    const { data } = await supabase
      .from('crm_interactions')
      .select('*')
      .eq('contact_id', contact!.id)
      .order('data', { ascending: false })
    if (data) setInteractions(data)
  }

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('internal_messages')
      .select('*, user_profiles:user_id(full_name)')
      .eq('contact_id', contact!.id)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const fetchDocs = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('contact_id', contact!.id)
      .order('uploaded_at', { ascending: false })
    if (data) setDocuments(data)
  }

  const addInteraction = async () => {
    if (!newNote.trim() || !contact || !user) return
    const { error } = await supabase
      .from('crm_interactions')
      .insert({
        contact_id: contact.id,
        tipo: 'Nota Interna',
        descricao: newNote,
        user_id: user.id,
      })
    if (!error) {
      setNewNote('')
      fetchInteractions()
      toast({ title: 'Sucesso', description: 'Interação registrada.' })
    }
  }

  const sendChatMessage = async () => {
    if (!chatMsg.trim() || !contact || !user) return
    const { error } = await supabase
      .from('internal_messages')
      .insert({ contact_id: contact.id, user_id: user.id, message: chatMsg })
    if (!error) {
      setChatMsg('')
      fetchMessages()
    }
  }

  const handleWhatsApp = async () => {
    if (!contact?.phone)
      return toast({
        title: 'Erro',
        description: 'Contato sem telefone.',
        variant: 'destructive',
      })
    const text = `Olá ${contact.firstName}, tudo bem? Sou consultor(a) da Km Zero Seguros.`
    const phoneNum = contact.phone.replace(/\D/g, '')
    window.open(
      `https://wa.me/55${phoneNum}?text=${encodeURIComponent(text)}`,
      '_blank',
    )
    await supabase
      .from('crm_interactions')
      .insert({
        contact_id: contact.id,
        tipo: 'WhatsApp Enviado',
        descricao: 'Mensagem inicial enviada via atalho.',
        user_id: user?.id,
      })
    fetchInteractions()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !contact) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${contact.id}/${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('documents')
      .upload(path, file)
    if (upErr) {
      toast({
        title: 'Erro',
        description: upErr.message,
        variant: 'destructive',
      })
      setUploading(false)
      return
    }

    const { error: dbErr } = await supabase
      .from('documents')
      .insert({
        contact_id: contact.id,
        file_name: file.name,
        file_path: path,
        document_type: 'outro',
      })
    if (!dbErr) {
      toast({ title: 'Sucesso', description: 'Documento salvo.' })
      fetchDocs()
    }
    setUploading(false)
  }

  const handleDownloadDoc = async (path: string, name: string) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .download(path)
    if (data) {
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
    } else {
      toast({
        title: 'Erro',
        description: 'Falha no download.',
        variant: 'destructive',
      })
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
              <div className="flex items-center gap-3 mt-2">
                <Button
                  size="sm"
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white h-8 text-xs gap-1 shadow-sm"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Chamar
                </Button>
                <SheetDescription className="text-muted-foreground flex items-center gap-2">
                  {contact.email} • {contact.phone}
                </SheetDescription>
              </div>
            </SheetHeader>
          </div>

          <Tabs defaultValue="info" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/20 px-6 h-12 flex-wrap">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="interactions">Interações</TabsTrigger>
              <TabsTrigger value="chat" className="gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> Chat
              </TabsTrigger>
              <TabsTrigger value="docs" className="gap-1">
                <FolderOpen className="h-3.5 w-3.5" /> Docs
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
                    <DetailItem
                      label="Produto"
                      value={contact.produto_interesse}
                    />
                    <DetailItem
                      label="Status"
                      value={contact.status.replace(/_/g, ' ')}
                      className="capitalize"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="interactions" className="mt-0 space-y-6">
                <div>
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Registro de chamada, notas..."
                    className="mb-3 bg-white"
                  />
                  <Button onClick={addInteraction} size="sm" className="w-full">
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
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
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
                <div className="flex-1 space-y-4 bg-muted/10 rounded-lg p-4 border border-border overflow-y-auto min-h-[300px]">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.user_id === user?.id ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-muted-foreground mb-1">
                        {m.user_profiles?.full_name}
                      </span>
                      <div
                        className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${m.user_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                      >
                        {m.message}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    placeholder="Mensagem interna..."
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage}>Enviar</Button>
                </div>
              </TabsContent>

              <TabsContent value="docs" className="mt-0 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="cursor-pointer file:text-primary file:font-semibold"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    {uploading && (
                      <span className="absolute right-3 top-2 text-xs text-muted-foreground">
                        Enviando...
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {documents.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      Nenhum documento anexado.
                    </p>
                  )}
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex justify-between items-center p-3 bg-card border border-border rounded-lg shadow-sm group"
                    >
                      <div className="flex flex-col overflow-hidden pr-4">
                        <span className="text-sm font-medium truncate">
                          {doc.file_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(
                            new Date(doc.uploaded_at),
                            'dd/MM/yyyy HH:mm',
                          )}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          handleDownloadDoc(doc.file_path, doc.file_name)
                        }
                      >
                        <Download className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  ))}
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
