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
      console.log('Iniciando processamento da mensagem do webhook...')
      const payload = await req.json()
      console.log('Incoming POST payload:', JSON.stringify(payload, null, 2))

      let incomingChannel = 'whatsapp'
      let normalizedPhone = ''
      let contactName = ''
      let messageBody = ''

      if (payload.object === 'page' || payload.object === 'instagram') {
        console.log(
          `🟢 [WEBHOOK-META] Recebido payload do ${payload.object === 'page' ? 'Facebook Messenger' : 'Instagram Direct'}`,
        )
        const messagingEvent = payload.entry?.[0]?.messaging?.[0]

        if (messagingEvent?.read || messagingEvent?.delivery) {
          console.log(
            '🟢 [WEBHOOK-META] Recebido evento de leitura/entrega. Ignorando.',
          )
          return new Response('OK', {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          })
        }

        if (!messagingEvent?.message?.text) {
          console.log(
            '🟢 [WEBHOOK-META] Evento recebido sem mensagem de texto. Ignorando.',
          )
          return new Response('OK', {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          })
        }
        normalizedPhone = messagingEvent.sender?.id
        if (!normalizedPhone) return new Response('Ignored', { status: 200 })
        messageBody = messagingEvent.message.text
        incomingChannel = payload.object === 'page' ? 'facebook' : 'instagram'

        try {
          if (incomingChannel === 'facebook') {
            const fbToken = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN')
            if (fbToken) {
              const res = await fetch(
                `https://graph.facebook.com/v20.0/${normalizedPhone}?fields=first_name,last_name,profile_pic&access_token=${fbToken}`,
              )
              if (res.ok) {
                const data = await res.json()
                contactName = [data.first_name, data.last_name]
                  .filter(Boolean)
                  .join(' ')
                  .trim()
              }
            }
          } else {
            const igToken = Deno.env.get('INSTAGRAM_PAGE_ACCESS_TOKEN')
            if (igToken) {
              const res = await fetch(
                `https://graph.facebook.com/v20.0/${normalizedPhone}?fields=name,username,profile_pic&access_token=${igToken}`,
              )
              if (res.ok) {
                const data = await res.json()
                contactName = data.name || data.username || ''
              }
            }
          }
        } catch (e) {
          console.error('Profile fetch error:', e)
        }

        if (!contactName) {
          contactName = `Cliente ${incomingChannel === 'facebook' ? 'Facebook' : 'Instagram'}`
        }
      } else if (
        payload.object === 'whatsapp_business_account' ||
        payload.object === 'whatsapp'
      ) {
        console.log('🟢 [WEBHOOK-META] Recebido payload do WhatsApp Cloud API')
        const entry = payload.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value
        if (value?.statuses) {
          console.log(
            '🟢 [WEBHOOK-META] Recebido evento de status (delivered, read, etc). Ignorando.',
          )
          return new Response('OK', {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          })
        }

        const messages = value?.messages

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          console.log(
            'Recebido payload de controle sem mensagens (ex: messaging_handovers ou empty). Ignorando.',
          )
          return new Response('OK', {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          })
        }

        const message = messages[0]
        const phone = message?.from
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

        messageBody = message.text.body
        contactName = value?.contacts?.[0]?.profile?.name || 'Cliente WhatsApp'
        normalizedPhone = (phone || '').replace(/\D/g, '')
        incomingChannel = 'whatsapp'
      } else {
        return new Response('Ignored', { status: 200 })
      }

      console.log('Tentando conectar ao banco de dados Supabase...')
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: lead, error: upsertError } = await supabase
        .schema('public')
        .from('leads')
        .upsert(
          {
            phone: normalizedPhone,
            name: contactName || 'Cliente',
            channel: incomingChannel,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'phone' },
        )
        .select('*')
        .single()

      if (upsertError || !lead) {
        console.error('Failed database operation (Lead Upsert):', upsertError)
        throw new Error(`Lead upsert error: ${upsertError?.message}`)
      }

      console.log(
        `Lead consultado/criado com sucesso. Status: ${lead.status} | IA Ativa: ${lead.ai_active} | Channel: ${lead.channel}`,
      )

      // 3. REGRA DE SILENCIAMENTO
      if (!lead.ai_active) {
        console.log(
          'IA inativa para este lead. Salvando mensagem do cliente no banco...',
        )

        const { error: insertError } = await supabase
          .schema('public')
          .from('messages')
          .insert({
            lead_id: lead.id,
            sender: 'lead',
            content: messageBody,
            is_draft: false,
          })

        if (insertError) {
          console.error(
            'Erro ao gravar mensagem de lead inativo: ',
            insertError,
          )
          throw new Error(`Falha na gravação do banco: ${insertError.message}`)
        }

        console.log(
          'Mensagem do cliente gravada com sucesso. Respondendo 200 OK.',
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
          is_draft: false,
        })
      if (insertMsgError) {
        console.error(
          'Failed database operation (Message Insert):',
          insertMsgError,
        )
        throw new Error(`Message insert error: ${insertMsgError.message}`)
      }

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

      const defaultPrompt = `Você é Dryka, assistente virtual e SDR da Km Zero Seguros.

IDENTIDADE E TOM:
- Amigável, objetiva, profissional e coloquial.
- Use mensagens curtas, como no WhatsApp, e emojis moderados.

REGRAS ESTRITAS:
1. NUNCA forneça preços, taxas de juros ou valores exatos.
2. NUNCA prometa aprovação de crédito ou garantia de cobertura.
3. Use apenas as informações fornecidas.

FLUXO DA CONVERSA:
1. Identificar Interesse: Descubra se o cliente quer Seguro, Consórcio ou Financiamento/Refinanciamento.
2. Filtro Consultivo: Faça perguntas qualificatórias básicas dependendo do produto (ex: tipo de veículo, valor desejado).
3. Coleta de Dados: Reúna os dados necessários para que os corretores humanos possam fazer a cotação.

HANDOFF (TRANSFERÊNCIA):
- Se o cliente solicitar atendimento humano, ou se você concluir a qualificação e coleta de dados, transfira para "Adriana" (Consórcio/Financiamento/Outros Seguros) ou "Gabriel" (Seguro Auto/Residencial).
- Ao transferir, encerre a interação incluindo a tag [STATUS: em_atendimento_humano].

TAGS DE STATUS OBRIGATÓRIAS (no final da mensagem, use apenas UMA):
- [STATUS: seguro_qualificado]
- [STATUS: consorcio_qualificado]
- [STATUS: financiamento_qualificado]
- [STATUS: em_atendimento_humano]`

      const prompt = configMap['sdr_system_prompt'] || defaultPrompt
      const isLearningMode = configMap['learning_mode_active'] === 'true'
      const history = (historyData || []).reverse()

      // FETCH SUCCESS PATTERNS (FEW-SHOT RAG)
      let productType = 'seguro'
      if (lead.status.includes('consorcio')) productType = 'consorcio'
      else if (lead.status.includes('financiamento'))
        productType = 'financiamento'

      const { data: patterns } = await supabase
        .schema('public')
        .from('success_patterns' as any)
        .select('customer_objection, successful_response')
        .eq('product_type', productType)
        .order('created_at', { ascending: false })
        .limit(2)

      let fewShotInjection = ''
      if (patterns && patterns.length > 0) {
        fewShotInjection = `\n\nAqui estão exemplos reais de como nossos melhores corretores humanos conduzem essa conversa com sucesso. Imite essas técnicas de abordagem e argumentação:\n`
        patterns.forEach((p: any, i: number) => {
          fewShotInjection += `Exemplo ${i + 1}: Objeção: ${p.customer_objection} -> Resposta Recomendada: ${p.successful_response}\n`
        })
      }

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

      const extraPrompt = `\n\nEXTRAÇÃO DE DADOS (Sempre que o cliente fornecer as informações abaixo, inclua a respectiva tag ao final da sua mensagem interna para o sistema registrar, ex: [EMAIL: teste@teste.com]):
- [EMAIL: valor]
- [CPF: valor]
- [CREDITO: valor numerico]
- [PARCELA: valor numerico]
- [VEICULO: marca/modelo/ano]`

      const fullPrompt = `${prompt}\n\n${timeContext}${fewShotInjection}${extraPrompt}`

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
      let updatesToLead: any = {}

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

      const extractRegex = /\[(EMAIL|CPF|CREDITO|PARCELA|VEICULO):\s*(.*?)\]/gi
      while ((match = extractRegex.exec(aiText)) !== null) {
        const key = match[1].toUpperCase()
        const val = match[2].trim()
        if (key === 'EMAIL') updatesToLead.email = val
        if (key === 'CPF') updatesToLead.cpf = val
        if (key === 'CREDITO') {
          const num = val.replace(/\D/g, '')
          if (num) updatesToLead.desired_credit = parseFloat(num)
        }
        if (key === 'PARCELA') {
          const num = val.replace(/\D/g, '')
          if (num) updatesToLead.target_installment = parseFloat(num)
        }
        if (key === 'VEICULO') updatesToLead.vehicle_info = val
      }

      const cleanText = aiText
        .replace(statusRegex, '')
        .replace(extractRegex, '')
        .trim()

      if (cleanText) {
        if (
          newStatus !== lead.status ||
          newAiActive !== lead.ai_active ||
          Object.keys(updatesToLead).length > 0
        ) {
          const { error: updateError } = await supabase
            .schema('public')
            .from('leads')
            .update({
              status: newStatus,
              ai_active: newAiActive,
              updated_at: new Date().toISOString(),
              ...updatesToLead,
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
          // DISPARO DE MENSAGEM COM BASE NO CANAL
          if (lead.channel === 'facebook' || lead.channel === 'instagram') {
            const tokenEnv =
              lead.channel === 'facebook'
                ? 'FACEBOOK_PAGE_ACCESS_TOKEN'
                : 'INSTAGRAM_PAGE_ACCESS_TOKEN'
            const accessToken = Deno.env.get(tokenEnv)

            if (!accessToken) {
              console.error(
                `Erro de Integração: Variável de ambiente ${tokenEnv} não configurada.`,
              )
            } else {
              console.log(
                `🟢 [DISPARO] Tentando responder via ${lead.channel} para o ID: ${lead.phone}...`,
              )
              const sendRes = await fetch(
                `https://graph.facebook.com/v20.0/me/messages?access_token=${accessToken}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    recipient: { id: lead.phone },
                    message: { text: cleanText },
                  }),
                },
              )

              if (!sendRes.ok) {
                const responseData = await sendRes.json().catch(() => ({}))
                console.error(
                  `🔴 [DISPARO] Erro ao responder via ${lead.channel}:`,
                  JSON.stringify(responseData),
                )
                throw new Error(
                  `Erro na API da Meta: ${JSON.stringify(responseData)}`,
                )
              } else {
                console.log(
                  `🟢 [DISPARO] Resposta enviada com sucesso via ${lead.channel}!`,
                )

                // Grava a mensagem da IA no banco após envio bem-sucedido
                const { error: iaMsgError } = await supabase
                  .schema('public')
                  .from('messages')
                  .insert({
                    lead_id: lead.id,
                    sender: 'ia',
                    content: cleanText,
                    is_draft: false,
                  })
                if (iaMsgError) console.error('[IA_MSG_ERROR]', iaMsgError)
              }
            }
          } else {
            // WHATSAPP API
            const waToken = Deno.env.get('META_ACCESS_TOKEN')
            const waPhoneId =
              Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '124285125625890'
            if (!waToken || !waPhoneId)
              throw new Error('WhatsApp API credentials missing')

            console.log(
              `🟢 [DISPARO] Tentando responder via whatsapp para o ID: ${lead.phone}...`,
            )
            const { error: invokeError } = await supabase.functions.invoke(
              'send-whatsapp',
              {
                body: { lead_id: lead.id, content: cleanText, sender: 'ia' },
              },
            )

            if (invokeError) {
              console.error(
                `🔴 [DISPARO] Erro ao responder via whatsapp:`,
                JSON.stringify(invokeError),
              )
              throw new Error(
                `Erro na invocação do send-whatsapp: ${invokeError.message}`,
              )
            } else {
              console.log(
                `🟢 [DISPARO] Resposta enviada com sucesso via whatsapp!`,
              )
            }
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
              const messageToHuman = `*Novo Lead Roteado: ${contactName}*\n\n*Canal:* ${lead.channel || incomingChannel}\n*Responsável:* ${routingHuman}\n*Status:* ${triggeredStatus}\n\n*Resumo:*\n${routingSummary}`
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
