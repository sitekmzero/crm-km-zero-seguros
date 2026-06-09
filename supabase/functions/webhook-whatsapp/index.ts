import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { encodeBase64 } from 'jsr:@std/encoding/base64'

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

    if (mode === 'subscribe' && token === verifyToken) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method === 'POST') {
    try {
      console.log('Iniciando processamento da mensagem do webhook...')
      const payload = await req.json()

      let incomingChannel = 'whatsapp'
      let normalizedPhone = ''
      let contactName = ''
      let messageBody = ''
      let ocrUpdates: any = {}

      if (payload.object === 'page' || payload.object === 'instagram') {
        const messagingEvent = payload.entry?.[0]?.messaging?.[0]
        if (messagingEvent?.read || messagingEvent?.delivery) {
          return new Response('OK', {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          })
        }
        if (!messagingEvent?.message?.text) {
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
        const entry = payload.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value
        if (value?.statuses) {
          return new Response('OK', {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          })
        }

        const messages = value?.messages
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          return new Response('OK', {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
          })
        }

        const message = messages[0]
        const phone = message?.from
        if (!phone) return new Response('Ignored', { status: 200 })

        normalizedPhone = (phone || '').replace(/\D/g, '')
        incomingChannel = 'whatsapp'
        contactName = value?.contacts?.[0]?.profile?.name || 'Cliente WhatsApp'

        if (message.type === 'text') {
          messageBody = message.text.body
        } else if (message.type === 'image' || message.type === 'document') {
          const mediaId = message[message.type]?.id
          if (mediaId) {
            console.log(
              `🟢 [WEBHOOK-META] Recebido media_id: ${mediaId}, iniciando download...`,
            )
            const waToken = Deno.env.get('META_ACCESS_TOKEN')
            if (waToken) {
              try {
                const mediaRes = await fetch(
                  `https://graph.facebook.com/v20.0/${mediaId}`,
                  {
                    headers: { Authorization: `Bearer ${waToken}` },
                  },
                )
                const mediaData = await mediaRes.json()
                if (mediaData.url) {
                  const fileRes = await fetch(mediaData.url, {
                    headers: { Authorization: `Bearer ${waToken}` },
                  })
                  const blob = await fileRes.blob()
                  const arrayBuffer = await blob.arrayBuffer()
                  const buffer = new Uint8Array(arrayBuffer)

                  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
                  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                  const supabase = createClient(supabaseUrl, supabaseKey)

                  const ext = message.type === 'image' ? 'jpg' : 'pdf'
                  const fileName = `${Date.now()}_${mediaId}.${ext}`
                  const { data: uploadData, error: uploadError } =
                    await supabase.storage
                      .from('chat_attachments')
                      .upload(fileName, buffer, {
                        contentType: blob.type,
                        upsert: true,
                      })

                  if (!uploadError && uploadData) {
                    const { data: publicUrlData } = supabase.storage
                      .from('chat_attachments')
                      .getPublicUrl(fileName)
                    messageBody = `[Arquivo Recebido: ${publicUrlData.publicUrl}]`

                    const geminiKey = Deno.env.get('GEMINI_API_KEY')
                    if (geminiKey && blob.size < 4000000) {
                      const base64Data = encodeBase64(buffer)
                      const promptOcr = `Analise este documento. Se for uma CNH, retorne apenas o CPF (apenas os números). Se for um CRLV (documento de veículo), retorne apenas a placa e modelo do veículo no formato "Placa: XXX, Modelo: YYY". Se for uma Apólice de Seguro, retorne um booleano "true" para is_renewal e extraia o número da apólice na URL. O formato de resposta DEVE ser estritamente um JSON válido: {"cpf": "string", "vehicle_info": "string", "is_renewal": boolean, "previous_policy_url": "string"}. Não use markdown.`

                      const ocrRes = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            contents: [
                              {
                                parts: [
                                  { text: promptOcr },
                                  {
                                    inlineData: {
                                      mimeType: blob.type,
                                      data: base64Data,
                                    },
                                  },
                                ],
                              },
                            ],
                            generationConfig: { temperature: 0.1 },
                          }),
                        },
                      )

                      if (ocrRes.ok) {
                        const ocrData = await ocrRes.json()
                        let ocrText =
                          ocrData.candidates?.[0]?.content?.parts?.[0]?.text ||
                          '{}'
                        ocrText = ocrText
                          .replace(/```json/g, '')
                          .replace(/```/g, '')
                          .trim()
                        try {
                          const parsedOcr = JSON.parse(ocrText)
                          if (parsedOcr.cpf) ocrUpdates.cpf = parsedOcr.cpf
                          if (parsedOcr.vehicle_info)
                            ocrUpdates.vehicle_info = parsedOcr.vehicle_info
                          if (parsedOcr.is_renewal === true)
                            ocrUpdates.is_renewal = true
                          if (parsedOcr.previous_policy_url)
                            ocrUpdates.previous_policy_url =
                              parsedOcr.previous_policy_url
                          console.log(
                            '🟢 [OCR] Dados extraídos com sucesso:',
                            ocrUpdates,
                          )
                        } catch (e) {
                          console.error('Erro ao fazer parse do JSON do OCR', e)
                        }
                      }
                    }
                  } else {
                    messageBody =
                      '[Arquivo Recebido - Falha ao salvar no Storage]'
                  }
                }
              } catch (err) {
                console.error('Erro no processamento de mídia:', err)
                messageBody = '[Arquivo Recebido - Erro no processamento]'
              }
            } else {
              messageBody = '[Arquivo Recebido - Token não configurado]'
            }
          }
        } else {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Ignored unsupported message type',
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
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
            ...ocrUpdates,
          },
          { onConflict: 'phone' },
        )
        .select('*')
        .single()

      if (upsertError || !lead) {
        throw new Error(`Lead upsert error: ${upsertError?.message}`)
      }

      if (!lead.ai_active) {
        const { error: insertError } = await supabase
          .schema('public')
          .from('messages')
          .insert({
            lead_id: lead.id,
            sender: 'lead',
            content: messageBody,
            is_draft: false,
          })

        if (insertError)
          throw new Error(`Falha na gravação do banco: ${insertError.message}`)
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
      if (insertMsgError)
        throw new Error(`Message insert error: ${insertMsgError.message}`)

      const { data: historyData, error: historyError } = await supabase
        .schema('public')
        .from('messages')
        .select('sender, content')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(8)
      if (historyError)
        throw new Error(`History fetch error: ${historyError.message}`)

      const { data: configData } = await supabase
        .schema('public')
        .from('configs')
        .select('key, value')
        .in('key', ['sdr_system_prompt', 'learning_mode_active'])

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

      const now = new Date()
      const utc = now.getTime() + now.getTimezoneOffset() * 60000
      const bsas = new Date(utc + 3600000 * -3)
      const hour = bsas.getHours()
      const day = bsas.getDay()
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

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: fullPrompt }] },
            contents: geminiMessages,
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
          await supabase.schema('public').from('messages').insert({
            lead_id: lead.id,
            sender: 'ia',
            content: cleanText,
            is_draft: true,
          })
        } else {
          if (lead.channel === 'facebook' || lead.channel === 'instagram') {
            const tokenEnv =
              lead.channel === 'facebook'
                ? 'FACEBOOK_PAGE_ACCESS_TOKEN'
                : 'INSTAGRAM_PAGE_ACCESS_TOKEN'
            const accessToken = Deno.env.get(tokenEnv)

            if (accessToken) {
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

              if (sendRes.ok) {
                await supabase.schema('public').from('messages').insert({
                  lead_id: lead.id,
                  sender: 'ia',
                  content: cleanText,
                  is_draft: false,
                })
              }
            }
          } else {
            await supabase.functions.invoke('send-whatsapp', {
              body: { lead_id: lead.id, content: cleanText, sender: 'ia' },
            })
          }
        }
      }

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
              parsedSummary.resumo || 'Novo lead qualificado/handoff.'
            const routingPhone =
              routingHuman === 'Gabriel' ? '5534992000300' : '5534984080220'

            const waToken = Deno.env.get('META_ACCESS_TOKEN')
            const waPhoneId =
              Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '124285125625890'
            if (waToken && waPhoneId) {
              const messageToHuman = `*Novo Lead Roteado: ${contactName}*\n\n*Canal:* ${lead.channel || incomingChannel}\n*Responsável:* ${routingHuman}\n*Status:* ${triggeredStatus}\n\n*Resumo:*\n${routingSummary}`
              await fetch(
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
