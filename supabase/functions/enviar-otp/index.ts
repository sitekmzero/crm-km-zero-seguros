import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { email } = await req.json()
    if (!email) throw new Error('Email is required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString()

    await supabase
      .from('otp_validacoes')
      .insert({ email, code, expires_at: expiresAt })

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contato@resend.dev',
          to: email,
          subject: 'Seu Código de Acesso - KM Zero',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #0B1F3B; padding: 20px; text-align: center;">
                <h1 style="color: #C8A24A; margin: 0; font-size: 24px;">KM Zero Seguros</h1>
              </div>
              <div style="padding: 30px; background-color: #ffffff; color: #333333; text-align: center;">
                <h2 style="color: #0B1F3B; margin-top: 0;">Código de Verificação</h2>
                <p>Use o código abaixo para acessar a Área do Cliente:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #C8A24A; margin: 20px 0;">
                  ${code}
                </div>
                <p style="color: #666; font-size: 14px;">Este código expira em 10 minutos.</p>
              </div>
            </div>
          `,
        }),
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
