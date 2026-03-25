import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()

    // Crisp webhook event for new messages
    if (payload.event === 'message:send') {
      const messageData = payload.data
      const userMessage = messageData.content?.text
      const sessionId = messageData.session_id

      if (!userMessage) {
        return new Response('No text content', { status: 200 })
      }

      const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
      if (!geminiApiKey) {
        console.error('GEMINI_API_KEY is not set')
        return new Response('Configuration missing', { status: 500 })
      }

      // Call Gemini API
      const geminiPrompt = `Você é um assistente virtual da KM Zero Seguros, uma corretora com mais de 20 anos de experiência. Responda à seguinte mensagem do usuário de forma educada, ágil e focada em seguros, consórcios e financiamentos. Mantenha a resposta curta e objetiva. Mensagem do usuário: "${userMessage}"`

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt }] }],
          }),
        },
      )

      const geminiData = await geminiResponse.json()
      const botReply =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Desculpe, não consegui processar sua solicitação no momento. Por favor, tente novamente.'

      // Save to Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase.from('chatbot_conversations').insert({
        crisp_session_id: sessionId,
        user_message: userMessage,
        bot_response: botReply,
      })

      // Normally here you would call Crisp API to send the message back to the user.
      // E.g., fetch(`https://api.crisp.chat/v1/website/${WEBSITE_ID}/conversation/${sessionId}/message`, ...)
      // Assuming webhook acknowledges receipt for this scope.

      return new Response(JSON.stringify({ success: true, reply: botReply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response('Event ignored', { status: 200 })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
