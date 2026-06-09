import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Save, Loader2, PanelRightClose } from 'lucide-react'

type Lead = Database['public']['Tables']['leads']['Row']

interface LeadDetailsSidebarProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onUpdate: (updated: Lead) => void
}

export function LeadDetailsSidebar({
  lead,
  isOpen,
  onClose,
  onUpdate,
}: LeadDetailsSidebarProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setFormData(lead)
  }, [lead])

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          cpf: formData.cpf,
          product_interest: formData.product_interest,
          assigned_to: formData.assigned_to,
          internal_notes: formData.internal_notes,
          vehicle_info: formData.vehicle_info,
          is_renewal: formData.is_renewal,
          previous_policy_url: formData.previous_policy_url,
          desired_credit: formData.desired_credit,
          target_installment: formData.target_installment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new Error('Este telefone já está cadastrado em outro lead.')
        }
        throw error
      }

      if (data) {
        onUpdate(data)
        toast({ title: 'Sucesso', description: 'Ficha salva com sucesso!' })
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  const showInsurance = formData.product_interest === 'Seguro'
  const showCredit =
    formData.product_interest === 'Consórcio' ||
    formData.product_interest === 'Financiamento' ||
    formData.product_interest === 'Refinanciamento'

  return (
    <div className="w-full md:w-[340px] shrink-0 border-l bg-card flex flex-col h-full shadow-lg z-20 transition-all duration-300">
      <div className="h-16 border-b flex items-center justify-between px-4 shrink-0 bg-card">
        <h3 className="font-semibold text-foreground">Ficha do Lead</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <PanelRightClose className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Contato */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Contato
          </h4>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nome</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Telefone</Label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">CPF</Label>
            <Input
              value={formData.cpf || ''}
              onChange={(e) => handleChange('cpf', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Interesse */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Interesse
          </h4>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Produto</Label>
            <Select
              value={formData.product_interest || ''}
              onValueChange={(v) => handleChange('product_interest', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seguro">Seguro</SelectItem>
                <SelectItem value="Consórcio">Consórcio</SelectItem>
                <SelectItem value="Financiamento">Financiamento</SelectItem>
                <SelectItem value="Refinanciamento">Refinanciamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Responsável</Label>
            <Select
              value={formData.assigned_to || ''}
              onValueChange={(v) => handleChange('assigned_to', v)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Adriana">Adriana</SelectItem>
                <SelectItem value="Gabriel">Gabriel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Anotações Internas
            </Label>
            <Textarea
              value={formData.internal_notes || ''}
              onChange={(e) => handleChange('internal_notes', e.target.value)}
              className="resize-none h-20 text-sm"
              placeholder="Adicione observações sobre a negociação..."
            />
          </div>
        </div>

        {/* Seguro */}
        {showInsurance && (
          <div className="space-y-3 p-3 bg-secondary/30 rounded-md border border-border/50">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Seguro
            </h4>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Veículo (Ano/Modelo/Placa)
              </Label>
              <Input
                value={formData.vehicle_info || ''}
                onChange={(e) => handleChange('vehicle_info', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs text-muted-foreground">
                É Renovação?
              </Label>
              <Switch
                checked={!!formData.is_renewal}
                onCheckedChange={(c) => handleChange('is_renewal', c)}
              />
            </div>
            {formData.is_renewal && (
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs text-muted-foreground">
                  URL Apólice Anterior
                </Label>
                <Input
                  value={formData.previous_policy_url || ''}
                  onChange={(e) =>
                    handleChange('previous_policy_url', e.target.value)
                  }
                  className="h-8 text-sm"
                  placeholder="https://"
                />
              </div>
            )}
          </div>
        )}

        {/* Crédito */}
        {showCredit && (
          <div className="space-y-3 p-3 bg-secondary/30 rounded-md border border-border/50">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Crédito
            </h4>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Crédito Desejado (R$)
              </Label>
              <Input
                type="number"
                value={formData.desired_credit || ''}
                onChange={(e) =>
                  handleChange(
                    'desired_credit',
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="h-8 text-sm"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Parcela Alvo (R$)
              </Label>
              <Input
                type="number"
                value={formData.target_installment || ''}
                onChange={(e) =>
                  handleChange(
                    'target_installment',
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="h-8 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-card shrink-0">
        <Button
          className="w-full bg-[#C8A24A] hover:bg-[#b38f3d] text-white"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Ficha
        </Button>
      </div>
    </div>
  )
}
