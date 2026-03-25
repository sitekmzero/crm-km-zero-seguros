import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { message, session_id } = await req.json()

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing')

    const promptContext = `
      Você é um assistente virtual da KM Zero Seguros, uma corretora com mais de 20 anos de mercado.
      Produtos principais: Seguro Auto, Seguro Empresarial, Consórcio, Financiamento.
      Seu objetivo é ser simpático, objetivo, e tentar qualificar o lead respondendo dúvidas básicas.
      Se o cliente pedir cotação ou demonstrar intenção de compra forte, peça o nome, email e telefone e diga que um especialista entrará em contato.
      
      Mensagem do cliente: "${message}"
    `

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptContext }] }],
        }),
      },
    )

    const data = await response.json()
    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua solicitação agora.'

    // Save history (optional, if tracking full session)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    await supabase.from('chatbot_conversations').insert({
      crisp_session_id: session_id || 'anonymous',
      user_message: message,
      bot_response: botReply,
    })

    return new Response(JSON.stringify({ reply: botReply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
