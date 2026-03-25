import { useState } from 'react'
import {
  Search,
  Plus,
  ArrowUpCircle,
  Phone,
  Store,
  HelpCircle,
  Settings,
  Bell,
  Sparkles,
  LayoutTemplate,
  Filter,
  ChevronDown,
  ArrowRight,
  ListFilter,
  ArrowUpDown,
  Copy,
  LayoutDashboard,
  Table as TableIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import useContactsStore, { Contact } from '@/stores/useContactsStore'
import { ContactFormDialog } from '@/components/contacts/ContactFormDialog'
import { ContactsTable } from '@/components/contacts/ContactsTable'
import { ContactsBoard } from '@/components/contacts/ContactsBoard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Index() {
  const [activeTab, setActiveTab] = useState('all')
  const { contacts } = useContactsStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [contactToEdit, setContactToEdit] = useState<Contact | undefined>(
    undefined,
  )
  const [viewMode, setViewMode] = useState<'table' | 'board'>('board')

  const handleCreateContact = () => {
    setContactToEdit(undefined)
    setIsDialogOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFDFD] relative font-sans">
      <ContactFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        contactToEdit={contactToEdit}
      />

      {/* CRM Top Header - Updated to Light Theme consistent with Expert page */}
      <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-20 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-4 w-full max-w-xl">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar na ADAPTΔCRM"
              className="pl-9 bg-gray-50/50 border-gray-200 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/20 rounded-[28px] h-9 transition-all hover:bg-white hover:border-primary/20 hover:shadow-subtle"
            />
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCreateContact}
            className="rounded-full bg-transparent hover:bg-gray-100 border-none h-9 w-9 flex-shrink-0 text-muted-foreground"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-muted-foreground">
          <HeaderIcon icon={ArrowUpCircle} label="Upgrade" />
          <HeaderIcon icon={Phone} label="Call" />
          <HeaderIcon icon={Store} label="Marketplace" />
          <HeaderIcon icon={HelpCircle} label="Help" />
          <HeaderIcon icon={Settings} label="Settings" />
          <HeaderIcon icon={Bell} label="Notifications" />

          <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

          <Button
            variant="ghost"
            className="hidden sm:flex gap-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 rounded-md"
          >
            <Sparkles className="h-4 w-4" />
            Assistente
          </Button>

          <div className="flex items-center gap-2 ml-2 pl-2 sm:border-l border-gray-200 cursor-pointer hover:opacity-80">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold border-2 border-white shadow-sm">
              CO
            </div>
            <span className="text-sm hidden lg:block font-medium text-foreground">
              codando
            </span>
            <ChevronDown className="h-3 w-3 hidden lg:block text-muted-foreground" />
          </div>
        </div>
      </header>

      {/* CRM Content */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-16">
        <div
          className={cn(
            'p-6 pb-20',
            viewMode === 'board' && 'h-full flex flex-col',
          )}
        >
          {/* Tabs Section */}
          <div className="flex flex-col space-y-4 mb-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex items-center justify-between border-b border-border pb-0">
                  <TabsList className="bg-transparent h-auto p-0 gap-1 md:gap-6 justify-start w-full overflow-x-auto no-scrollbar">
                    <TabItem
                      value="all"
                      label="Todos os contatos"
                      count={contacts.length}
                      active={activeTab === 'all'}
                    />
                    <TabItem
                      value="subscribers"
                      label="Assinantes do informativo"
                      active={activeTab === 'subscribers'}
                    />
                    <TabItem
                      value="unsubscribed"
                      label="Assinatura cancelada"
                      active={activeTab === 'unsubscribed'}
                    />
                    <TabItem
                      value="customers"
                      label="Todos os clientes"
                      active={activeTab === 'customers'}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-gray-100 flex-shrink-0 ml-1 text-muted-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TabsList>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col space-y-4 flex-shrink-0">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
              <div className="flex items-center w-full xl:w-auto flex-1 gap-2">
                <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar todos os contatos"
                    className="pl-9 h-9 bg-white border-gray-200 rounded-[28px] focus-visible:ring-1 focus-visible:ring-primary/20 hover:border-primary/30 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 bg-white hidden md:flex rounded-md border-gray-200 hover:bg-gray-50 text-foreground"
                    >
                      {viewMode === 'table' ? (
                        <TableIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="hidden lg:inline">
                        {viewMode === 'table'
                          ? 'Exibição de tabela'
                          : 'Exibição de quadro'}
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setViewMode('table')}>
                      <TableIcon className="mr-2 h-4 w-4" />
                      Exibição de tabela
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode('board')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Exibição de quadro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-white hidden md:flex rounded-md border-gray-200 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>

                {viewMode === 'table' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 bg-white rounded-md border-gray-200 hover:bg-gray-50 text-foreground"
                  >
                    Editar colunas
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 bg-white rounded-md border-gray-200 hover:bg-gray-50 text-foreground"
                >
                  <ListFilter className="h-4 w-4 text-muted-foreground" />
                  Filtros
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 bg-white hidden sm:flex rounded-md border-gray-200 hover:bg-gray-50 text-foreground"
                >
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  Classificar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white hidden sm:flex rounded-md border-gray-200 hover:bg-gray-50 text-foreground"
                >
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-white hidden md:flex rounded-md border-gray-200 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 bg-white hidden sm:flex rounded-md border-gray-200 hover:bg-gray-50 text-foreground"
                >
                  Salvar
                </Button>
                <Button
                  onClick={handleCreateContact}
                  className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 ml-auto xl:ml-2 shadow-sm rounded-md font-medium"
                >
                  Adicionar contatos
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center gap-2 border-b border-border pb-4 overflow-x-auto no-scrollbar">
              <FilterSelect label="Proprietário do contato" />
              <FilterSelect label="Data de criação" />
              <FilterSelect label="Data da última atividade" />
              <FilterSelect label="Status do lead" />
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 h-8 gap-1 font-medium whitespace-nowrap hover:bg-primary/5 rounded-md"
              >
                <Plus className="h-3 w-3" /> Mais
              </Button>
              <div className="h-6 w-[1px] bg-gray-200 mx-2 flex-shrink-0"></div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-8 gap-2 font-medium whitespace-nowrap hover:bg-gray-100 rounded-md"
              >
                <Filter className="h-3 w-3" />
                Filtros avançados
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={cn('mt-4 flex-1', viewMode === 'board' && 'min-h-0')}>
            {contacts.length === 0 ? (
              <div className="flex-1 min-h-[400px] flex items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 relative overflow-hidden group hover:border-purple-200 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50/20" />
                <div className="z-10 flex flex-col-reverse md:flex-row items-center justify-center max-w-5xl mx-auto w-full gap-8 md:gap-16 p-8">
                  <div className="flex-1 max-w-lg space-y-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight font-display">
                      Adicione mais contatos para organizar e identificar leads
                      promissores.
                    </h2>

                    <div className="space-y-5">
                      <FeaturePoint text="Importe um arquivo ou sincronize contatos diretamente de outros aplicativos que sua empresa já utiliza." />
                      <FeaturePoint text="Nós ajudaremos você a remover duplicidades. Assim, seu negócio vai crescer com dados limpos." />
                      <FeaturePoint text="Não é necessário nenhum trabalho sofisticado com dados e estamos aqui para ajudar em cada etapa." />
                    </div>
                  </div>

                  <div className="flex-1 flex justify-center">
                    <img
                      src="https://img.usecurling.com/i?q=illustration%20contacts%20list%20crm&shape=hand-drawn&color=violet"
                      alt="CRM Illustration"
                      className="w-[280px] md:w-[340px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <ContactsTable onEdit={handleEditContact} />
            ) : (
              <ContactsBoard contacts={contacts} onEdit={handleEditContact} />
            )}
          </div>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border p-3 md:p-4 flex items-center justify-center z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6 text-sm text-gray-600 font-medium">
          <Button
            variant="ghost"
            disabled
            className="gap-2 text-muted-foreground hover:bg-transparent h-8 rounded-md"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
            Voltar
          </Button>
          <Button
            variant="ghost"
            className="gap-2 text-primary hover:text-primary hover:bg-primary/5 h-8 rounded-md"
          >
            Próximo
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
          <div className="flex items-center gap-2 ml-4 cursor-pointer hover:text-primary transition-colors py-1 px-2 rounded hover:bg-gray-50">
            <span>25 por página</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  )
}

function HeaderIcon({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-full h-9 w-9 hidden md:flex"
      title={label}
    >
      <Icon className="h-5 w-5" />
    </Button>
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
        'rounded-none border-b-[3px] border-transparent px-3 pb-3 pt-2 font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent transition-all whitespace-nowrap',
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'ml-2 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors',
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200',
          )}
        >
          {count}
        </span>
      )}
      {active && (
        <div className="ml-2 hover:bg-gray-100 rounded-full p-0.5">
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
      {!active && <div className="ml-2 w-4" />}
    </TabsTrigger>
  )
}

function FilterSelect({ label }: { label: string }) {
  return (
    <Button
      variant="ghost"
      className="h-8 border border-dashed border-gray-300 rounded-md px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white whitespace-nowrap transition-colors"
    >
      {label}
      <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
    </Button>
  )
}

function FeaturePoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-purple-100">
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
      <p className="text-gray-600 text-[15px] leading-relaxed group-hover:text-gray-900 transition-colors font-medium">
        {text}
      </p>
    </div>
  )
}
