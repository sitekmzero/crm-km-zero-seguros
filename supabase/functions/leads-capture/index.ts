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
      const { name, phone, email, product } = body

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      const normalizedPhone = (phone || '').replace(/\D/g, '')

      if (!normalizedPhone) throw new Error('Phone is required')

      let { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('phone', normalizedPhone)
        .maybeSingle()

      if (!lead) {
        const { data: newLead, error } = await supabase
          .from('leads')
          .insert({
            phone: normalizedPhone,
            name: name || 'Cliente Landing Page',
            channel: 'landing_page',
            status: 'novo',
            ai_active: true,
          })
          .select('*')
          .single()
        if (error) throw error
        lead = newLead
      }

      const productName = product || 'N/D'
      const msgContent = `Lead se cadastrou via Landing Page de ${productName}${email ? `. Email: ${email}` : ''}`

      await supabase.from('messages').insert({
        lead_id: lead.id,
        sender: 'ia',
        content: msgContent,
        is_draft: false,
      })

      await supabase
        .from('leads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', lead.id)

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
