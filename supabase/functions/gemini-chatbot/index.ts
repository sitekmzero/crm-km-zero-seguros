import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { message, session_id, lead_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch dynamic configurations
    const { data: configData } = await supabase
      .from('configs')
      .select('key, value')
      .in('key', ['sdr_system_prompt', 'learning_mode_active'])
    const configMap = (configData || []).reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value
      return acc
    }, {})

    const systemPrompt =
      configMap['sdr_system_prompt'] ||
      'Você é um assistente virtual da KM Zero Seguros.'
    const isLearningMode = configMap['learning_mode_active'] === 'true'

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: message }] }],
        }),
      },
    )

    const data = await response.json()
    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua solicitação agora.'

    if (lead_id) {
      if (isLearningMode) {
        // Save as draft, human-in-the-loop will review
        await supabase.from('messages').insert({
          lead_id,
          sender: 'ia',
          content: botReply,
          is_draft: true,
        })
      } else {
        // Send directly via WhatsApp
        await supabase.functions.invoke('send-whatsapp', {
          body: { lead_id, content: botReply, sender: 'ia' },
        })
      }
    } else {
      // Legacy fallback for generic sessions
      await supabase.from('chatbot_conversations').insert({
        crisp_session_id: session_id || 'anonymous',
        user_message: message,
        bot_response: botReply,
      })
    }

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
