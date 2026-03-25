import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Download, Search, FileText, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const { toast } = useToast()
  const { isAdmin, user } = useAuth()

  useEffect(() => {
    if (user) fetchDocs()
  }, [user, isAdmin])

  const fetchDocs = async () => {
    let query = supabase
      .from('documents')
      .select('*, contacts(first_name, last_name, proprietario_id)')
      .order('uploaded_at', { ascending: false })
    const { data } = await query
    if (data) {
      // If not admin, only show docs from their own contacts
      const filtered = isAdmin
        ? data
        : data.filter((d) => d.contacts?.proprietario_id === user?.id)
      setDocuments(filtered)
    }
  }

  const handleDownload = async (path: string, name: string) => {
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
        description: 'Arquivo não encontrado.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string, path: string) => {
    if (!confirm('Deseja realmente excluir este documento?')) return
    await supabase.storage.from('documents').remove([path])
    await supabase.from('documents').delete().eq('id', id)
    toast({ title: 'Sucesso', description: 'Documento excluído.' })
    fetchDocs()
  }

  const filteredDocs = documents.filter(
    (d) =>
      d.file_name.toLowerCase().includes(search.toLowerCase()) ||
      d.contacts?.first_name?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-8 w-8 text-[#C8A24A]" /> Central de Documentos
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todos os arquivos e apólices dos clientes.
        </p>
      </div>

      <Card className="mb-6 shadow-sm border-border">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por arquivo ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data de Upload</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Nenhum documento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium text-primary flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />{' '}
                      {doc.file_name}
                    </TableCell>
                    <TableCell>
                      {doc.contacts?.first_name} {doc.contacts?.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(doc.file_path, doc.file_name)
                          }
                        >
                          <Download className="h-4 w-4 text-[#0B1F3B]" />
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(doc.id, doc.file_path)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
