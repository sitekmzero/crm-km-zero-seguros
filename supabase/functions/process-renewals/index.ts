import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
      throw new Error('Missing Resend API Key')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Target date = Today + 30 days
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 30)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    // Find active renewal campaign
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('trigger_type', 'renovação')
      .eq('status', 'ativo')
      .single()

    if (!campaign) {
      return new Response(
        JSON.stringify({ success: true, note: 'No active renewal campaign' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Find clients with renewal_date exactly 30 days from now
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, email, name')
      .eq('renewal_date', targetDateStr)

    if (clientsError) throw clientsError

    let sentCount = 0

    for (const client of clients || []) {
      // Check if already sent
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select('id')
        .eq('client_id', client.id)
        .eq('campaign_id', campaign.id)
        .single()

      if (!existingLog && client.email) {
        // Send email via Resend
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contato@resend.dev',
            to: client.email,
            subject: campaign.name,
            html: campaign.template.replace('{{nome}}', client.name),
          }),
        })

        if (res.ok) {
          // Log the send
          await supabase.from('email_logs').insert({
            client_id: client.id,
            campaign_id: campaign.id,
          })
          sentCount++
        } else {
          console.error(`Failed to send to ${client.email}:`, await res.text())
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: sentCount }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (err: any) {
    console.error('Error processing renewals:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
