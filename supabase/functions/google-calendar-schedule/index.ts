import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { contact_id, contact_name, contact_email, datetime } =
      await req.json()

    if (!contact_id || !datetime) {
      throw new Error('contact_id and datetime are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Log the interaction
    await supabase
      .schema('crm')
      .from('crm_interactions')
      .insert({
        contact_id,
        tipo: 'Reunião Agendada',
        descricao: `Reunião agendada para: ${new Date(datetime).toLocaleString('pt-BR')}`,
      })

    // Mock Google Calendar API logic
    // In a real application, we would retrieve 'google_calendar_token' from 'vendor_config'
    // and make an authenticated POST request to https://www.googleapis.com/calendar/v3/calendars/primary/events
    console.log(`[Google Calendar API Mock] Event created for ${datetime}`)

    // Send confirmation email to client
    if (resendApiKey && contact_email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'crm@resend.dev',
          to: contact_email,
          subject: 'Confirmação de Reunião - KM Zero Seguros',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #0B1F3B;">Olá, ${contact_name}!</h2>
              <p>Sua reunião com nosso especialista foi confirmada com sucesso.</p>
              <p><strong>Data/Hora:</strong> ${new Date(datetime).toLocaleString('pt-BR')}</p>
              <br/>
              <p>Em breve você receberá o link para acesso em sua agenda.</p>
              <p>Equipe KM Zero Seguros</p>
            </div>
          `,
        }),
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reunião agendada com sucesso',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
