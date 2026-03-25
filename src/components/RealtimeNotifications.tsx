import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Bell, RefreshCw, MessageCircle } from 'lucide-react'

export function RealtimeNotifications() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('global_notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contacts' },
        (payload) => {
          if (payload.new.proprietario_id === user.id) {
            toast('Novo Contato Atribuído!', {
              description: `${payload.new.first_name} foi adicionado ao seu pipeline.`,
              icon: <Bell className="h-4 w-4 text-primary" />,
            })
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contacts' },
        (payload) => {
          if (
            payload.new.proprietario_id === user.id &&
            payload.new.status !== payload.old.status
          ) {
            toast('Status Atualizado', {
              description: `${payload.new.first_name} mudou para ${payload.new.status.replace(/_/g, ' ')}.`,
              icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
            })
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'crm_interactions' },
        (payload) => {
          if (
            payload.new.tipo === 'WhatsApp (Inbound)' ||
            payload.new.tipo?.includes('WhatsApp')
          ) {
            toast('Nova Mensagem WhatsApp', {
              description: payload.new.descricao,
              icon: <MessageCircle className="h-4 w-4 text-green-500" />,
            })
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quotations' },
        (payload) => {
          if (payload.new.status !== payload.old.status) {
            toast('Cotação Respondida', {
              description: `Uma cotação mudou para o status: ${payload.new.status}.`,
              icon: <Bell className="h-4 w-4 text-orange-500" />,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return null
}
