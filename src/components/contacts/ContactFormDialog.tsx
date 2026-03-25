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
import useContactsStore, { Contact } from '@/stores/useContactsStore'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  companyName: z.string().optional(),
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
      status: 'lead',
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
        })
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          status: 'lead',
          companyName: '',
        })
      }
    }
  }, [open, contactToEdit, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (contactToEdit) {
      updateContact(contactToEdit.id, values)
      toast({
        title: 'Contato atualizado',
        description: 'As informações do contato foram salvas com sucesso.',
      })
    } else {
      addContact(values)
      toast({
        title: 'Contato criado',
        description: 'O novo contato foi adicionado à sua lista.',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {contactToEdit ? 'Editar contato' : 'Adicionar contato'}
          </DialogTitle>
          <DialogDescription>
            {contactToEdit
              ? 'Faça alterações nas informações do contato abaixo.'
              : 'Preencha os dados abaixo para adicionar um novo contato.'}
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
                      <Input
                        placeholder="João"
                        className="rounded-[28px]"
                        {...field}
                      />
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
                      <Input
                        placeholder="Silva"
                        className="rounded-[28px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="joao.silva@exemplo.com"
                      className="rounded-[28px]"
                      {...field}
                    />
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
                  <FormLabel>Número de telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      className="rounded-[28px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Empresa XYZ"
                      className="rounded-[28px]"
                      {...field}
                    />
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
                  <FormLabel>Status do lead</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-[28px]">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="subscriber">Assinante</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="marketing_qualified_lead">
                        MQL
                      </SelectItem>
                      <SelectItem value="sales_qualified_lead">SQL</SelectItem>
                      <SelectItem value="opportunity">Oportunidade</SelectItem>
                      <SelectItem value="customer">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-[28px]"
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-[28px]">
                {contactToEdit ? 'Salvar' : 'Criar contato'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
