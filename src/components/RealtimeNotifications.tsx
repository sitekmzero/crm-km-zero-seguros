import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Bell, RefreshCw, MessageCircle, AlertTriangle } from 'lucide-react'

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
        { event: 'INSERT', schema: 'public', table: 'internal_messages' },
        (payload) => {
          if (payload.new.user_id !== user.id) {
            toast('Nova Mensagem no Chat', {
              description: 'Você tem uma nova mensagem interna em um contato.',
              icon: <MessageCircle className="h-4 w-4 text-primary" />,
            })
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'app_notifications' },
        (payload) => {
          if (payload.new.user_id === user.id) {
            const isUrgent = payload.new.priority === 'high'
            toast(payload.new.title, {
              description: payload.new.message,
              icon: (
                <AlertTriangle
                  className={`h-4 w-4 ${isUrgent ? 'text-red-500' : 'text-blue-500'}`}
                />
              ),
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
