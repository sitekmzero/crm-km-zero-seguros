import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { UploadCloud, Loader2 } from 'lucide-react'
import useContactsStore from '@/stores/useContactsStore'

export function ImportCsvDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const { refreshContacts } = useContactsStore()

  const handleProcessCsv = async () => {
    if (!file || !user) return
    setUploading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const rows = text.split('\n').filter((row) => row.trim().length > 0)
        const headers = rows[0].split(',').map((h) => h.trim().toLowerCase())

        const contactsToInsert = rows.slice(1).map((row) => {
          const values = row.split(',')
          const obj: any = {}
          headers.forEach((h, i) => {
            obj[h] = values[i]?.trim()
          })

          return {
            first_name: obj['nome']?.split(' ')[0] || 'Desconhecido',
            last_name: obj['nome']?.split(' ').slice(1).join(' ') || '',
            email: obj['email'] || null,
            phone: obj['telefone'] || null,
            cpf: obj['cpf'] || null,
            cep: obj['cep'] || null,
            produto_interesse: obj['produto'] || null,
            status: 'subscriber',
            proprietario_id: user.id,
          }
        })

        const { error } = await supabase
          .from('contacts')
          .insert(contactsToInsert)
        if (error) throw error

        toast({
          title: 'Sucesso',
          description: `${contactsToInsert.length} contatos importados com sucesso.`,
        })
        refreshContacts()
        onOpenChange(false)
      } catch (err: any) {
        toast({
          title: 'Erro ao importar',
          description: err.message || 'Formato de arquivo inválido.',
          variant: 'destructive',
        })
      } finally {
        setUploading(false)
        setFile(null)
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Contatos (CSV)</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV para importar contatos em massa.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-foreground font-medium mb-2">
              Estrutura esperada do cabeçalho:
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded text-primary">
              nome, email, telefone, cpf, cep, produto
            </code>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleProcessCsv}
            disabled={!file || uploading}
            className="bg-primary text-primary-foreground"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {uploading ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
