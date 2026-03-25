import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import useContactsStore, { Contact } from '@/stores/useContactsStore'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().optional(),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  companyName: z.string().optional(),
  cpf: z.string().optional(),
  cep: z.string().optional(),
  produto_interesse: z.string().optional(),
  modelo_captura: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(
    [
      'subscriber',
      'lead',
      'marketing_qualified_lead',
      'sales_qualified_lead',
      'opportunity',
      'customer',
    ],
    {
      required_error: 'Status é obrigatório',
    },
  ),
})

interface ContactFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactToEdit?: Contact
}

export function ContactFormDialog({
  open,
  onOpenChange,
  contactToEdit,
}: ContactFormDialogProps) {
  const { addContact, updateContact } = useContactsStore()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      cpf: '',
      cep: '',
      produto_interesse: '',
      modelo_captura: '',
      observacoes: '',
      status: 'subscriber',
    },
  })

  useEffect(() => {
    if (open) {
      if (contactToEdit) {
        form.reset({
          firstName: contactToEdit.firstName,
          lastName: contactToEdit.lastName,
          email: contactToEdit.email,
          phone: contactToEdit.phone,
          status: contactToEdit.status,
          companyName: contactToEdit.companyName || '',
          cpf: contactToEdit.cpf || '',
          cep: contactToEdit.cep || '',
          produto_interesse: contactToEdit.produto_interesse || '',
          modelo_captura: contactToEdit.modelo_captura || '',
          observacoes: contactToEdit.observacoes || '',
        })
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          status: 'subscriber',
          companyName: '',
          cpf: '',
          cep: '',
          produto_interesse: '',
          modelo_captura: '',
          observacoes: '',
        })
      }
    }
  }, [open, contactToEdit, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (contactToEdit) {
      await updateContact(contactToEdit.id, values)
      toast({
        title: 'Contato atualizado',
        description: 'As informações foram salvas com sucesso.',
      })
    } else {
      await addContact(values)
      toast({
        title: 'Contato criado',
        description: 'O novo contato foi adicionado à sua lista.',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contactToEdit ? 'Editar contato' : 'Adicionar novo contato'}
          </DialogTitle>
          <DialogDescription>
            {contactToEdit
              ? 'Faça alterações nas informações abaixo.'
              : 'Preencha os dados do novo prospect ou cliente.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="João" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="joao@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="produto_interesse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto de Interesse</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Seguro Auto">Seguro Auto</SelectItem>
                        <SelectItem value="Seguro Empresarial">
                          Seguro Empresarial
                        </SelectItem>
                        <SelectItem value="Consórcio">Consórcio</SelectItem>
                        <SelectItem value="Financiamento">
                          Financiamento
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelo_captura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de Captura</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cotação Real">
                          Cotação Real
                        </SelectItem>
                        <SelectItem value="Vapt-Vupt">Vapt-Vupt</SelectItem>
                        <SelectItem value="Gamified">Gamified</SelectItem>
                        <SelectItem value="Manual">Manual (Interno)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Opcional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status (Pipeline)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estágio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="subscriber">Assinante</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="marketing_qualified_lead">
                          MQL
                        </SelectItem>
                        <SelectItem value="sales_qualified_lead">
                          SQL
                        </SelectItem>
                        <SelectItem value="opportunity">
                          Oportunidade
                        </SelectItem>
                        <SelectItem value="customer">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionais sobre o cliente..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="font-semibold text-primary-foreground"
              >
                {contactToEdit ? 'Salvar Alterações' : 'Criar Contato'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
