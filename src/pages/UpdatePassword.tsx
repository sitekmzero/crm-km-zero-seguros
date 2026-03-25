import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setEmail(session.user.email || '')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setEmail(session.user.email || '')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const hasMinLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const isMatch = password === confirmPassword && password.length > 0
  const isValid = hasMinLength && hasUpper && hasNumber && isMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Senha definida com sucesso!' })
      await supabase.auth.signOut()
      navigate('/login')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#F5F2EA' }}
    >
      <div className="mb-8">
        <img
          src="https://idtvwxzbmnqjcyxquqdk.supabase.co/storage/v1/object/public/Imagem/Logo%20km%20zero%20fundo%20branco%20transparente%20site.svg"
          alt="Km Zero Seguros"
          className="h-20 w-auto object-contain"
        />
      </div>
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1
          className="text-2xl font-bold text-center mb-2"
          style={{ color: '#0B1F3B' }}
        >
          Bem-vindo(a) à Km Zero
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Defina sua senha para acessar o CRM.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: '#0B1F3B' }}>
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: '#0B1F3B' }}>
              Nova Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" style={{ color: '#0B1F3B' }}>
              Confirme a Senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="py-2 space-y-1 text-sm">
            <div
              className={cn(
                'flex items-center gap-2',
                hasMinLength ? 'text-green-600' : 'text-gray-500',
              )}
            >
              {hasMinLength ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}{' '}
              Mínimo de 8 caracteres
            </div>
            <div
              className={cn(
                'flex items-center gap-2',
                hasUpper ? 'text-green-600' : 'text-gray-500',
              )}
            >
              {hasUpper ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}{' '}
              Pelo menos 1 letra maiúscula
            </div>
            <div
              className={cn(
                'flex items-center gap-2',
                hasNumber ? 'text-green-600' : 'text-gray-500',
              )}
            >
              {hasNumber ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}{' '}
              Pelo menos 1 número
            </div>
            <div
              className={cn(
                'flex items-center gap-2',
                isMatch ? 'text-green-600' : 'text-gray-500',
              )}
            >
              {isMatch ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}{' '}
              As senhas coincidem
            </div>
          </div>

          <Button
            type="submit"
            className="w-full font-semibold mt-4 hover:opacity-90"
            style={{ backgroundColor: '#C8A24A', color: '#ffffff' }}
            disabled={loading || !isValid}
          >
            {loading ? 'Salvando...' : 'Definir Senha'}
          </Button>
        </form>
      </div>
    </div>
  )
}
