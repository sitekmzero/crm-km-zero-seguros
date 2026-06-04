import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

// SHA-256 Hash utility for Meta CAPI
async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)

  // Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    const verifyToken = Deno.env.get('VERIFY_TOKEN')

    if (mode === 'subscribe' && token === verifyToken) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // Webhook Event (POST)
  if (req.method === 'POST') {
    try {
      const payload = await req.json()

      // WhatsApp Cloud API Payload Structure parsing
      if (payload.object === 'whatsapp_business_account') {
        const entry = payload.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value
        const messages = value?.messages

        if (messages && messages.length > 0) {
          const message = messages[0]
          const contactInfo = value.contacts?.[0]
          const phone = message.from // Sender's phone number
          const messageId = message.id

          let messageBody = ''
          if (message.type === 'text') {
            messageBody = message.text.body
          } else {
            messageBody = `[${message.type}]`
          }

          if (!phone) return new Response('Ignored', { status: 200 })

          const supabaseUrl = Deno.env.get('SUPABASE_URL')
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration')
          }

          const supabase = createClient(supabaseUrl, supabaseKey)

          // 1. Find or Create Contact
          let { data: contact } = await supabase
            .schema('crm' as any)
            .from('contacts')
            .select('*')
            .eq('phone', phone)
            .single()

          if (!contact) {
            const { data: newContact, error: createError } = await supabase
              .schema('crm' as any)
              .from('contacts')
              .insert({
                phone: phone,
                name: contactInfo?.profile?.name || phone,
              })
              .select('*')
              .single()

            if (createError) throw createError
            contact = newContact
          }

          // 2. Insert Message into crm.whatsapp_messages
          await supabase
            .schema('crm' as any)
            .from('whatsapp_messages')
            .insert({
              contact_id: contact.id,
              message_body: messageBody,
              direction: 'inbound',
              metadata: { message_id: messageId, original_payload: message },
            })

          // 3. Trigger Meta Conversions API (CAPI)
          const metaAccessToken = Deno.env.get('META_ACCESS_TOKEN')
          const metaPixelId = Deno.env.get('META_PIXEL_ID')

          if (metaAccessToken && metaPixelId) {
            const hashedPhone = await hashData(phone)
            let hashedEmail = undefined

            if (contact.email) {
              hashedEmail = await hashData(contact.email)
            }

            const eventData = {
              data: [
                {
                  event_name: 'Contact',
                  event_time: Math.floor(Date.now() / 1000),
                  action_source: 'chat',
                  user_data: {
                    ph: [hashedPhone],
                    ...(hashedEmail ? { em: [hashedEmail] } : {}),
                  },
                },
              ],
            }

            const capiResponse = await fetch(
              `https://graph.facebook.com/v17.0/${metaPixelId}/events?access_token=${metaAccessToken}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
              },
            )

            if (!capiResponse.ok) {
              console.error('CAPI Error:', await capiResponse.text())
            }
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      // Default fallback
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } catch (e: any) {
      console.error('Webhook error:', e)
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
})
