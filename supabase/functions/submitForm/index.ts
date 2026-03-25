import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { formType, formData, token } = await req.json()

    if (!formType || !formData) {
      throw new Error('formType and formData are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')

    let insertedData

    if (formType === 'lead' || formType === 'renewal' || formType === 'ebook') {
      const { data, error } = await supabase
        .from('leads')
        .insert([formData])
        .select()
        .single()
      if (error) throw error
      insertedData = data

      // Send Email via Resend
      if (resendApiKey && formData.email) {
        let subject = 'Recebemos sua solicitação - KM Zero Seguros'
        let innerHtml = `
          <h2 style="color: #0B1F3B; margin-top: 0;">Olá, ${formData.name || 'Cliente'}!</h2>
          <p>Recebemos sua solicitação com sucesso.</p>
          <p>Nossa equipe de especialistas já está analisando o seu perfil para o produto <strong>${formData.product_type || 'solicitado'}</strong> e entrará em contato muito em breve para oferecer a melhor consultoria personalizada.</p>
        `

        if (formType === 'ebook') {
          subject = 'Seu E-book Chegou: Guia Completo de Seguros - KM Zero'
          innerHtml = `
            <h2 style="color: #0B1F3B; margin-top: 0;">Olá, ${formData.name || 'Cliente'}!</h2>
            <p>Obrigado por baixar nosso Guia Completo para Escolher o Melhor Seguro.</p>
            <p>Clique no botão abaixo para acessar e baixar o seu material gratuitamente:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://km-zero-seguros-copy-fdbec.goskip.app/ebook-guia-seguros.pdf" style="display:inline-block; padding: 15px 30px; background-color: #C8A24A; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Baixar Meu E-book</a>
            </div>
            <p>Se tiver qualquer dúvida, nossa equipe de consultores está à disposição.</p>
          `
        } else if (formType === 'renewal') {
          subject = 'Solicitação de Renovação Recebida - KM Zero Seguros'
          innerHtml = `
            <h2 style="color: #0B1F3B; margin-top: 0;">Olá, ${formData.name || 'Cliente'}!</h2>
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
            to: formData.email,
            subject: subject,
            html: emailHtml,
          }),
        }).catch((err) => console.error('Error sending email via Resend:', err))
      }

      // Send Slack Notification
      if (slackWebhookUrl) {
        let slackText = `🚨 *Novo ${formType === 'renewal' ? 'Lead de Renovação' : formType === 'ebook' ? 'Lead E-book' : 'Lead'} Recebido!* 🚨\n\n*Nome:* ${formData.name || 'N/A'}\n*Email:* ${formData.email || 'N/A'}\n*Telefone:* ${formData.phone || 'N/A'}\n*Produto:* ${formData.product_type || 'N/A'}\n*Origem:* ${formData.lead_source || 'website'}`

        if (formType === 'renewal') {
          slackText += `\n*Vencimento:* ${formData.expiration_date || 'N/A'}\n*Horário Preferencial:* ${formData.preferred_time || 'N/A'}`
          if (formData.file_url) {
            slackText += `\n*Apólice Anexa:* ${formData.file_url}`
          }
        }

        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: slackText }),
        }).catch((err) =>
          console.error('Error sending Slack notification:', err),
        )
      }
    } else if (formType === 'candidate') {
      const { data, error } = await supabase
        .from('candidatos')
        .insert([formData])
        .select()
        .single()
      if (error) throw error
      insertedData = data

      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🧑‍💼 *Nova Candidatura* \n\n*Nome:* ${formData.name}\n*Email:* ${formData.email}`,
          }),
        }).catch((err) => console.error('Slack error:', err))
      }
    } else {
      throw new Error('Tipo de formulário inválido.')
    }

    return new Response(JSON.stringify({ success: true, data: insertedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('submitForm error:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
