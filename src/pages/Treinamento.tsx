import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  GraduationCap,
  PlayCircle,
  CheckCircle,
  Award,
  BarChart,
} from 'lucide-react'
import { trainingModules } from '@/lib/training-data'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export default function Treinamento() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProgress()
    }
  }, [user])

  const fetchProgress = async () => {
    const { data } = await supabase
      .from('training_progress')
      .select('module_id')
      .eq('user_id', user!.id)
      .gte('score', 80)

    if (data) {
      setCompletedModules(data.map((d) => d.module_id))
    }
    setLoading(false)
  }

  const generateCertificate = () => {
    // Simulated PDF Generation via print window formatted
    toast({
      title: 'Gerando Certificado...',
      description: 'Aguarde enquanto preparamos seu PDF.',
    })
    setTimeout(() => {
      window.print()
    }, 1000)
  }

  const progressPercentage =
    Math.round((completedModules.length / trainingModules.length) * 100) || 0

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background font-sans print:p-0 print:bg-white">
      <div className="flex justify-between items-start mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" /> Academia Km Zero
          </h1>
          <p className="text-muted-foreground mt-1">
            Trilhas de capacitação do CRM para maximizar suas vendas.
          </p>
        </div>
        {isAdmin && (
          <Link to="/treinamento/relatorio">
            <Button
              variant="outline"
              className="gap-2 border-primary/20 text-primary bg-primary/5"
            >
              <BarChart className="h-4 w-4" /> Relatório da Equipe
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-8 print:hidden">
        <Card className="bg-[#0B1F3B] text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#C8A24A]" /> Seu Progresso:{' '}
                  {progressPercentage}%
                </h3>
                <Progress
                  value={progressPercentage}
                  className="h-3 bg-white/20"
                />
                <p className="text-sm mt-2 text-gray-300">
                  {completedModules.length} de {trainingModules.length} módulos
                  concluídos.
                </p>
              </div>
              <div>
                <Button
                  onClick={generateCertificate}
                  disabled={progressPercentage < 100}
                  className="bg-[#C8A24A] hover:bg-[#b08d40] text-white font-bold h-12 px-6"
                >
                  Emitir Certificado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 print:hidden">
        {trainingModules.map((mod, i) => {
          const isCompleted = completedModules.includes(mod.id)
          const isLocked =
            i > 0 && !completedModules.includes(trainingModules[i - 1].id)

          return (
            <Card
              key={mod.id}
              className={cn(
                'flex flex-col transition-all',
                isLocked && 'opacity-60 grayscale',
              )}
            >
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {mod.level}
                  </span>
                  {isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <CardTitle className="text-lg mt-2 leading-tight">
                  {mod.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Duração estimada: {mod.duration}
                  </p>
                </div>
                <Button
                  asChild
                  disabled={isLocked}
                  variant={isCompleted ? 'outline' : 'default'}
                  className="w-full gap-2 mt-4"
                >
                  <Link to={`/treinamento/modulo/${mod.id}`}>
                    <PlayCircle className="h-4 w-4" />
                    {isCompleted ? 'Revisar Módulo' : 'Iniciar Treinamento'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Certificate Print Template (only visible when printing) */}
      <div className="hidden print:flex flex-col items-center justify-center w-full h-[100vh] border-[10px] border-[#0B1F3B] p-10 relative">
        <div className="absolute inset-0 border-[2px] border-[#C8A24A] m-2 pointer-events-none" />
        <img
          src="https://idtvwxzbmnqjcyxquqdk.supabase.co/storage/v1/object/public/Imagem/Logo%20km%20zero%20fundo%20branco%20transparente%20site.svg"
          alt="Logo"
          className="h-20 mb-8"
        />

        <h1 className="text-5xl font-serif font-bold text-[#0B1F3B] mb-2 uppercase tracking-widest text-center">
          Certificado de Conclusão
        </h1>
        <h2 className="text-2xl text-[#C8A24A] mb-12">
          Academia de Vendas CRM
        </h2>

        <p className="text-lg text-gray-600 mb-4">Certificamos que</p>
        <p className="text-4xl font-bold text-[#0B1F3B] mb-4 border-b pb-2 px-10">
          {user?.user_metadata?.name || user?.email}
        </p>

        <p className="text-lg text-gray-600 max-w-2xl text-center mb-12">
          concluiu com êxito todos os módulos de capacitação na plataforma CRM
          Km Zero, demonstrando proficiência em gestão de leads, funil de vendas
          e automações.
        </p>

        <div className="flex justify-between w-full max-w-2xl mt-12">
          <div className="text-center">
            <div className="border-t border-gray-400 w-48 mb-2"></div>
            <p className="text-sm font-bold text-gray-700">
              Diretoria Comercial
            </p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 w-48 mb-2"></div>
            <p className="text-sm font-bold text-gray-700">Data de Emissão</p>
            <p className="text-sm">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
