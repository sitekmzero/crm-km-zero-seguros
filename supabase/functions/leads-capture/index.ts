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

  if (req.method === 'POST') {
    try {
      const body = await req.json()
      const { name, phone, email, product_interest, product } = body

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      const normalizedPhone = (phone || '').replace(/\D/g, '')

      if (!normalizedPhone) throw new Error('Phone is required')

      const leadName = name || 'Cliente Landing Page'
      const prodInterest = product_interest || product || 'N/D'

      const { data: lead, error: upsertError } = await supabase
        .from('leads')
        .upsert(
          {
            phone: normalizedPhone,
            name: leadName,
            email: email || null,
            product_interest: prodInterest,
            channel: 'landing_page',
            status: 'novo',
            ai_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'phone' },
        )
        .select('*')
        .single()

      if (upsertError || !lead)
        throw new Error(`Lead upsert error: ${upsertError?.message}`)

      console.log(`Lead captured and saved for: ${normalizedPhone}`)

      const msgContent = `Lead se cadastrou via Landing Page de ${prodInterest}${email ? `. Email: ${email}` : ''}`

      await supabase.from('messages').insert({
        lead_id: lead.id,
        sender: 'ia',
        content: msgContent,
        is_draft: false,
      })

      const waToken = Deno.env.get('META_ACCESS_TOKEN')
      const waPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

      if (waToken && waPhoneId) {
        try {
          const waRes = await fetch(
            `https://graph.facebook.com/v20.0/${waPhoneId}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${waToken}`,
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: normalizedPhone,
                type: 'template',
                template: {
                  name: 'kmzero_boas_vindas_sdr',
                  language: {
                    code: 'pt_BR',
                  },
                  components: [
                    {
                      type: 'body',
                      parameters: [
                        {
                          type: 'text',
                          text: leadName,
                        },
                        {
                          type: 'text',
                          text: prodInterest,
                        },
                      ],
                    },
                  ],
                },
              }),
            },
          )

          if (!waRes.ok) {
            const errText = await waRes.text()
            console.log('WhatsApp template send error:', errText)
          } else {
            console.log(
              `WhatsApp welcome message sent via Meta API for: ${normalizedPhone}`,
            )
          }
        } catch (waErr) {
          console.log('Error during WhatsApp dispatch:', waErr)
        }
      }

      return new Response(JSON.stringify({ success: true, lead }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Not found', { status: 404 })
})
