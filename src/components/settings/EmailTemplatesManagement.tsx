import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Mail,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const ALLOWED_VARIABLES = [
  'nome_cliente',
  'email_cliente',
  'telefone_cliente',
  'produto',
  'valor_cotacao',
  'data_proposta',
  'link_cotacao',
  'nome_vendedor',
]

const SAMPLE_DATA: Record<string, string> = {
  nome_cliente: 'João Silva',
  email_cliente: 'joao@exemplo.com',
  telefone_cliente: '(11) 99999-9999',
  produto: 'Seguro Auto Completo',
  valor_cotacao: '2.450,00',
  data_proposta: '25/10/2023',
  link_cotacao: 'https://kmzero.com/proposta/123',
  nome_vendedor: 'Mariana Consultora',
}

export function EmailTemplatesManagement() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (data && !error) setTemplates(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir este template? Esta ação não pode ser desfeita.',
      )
    )
      return

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Template excluído.' })
      fetchTemplates()
    }
  }

  if (editingTemplate || isCreating) {
    return (
      <TemplateEditor
        template={editingTemplate}
        user={user}
        onBack={() => {
          setEditingTemplate(null)
          setIsCreating(false)
        }}
        onSaved={() => {
          setEditingTemplate(null)
          setIsCreating(false)
          fetchTemplates()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3B]">
            Templates de E-mail
          </h2>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie os modelos de e-mail automatizados do CRM.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#C8A24A] hover:bg-[#b08d40] text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Novo Template
        </Button>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum template encontrado.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium text-[#0B1F3B]">
                    {t.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[200px]">
                    {t.subject}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === 'publicado' ? 'default' : 'secondary'
                      }
                      className={
                        t.status === 'publicado'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : ''
                      }
                    >
                      {t.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {t.updated_at
                      ? format(new Date(t.updated_at), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTemplate(t)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(t.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function TemplateEditor({ template, user, onBack, onSaved }: any) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
    status: template?.status || 'rascunho',
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const insertVariable = (variable: string) => {
    setFormData((prev) => ({ ...prev, body: prev.body + `{{${variable}}}` }))
  }

  const validateTemplate = () => {
    if (!formData.name.trim()) return 'O nome do template é obrigatório.'
    if (!formData.subject.trim()) return 'O assunto é obrigatório.'
    if (!formData.body.trim()) return 'O corpo do e-mail não pode estar vazio.'

    // Check for invalid variables
    const matches = formData.body.match(/\{\{([^}]+)\}\}/g) || []
    for (const match of matches) {
      const varName = match.replace(/[{}]/g, '')
      if (!ALLOWED_VARIABLES.includes(varName)) {
        return `Variável inválida encontrada: {{${varName}}}`
      }
    }

    return null
  }

  const handleSave = async (status: string) => {
    const errorMsg = validateTemplate()
    if (errorMsg) {
      toast({
        title: 'Erro de Validação',
        description: errorMsg,
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    const matches = formData.body.match(/\{\{([^}]+)\}\}/g) || []
    const variablesUsed = [
      ...new Set(matches.map((m) => m.replace(/[{}]/g, ''))),
    ]

    const payload = {
      name: formData.name,
      subject: formData.subject,
      body: formData.body,
      status: status,
      variables_used: variablesUsed,
      updated_at: new Date().toISOString(),
      created_by: user?.id,
    }

    let error
    if (template?.id) {
      const { error: err } = await supabase
        .from('email_templates')
        .update(payload)
        .eq('id', template.id)
      error = err
    } else {
      const { error: err } = await supabase
        .from('email_templates')
        .insert(payload)
      error = err
    }

    setSaving(false)
    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: `Template ${status === 'publicado' ? 'publicado' : 'salvo como rascunho'} com sucesso!`,
      })
      onSaved()
    }
  }

  const renderPreview = (text: string) => {
    let preview = text.replace(/\n/g, '<br/>')
    Object.keys(SAMPLE_DATA).forEach((key) => {
      preview = preview.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        `<strong style="color: #C8A24A;">${SAMPLE_DATA[key]}</strong>`,
      )
    })
    return preview
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3B]">
            {template ? 'Editar Template' : 'Novo Template'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure os dados e variáveis dinâmicas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-2">
            <Label>Nome do Template (Uso Interno)</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Boas-vindas Consórcio"
            />
          </div>
          <div className="space-y-2">
            <Label>Assunto do E-mail</Label>
            <Input
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Ex: Bem-vindo à Km Zero"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Label>Corpo do E-mail</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="h-8 text-xs"
              >
                {previewMode ? (
                  <Edit className="w-3 h-3 mr-1" />
                ) : (
                  <Eye className="w-3 h-3 mr-1" />
                )}
                {previewMode ? 'Modo Edição' : 'Ver Preview'}
              </Button>
            </div>

            {!previewMode ? (
              <Textarea
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                className="min-h-[300px] font-mono text-sm"
                placeholder="Escreva sua mensagem aqui... Use variáveis como {{nome_cliente}}"
              />
            ) : (
              <div className="min-h-[300px] p-4 border rounded-md bg-gray-50 overflow-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderPreview(formData.body),
                  }}
                />
              </div>
            )}
          </div>

          {!previewMode && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Variáveis Dinâmicas Disponíveis
              </Label>
              <div className="flex flex-wrap gap-2">
                {ALLOWED_VARIABLES.map((v) => (
                  <Badge
                    key={v}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => insertVariable(v)}
                  >
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => handleSave('rascunho')}
              disabled={saving}
              className="flex-1"
            >
              Salvar como Rascunho
            </Button>
            <Button
              onClick={() => handleSave('publicado')}
              disabled={saving}
              className="flex-1 bg-[#0B1F3B] hover:bg-[#1a365d] text-white"
            >
              Publicar Template
            </Button>
          </div>
        </div>

        <div className="hidden lg:block bg-gray-100 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-[#0B1F3B] font-semibold">
            <Mail className="h-5 w-5" /> Visualização do Cliente
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b p-3 space-y-1 text-sm">
              <div>
                <span className="text-gray-500 w-16 inline-block">De:</span>{' '}
                contato@kmzero.com.br
              </div>
              <div>
                <span className="text-gray-500 w-16 inline-block">Para:</span>{' '}
                {SAMPLE_DATA.email_cliente}
              </div>
              <div>
                <span className="text-gray-500 w-16 inline-block">
                  Assunto:
                </span>{' '}
                <span className="font-semibold">
                  {formData.subject || 'Sem assunto'}
                </span>
              </div>
            </div>
            <div
              className="p-6 text-gray-800 text-sm leading-relaxed min-h-[300px]"
              dangerouslySetInnerHTML={{
                __html: renderPreview(
                  formData.body || 'Seu e-mail aparecerá aqui...',
                ),
              }}
            />
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 text-blue-800 rounded-md text-xs border border-blue-100">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Os dados coloridos em dourado são informações reais que serão
              substituídas automaticamente pelo sistema no momento do envio real
              para o cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
