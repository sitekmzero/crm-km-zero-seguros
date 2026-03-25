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
import { Contact } from '@/stores/useContactsStore'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

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
  const [newNote, setNewNote] = useState('')
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open && contact) {
      fetchInteractions()
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
        description: 'Não foi possível salvar a interação.',
        variant: 'destructive',
      })
    } else {
      setNewNote('')
      fetchInteractions()
      toast({ title: 'Sucesso', description: 'Interação registrada.' })
    }
  }

  if (!contact) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-background border-border">
        <SheetHeader>
          <SheetTitle className="text-2xl text-foreground font-bold">
            {contact.firstName} {contact.lastName}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {contact.email} • {contact.phone}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3 border-b border-border pb-2">
              Informações Cadastrais
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <p className="text-sm">
                <strong className="text-foreground">CPF:</strong>{' '}
                <span className="text-muted-foreground">
                  {contact.cpf || 'Não informado'}
                </span>
              </p>
              <p className="text-sm">
                <strong className="text-foreground">CEP:</strong>{' '}
                <span className="text-muted-foreground">
                  {contact.cep || 'Não informado'}
                </span>
              </p>
              <p className="text-sm">
                <strong className="text-foreground">Empresa:</strong>{' '}
                <span className="text-muted-foreground">
                  {contact.companyName || 'N/A'}
                </span>
              </p>
              <p className="text-sm">
                <strong className="text-foreground">Produto:</strong>{' '}
                <span className="text-muted-foreground">
                  {contact.produto_interesse || 'N/A'}
                </span>
              </p>
              <p className="text-sm">
                <strong className="text-foreground">Modelo:</strong>{' '}
                <span className="text-muted-foreground">
                  {contact.modelo_captura || 'N/A'}
                </span>
              </p>
              <p className="text-sm">
                <strong className="text-foreground">Status:</strong>{' '}
                <span className="text-muted-foreground capitalize">
                  {contact.status.replace(/_/g, ' ')}
                </span>
              </p>
            </div>
            {contact.observacoes && (
              <div className="mt-3">
                <strong className="text-foreground text-sm">
                  Observações:
                </strong>
                <p className="text-sm text-muted-foreground mt-1">
                  {contact.observacoes}
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Nova Interação
            </h3>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Adicionar uma nota, registro de chamada ou email..."
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

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Histórico de Interações
            </h3>
            <div className="space-y-3">
              {interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                  Nenhuma interação registrada ainda.
                </p>
              ) : (
                interactions.map((int) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
