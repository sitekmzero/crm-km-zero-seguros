import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { quotation_id, novo_status } = await req.json() // 'aceita' or 'recusada'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: q, error } = await supabase
      .from('quotations')
      .update({ status: novo_status })
      .eq('id', quotation_id)
      .select()
      .single()
    if (error) throw error

    const nextStatus = novo_status === 'aceita' ? 'opportunity' : 'lead'
    await supabase
      .from('contacts')
      .update({
        status: nextStatus,
        last_activity_date: new Date().toISOString(),
      })
      .eq('id', q.contact_id)

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
