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
    const { quotation_id, novo_status } = await req.json() // 'aceita' or 'recusada'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: q, error } = await supabase
      .schema('crm' as any)
      .from('quotations')
      .update({ status: novo_status })
      .eq('id', quotation_id)
      .select()
      .single()
    if (error) throw error

    const nextStatus = novo_status === 'aceita' ? 'opportunity' : 'lead'
    await supabase
      .schema('crm' as any)
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
