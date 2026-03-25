import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([])
  const [filterAction, setFilterAction] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('audit_log')
      .select('*, user_profiles:usuario_id(full_name, email)')
      .order('data_hora', { ascending: false })

    if (data) setLogs(data)
  }

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'all' && log.acao !== filterAction) return false
    if (search) {
      const s = search.toLowerCase()
      const userStr =
        `${log.user_profiles?.full_name} ${log.user_profiles?.email}`.toLowerCase()
      if (!userStr.includes(s) && !log.descricao?.toLowerCase().includes(s))
        return false
    }
    return true
  })

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background print:bg-white print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Log de Auditoria
            </h1>
            <p className="text-muted-foreground mt-1">
              Histórico de ações administrativas de usuários.
            </p>
          </div>
        </div>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4 print:hidden">
        <Input
          placeholder="Buscar por usuário ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Ações</SelectItem>
            <SelectItem value="criar_usuario">Criar Usuário</SelectItem>
            <SelectItem value="editar_usuario">Editar Usuário</SelectItem>
            <SelectItem value="resetar_senha">Resetar Senha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="print:shadow-none print:border-none border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="print:hidden">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground h-24"
                  >
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(log.data_hora), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {log.user_profiles?.full_name || 'Desconhecido'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.user_profiles?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                        {log.acao}
                      </span>
                    </TableCell>
                    <TableCell>{log.descricao}</TableCell>
                    <TableCell className="text-xs text-muted-foreground print:hidden">
                      {log.ip_usuario || '-'}
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
