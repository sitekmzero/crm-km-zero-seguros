import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { lead_id, content, sender = 'humano', message_id } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: lead, error: fetchError } = await supabase
      .schema('public')
      .from('leads')
      .select('phone, ai_active')
      .eq('id', lead_id)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!lead) throw new Error('Lead not found')

    if (sender === 'humano' && lead.ai_active) {
      await supabase
        .schema('public')
        .from('leads')
        .update({
          ai_active: false,
          status: 'em_atendimento_humano',
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead_id)
    }

    if (message_id) {
      await supabase
        .schema('public')
        .from('messages')
        .update({
          sender,
          content,
          is_draft: false,
        })
        .eq('id', message_id)
    } else {
      await supabase.schema('public').from('messages').insert({
        lead_id,
        sender,
        content,
        is_draft: false,
      })
    }

    const waToken = Deno.env.get('META_ACCESS_TOKEN')
    const waPhoneId =
      Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '124285125625890'
    if (waToken && waPhoneId && lead?.phone) {
      const waRes = await fetch(
        `https://graph.facebook.com/v17.0/${waPhoneId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${waToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: lead.phone,
            text: { body: content },
          }),
        },
      )
      if (!waRes.ok) {
        const errData = await waRes.json().catch(() => ({}))
        throw new Error(`Meta API Error: ${JSON.stringify(errData)}`)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: corsHeaders,
    })
  }
})
