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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  // Integrations State
  const [n8nUrl, setN8nUrl] = useState('')
  const [pipedriveKey, setPipedriveKey] = useState('')
  const [specialties, setSpecialties] = useState('')

  // Templates State
  const [templates, setTemplates] = useState<any[]>([])
  const [editingTemplate, setEditingTemplate] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchVendorConfig()
      if (isAdmin) fetchTemplates()
    }
  }, [user, isAdmin])

  const fetchVendorConfig = async () => {
    const { data } = await supabase
      .from('vendor_config')
      .select('*')
      .eq('user_id', user?.id)
      .single()
    if (data) {
      setN8nUrl(data.n8n_webhook_url || '')
      setPipedriveKey(data.pipedrive_api_key || '')
      setSpecialties(data.specialties?.join(', ') || '')
    }
  }

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at')
    if (data) setTemplates(data)
  }

  const saveIntegrations = async () => {
    const { error } = await supabase.from('vendor_config').upsert({
      user_id: user?.id,
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
    else
      toast({
        title: 'Sucesso',
        description: 'Integrações salvas com sucesso.',
      })
  }

  const saveTemplate = async () => {
    if (!editingTemplate) return
    const { error } = await supabase.from('email_templates').upsert({
      id: editingTemplate.id,
      name: editingTemplate.name,
      stage: editingTemplate.stage,
      subject: editingTemplate.subject,
      body: editingTemplate.body,
    })
    if (error)
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    else {
      toast({ title: 'Sucesso', description: 'Template salvo.' })
      setEditingTemplate(null)
      fetchTemplates()
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e automações
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full max-w-4xl">
        <TabsList className="mb-6 bg-muted/50 p-1">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="templates">Templates (Admin)</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>E-mail (Login)</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Role (Permissão)</Label>
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
              <CardDescription>
                Conecte o CRM com ferramentas externas e defina especialidades.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label>N8N Webhook URL</Label>
                <Input
                  value={n8nUrl}
                  onChange={(e) => setN8nUrl(e.target.value)}
                  placeholder="https://seu-n8n.com/webhook/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Pipedrive API Key</Label>
                <Input
                  type="password"
                  value={pipedriveKey}
                  onChange={(e) => setPipedriveKey(e.target.value)}
                  placeholder="******************"
                />
              </div>
              <div className="space-y-2">
                <Label>Especialidades (separado por vírgula)</Label>
                <Input
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Ex: Seguro Auto, Consórcio"
                />
              </div>
              <Button className="mt-2" onClick={saveIntegrations}>
                Salvar Integrações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automação de E-mails (Por Estágio)</CardTitle>
                <CardDescription>
                  Configure as mensagens enviadas automaticamente aos clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingTemplate ? (
                  <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border">
                    <h3 className="font-semibold">
                      {editingTemplate.id ? 'Editar' : 'Novo'} Template
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Template</Label>
                        <Input
                          value={editingTemplate.name}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Disparar no Estágio</Label>
                        <Input
                          value={editingTemplate.stage}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              stage: e.target.value,
                            })
                          }
                          placeholder="Ex: lead, opportunity"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Assunto</Label>
                      <Input
                        value={editingTemplate.subject}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            subject: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Corpo (HTML permitido)</Label>
                      <Textarea
                        className="min-h-[150px]"
                        value={editingTemplate.body}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            body: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Variáveis: {'{{nome_cliente}}, {{produto}}'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveTemplate}>Salvar Template</Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingTemplate(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={() =>
                        setEditingTemplate({
                          name: '',
                          stage: '',
                          subject: '',
                          body: '',
                        })
                      }
                    >
                      Criar Novo Template
                    </Button>

                    <div className="grid gap-2">
                      {templates.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum template configurado.
                        </p>
                      ) : (
                        templates.map((t) => (
                          <div
                            key={t.id}
                            className="flex justify-between items-center p-3 border border-border rounded-lg bg-card"
                          >
                            <div>
                              <p className="font-semibold text-sm">{t.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Gatilho: {t.stage}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTemplate(t)}
                            >
                              Editar
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
