import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Contact } from '@/stores/useContactsStore'

interface ScheduleMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  contact,
}: ScheduleMeetingDialogProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSchedule = async () => {
    if (!date || !time) {
      toast({
        title: 'Aviso',
        description: 'Preencha a data e a hora.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    // Call Edge Function to schedule in Google Calendar and send email
    const { error } = await supabase.functions.invoke(
      'google-calendar-schedule',
      {
        body: {
          contact_id: contact.id,
          contact_name: `${contact.firstName} ${contact.lastName}`,
          contact_email: contact.email,
          datetime: `${date}T${time}:00`,
        },
      },
    )

    if (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao agendar reunião. ' + error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Sucesso',
        description: 'Reunião agendada e convite enviado ao cliente!',
      })
      onOpenChange(false)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Reunião</DialogTitle>
          <DialogDescription>
            Agende um horário para falar com{' '}
            <strong className="text-foreground">{contact.firstName}</strong>. O
            cliente receberá um convite por e-mail automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="w-full font-semibold"
            onClick={handleSchedule}
            disabled={loading || !date || !time}
          >
            {loading ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
