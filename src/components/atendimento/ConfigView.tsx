import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ConfigView() {
  const [prompt, setPrompt] = useState('')
  const [learningMode, setLearningMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchConfigs = async () => {
      const { data } = await supabase
        .from('configs')
        .select('*')
        .in('key', ['sdr_system_prompt', 'learning_mode_active'])
      if (data) {
        const p = data.find((c) => c.key === 'sdr_system_prompt')?.value
        const l = data.find((c) => c.key === 'learning_mode_active')?.value
        if (p) setPrompt(p)
        if (l) setLearningMode(l === 'true')
      }
    }
    fetchConfigs()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.from('configs').upsert([
      { key: 'sdr_system_prompt', value: prompt },
      { key: 'learning_mode_active', value: learningMode ? 'true' : 'false' },
    ])

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Configurações salvas com sucesso' })
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/20 w-full h-full">
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <h2 className="text-2xl font-bold tracking-tight">
          Configurações da IA (SDR)
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Modo Aprendendo</CardTitle>
            <CardDescription>
              Quando ativado, a IA irá gerar rascunhos de respostas em vez de
              enviá-las automaticamente ao Meta WhatsApp. Você deverá aprovar
              cada mensagem manualmente na aba Conversas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Label
              htmlFor="learning-mode"
              className="flex-1 cursor-pointer font-medium"
            >
              Ativar Modo Aprendendo
            </Label>
            <Switch
              id="learning-mode"
              checked={learningMode}
              onCheckedChange={setLearningMode}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
            <CardDescription>
              Instruções base que definem o comportamento e as regras do SDR
              virtual na qualificação de leads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[300px] font-mono text-sm leading-relaxed"
              placeholder="Digite o system prompt da IA..."
            />
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#C8A24A] hover:bg-[#C8A24A]/90 text-white shadow-sm"
              >
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
