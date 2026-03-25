import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Shield, Power, KeyRound, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'vendedor',
  })

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setUsers(data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAction = async (
    action: string,
    payload: any,
    successMsg: string,
  ) => {
    setLoading(true)
    const { data, error } = await supabase.functions.invoke('manage-users', {
      body: { action, payload },
    })

    if (error || data?.error) {
      toast({
        title: 'Erro',
        description: error?.message || data?.error,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: successMsg })
      if (data?.link) {
        navigator.clipboard.writeText(data.link)
        toast({
          title: 'Link Copiado',
          description:
            'O link de convite foi copiado para a área de transferência.',
        })
      }
      fetchUsers()
      if (action === 'invite') setInviteOpen(false)
    }
    setLoading(false)
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    handleAction('invite', inviteData, 'Convite enviado com sucesso!')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gerenciar Usuários</h2>
          <p className="text-sm text-muted-foreground">
            Controle os acessos da sua equipe.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/audit">
            <Button variant="outline" className="gap-2">
              <ShieldAlert className="h-4 w-4" /> Log de Auditoria
            </Button>
          </Link>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                style={{ backgroundColor: '#C8A24A', color: 'white' }}
              >
                <UserPlus className="h-4 w-4" /> Convidar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Colaborador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    required
                    value={inviteData.name}
                    onChange={(e) =>
                      setInviteData({ ...inviteData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    required
                    value={inviteData.email}
                    onChange={(e) =>
                      setInviteData({ ...inviteData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Função</Label>
                  <Select
                    value={inviteData.role}
                    onValueChange={(v) =>
                      setInviteData({ ...inviteData, role: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <p className="font-medium">{u.full_name || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.status === 'inativo' ? 'destructive' : 'outline'}
                    className={
                      u.status !== 'inativo'
                        ? 'border-green-500 text-green-600'
                        : ''
                    }
                  >
                    {u.status === 'inativo' ? 'Inativo' : 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.created_at
                    ? format(new Date(u.created_at), 'dd/MM/yyyy', {
                        locale: ptBR,
                      })
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Alterar Função"
                      onClick={() => {
                        const newRole =
                          u.role === 'admin' ? 'vendedor' : 'admin'
                        handleAction(
                          'update_role',
                          {
                            target_user_id: u.id,
                            role: newRole,
                            email: u.email,
                          },
                          `Função alterada para ${newRole}`,
                        )
                      }}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Resetar Senha"
                      onClick={() => {
                        handleAction(
                          'reset_password',
                          { target_user_id: u.id, email: u.email },
                          'Link de redefinição enviado',
                        )
                      }}
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={u.status === 'inativo' ? 'Ativar' : 'Desativar'}
                      onClick={() => {
                        const newStatus =
                          u.status === 'inativo' ? 'ativo' : 'inativo'
                        handleAction(
                          'update_status',
                          {
                            target_user_id: u.id,
                            status: newStatus,
                            email: u.email,
                          },
                          `Usuário ${newStatus}`,
                        )
                      }}
                    >
                      <Power
                        className={`h-4 w-4 ${u.status === 'inativo' ? 'text-green-500' : 'text-red-500'}`}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
