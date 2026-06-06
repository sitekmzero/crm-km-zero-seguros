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
    console.log('GET Handshake request URL:', req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    const verifyToken = Deno.env.get('VERIFY_TOKEN') || 'km0_conexao_segura'

    console.log('Handshake params:', {
      mode,
      token,
      challenge,
      expectedToken: verifyToken,
    })

    if (mode === 'subscribe' && token === verifyToken) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method === 'POST') {
    try {
      console.log('Iniciando processamento da mensagem do WhatsApp...')
      const payload = await req.json()
      console.log('Incoming POST payload:', JSON.stringify(payload, null, 2))

      if (payload.object !== 'whatsapp_business_account') {
        return new Response('Ignored', { status: 200 })
      }

      const entry = payload.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value
      const messages = value?.messages

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        console.log(
          'Recebido payload de controle sem mensagens (ex: messaging_handovers ou statuses). Ignorando e respondendo 200 OK imediatamente.',
        )
        return new Response('OK', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        })
      }

      const message = messages[0]
      const phone = message.from
      const messageId = message.id
      const contactName =
        value?.contacts?.[0]?.profile?.name || 'Cliente WhatsApp'

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

      // Normalize phone number (digits only)
      const phoneRaw = phone || ''
      const normalizedPhone = phoneRaw.replace(/\D/g, '')

      console.log('Tentando conectar ao banco de dados Supabase...')
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      let { data: lead, error: fetchError } = await supabase
        .schema('public')
        .from('leads')
        .select('*')
        .eq('phone', normalizedPhone)
        .maybeSingle()
      if (fetchError) throw new Error(`Lead fetch error: ${fetchError.message}`)

      // Fallback for Brazilian numbers (9-digit issue)
      if (!lead && normalizedPhone.startsWith('55')) {
        if (normalizedPhone.length === 12) {
          const variant =
            normalizedPhone.slice(0, 4) + '9' + normalizedPhone.slice(4)
          const { data } = await supabase
            .schema('public')
            .from('leads')
            .select('*')
            .eq('phone', variant)
            .maybeSingle()
          lead = data
        } else if (normalizedPhone.length === 13) {
          const variant = normalizedPhone.slice(0, 4) + normalizedPhone.slice(5)
          const { data } = await supabase
            .schema('public')
            .from('leads')
            .select('*')
            .eq('phone', variant)
            .maybeSingle()
          lead = data
        }
      }

      if (!lead) {
        try {
          const { data: newLead, error } = await supabase
            .schema('public')
            .from('leads')
            .insert({
              phone: normalizedPhone,
              name: contactName,
              status: 'novo',
              ai_active: true,
            })
            .select('*')
            .single()
          if (error) throw new Error(`Lead insert error: ${error.message}`)
          lead = newLead
        } catch (e: any) {
          console.error('Error creating lead:', e)
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Failed to create lead',
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
      }

      console.log(
        `Lead consultado/criado com sucesso. Status: ${lead.status} | IA Ativa: ${lead.ai_active}`,
      )

      // 3. REGRA DE SILENCIAMENTO
      if (!lead.ai_active) {
        console.log(
          'IA inativa para este lead. Salvando mensagem do cliente no banco...',
        )

        const { data, error: insertError } = await supabase
          .schema('public')
          .from('messages')
          .insert({
            lead_id: lead.id,
            sender: 'lead',
            content: messageBody,
          })

        if (insertError) {
          console.error(
            'Erro detalhado do Supabase ao gravar mensagem de lead inativo: ',
            insertError,
          )
          throw new Error(`Falha na gravação do banco: ${insertError.message}`)
        }

        await supabase
          .schema('public')
          .from('leads')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', lead.id)

        console.log(
          'Mensagem do cliente gravada com sucesso. Respondendo 200 OK para a Meta.',
        )

        return new Response('OK', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        })
      }

      const { error: insertMsgError } = await supabase
        .schema('public')
        .from('messages')
        .insert({
          lead_id: lead.id,
          sender: 'lead',
          content: messageBody,
        })
      if (insertMsgError)
        throw new Error(`Message insert error: ${insertMsgError.message}`)

      // Atualiza o updated_at do lead para refletir a nova mensagem na listagem
      await supabase
        .schema('public')
        .from('leads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', lead.id)

      // 1. LIMITE DA JANELA DE HISTÓRICO
      const { data: historyData, error: historyError } = await supabase
        .schema('public')
        .from('messages')
        .select('sender, content')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(8)
      if (historyError)
        throw new Error(`History fetch error: ${historyError.message}`)

      const { data: configData, error: configError } = await supabase
        .schema('public')
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

      // Checagem de horário comercial (UTC-3)
      const now = new Date()
      const utc = now.getTime() + now.getTimezoneOffset() * 60000
      const bsas = new Date(utc + 3600000 * -3) // UTC-3
      const hour = bsas.getHours()
      const day = bsas.getDay() // 0 = Sunday, 6 = Saturday
      const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 18
      const timeContext = isBusinessHours
        ? 'Contexto do sistema: Estamos DENTRO do horário comercial (seg a sex, 09h às 18h).'
        : "Contexto do sistema: Estamos FORA do horário comercial. Siga as regras de 'Fora do horário comercial'."

      const fullPrompt = `${prompt}\n\n${timeContext}`

      const geminiKey = Deno.env.get('GEMINI_API_KEY')
      if (!geminiKey) throw new Error('GEMINI_API_KEY missing')

      console.log('Enviando histórico de conversas para o Gemini 3.5 Flash...')

      // ROTA DA API E MODELO (gemini-3.5-flash)
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: fullPrompt }] },
            contents: geminiMessages,
            // 2. CONFIGURAÇÃO DE PARAMETROS DE GERAÇÃO
            generationConfig: {
              maxOutputTokens: 150,
              temperature: 0.7,
            },
          }),
        },
      )

      if (!geminiRes.ok)
        throw new Error(`Gemini API error: ${geminiRes.statusText}`)

      const geminiData = await geminiRes.json()
      const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

      console.log(`Resposta recebida do Gemini: ${aiText}`)

      let newStatus = lead.status
      let newAiActive = lead.ai_active

      const statusRegex =
        /\[STATUS:\s*(seguro_qualificado|consorcio_qualificado|financiamento_qualificado|em_atendimento_humano|perdido)\]/gi
      let match
      let triggeredStatus = null

      while ((match = statusRegex.exec(aiText)) !== null) {
        newStatus = match[1].toLowerCase() as any
        if (
          [
            'seguro_qualificado',
            'consorcio_qualificado',
            'financiamento_qualificado',
            'em_atendimento_humano',
          ].includes(newStatus)
        ) {
          newAiActive = false
          triggeredStatus = newStatus
        }
      }

      const cleanText = aiText.replace(statusRegex, '').trim()

      if (cleanText) {
        if (newStatus !== lead.status || newAiActive !== lead.ai_active) {
          const { error: updateError } = await supabase
            .schema('public')
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
          const { error: draftError } = await supabase
            .schema('public')
            .from('messages')
            .insert({
              lead_id: lead.id,
              sender: 'ia',
              content: cleanText,
              is_draft: true,
            })
          if (draftError) console.error('[DRAFT_ERROR]', draftError)
        } else {
          const waToken = Deno.env.get('META_ACCESS_TOKEN')
          const waPhoneId =
            Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '124285125625890'
          if (!waToken || !waPhoneId)
            throw new Error('WhatsApp API credentials missing')

          console.log('Disparando requisição POST para a Graph API da Meta...')
          const { error: invokeError } = await supabase.functions.invoke(
            'send-whatsapp',
            {
              body: { lead_id: lead.id, content: cleanText, sender: 'ia' },
            },
          )

          if (invokeError) {
            console.error('[INVOKE_ERROR]', invokeError)
          } else {
            console.log(
              'Mensagem enviada com sucesso para o cliente via Meta Cloud API.',
            )
          }
        }
      }

      // Roteamento inteligente para Gabriel ou Adriana no Handoff
      if (triggeredStatus) {
        try {
          const summaryRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [
                    {
                      text: 'Você é um assistente de roteamento. Analise a conversa e extraia o responsável e um resumo. Regra: Gabriel atende \'Seguro Auto\' e \'Seguro Residencial\'. Adriana atende o resto (outros seguros, consórcios, financiamentos). Retorne APENAS um JSON válido no formato: {"responsavel": "Gabriel" ou "Adriana", "resumo": "..."}',
                    },
                  ],
                },
                contents: geminiMessages,
                generationConfig: { temperature: 0.1 },
              }),
            },
          )

          if (summaryRes.ok) {
            const summaryData = await summaryRes.json()
            let summaryText =
              summaryData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            summaryText = summaryText
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim()
            const parsedSummary = JSON.parse(summaryText)

            const routingHuman = parsedSummary.responsavel || 'Adriana'
            const routingSummary =
              parsedSummary.resumo ||
              'Novo lead qualificado/handoff. Verifique o CRM.'
            const routingPhone =
              routingHuman === 'Gabriel' ? '5534992000300' : '5534984080220'

            const waToken = Deno.env.get('META_ACCESS_TOKEN')
            const waPhoneId =
              Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '124285125625890'
            if (waToken && waPhoneId) {
              const messageToHuman = `*Novo Lead Roteado: ${contactName} (${phone})*\n\n*Responsável:* ${routingHuman}\n*Status:* ${triggeredStatus}\n\n*Resumo:*\n${routingSummary}`
              console.log(
                'Disparando requisição POST para a Graph API da Meta (Roteamento)...',
              )
              const routingRes = await fetch(
                `https://graph.facebook.com/v17.0/${waPhoneId}/messages`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${waToken}`,
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: routingPhone,
                    text: { body: messageToHuman },
                  }),
                },
              )

              if (!routingRes.ok) {
                const errorData = await routingRes.text()
                console.error(
                  'Erro ao enviar mensagem de roteamento:',
                  errorData,
                )
              } else {
                console.log(
                  'Mensagem enviada com sucesso para o cliente via Meta Cloud API (Roteamento).',
                )
              }
            }
          }
        } catch (err) {
          console.error('Error generating/sending summary:', err)
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (e: any) {
      console.error('ERRO CRÍTICO NA EXECUÇÃO DO WEBHOOK: ', e.message, e.stack)
      return new Response(JSON.stringify({ error: e.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
})
