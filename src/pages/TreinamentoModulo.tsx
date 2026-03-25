import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { trainingModules } from '@/lib/training-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TreinamentoModulo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  const module = trainingModules.find((m) => m.id === id)

  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)

  // Forum state
  const [posts, setPosts] = useState<any[]>([])
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {},
  )
  const [loadingForum, setLoadingForum] = useState(true)

  useEffect(() => {
    if (module) {
      fetchForumPosts()
    }
  }, [module])

  const fetchForumPosts = async () => {
    setLoadingForum(true)
    const { data: fetchedPosts } = await supabase
      .from('forum_posts')
      .select(
        `
        *,
        user_profiles:user_id(full_name, email),
        forum_replies(*, user_profiles:user_id(full_name, email))
      `,
      )
      .eq('module_id', module?.id)
      .order('created_at', { ascending: false })

    if (fetchedPosts) {
      setPosts(fetchedPosts)
    }
    setLoadingForum(false)
  }

  if (!module) return <div className="p-8">Módulo não encontrado.</div>

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQ] = optionIdx
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQ < module.questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      calculateScore()
    }
  }

  const calculateScore = async () => {
    let correct = 0
    answers.forEach((ans, idx) => {
      if (ans === module.questions[idx].correctAnswer) correct++
    })

    const finalScore = Math.round((correct / module.questions.length) * 100)
    setScore(finalScore)
    setShowResults(true)

    if (finalScore >= 80 && user) {
      setSaving(true)
      await supabase.from('training_progress').upsert(
        {
          user_id: user.id,
          module_id: module.id,
          score: finalScore,
        },
        { onConflict: 'user_id,module_id' },
      )
      setSaving(false)
      toast({ title: 'Sucesso!', description: 'Progresso salvo.' })
    }
  }

  const resetQuiz = () => {
    setCurrentQ(0)
    setAnswers([])
    setShowResults(false)
    setScore(0)
  }

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !user) return

    const { error } = await supabase.from('forum_posts').insert({
      user_id: user.id,
      module_id: module.id,
      title: newPostTitle,
      content: newPostContent,
    })

    if (!error) {
      toast({
        title: 'Pergunta enviada',
        description: 'Sua dúvida foi postada no fórum.',
      })
      setNewPostTitle('')
      setNewPostContent('')
      fetchForumPosts()
    }
  }

  const handleCreateReply = async (postId: string) => {
    const content = replyContent[postId]
    if (!content?.trim() || !user) return

    const { error } = await supabase.from('forum_replies').insert({
      post_id: postId,
      user_id: user.id,
      content: content,
    })

    if (!error) {
      toast({ title: 'Resposta enviada' })
      setReplyContent({ ...replyContent, [postId]: '' })
      fetchForumPosts()
    }
  }

  const markReplyCorrect = async (replyId: string) => {
    if (!isAdmin) return
    await supabase
      .from('forum_replies')
      .update({ is_correct: true })
      .eq('id', replyId)
    toast({ title: 'Marcada como correta' })
    fetchForumPosts()
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/treinamento"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Trilhas
        </Link>

        <h1 className="text-3xl font-bold text-[#0B1F3B] mb-2">
          {module.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded font-semibold">
            {module.level}
          </span>
          <span>Duração: {module.duration}</span>
        </div>

        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-8 shadow-elevation">
          <iframe
            src={module.videoUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <Card className="mb-12 shadow-sm border-border">
          <CardContent
            className="p-8 prose prose-slate max-w-none prose-h3:text-[#0B1F3B] prose-h4:text-[#C8A24A]"
            dangerouslySetInnerHTML={{ __html: module.content }}
          />
        </Card>

        <h2 className="text-2xl font-bold text-[#0B1F3B] mb-6">
          Validação de Conhecimento
        </h2>

        {!showResults ? (
          <Card className="shadow-elevation border-primary/20 mb-12">
            <CardContent className="p-8">
              <div className="flex justify-between text-sm font-medium text-muted-foreground mb-4">
                <span>
                  Pergunta {currentQ + 1} de {module.questions.length}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-6">
                {module.questions[currentQ].question}
              </h3>

              <div className="space-y-3">
                {module.questions[currentQ].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQ] === idx
                        ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={nextQuestion}
                  disabled={answers[currentQ] === undefined}
                  className="px-8 font-bold"
                >
                  {currentQ === module.questions.length - 1
                    ? 'Finalizar Quiz'
                    : 'Próxima'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center p-10 border-primary/20 shadow-elevation mb-12">
            {score >= 80 ? (
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F3B]">
                  Módulo Concluído!
                </h3>
                <p className="text-muted-foreground">
                  Você atingiu {score}% de acertos.
                </p>
                <div className="pt-6">
                  <Button
                    onClick={() => navigate('/treinamento')}
                    className="px-8 font-bold"
                    disabled={saving}
                  >
                    Voltar para Trilhas
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#0B1F3B]">
                  Você precisa de 80% para aprovação.
                </h3>
                <p className="text-muted-foreground">
                  Sua pontuação foi de {score}%. Revise o material e tente
                  novamente.
                </p>
                <div className="pt-6">
                  <Button
                    onClick={resetQuiz}
                    variant="outline"
                    className="px-8 font-bold"
                  >
                    Refazer Quiz
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Fórum de Dúvidas */}
        <div className="pt-8 border-t border-border">
          <h2 className="text-2xl font-bold text-[#0B1F3B] mb-2 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-[#C8A24A]" /> Fórum de
            Dúvidas
          </h2>
          <p className="text-muted-foreground mb-6">
            Compartilhe suas dúvidas e ajude outros colegas com este módulo.
          </p>

          <Card className="mb-8">
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="Título da sua pergunta"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
              <Textarea
                placeholder="Descreva sua dúvida com mais detalhes..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <Button
                onClick={handleCreatePost}
                disabled={!newPostTitle || !newPostContent}
                className="w-full sm:w-auto"
              >
                Publicar Pergunta
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {loadingForum ? (
              <p className="text-center text-muted-foreground py-8">
                Carregando discussões...
              </p>
            ) : posts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 bg-muted/30 rounded-lg">
                Nenhuma pergunta ainda. Seja o primeiro a perguntar!
              </p>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="shadow-sm">
                  <CardHeader className="pb-3 bg-muted/10 border-b border-border">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Por {post.user_profiles?.full_name || 'Usuário'} em{' '}
                          {format(
                            new Date(post.created_at),
                            "dd 'de' MMMM 'às' HH:mm",
                            { locale: ptBR },
                          )}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-foreground mb-6">
                      {post.content}
                    </p>

                    <div className="pl-4 border-l-2 border-border space-y-4 mb-4">
                      {post.forum_replies?.map((reply: any) => (
                        <div
                          key={reply.id}
                          className={`p-3 rounded-md text-sm ${reply.is_correct ? 'bg-green-50 border border-green-200' : 'bg-muted/30'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold">
                              {reply.user_profiles?.full_name || 'Usuário'}
                            </span>
                            {reply.is_correct && (
                              <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Resposta
                                Correta
                              </span>
                            )}
                          </div>
                          <p>{reply.content}</p>
                          {isAdmin && !reply.is_correct && (
                            <button
                              onClick={() => markReplyCorrect(reply.id)}
                              className="text-xs text-primary hover:underline mt-2"
                            >
                              Marcar como solução
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="Escreva uma resposta..."
                        value={replyContent[post.id] || ''}
                        onChange={(e) =>
                          setReplyContent({
                            ...replyContent,
                            [post.id]: e.target.value,
                          })
                        }
                        className="h-9 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCreateReply(post.id)}
                        disabled={!replyContent[post.id]}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
