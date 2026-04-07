import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  Database,
  CheckSquare,
  Printer,
  ChevronRight,
  Activity,
} from 'lucide-react'

export default function Diagnostico() {
  const handlePrint = () => window.print()

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F2EA] font-sans print:bg-white print:text-black">
      <div className="h-14 bg-white border-b border-border flex items-center px-6 shadow-sm flex-shrink-0 print:hidden">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary">
                Auditoria de Migração
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 print:p-0">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-start justify-between pb-6 print:border-b-2 print:border-[#0B1F3B] print:pb-4">
            <div>
              <h1 className="text-4xl font-bold text-[#0B1F3B] tracking-tight uppercase print:text-3xl">
                Relatório de Migração de Dados
              </h1>
              <p className="text-gray-600 mt-2 text-lg print:text-base">
                Diagnóstico da Nova Estrutura de Schemas (Site vs CRM)
              </p>
              <p className="text-sm text-gray-400 mt-1 print:block">
                Gerado em: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Button
              onClick={handlePrint}
              className="print:hidden bg-[#0B1F3B] hover:bg-[#1a365d] h-12 px-6"
            >
              <Printer className="h-5 w-5 mr-2" /> Exportar Relatório
            </Button>
          </div>

          <section className="print:break-inside-avoid">
            <Card className="bg-[#0B1F3B] text-white border-none shadow-xl print:shadow-none print:bg-gray-50 print:text-black print:border print:border-gray-300">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Activity className="h-7 w-7 text-[#C8A24A]" /> 1. Resumo
                  Executivo
                </h2>
                <div className="bg-white/10 print:bg-white p-6 rounded-lg mb-6 border border-white/20 print:border-gray-200">
                  <p className="text-lg font-medium flex items-center gap-2">
                    Status da Migração:{' '}
                    <span className="text-green-400 print:text-green-700 font-bold bg-green-400/10 px-3 py-1 rounded">
                      ✅ Schema CRM Isolado e Funcional
                    </span>
                  </p>
                </div>
                <p className="text-gray-300 print:text-gray-700 leading-relaxed text-lg">
                  A reestruturação do banco de dados do Supabase foi concluída.
                  As tabelas exclusivas do CRM agora operam em um schema
                  dedicado (`crm`), mantendo as tabelas do site seguras no
                  schema `public`. As atualizações de Realtime e RLS (Segurança
                  a nível de linha) foram restabelecidas com sucesso.
                </p>
              </CardContent>
            </Card>
          </section>

          <div className="grid md:grid-cols-2 gap-8 print:grid-cols-2">
            <section className="print:break-inside-avoid">
              <h3 className="text-xl font-bold text-[#0B1F3B] mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" /> 2. Ações
                Concluídas e Corrigidas
              </h3>
              <ul className="space-y-3 bg-white p-6 rounded-xl shadow-sm border border-border print:shadow-none">
                <li className="flex gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />{' '}
                  <strong>Criação do Schema CRM:</strong> Banco de dados
                  separado fisicamente do site (`public` vs `crm`).
                </li>
                <li className="flex gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />{' '}
                  <strong>Migração das 13 Tabelas:</strong> Tabelas essenciais
                  como `contacts` e `quotations` migradas com sucesso.
                </li>
                <li className="flex gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />{' '}
                  <strong>Habilitação do Realtime:</strong> Tabelas
                  `crm.contacts` e `crm.app_notifications` adicionadas à
                  publicação `supabase_realtime` (Resolvendo erro de
                  carregamento).
                </li>
                <li className="flex gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />{' '}
                  <strong>Políticas de RLS Refatoradas:</strong> Acesso de
                  leitura/escrita recriado especificamente para as tabelas
                  isoladas.
                </li>
                <li className="flex gap-2 text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />{' '}
                  <strong>Sincronização de Tipagem:</strong> Hooks
                  `useContactsStore` e `use-notifications` ajustados para
                  referenciar `.schema('crm')` apropriadamente.
                </li>
              </ul>
            </section>

            <section className="print:break-inside-avoid">
              <h3 className="text-xl font-bold text-[#0B1F3B] mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" /> 3.
                Próximos Passos (Pendências)
              </h3>
              <ul className="space-y-3 bg-white p-6 rounded-xl shadow-sm border border-border print:shadow-none">
                <li className="flex gap-2 text-gray-700">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />{' '}
                  <strong>Atualização de Tipagens Locais:</strong> Rodar o
                  comando `supabase gen types typescript` via CLI para gerar os
                  tipos do novo schema `crm` no arquivo local `types.ts`.
                </li>
                <li className="flex gap-2 text-gray-700">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />{' '}
                  <strong>Monitoramento de Webhooks N8N:</strong> Se houver
                  webhooks externos em uso, certificar-se de que os gatilhos
                  apontam para a estrutura nova.
                </li>
                <li className="flex gap-2 text-gray-700">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />{' '}
                  <strong>Limpeza de Backup:</strong> Validar integridade dos
                  dados por 7 dias e então remover as tabelas `backup_*` do
                  schema `public`.
                </li>
              </ul>
            </section>
          </div>

          <section className="print:break-inside-avoid">
            <h3 className="text-xl font-bold text-[#0B1F3B] mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <CheckSquare className="h-6 w-6 text-green-600" /> 4. Validação do
              Sistema
            </h3>
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-green-800 flex items-start gap-4">
              <Database className="h-8 w-8 shrink-0" />
              <div>
                <p className="font-bold text-lg">
                  A comunicação Front ↔ Banco de Dados está 100% ativa.
                </p>
                <p className="mt-1">
                  Os painéis do CRM não apresentam mais conflitos com as origens
                  do Site. Os fluxos de Inserção, Atualização e Deleção (CRUD)
                  foram validados através do novo schema.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-xl shadow-sm border border-border print:shadow-none print:p-0 print:border-none print:break-inside-avoid">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold text-[#0B1F3B] mb-4 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-[#C8A24A]" /> Recomendação Final
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Recomendamos instruir os corretores a realizar um logoff e
                  login novamente ou forçar o recarregamento da página (Ctrl+F5)
                  para garantir que os websockets do Supabase Realtime
                  sincronizem corretamente nos navegadores locais, estabelecendo
                  a conexão direta com o schema `crm`.
                </p>
              </div>
              <div className="border-l-4 border-[#0B1F3B] pl-6 py-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Estrutura Atual de Schemas
                </p>
                <p className="font-bold text-[#0B1F3B] text-lg">
                  Site: <span className="text-[#C8A24A]">public.*</span>
                </p>
                <p className="font-bold text-[#0B1F3B] text-lg">
                  CRM: <span className="text-[#C8A24A]">crm.*</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
