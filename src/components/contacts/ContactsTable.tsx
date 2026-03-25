import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import useContactsStore, {
  Contact,
  ContactStatus,
} from '@/stores/useContactsStore'
import { useToast } from '@/hooks/use-toast'

interface ContactsTableProps {
  onEdit: (contact: Contact) => void
  onViewDetails?: (contact: Contact) => void
}

export function ContactsTable({ onEdit, onViewDetails }: ContactsTableProps) {
  const { contacts, deleteContact } = useContactsStore()
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    deleteContact(id)
    toast({
      title: 'Contato removido',
      description: 'O contato foi excluído permanentemente.',
    })
  }

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case 'subscriber':
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Assinante
          </Badge>
        )
      case 'lead':
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            Lead
          </Badge>
        )
      case 'marketing_qualified_lead':
        return (
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          >
            MQL
          </Badge>
        )
      case 'sales_qualified_lead':
        return (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 hover:bg-orange-200"
          >
            SQL
          </Badge>
        )
      case 'opportunity':
        return (
          <Badge
            variant="secondary"
            className="bg-primary/20 text-primary hover:bg-primary/30"
          >
            Oportunidade
          </Badge>
        )
      case 'customer':
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 hover:bg-green-200"
          >
            Cliente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[300px]">Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum contato encontrado.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow
                key={contact.id}
                className="hover:bg-muted/10 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?gender=${
                          Math.random() > 0.5 ? 'male' : 'female'
                        }&seed=${contact.id}`}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {contact.firstName[0]}
                        {contact.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span
                        className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => onViewDetails?.(contact)}
                      >
                        {contact.firstName} {contact.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">
                  {contact.email}
                </TableCell>
                <TableCell>{getStatusBadge(contact.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(contact.createdAt), 'dd MMM yyyy', {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onViewDetails?.(contact)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(contact)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá
                          permanentemente o contato <b>{contact.firstName}</b>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(contact.id)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
