import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function Quotations() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    contact_id: '',
    tipo_produto: 'Seguro Auto',
    marca: '',
    modelo: '',
    ano: '',
    valor: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: qData } = await supabase
      .schema('crm' as any)
      .from('quotations')
      .select('*, contacts(first_name, last_name)')
      .order('data_criacao', { ascending: false })
    if (qData) setQuotations(qData)

    const { data: cData } = await supabase
      .schema('crm' as any)
      .from('contacts')
      .select('id, first_name, last_name')
      .order('first_name')
    if (cData) setContacts(cData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.contact_id)
      return toast({
        title: 'Aviso',
        description: 'Selecione um contato',
        variant: 'destructive',
      })

    const { error } = await supabase
      .schema('crm' as any)
      .from('quotations')
      .insert({
        contact_id: formData.contact_id,
        tipo_produto: formData.tipo_produto,
        dados_cotacao: {
          marca: formData.marca,
          modelo: formData.modelo,
          ano: formData.ano,
          valor: formData.valor,
        },
        status: 'pendente',
      })

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Cotação registrada com sucesso!',
      })
      setOpen(false)
      fetchData()
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Cotações e Propostas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie cotações de seguros e consórcios
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold">
              Nova Cotação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nova Cotação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Contato</Label>
                <Select
                  value={formData.contact_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, contact_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Produto</Label>
                <Select
                  value={formData.tipo_produto}
                  onValueChange={(v) =>
                    setFormData({ ...formData, tipo_produto: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Seguro Auto">Seguro Auto</SelectItem>
                    <SelectItem value="Consórcio">Consórcio</SelectItem>
                    <SelectItem value="Seguro Empresarial">
                      Seguro Empresarial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marca/Tipo</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) =>
                      setFormData({ ...formData, marca: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo/Bem</Label>
                  <Input
                    value={formData.modelo}
                    onChange={(e) =>
                      setFormData({ ...formData, modelo: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Salvar Cotação
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    Nenhuma cotação registrada.
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(q.data_criacao), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {q.contacts?.first_name} {q.contacts?.last_name}
                    </TableCell>
                    <TableCell>{q.tipo_produto}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {q.dados_cotacao?.marca} {q.dados_cotacao?.modelo}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          q.status === 'aceita'
                            ? 'default'
                            : q.status === 'pendente'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {q.status.toUpperCase()}
                      </Badge>
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
