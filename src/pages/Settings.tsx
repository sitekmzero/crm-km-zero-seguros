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

export default function Settings() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  const [n8nUrl, setN8nUrl] = useState('')
  const [pipedriveKey, setPipedriveKey] = useState('')
  const [specialties, setSpecialties] = useState('')

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
      .from('vendor_config')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle()
    if (data) {
      setN8nUrl(data.n8n_webhook_url || '')
      setPipedriveKey(data.pipedrive_api_key || '')
      setSpecialties(data.specialties?.join(', ') || '')
    }
  }

  const fetchCompanyConfig = async () => {
    const { data } = await supabase
      .from('corretora_config')
      .select('*')
      .single()
    if (data) setCompanyInfo(data)
  }

  const saveIntegrations = async () => {
    const { error } = await supabase.from('vendor_config').upsert({
      user_id: user!.id,
      n8n_webhook_url: n8nUrl,
      pipedrive_api_key: pipedriveKey,
      specialties: specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
    if (error)
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    else toast({ title: 'Sucesso', description: 'Integrações salvas.' })
  }

  const saveCompanyInfo = async () => {
    const { error } = await supabase
      .from('corretora_config')
      .upsert({ id: '00000000-0000-0000-0000-000000000000', ...companyInfo })
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
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
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
