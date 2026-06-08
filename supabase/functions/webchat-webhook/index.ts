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
    const { message, lead_id } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let currentLeadId = lead_id

    if (!currentLeadId) {
      const phone = 'webchat_' + Math.random().toString(36).substring(2, 10)
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          phone: phone,
          name: 'Lead Webchat',
          channel: 'webchat',
          status: 'novo',
          ai_active: true,
        })
        .select('*')
        .single()
      if (error) throw error
      currentLeadId = newLead.id
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('ai_active, status')
      .eq('id', currentLeadId)
      .single()

    await supabase.from('messages').insert({
      lead_id: currentLeadId,
      sender: 'lead',
      content: message,
      is_draft: false,
    })

    await supabase
      .from('leads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentLeadId)

    if (!lead?.ai_active) {
      return new Response(
        JSON.stringify({
          lead_id: currentLeadId,
          reply: 'Sua mensagem foi enviada para nossa equipe.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { data: history } = await supabase
      .from('messages')
      .select('sender, content')
      .eq('lead_id', currentLeadId)
      .order('created_at', { ascending: false })
      .limit(8)

    const geminiMessages = (history || []).reverse().map((m: any) => ({
      role: m.sender === 'lead' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const { data: configData } = await supabase
      .from('configs')
      .select('key, value')
      .in('key', ['sdr_system_prompt'])
    const systemPrompt =
      configData?.find((c) => c.key === 'sdr_system_prompt')?.value ||
      'Você é a Dryka, assistente virtual da Km Zero Seguros.'

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
        }),
      },
    )

    const data = await response.json()
    const botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua solicitação no momento. Aguarde o atendimento humano.'

    await supabase.from('messages').insert({
      lead_id: currentLeadId,
      sender: 'ia',
      content: botReply,
      is_draft: false,
    })

    return new Response(
      JSON.stringify({ lead_id: currentLeadId, reply: botReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
