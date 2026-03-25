import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Book,
  Shield,
  TrendingUp,
  PieChart,
  Users,
  FileText,
  Search,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function Manual() {
  const [activeTab, setActiveTab] = useState('capa')
  const [company, setCompany] = useState<any>({
    name: 'Km Zero Seguros',
    cnpj: '00.000.000/0001-00',
    address: 'Endereço não definido',
    phone: '(00) 0000-0000',
    email: 'contato@kmzero.com.br',
  })
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    supabase
      .from('corretora_config')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) setCompany(data)
      })
  }, [])

  const handlePrint = () => window.print()

  const handleFeedback = async () => {
    if (!feedback.trim()) return
    const { error } = await supabase
      .from('manual_feedback')
      .insert({ pagina: activeTab, mensagem: feedback })
    if (!error) {
      toast({ title: 'Obrigado!', description: 'Seu feedback foi enviado.' })
      setFeedback('')
    }
  }

  const sections = [
    { id: 'capa', icon: Book, title: 'Capa / Início' },
    { id: 'passos', icon: Shield, title: 'Primeiros Passos' },
    { id: 'jornada', icon: TrendingUp, title: 'A Jornada do Lead' },
    { id: 'dashboard', icon: PieChart, title: 'Dashboard Estratégico' },
    { id: 'kanban', icon: Users, title: 'Gestão e Kanban' },
    { id: 'cotacoes', icon: FileText, title: 'Cotações e Propostas' },
  ]

  return (
    <div className="flex h-full w-full bg-[#F5F2EA] font-sans selection:bg-[#C8A24A]/30">
      <div className="w-64 bg-[#0B1F3B] text-white flex-shrink-0 flex flex-col print:hidden border-r border-[#1a365d]">
        <div className="p-6 border-b border-[#1a365d] bg-[#08162b]">
          <h2 className="text-[#C8A24A] font-bold text-xl tracking-tight">
            CRM Km Zero
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
            Manual do Usuário
          </p>
        </div>
        <div className="p-4 border-b border-[#1a365d]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="bg-[#1a365d] border-none text-white pl-9 h-9 text-sm"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                activeTab === s.id
                  ? 'bg-[#C8A24A] text-white shadow-md'
                  : 'text-gray-300 hover:bg-[#1a365d] hover:text-white',
              )}
            >
              <s.icon className="h-4 w-4" /> {s.title}
            </button>
          ))}
        </nav>
        <div className="p-4 bg-[#08162b] text-center space-y-3 border-t border-[#1a365d]">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://crm-kmzero.goskip.app/manual&bgcolor=08162b&color=C8A24A"
            alt="QR Code"
            className="mx-auto border border-[#1a365d] rounded-lg p-1 bg-white"
          />
          <p className="text-[10px] text-gray-400">
            Escaneie para ler no celular
          </p>
          <Button
            onClick={handlePrint}
            size="sm"
            className="w-full bg-[#C8A24A] hover:bg-[#b08d40] text-white font-bold"
          >
            <Download className="h-4 w-4 mr-2" /> PDF / Imprimir
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 print:p-0 print:block">
        <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 rounded-xl shadow-elevation print:shadow-none print:w-full print:p-0 relative min-h-[800px]">
          {activeTab === 'capa' && (
            <div className="text-center space-y-12 py-20 print:py-40">
              <img
                src="https://idtvwxzbmnqjcyxquqdk.supabase.co/storage/v1/object/public/Imagem/Logo%20km%20zero%20fundo%20branco%20transparente%20site.svg"
                alt="Logo"
                className="h-24 mx-auto"
              />
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-[#0B1F3B] tracking-tight">
                  Manual Consultivo
                </h1>
                <p className="text-2xl text-[#C8A24A] font-medium">
                  Plataforma CRM Oficial
                </p>
              </div>
              <div className="pt-20 text-sm text-gray-500 space-y-2 border-t border-gray-100 max-w-md mx-auto">
                <p className="font-bold text-[#0B1F3B]">
                  {company.name || 'Km Zero Seguros'}
                </p>
                <p>CNPJ: {company.cnpj || '-'}</p>
                <p>{company.address || '-'}</p>
                <p>
                  {company.phone || '-'} | {company.email || '-'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'passos' && (
            <div className="space-y-8 animate-fade-in text-gray-700">
              <h1 className="text-3xl font-bold text-[#0B1F3B] border-b-2 border-[#C8A24A] pb-4">
                1. Primeiros Passos
              </h1>
              <p>
                O CRM Km Zero foi projetado para ser intuitivo. Siga estas
                instruções para configurar seu acesso inicial.
              </p>

              <h3 className="text-xl font-bold text-[#0B1F3B]">
                Como Fazer Login
              </h3>
              <p>
                Acesse o link oficial do CRM, insira seu e-mail corporativo e a
                senha fornecida no convite. Recomendamos o uso do Google Chrome
                para melhor performance.
              </p>

              <h3 className="text-xl font-bold text-[#0B1F3B] mt-6">
                Perfis de Acesso
              </h3>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <Card className="border-[#C8A24A]/30 shadow-sm">
                  <CardContent className="p-6 bg-blue-50/30">
                    <h4 className="font-bold text-[#0B1F3B] mb-2">
                      🛡️ Administrador
                    </h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Visão consolidada da equipe.</li>
                      <li>Acesso à tela de Configurações.</li>
                      <li>Logs de auditoria e gestão de usuários.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-[#C8A24A]/30 shadow-sm">
                  <CardContent className="p-6 bg-yellow-50/30">
                    <h4 className="font-bold text-[#0B1F3B] mb-2">
                      💼 Vendedor
                    </h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Gestão exclusiva da própria carteira.</li>
                      <li>Funil de vendas personalizado.</li>
                      <li>Atalhos rápidos para Cotações e WhatsApp.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'jornada' && (
            <div className="space-y-6 animate-fade-in text-gray-700">
              <h1 className="text-3xl font-bold text-[#0B1F3B] border-b-2 border-[#C8A24A] pb-4">
                2. A Jornada do Lead
              </h1>
              <p>
                Nosso pipeline é dividido em 6 etapas estratégicas. É
                fundamental que você mova os cards conforme o cliente avança,
                pois isso aciona automações (e-mails).
              </p>

              <div className="space-y-4 my-6">
                <div className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="w-24 font-bold text-[#0B1F3B]">Assinante</div>
                  <div>
                    Contato inicial, capturado via E-book ou Newsletter. Ainda
                    não há intenção clara de compra.
                  </div>
                </div>
                <div className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-blue-50">
                  <div className="w-24 font-bold text-blue-700">Lead</div>
                  <div>O cliente solicitou contato (via site ou WhatsApp).</div>
                </div>
                <div className="flex gap-4 p-4 border border-[#C8A24A] rounded-lg bg-yellow-50/30">
                  <div className="w-24 font-bold text-[#C8A24A]">MQL / SQL</div>
                  <div>
                    Lead Qualificado. O vendedor já analisou o perfil e está
                    montando a cotação.
                  </div>
                </div>
                <div className="flex gap-4 p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="w-24 font-bold text-green-700">
                    Oportunidade
                  </div>
                  <div>
                    A proposta foi enviada e está em fase de negociação direta.
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#0B1F3B] mt-8">
                Lead Scoring Explicado
              </h3>
              <p>
                O sistema atribui uma nota de <strong>0 a 100</strong> para cada
                contato. Leads com score{' '}
                <strong className="text-green-600">Verde (80+)</strong> devem
                ser priorizados diariamente, pois indicam alta probabilidade de
                fechamento baseada em recência e interações.
              </p>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in text-gray-700">
              <h1 className="text-3xl font-bold text-[#0B1F3B] border-b-2 border-[#C8A24A] pb-4">
                3. Dashboard Estratégico
              </h1>
              <p>
                Sua central de comando. Utilize os filtros de período (7, 30 ou
                90 dias) no topo para analisar tendências.
              </p>
              <ul className="list-decimal pl-5 space-y-2 mt-4">
                <li>
                  <strong>Cards de Métrica:</strong> Monitore o total de leads
                  recebidos contra a quantidade de apólices fechadas
                  (Conversões).
                </li>
                <li>
                  <strong>Funil de Vendas:</strong> Visualização rápida para
                  identificar onde os clientes estão "travando" (ex: muitos
                  MQLs, poucas Oportunidades).
                </li>
                <li>
                  <strong>Alertas de Renovação:</strong> O painel inferior
                  destaca apólices vencendo em até 30 dias. Clique no botão
                  "Renovar" ou envie um WhatsApp diretamente para não perder o
                  prazo.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'kanban' && (
            <div className="space-y-6 animate-fade-in text-gray-700">
              <h1 className="text-3xl font-bold text-[#0B1F3B] border-b-2 border-[#C8A24A] pb-4">
                4. Gestão e Kanban
              </h1>
              <p>
                A tela principal do CRM. O método Kanban permite arrastar e
                soltar (drag-and-drop) os contatos entre as colunas.
              </p>

              <h3 className="text-xl font-bold text-[#0B1F3B] mt-6">
                Regras de Ouro
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Sempre que fizer uma ligação, clique no contato e registre uma{' '}
                  <strong>Nota Interna</strong> na aba "Interações".
                </li>
                <li>
                  Utilize o botão verde do <strong>WhatsApp</strong> dentro do
                  perfil do cliente para usar nossos templates pré-aprovados. A
                  interação é salva automaticamente no histórico.
                </li>
                <li>
                  Para anexar apólices antigas ou CNH do cliente, use a aba{' '}
                  <strong>Docs</strong> no perfil do contato.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'cotacoes' && (
            <div className="space-y-6 animate-fade-in text-gray-700">
              <h1 className="text-3xl font-bold text-[#0B1F3B] border-b-2 border-[#C8A24A] pb-4">
                5. Cotações e Propostas
              </h1>
              <p>
                Acesse o menu "Cotações" na barra lateral para gerar registros
                formais.
              </p>
              <p>
                Para criar uma nova cotação, clique em{' '}
                <strong>Nova Cotação</strong>, selecione o cliente e o produto.
                Esses dados alimentam a inteligência do Dashboard (gráfico "Por
                Produto"). Quando o cliente aceitar a proposta, altere o status
                para "Aceita" — isso move automaticamente o cliente para o
                estágio final no pipeline Kanban.
              </p>
            </div>
          )}

          {/* Footer that appears on all print pages */}
          <div className="mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 print:absolute print:bottom-0 print:w-full">
            © {new Date().getFullYear()} Todos os direitos reservados à{' '}
            {company.name || 'Km Zero Corretora de Seguros e Consórcios Ltda'}.
          </div>

          {/* Feedback Form (hidden in print) */}
          <div className="absolute bottom-8 right-8 print:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="shadow-lg rounded-full h-12 w-12 p-0 bg-white border-[#C8A24A] text-[#C8A24A] hover:bg-[#F5F2EA]"
                >
                  ?
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-4">
                <h4 className="font-bold mb-2 text-[#0B1F3B]">
                  Feedback sobre o Manual
                </h4>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Encontrou um erro ou tem uma sugestão?"
                  className="text-sm mb-2"
                />
                <Button
                  onClick={handleFeedback}
                  size="sm"
                  className="w-full bg-[#0B1F3B]"
                >
                  Enviar Feedback
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}
