import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lead } = await req.json()

    if (!lead) {
      throw new Error('Lead data is required')
    }

    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    console.log('Processing lead:', lead.id, 'Source:', lead.lead_source)

    // 1. Send notification to Slack
    if (slackWebhookUrl) {
      let slackText = `🚨 *Novo Lead Recebido!* 🚨\n\n*Nome:* ${lead.name || 'N/A'}\n*Email:* ${lead.email || 'N/A'}\n*Telefone:* ${lead.phone || 'N/A'}\n*Produto:* ${lead.product_type || 'N/A'}\n*Origem:* ${lead.lead_source || 'website'}`

      if (lead.lead_source === 'renovacao') {
        slackText += `\n*Vencimento:* ${lead.expiration_date || 'N/A'}\n*Horário Preferencial:* ${lead.preferred_time || 'N/A'}`
        if (lead.file_url) {
          slackText += `\n*Apólice Anexa:* ${lead.file_url}`
        }
      }

      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: slackText }),
      }).catch((err) => console.error('Error sending Slack notification:', err))
    } else {
      console.warn('SLACK_WEBHOOK_URL not configured')
    }

    // 2. Send confirmation email to the client via Resend
    if (resendApiKey && lead.email) {
      let subject = 'Recebemos sua solicitação - KM Zero Seguros'
      let innerHtml = `
        <h2 style="color: #0B1F3B; margin-top: 0;">Olá, ${lead.name || 'Cliente'}!</h2>
        <p>Recebemos sua solicitação com sucesso.</p>
        <p>Nossa equipe de especialistas já está analisando o seu perfil para o produto <strong>${lead.product_type || 'solicitado'}</strong> e entrará em contato muito em breve para oferecer a melhor consultoria personalizada.</p>
      `

      if (lead.lead_source === 'ebook_guia') {
        subject = 'Seu E-book Chegou: Guia Completo de Seguros - KM Zero'
        innerHtml = `
          <h2 style="color: #0B1F3B; margin-top: 0;">Olá, ${lead.name || 'Cliente'}!</h2>
          <p>Obrigado por baixar nosso Guia Completo para Escolher o Melhor Seguro.</p>
          <p>Clique no botão abaixo para acessar e baixar o seu material gratuitamente:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://km-zero-seguros-copy-fdbec.goskip.app/ebook-guia-seguros.pdf" style="display:inline-block; padding: 15px 30px; background-color: #C8A24A; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Baixar Meu E-book</a>
          </div>
          <p>Se tiver qualquer dúvida, nossa equipe de consultores está à disposição.</p>
        `
      } else if (lead.lead_source === 'renovacao') {
        subject = 'Solicitação de Renovação Recebida - KM Zero Seguros'
        innerHtml = `
          <h2 style="color: #0B1F3B; margin-top: 0;">Olá, ${lead.name || 'Cliente'}!</h2>
          <p>Recebemos seus dados para a análise de renovação do seu seguro.</p>
          <p>Nossos especialistas já estão trabalhando para encontrar as melhores condições do mercado para você e entrarão em contato no seu horário de preferência.</p>
        `
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0B1F3B; padding: 20px; text-align: center;">
            <h1 style="color: #C8A24A; margin: 0; font-size: 24px;">KM Zero Seguros</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff; color: #333333;">
            ${innerHtml}
            <br/>
            <p>Atenciosamente,<br/><strong>Equipe KM Zero Seguros</strong></p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0;">Este é um e-mail automático. Por favor, não responda.</p>
          </div>
        </div>
      `

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contato@resend.dev',
          to: lead.email,
          subject: subject,
          html: emailHtml,
        }),
      }).catch((err) => console.error('Error sending email via Resend:', err))
    } else {
      console.warn('RESEND_API_KEY or lead email missing. Skipping email.')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('Error processing lead:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
