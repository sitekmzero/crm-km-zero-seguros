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

    let systemPrompt = configMap['sdr_system_prompt'] || defaultPrompt

    systemPrompt += `\n\nEXTRAÇÃO DE DADOS (Sempre que o cliente fornecer as informações abaixo, inclua a respectiva tag ao final da sua mensagem para registro no sistema, ex: [EMAIL: teste@teste.com]):
- [EMAIL: valor]
- [CPF: valor]
- [CREDITO: valor numerico]
- [PARCELA: valor numerico]
- [VEICULO: marca/modelo/ano]`

    if (lead_id) {
      const { data: lead } = await supabase
        .schema('public')
        .from('leads')
        .select('status')
        .eq('id', lead_id)
        .maybeSingle()
      if (lead) {
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

        if (patterns && patterns.length > 0) {
          systemPrompt += `\n\nAqui estão exemplos reais de como nossos melhores corretores humanos conduzem essa conversa com sucesso. Imite essas técnicas de abordagem e argumentação:\n`
          patterns.forEach((p: any, i: number) => {
            systemPrompt += `Exemplo ${i + 1}: Objeção: ${p.customer_objection} -> Resposta Recomendada: ${p.successful_response}\n`
          })
        }
      }
    }
    const isLearningMode = configMap['learning_mode_active'] === 'true'

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing')

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: message }] }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        }),
      },
    )

    const data = await response.json()
    let botReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Desculpe, não consegui processar sua solicitação agora.'

    let updatesToLead: any = {}
    const extractRegex = /\[(EMAIL|CPF|CREDITO|PARCELA|VEICULO):\s*(.*?)\]/gi
    let match
    while ((match = extractRegex.exec(botReply)) !== null) {
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

    botReply = botReply.replace(extractRegex, '').trim()

    if (lead_id) {
      if (Object.keys(updatesToLead).length > 0) {
        await supabase
          .schema('public')
          .from('leads')
          .update(updatesToLead)
          .eq('id', lead_id)
      }
      if (isLearningMode) {
        // Save as draft, human-in-the-loop will review
        await supabase.schema('public').from('messages').insert({
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
      await supabase
        .schema('public')
        .from('chatbot_conversations')
        .insert({
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
