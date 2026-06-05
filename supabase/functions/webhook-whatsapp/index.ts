import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    const verifyToken = Deno.env.get('VERIFY_TOKEN') || 'km0_conexao_segura'

    if (mode === 'subscribe' && token === verifyToken) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method === 'POST') {
    try {
      const payload = await req.json()
      if (payload.object !== 'whatsapp_business_account') {
        return new Response('Ignored', { status: 200 })
      }

      const entry = payload.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value
      const messages = value?.messages

      if (!messages || messages.length === 0) {
        return new Response('No messages', { status: 200 })
      }

      const message = messages[0]
      const phone = message.from
      const messageId = message.id
      const contactName = value.contacts?.[0]?.profile?.name || phone

      if (!phone) return new Response('Ignored', { status: 200 })

      if (message.type !== 'text') {
        console.log(`Ignored unsupported message type: ${message.type}`)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Ignored non-text message',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const messageBody = message.text.body

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      let { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .eq('phone', phone)
        .maybeSingle()
      if (fetchError) throw new Error(`Lead fetch error: ${fetchError.message}`)

      if (!lead) {
        const { data: newLead, error } = await supabase
          .from('leads')
          .insert({ phone, name: contactName, status: 'novo', ai_active: true })
          .select('*')
          .single()
        if (error) throw new Error(`Lead insert error: ${error.message}`)
        lead = newLead
      }

      if (!lead.ai_active) {
        const { error: insertMsgError } = await supabase
          .from('messages')
          .insert({
            lead_id: lead.id,
            sender: 'lead',
            content: messageBody,
          })
        if (insertMsgError)
          throw new Error(`Message insert error: ${insertMsgError.message}`)

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Lead is in human handover',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      const { error: insertMsgError } = await supabase.from('messages').insert({
        lead_id: lead.id,
        sender: 'lead',
        content: messageBody,
      })
      if (insertMsgError)
        throw new Error(`Message insert error: ${insertMsgError.message}`)

      const { data: historyData, error: historyError } = await supabase
        .from('messages')
        .select('sender, content')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(15)
      if (historyError)
        throw new Error(`History fetch error: ${historyError.message}`)

      const { data: configData, error: configError } = await supabase
        .from('configs')
        .select('key, value')
        .in('key', ['sdr_system_prompt', 'learning_mode_active'])
      if (configError)
        throw new Error(`Config fetch error: ${configError.message}`)

      const configMap = (configData || []).reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value
        return acc
      }, {})

      const defaultPrompt =
        'Você é um SDR virtual da KM Zero Seguros, Consórcios e Financiamentos.'
      const prompt = configMap['sdr_system_prompt'] || defaultPrompt
      const isLearningMode = configMap['learning_mode_active'] === 'true'
      const history = (historyData || []).reverse()

      const geminiMessages = history.map((m: any) => ({
        role: m.sender === 'lead' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }))

      const geminiKey = Deno.env.get('GEMINI_API_KEY')
      if (!geminiKey) throw new Error('GEMINI_API_KEY missing')

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: prompt }] },
            contents: geminiMessages,
          }),
        },
      )

      if (!geminiRes.ok)
        throw new Error(`Gemini API error: ${geminiRes.statusText}`)

      const geminiData = await geminiRes.json()
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

      let newStatus = lead.status
      let newAiActive = lead.ai_active

      const statusRegex =
        /\[STATUS:\s*(seguro_qualificado|consorcio_qualificado|financiamento_qualificado|em_atendimento_humano|perdido)\]/gi
      let match
      while ((match = statusRegex.exec(aiText)) !== null) {
        newStatus = match[1].toLowerCase() as any
        if (newStatus === 'em_atendimento_humano') {
          newAiActive = false
        }
      }

      let cleanText = aiText.replace(statusRegex, '').trim()

      if (cleanText) {
        if (newStatus !== lead.status || newAiActive !== lead.ai_active) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({
              status: newStatus,
              ai_active: newAiActive,
              updated_at: new Date().toISOString(),
            })
            .eq('id', lead.id)
          if (updateError)
            throw new Error(`Lead update error: ${updateError.message}`)
        }

        if (isLearningMode) {
          const { error: draftError } = await supabase.from('messages').insert({
            lead_id: lead.id,
            sender: 'ia',
            content: cleanText,
            is_draft: true,
          })
          if (draftError) console.error('[DRAFT_ERROR]', draftError)
        } else {
          const waToken = Deno.env.get('META_ACCESS_TOKEN')
          const waPhoneId =
            Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '1242285125625890'
          if (!waToken || !waPhoneId)
            throw new Error('WhatsApp API credentials missing')

          // Trigger the send-whatsapp Edge Function to deliver the AI response
          const { error: invokeError } = await supabase.functions.invoke(
            'send-whatsapp',
            {
              body: { lead_id: lead.id, content: cleanText, sender: 'ia' },
            },
          )

          if (invokeError) {
            console.error('[INVOKE_ERROR]', invokeError)
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (e: any) {
      console.error(e)
      // Return 200 instead of 400 so Meta does not continuously retry if we fail internally
      return new Response(JSON.stringify({ error: e.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
})
