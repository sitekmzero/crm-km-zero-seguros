import { MoreHorizontal, Pencil, Trash2, Eye, Target, TrendingUp } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
    const labels: Record<string, string> = {
      subscriber: 'Assinante',
      lead: 'Lead',
      marketing_qualified_lead: 'MQL',
      sales_qualified_lead: 'SQL',
      opportunity: 'Oportunidade',
      customer: 'Cliente'
    }
    return <Badge variant="secondary">{labels[status] || status}</Badge>
  }

  return (
    <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-[250px]">Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Conv. (%)</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhum contato encontrado.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-muted/10 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${contact.id}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {contact.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => onViewDetails?.(contact)}>
                        {contact.firstName} {contact.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">{contact.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(contact.status)}</TableCell>
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className={`px-2 py-0.5 text-white ${
                        (contact.leadScore || 0) >= 80 ? 'bg-green-500 hover:bg-green-600' :
                        (contact.leadScore || 0) >= 50 ? 'bg-yellow-500 hover:bg-yellow-600' :
                        'bg-red-500 hover:bg-red-600'
                      }`}>
                        <Target className="h-3 w-3 mr-1 inline" />
                        {contact.leadScore || 0}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Lead Score</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm font-medium text-muted-foreground">
                    <TrendingUp className={`h-4 w-4 ${(contact.probability || 0) > 70 ? 'text-green-500' : (contact.probability || 0) > 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                    {contact.probability || 0}%
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(contact.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetails?.(contact)}>
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
                          Esta ação excluirá permanentemente o contato <b>{contact.firstName}</b>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(contact.id)} className="bg-destructive text-destructive-foreground">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
