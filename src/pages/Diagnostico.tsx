import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Shield,
  Zap,
} from 'lucide-react'

export default function Diagnostico() {
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Diagnóstico de Implantação
          </h1>
          <p className="text-muted-foreground mt-2">
            Relatório oficial de status da reestruturação do banco de dados
            (Schema CRM) e correções de estabilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            icon={<Database className="h-5 w-5 text-blue-500" />}
            title="Schema Isolado"
            description="Tabelas migradas para 'crm'"
            status="success"
          />
          <StatusCard
            icon={<Shield className="h-5 w-5 text-green-500" />}
            title="Políticas RLS"
            description="Permissões de acesso"
            status="success"
          />
          <StatusCard
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
            title="Realtime Supabase"
            description="Sincronização de interface"
            status="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />O que foi
                realizado e corrigido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <ListItem>
                  <strong>Isolamento de Dados:</strong> Migração bem-sucedida de
                  13 tabelas do CRM (contacts, quotations, etc.) do schema{' '}
                  <code>public</code> para o novo schema <code>crm</code>.
                </ListItem>
                <ListItem>
                  <strong>Refatoração de Queries:</strong> Atualização de todos
                  os serviços e hooks (<code>useContactsStore</code>,{' '}
                  <code>useNotifications</code>) para usar{' '}
                  <code>.schema('crm')</code> explicitamente.
                </ListItem>
                <ListItem>
                  <strong>Correção de Erro na Interface:</strong> Resolvido o
                  erro de renderização do componente <code>Index</code> causado
                  por falhas de tipagem na destruturação do <code>useAuth</code>{' '}
                  e conversão insegura de datas (
                  <code>formatDistanceToNow</code>).
                </ListItem>
                <ListItem>
                  <strong>Estabilidade do Realtime:</strong> Inclusão correta
                  das tabelas no publication <code>supabase_realtime</code> e
                  correção de payloads nulos no listener de atualizações.
                </ListItem>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Próximos Passos (A Fazer)
              </CardTitle>
              <CardDescription>
                Ações recomendadas para finalizar a arquitetura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <ListItem
                  icon={
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  }
                >
                  <strong>Remoção do Backup:</strong> Após 7 dias de
                  estabilidade comprovada, deletar as tabelas de backup (
                  <code>backup_contacts</code>, etc.) que ficaram no schema{' '}
                  <code>public</code>.
                </ListItem>
                <ListItem
                  icon={
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  }
                >
                  <strong>Revisão de Edge Functions:</strong> Garantir que
                  funções externas como o webhook do Pipedrive e N8N estejam
                  consumindo e gravando no novo schema.
                </ListItem>
                <ListItem
                  icon={
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  }
                >
                  <strong>Auditoria de Logs:</strong> Acompanhar a tabela{' '}
                  <code>error_logs</code> durante as próximas 48 horas para
                  confirmar que não há chamadas legadas perdidas.
                </ListItem>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ icon, title, description, status }: any) {
  return (
    <Card className="bg-card">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="ml-auto">
          {status === 'success' && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {status === 'warning' && (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ListItem({ children, icon }: any) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      {icon || (
        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
      )}
      <span>{children}</span>
    </li>
  )
}
