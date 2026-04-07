import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { contact_id, tipo_produto, dados_cotacao } = await req.json()
    if (!contact_id) throw new Error('contact_id is required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: quotation, error } = await supabase
      .schema('crm')
      .from('quotations')
      .insert({
        contact_id,
        tipo_produto,
        dados_cotacao,
        status: 'pendente',
      })
      .select()
      .single()

    if (error) throw error

    // Update pipeline status
    await supabase
      .schema('crm')
      .from('contacts')
      .update({
        status: 'marketing_qualified_lead',
        last_activity_date: new Date().toISOString(),
      })
      .eq('id', contact_id)

    // Optionally send email confirmation via Resend here

    return new Response(
      JSON.stringify({ success: true, quotationId: quotation.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
