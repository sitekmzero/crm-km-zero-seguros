import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { crypto } from 'jsr:@std/crypto/crypto'
import { encodeHex } from 'jsr:@std/encoding/hex'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const record = payload.record

    if (!record) {
      return new Response('No record found in payload', {
        status: 400,
        headers: corsHeaders,
      })
    }

    console.log(
      'Disparada conversão offline de Lead Qualificado para a Meta CAPI...',
    )

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (['facebook', 'instagram', 'whatsapp'].includes(record.channel)) {
      const metaPixelId = Deno.env.get('META_PIXEL_ID')
      const metaAccessToken = Deno.env.get('META_ACCESS_TOKEN')

      if (metaPixelId && metaAccessToken) {
        const encoder = new TextEncoder()
        let phHash = undefined
        if (record.phone) {
          const phData = encoder.encode(record.phone.replace(/\D/g, ''))
          phHash = encodeHex(await crypto.subtle.digest('SHA-256', phData))
        }
        let emHash = undefined
        if (record.email) {
          const emData = encoder.encode(record.email.trim().toLowerCase())
          emHash = encodeHex(await crypto.subtle.digest('SHA-256', emData))
        }

        const userData: any = {
          client_user_agent: 'Offline Conversion Engine',
        }
        if (phHash) userData.ph = [phHash]
        if (emHash) userData.em = [emHash]

        const event = {
          data: [
            {
              event_name: 'Lead',
              event_time: Math.floor(Date.now() / 1000),
              user_data: userData,
              custom_data: { lead_status: record.status },
              action_source: 'physical_store',
            },
          ],
        }

        const metaRes = await fetch(
          `https://graph.facebook.com/v20.0/${metaPixelId}/events?access_token=${metaAccessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          },
        )

        if (!metaRes.ok) {
          console.error(
            'Erro ao enviar conversão para Meta CAPI:',
            await metaRes.text(),
          )
        } else {
          console.log('Conversão enviada com sucesso para Meta CAPI.')
        }
      } else {
        console.warn('META_PIXEL_ID ou META_ACCESS_TOKEN ausentes.')
      }
    }

    if (record.gclid) {
      console.log('GCLID enviado para exportação de conversões do Google...')
      await supabase.schema('public').from('google_conversions').insert({
        lead_id: record.id,
        gclid: record.gclid,
        converted_at: new Date().toISOString(),
        status: 'pending_export',
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Erro na função offline-conversions:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
