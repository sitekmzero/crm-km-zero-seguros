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
import { useAuth } from '@/hooks/use-auth'

export default function Settings() {
  const { user, isAdmin } = useAuth()

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências de conta
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Usuário</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail (Login)</Label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
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

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Administração do Sistema</CardTitle>
              <CardDescription>
                Apenas administradores veem esta seção.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Como administrador, você pode gerenciar a configuração global de
                webhook do WhatsApp e chaves da Resend API no painel do
                Supabase.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  window.open('https://supabase.com/dashboard', '_blank')
                }
              >
                Abrir Painel do Supabase
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
