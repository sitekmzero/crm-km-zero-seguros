import { useState } from 'react'
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Table as TableIcon,
  LogOut,
  Upload,
  Filter,
  X,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import useContactsStore, { Contact } from '@/stores/useContactsStore'
import { ContactFormDialog } from '@/components/contacts/ContactFormDialog'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { ContactsBoard } from '@/components/contacts/ContactsBoard'
import { ContactDetailsSheet } from '@/components/contacts/ContactDetailsSheet'
import { ImportCsvDialog } from '@/components/contacts/ImportCsvDialog'
import { useAuth } from '@/hooks/use-auth'
import { useNotifications } from '@/hooks/use-notifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const [activeTab, setActiveTab] = useState('all')
  const { contacts } = useContactsStore()
  const auth = useAuth() as any
  const { user, signOut } = auth
  const isAdmin = auth.isAdmin || user?.user_metadata?.is_admin || false
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCsvOpen, setIsCsvOpen] = useState(false)
  const [contactToEdit, setContactToEdit] = useState<Contact | undefined>(
    undefined,
  )
  const [viewingContactDetails, setViewingContactDetails] = useState<
    Contact | undefined
  >(undefined)
  const [viewMode, setViewMode] = useState<'table' | 'board'>('board')

  const [searchTerm, setSearchTerm] = useState('')
  const [filterScore, setFilterScore] = useState('all')
  const [filterProduct, setFilterProduct] = useState('all')

  const handleCreateContact = () => {
    setContactToEdit(undefined)
    setIsFormOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact)
    setIsFormOpen(true)
  }

  const filteredContacts = contacts.filter((c) => {
    const searchString =
      `${c.firstName || ''} ${c.lastName || ''} ${c.email || ''} ${c.cpf || ''}`.toLowerCase()
    if (!searchString.includes(searchTerm.toLowerCase())) return false
    if (filterProduct !== 'all' && c.produto_interesse !== filterProduct)
      return false
    if (filterScore !== 'all') {
      const score = c.leadScore || 0
      if (filterScore === 'high' && score < 80) return false
      if (filterScore === 'medium' && (score < 50 || score >= 80)) return false
      if (filterScore === 'low' && score >= 50) return false
    }
    if (activeTab !== 'all') {
      const statusMap: any = {
        subscriber: 'subscriber',
        lead: 'lead',
        mql: 'marketing_qualified_lead',
        sql: 'sales_qualified_lead',
        opportunity: 'opportunity',
        customer: 'customer',
      }
      if (c.status !== statusMap[activeTab]) return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-full w-full bg-background relative font-sans">
      <ContactFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contactToEdit={contactToEdit}
      />
      <ImportCsvDialog open={isCsvOpen} onOpenChange={setIsCsvOpen} />
      <ContactDetailsSheet
        open={!!viewingContactDetails}
        onOpenChange={(o) => !o && setViewingContactDetails(undefined)}
        contact={viewingContactDetails}
      />

      <header className="h-20 px-6 border-b border-border flex items-center justify-between bg-card sticky top-0 z-20 flex-shrink-0 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Gestão de Contatos
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao pipeline da Km Zero Seguros
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="hidden sm:flex gap-2 text-sm text-primary hover:text-primary hover:bg-primary/10 px-3 rounded-md font-semibold"
          >
            <Sparkles className="h-4 w-4" />{' '}
            {isAdmin ? 'Visão Admin' : 'Visão Vendedor'}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-0 shadow-lg border-border"
            >
              <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                <h4 className="font-semibold text-sm">Notificações</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] h-6 px-2"
                  onClick={markAllAsRead}
                >
                  Marcar lidas
                </Button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Você não possui notificações.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'p-3 border-b border-border flex flex-col gap-1 cursor-pointer transition-colors hover:bg-muted/50',
                        !n.read && 'bg-primary/5',
                      )}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold leading-tight text-foreground">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {n.created_at
                            ? formatDistanceToNow(new Date(n.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })
                            : 'recentemente'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {n.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-6 w-[1px] bg-border mx-2 hidden sm:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-md border-2 border-background">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 hidden lg:block text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.name || 'Usuário'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-y-auto pb-16">
        <div
          className={cn(
            'p-6 pb-20',
            viewMode === 'board' && 'h-full flex flex-col',
          )}
        >
          <div className="flex flex-col space-y-4 mb-6 flex-shrink-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex items-center justify-between border-b border-border pb-0">
                <TabsList className="bg-transparent h-auto p-0 justify-start w-full overflow-x-auto no-scrollbar gap-2 md:gap-6">
                  <TabItem
                    value="all"
                    label="Todos"
                    count={contacts.length}
                    active={activeTab === 'all'}
                  />
                  <TabItem
                    value="subscriber"
                    label="Assinantes"
                    active={activeTab === 'subscriber'}
                  />
                  <TabItem
                    value="lead"
                    label="Leads"
                    active={activeTab === 'lead'}
                  />
                  <TabItem
                    value="mql"
                    label="MQL"
                    active={activeTab === 'mql'}
                  />
                  <TabItem
                    value="sql"
                    label="SQL"
                    active={activeTab === 'sql'}
                  />
                  <TabItem
                    value="opportunity"
                    label="Oportunidades"
                    active={activeTab === 'opportunity'}
                  />
                  <TabItem
                    value="customer"
                    label="Clientes"
                    active={activeTab === 'customer'}
                  />
                </TabsList>
              </div>
            </Tabs>
          </div>

          <div className="flex flex-col space-y-4 flex-shrink-0 mb-4">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
              <div className="flex items-center w-full xl:w-auto flex-1 gap-2">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Busca por nome, e-mail ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 bg-card"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-10 gap-2 shadow-sm',
                        (filterScore !== 'all' || filterProduct !== 'all') &&
                          'bg-primary/5 border-primary/20 text-primary',
                      )}
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filtros</span>
                      {(filterScore !== 'all' || filterProduct !== 'all') && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                          !
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Filtros Avançados</h4>
                      </div>
                      <div className="grid gap-2">
                        <Label>Lead Score</Label>
                        <Select
                          value={filterScore}
                          onValueChange={setFilterScore}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="high">Alto (80+)</SelectItem>
                            <SelectItem value="medium">
                              Médio (50-79)
                            </SelectItem>
                            <SelectItem value="low">Baixo (&lt;50)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Label className="mt-2">Produto</Label>
                        <Select
                          value={filterProduct}
                          onValueChange={setFilterProduct}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Seguro Auto">
                              Seguro Auto
                            </SelectItem>
                            <SelectItem value="Consórcio">Consórcio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={() => {
                          setFilterScore('all')
                          setFilterProduct('all')
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setViewMode(viewMode === 'table' ? 'board' : 'table')
                  }
                  className="h-10 gap-2 bg-card"
                >
                  {viewMode === 'table' ? (
                    <TableIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                  )}
                  <span className="hidden lg:inline font-medium">
                    {viewMode === 'table' ? 'Tabela' : 'Quadro'}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCsvOpen(true)}
                  className="h-10 gap-2 bg-card"
                >
                  <Upload className="h-4 w-4" /> Importar CSV
                </Button>
                <Button
                  onClick={handleCreateContact}
                  className="h-10 gap-2 font-bold px-6"
                >
                  <Plus className="h-4 w-4" /> Adicionar Contato
                </Button>
              </div>
            </div>
          </div>

          <div className={cn('mt-2 flex-1', viewMode === 'board' && 'min-h-0')}>
            {filteredContacts.length === 0 ? (
              <div className="flex-1 min-h-[400px] flex items-center justify-center bg-muted/30 rounded-xl border border-dashed border-border relative overflow-hidden group">
                <div className="z-10 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-6 p-8 text-center">
                  <div className="h-20 w-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                    <Users className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    Nenhum contato encontrado
                  </h2>
                  <p className="text-muted-foreground">
                    Adicione novos contatos ou ajuste seus filtros.
                  </p>
                  <Button
                    onClick={handleCreateContact}
                    size="lg"
                    className="mt-4 font-bold"
                  >
                    Criar Primeiro Contato
                  </Button>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <ContactsTable
                onEdit={handleEditContact}
                onViewDetails={setViewingContactDetails}
              />
            ) : (
              <ContactsBoard
                contacts={filteredContacts}
                onEdit={handleEditContact}
                onViewDetails={setViewingContactDetails}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabItem({
  label,
  active,
  count,
  value,
}: {
  label: string
  active?: boolean
  count?: number
  value: string
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        'rounded-none border-b-[3px] border-transparent px-3 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent transition-all whitespace-nowrap',
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'ml-2 rounded-full px-2 py-0.5 text-xs font-bold transition-colors',
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </TabsTrigger>
  )
}
