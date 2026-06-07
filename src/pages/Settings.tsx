import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { UserManagement } from '@/components/settings/UserManagement'
import { EmailTemplatesManagement } from '@/components/settings/EmailTemplatesManagement'
import { Switch } from '@/components/ui/switch'
import { Copy, Code, Globe, MessageCircle } from 'lucide-react'

export default function Settings() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  const [n8nUrl, setN8nUrl] = useState('')
  const [pipedriveKey, setPipedriveKey] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [channelGoals, setChannelGoals] = useState<any[]>([])

  // Admin Company Config
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    round_robin_enabled: false,
  })

  useEffect(() => {
    if (user) {
      fetchVendorConfig()
      if (isAdmin) {
        fetchCompanyConfig()
      }
    }
  }, [user, isAdmin])

  const fetchVendorConfig = async () => {
    const { data } = await supabase
      .from('configs')
      .select('*')
      .eq('key', `vendor_config_${user!.id}`)
      .maybeSingle()
    if (data && data.value) {
      try {
        const parsed = JSON.parse(data.value)
        setN8nUrl(parsed.n8n_webhook_url || '')
        setPipedriveKey(parsed.pipedrive_api_key || '')
        setSpecialties(parsed.specialties?.join(', ') || '')
      } catch {
        /* intentionally ignored */
      }
    }
  }

  const fetchCompanyConfig = async () => {
    const { data } = await supabase
      .from('configs')
      .select('*')
      .eq('key', 'company_info')
      .maybeSingle()
    if (data && data.value) {
      try {
        const parsed = JSON.parse(data.value)
        setCompanyInfo({ ...companyInfo, ...parsed })
      } catch {
        /* intentionally ignored */
      }
    }
    const { data: goalsData } = await supabase.from('channel_goals').select('*')
    if (goalsData) {
      const defaultGoals = [
        { channel: 'whatsapp', target_count: 50 },
        { channel: 'instagram', target_count: 20 },
        { channel: 'facebook', target_count: 10 },
        { channel: 'landing_page', target_count: 30 },
        { channel: 'webchat', target_count: 15 },
      ]

      const merged = defaultGoals.map((dg) => {
        const found = goalsData.find((g) => g.channel === dg.channel)
        return found ? found : dg
      })
      setChannelGoals(merged)
    }
  }

  const saveChannelGoals = async () => {
    const upserts = channelGoals.map((g) => ({
      channel: g.channel,
      target_count: Number(g.target_count) || 0,
      period: 'monthly',
    }))
    const { error } = await supabase
      .from('channel_goals')
      .upsert(upserts, { onConflict: 'channel' })
    if (error)
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    else
      toast({ title: 'Sucesso', description: 'Metas por canal atualizadas.' })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copiado!',
      description: 'Texto copiado para a área de transferência.',
    })
  }

  const saveIntegrations = async () => {
    const value = JSON.stringify({
      n8n_webhook_url: n8nUrl,
      pipedrive_api_key: pipedriveKey,
      specialties: specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
    const { error } = await supabase.from('configs').upsert(
      {
        key: `vendor_config_${user!.id}`,
        value,
      },
      { onConflict: 'key' },
    )
    if (error)
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    else toast({ title: 'Sucesso', description: 'Integrações salvas.' })
  }

  const saveCompanyInfo = async () => {
    const value = JSON.stringify(companyInfo)
    const { error } = await supabase
      .from('configs')
      .upsert({ key: 'company_info', value }, { onConflict: 'key' })
    if (error)
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    else
      toast({ title: 'Sucesso', description: 'Dados da empresa atualizados.' })
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e automações
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full max-w-5xl">
        <TabsList className="mb-6 bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="metas">Metas de Conversão</TabsTrigger>
              <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
              <TabsTrigger value="templates">Templates de E-mail</TabsTrigger>
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={isAdmin ? 'Administrador' : 'Vendedor'}
                  disabled
                  className="bg-muted font-semibold text-primary"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Landing Pages (API)
                </CardTitle>
                <CardDescription>
                  Webhook para formulários externos (Elementor, Webflow, etc)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Endpoint de Captura (POST)</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/leads-capture`}
                      className="bg-muted font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/leads-capture`,
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md border">
                  <strong>Instruções Elementor Pro:</strong>
                  <br />
                  1. No formulário, adicione a ação "Webhook".
                  <br />
                  2. Cole o URL acima no campo "Webhook URL".
                  <br />
                  3. Certifique-se de que os campos tenham os IDs:{' '}
                  <code>name</code>, <code>phone</code>, <code>email</code>,{' '}
                  <code>product</code>.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Webchat Widget
                </CardTitle>
                <CardDescription>
                  Chatbot flutuante para seu site principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Script de Instalação</Label>
                  <div className="relative">
                    <div className="bg-slate-950 text-slate-50 p-3 rounded-md font-mono text-xs overflow-x-auto">
                      {`<script src="${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget" defer></script>`}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 bg-white text-black hover:bg-gray-200"
                      onClick={() =>
                        copyToClipboard(
                          `<script src="${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget" defer></script>`,
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Cole este script logo antes da tag de fechamento{' '}
                  <code>&lt;/body&gt;</code> no HTML do seu site.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" /> Configurações Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>N8N Webhook URL</Label>
                <Input
                  value={n8nUrl}
                  onChange={(e) => setN8nUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Pipedrive API Key</Label>
                <Input
                  type="password"
                  value={pipedriveKey}
                  onChange={(e) => setPipedriveKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Especialidades (virgula)</Label>
                <Input
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                />
              </div>
              <Button onClick={saveIntegrations}>Salvar Integrações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="metas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metas de Conversão por Canal</CardTitle>
                  <CardDescription>
                    Defina os objetivos mensais para cada canal de aquisição.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-xl">
                  {channelGoals.map((goal, index) => (
                    <div key={goal.channel} className="flex items-center gap-4">
                      <Label className="w-32 capitalize">
                        {goal.channel.replace('_', ' ')}
                      </Label>
                      <Input
                        type="number"
                        value={goal.target_count}
                        onChange={(e) => {
                          const newGoals = [...channelGoals]
                          newGoals[index].target_count = e.target.value
                          setChannelGoals(newGoals)
                        }}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        leads qualificados / mês
                      </span>
                    </div>
                  ))}
                  <Button onClick={saveChannelGoals} className="mt-4">
                    Salvar Metas
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="empresa" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Institucionais</CardTitle>
                  <CardDescription>
                    Utilizado no Manual do Usuário e faturas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input
                      value={companyInfo.name || ''}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input
                      value={companyInfo.cnpj || ''}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, cnpj: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Endereço Completo</Label>
                    <Input
                      value={companyInfo.address || ''}
                      onChange={(e) =>
                        setCompanyInfo({
                          ...companyInfo,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input
                        value={companyInfo.phone || ''}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        value={companyInfo.email || ''}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">
                          Distribuição Automática (Round Robin)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Atribui leads novos aos vendedores de forma
                          igualitária.
                        </p>
                      </div>
                      <Switch
                        checked={companyInfo.round_robin_enabled || false}
                        onCheckedChange={(v) =>
                          setCompanyInfo({
                            ...companyInfo,
                            round_robin_enabled: v,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button className="mt-4" onClick={saveCompanyInfo}>
                    Salvar Dados
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <EmailTemplatesManagement />
            </TabsContent>

            <TabsContent value="usuarios" className="space-y-6">
              <UserManagement />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
