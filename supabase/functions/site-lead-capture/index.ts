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
    const {
      nome,
      email,
      telefone,
      cpf,
      cep,
      modelo_captura,
      produto_interesse,
    } = await req.json()

    if (!nome || !telefone) throw new Error('Nome e telefone são obrigatórios')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Check duplicates by phone or email
    const { data: existing } = await supabase
      .schema('crm' as any)
      .from('contacts')
      .select('id')
      .or(`phone.eq.${telefone},email.eq.${email}`)
      .limit(1)

    let contactId

    if (existing && existing.length > 0) {
      contactId = existing[0].id
      await supabase
        .schema('crm' as any)
        .from('contacts')
        .update({ modelo_captura, produto_interesse, status: 'lead' })
        .eq('id', contactId)
    } else {
      const { data, error } = await supabase
        .schema('crm' as any)
        .from('contacts')
        .insert({
          first_name: nome.split(' ')[0],
          last_name: nome.split(' ').slice(1).join(' '),
          email,
          phone: telefone,
          cpf,
          cep,
          modelo_captura: modelo_captura || 'Vapt-Vupt',
          produto_interesse,
          status: 'subscriber', // Or lead
        })
        .select()
        .single()

      if (error) throw error
      contactId = data.id
    }

    return new Response(JSON.stringify({ success: true, contactId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
