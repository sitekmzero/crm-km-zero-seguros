import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    // Adapt payload mapping based on actual webhook provider (Twilio, Evolution API)
    const phone = payload.phone || payload.From?.replace('whatsapp:', '')
    const message = payload.text || payload.Body

    if (!phone) return new Response('Ignored', { status: 200 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Find contact by phone
    const { data: contacts } = await supabase
      .schema('crm')
      .from('contacts')
      .select('id, proprietario_id')
      .ilike('phone', `%${phone.substring(phone.length - 8)}%`)
      .limit(1)

    if (contacts && contacts.length > 0) {
      const contact = contacts[0]
      // Record interaction
      await supabase
        .schema('crm')
        .from('crm_interactions')
        .insert({
          contact_id: contact.id,
          tipo: 'WhatsApp (Inbound)',
          descricao: `Mensagem recebida: ${message}`,
        })
      // Here you could send an email notification to proprietario_id
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Olá! Recebemos sua mensagem. Um de nossos consultores entrará em contato em breve.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
