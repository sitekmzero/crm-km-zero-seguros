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
  ChevronRight,
} from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
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
    if (module) fetchForumPosts()
  }, [module])

  const fetchForumPosts = async () => {
    setLoadingForum(true)
    const { data: fetchedPosts } = await supabase
      .from('forum_posts')
      .select(
        `*, user_profiles:user_id(full_name, email), forum_replies(*, user_profiles:user_id(full_name, email))`,
      )
      .eq('module_id', module?.id)
      .order('created_at', { ascending: false })

    if (fetchedPosts) setPosts(fetchedPosts)
    setLoadingForum(false)
  }

  if (!module) return <div className="p-8">Módulo não encontrado.</div>

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQ] = optionIdx
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQ < module.questions.length - 1) setCurrentQ(currentQ + 1)
    else calculateScore()
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
      // Save result to training_progress (alias to training_results conceptually)
      await supabase
        .from('training_progress')
        .upsert(
          { user_id: user.id, module_id: module.id, score: finalScore },
          { onConflict: 'user_id,module_id' },
        )
      setSaving(false)
      toast({ title: 'Sucesso!', description: 'Progresso salvo com sucesso.' })
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
      toast({ title: 'Dúvida enviada para a comunidade.' })
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
      toast({ title: 'Resposta publicada.' })
      setReplyContent({ ...replyContent, [postId]: '' })
      fetchForumPosts()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F2EA] font-sans">
      <div className="h-14 bg-white border-b border-border flex items-center px-6 shadow-sm flex-shrink-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/treinamento">Academia</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-primary">
                {module.level}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/treinamento"
            className="inline-flex items-center text-sm font-semibold text-[#0B1F3B] hover:text-[#C8A24A] mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para Trilhas
          </Link>

          <h1 className="text-4xl font-bold text-[#0B1F3B] mb-3">
            {module.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 font-medium">
            <span className="bg-[#C8A24A]/20 text-[#C8A24A] px-3 py-1 rounded-full uppercase tracking-wider text-[10px] border border-[#C8A24A]/50">
              Nível: {module.level}
            </span>
            <span>Duração Média: {module.duration}</span>
          </div>

          <div className="aspect-video bg-[#0B1F3B] rounded-xl overflow-hidden mb-10 shadow-elevation relative group">
            <iframe
              src={module.videoUrl}
              className="w-full h-full border-0 absolute inset-0 z-10"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute inset-0 flex items-center justify-center text-white z-0">
              Carregando Video Player...
            </div>
          </div>

          <Card className="mb-12 shadow-sm border-none bg-white">
            <CardContent
              className="p-8 prose prose-slate max-w-none prose-h3:text-[#0B1F3B] prose-h4:text-[#C8A24A] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: module.content }}
            />
          </Card>

          <h2 className="text-2xl font-bold text-[#0B1F3B] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-[#C8A24A]" /> Validação de
            Conhecimento
          </h2>

          {!showResults ? (
            <Card className="shadow-lg border-2 border-[#0B1F3B] mb-12 bg-white">
              <CardContent className="p-10">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">
                  <span>
                    Questão {currentQ + 1} de {module.questions.length}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-8 text-[#0B1F3B]">
                  {module.questions[currentQ].question}
                </h3>

                <div className="space-y-4">
                  {module.questions[currentQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-5 rounded-lg border-2 transition-all font-medium ${
                        answers[currentQ] === idx
                          ? 'border-[#C8A24A] bg-[#C8A24A]/10 text-[#0B1F3B] shadow-md'
                          : 'border-gray-200 hover:border-[#0B1F3B]/50 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex justify-end">
                  <Button
                    onClick={nextQuestion}
                    disabled={answers[currentQ] === undefined}
                    className="px-10 h-12 text-lg font-bold bg-[#0B1F3B] hover:bg-[#1a365d]"
                  >
                    {currentQ === module.questions.length - 1
                      ? 'Analisar Respostas'
                      : 'Próxima Questão'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center p-12 border-2 border-gray-100 shadow-elevation mb-12 bg-white">
              {score >= 80 ? (
                <div className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#0B1F3B]">
                    Módulo Concluído com Excelência!
                  </h3>
                  <p className="text-xl text-gray-600">
                    Pontuação atingida:{' '}
                    <strong className="text-green-600">
                      {score}% (
                      {Math.round((score / 100) * module.questions.length)}/
                      {module.questions.length} corretas)
                    </strong>
                  </p>
                  <div className="pt-8">
                    <Button
                      onClick={() => navigate('/treinamento')}
                      className="px-10 h-12 font-bold bg-[#C8A24A] hover:bg-[#b08d40]"
                      disabled={saving}
                    >
                      Avançar na Trilha
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <AlertCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#0B1F3B]">
                    Pontuação Insuficiente
                  </h3>
                  <p className="text-lg text-gray-600">
                    Sua pontuação foi de <strong>{score}%</strong>. A métrica de
                    aprovação é 80%.
                  </p>
                  <div className="pt-8">
                    <Button
                      onClick={resetQuiz}
                      variant="outline"
                      className="px-10 h-12 font-bold border-[#0B1F3B] text-[#0B1F3B]"
                    >
                      Revisar Aula e Tentar Novamente
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Fórum */}
          <div className="pt-10 border-t-2 border-gray-200">
            <h2 className="text-2xl font-bold text-[#0B1F3B] mb-3 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-[#C8A24A]" /> Fórum da
              Turma
            </h2>
            <p className="text-gray-500 mb-8">
              Discussões técnicas e suporte colaborativo sobre este módulo.
            </p>

            <Card className="mb-8 border-none shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                <Input
                  placeholder="Resumo da sua dúvida"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="bg-gray-50 border-gray-300"
                />
                <Textarea
                  placeholder="Contextualize sua dificuldade para que a equipe possa ajudar..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="bg-gray-50 border-gray-300"
                  rows={3}
                />
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostTitle || !newPostContent}
                  className="bg-[#0B1F3B] hover:bg-[#1a365d]"
                >
                  Publicar no Fórum
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {loadingForum ? (
                <p className="text-center text-gray-400 py-10">
                  Sincronizando fórum...
                </p>
              ) : posts.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
                  Sem discussões abertas. Seja o pioneiro!
                </div>
              ) : (
                posts.map((post) => (
                  <Card
                    key={post.id}
                    className="shadow-sm border-gray-200 bg-white"
                  >
                    <CardHeader className="pb-3 bg-gray-50/50 border-b border-gray-100">
                      <div>
                        <CardTitle className="text-lg text-[#0B1F3B]">
                          {post.title}
                        </CardTitle>
                        <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">
                          Por {post.user_profiles?.full_name || 'Agente'} •{' '}
                          {format(new Date(post.created_at), 'dd MMM HH:mm', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <p className="text-sm text-gray-700 mb-6">
                        {post.content}
                      </p>

                      <div className="pl-4 border-l-4 border-gray-200 space-y-4 mb-6">
                        {post.forum_replies?.map((reply: any) => (
                          <div
                            key={reply.id}
                            className={`p-4 rounded-md text-sm ${reply.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-[#0B1F3B]">
                                {reply.user_profiles?.full_name || 'Agente'}
                              </span>
                              {reply.is_correct && (
                                <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Aprovada
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700">{reply.content}</p>
                            {isAdmin && !reply.is_correct && (
                              <button
                                onClick={async () => {
                                  await supabase
                                    .from('forum_replies')
                                    .update({ is_correct: true })
                                    .eq('id', reply.id)
                                  fetchForumPosts()
                                }}
                                className="text-xs text-[#C8A24A] font-bold hover:underline mt-3 block"
                              >
                                Validar Solução
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Contribuir com resposta..."
                          value={replyContent[post.id] || ''}
                          onChange={(e) =>
                            setReplyContent({
                              ...replyContent,
                              [post.id]: e.target.value,
                            })
                          }
                          className="bg-gray-50 h-10 border-gray-300"
                        />
                        <Button
                          onClick={() => handleCreateReply(post.id)}
                          disabled={!replyContent[post.id]}
                          className="bg-[#0B1F3B]"
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
    </div>
  )
}
