import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const record = payload.record

    if (!record || !record.email || !record.id) {
      throw new Error('Invalid payload')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
      throw new Error('Missing Resend API Key')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find active welcome campaign
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('trigger_type', 'boas-vindas')
      .eq('status', 'ativo')
      .single()

    if (!campaign) {
      console.log('No active welcome campaign found.')
      return new Response(
        JSON.stringify({ success: true, note: 'No active campaign' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Check if already sent
    const { data: existingLog } = await supabase
      .from('email_logs')
      .select('id')
      .eq('client_id', record.id)
      .eq('campaign_id', campaign.id)
      .single()

    if (existingLog) {
      console.log('Welcome email already sent to this client.')
      return new Response(
        JSON.stringify({ success: true, note: 'Already sent' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'contato@resend.dev',
        to: record.email,
        subject: campaign.name,
        html: campaign.template,
      }),
    })

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`)
    }

    // Log the send
    await supabase.from('email_logs').insert({
      client_id: record.id,
      campaign_id: campaign.id,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('Error sending welcome email:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
