import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    const { cpf, veiculo, cobertura, contato_id } = payload

    if (!cpf || !veiculo) throw new Error('CPF e veículo são obrigatórios')

    // Mock API requests to real Insurers (Bradesco, Porto, Allianz)
    // In real life, you would use fetch() with MTLS or specific tokens for each insurer's API

    console.log(
      `[API Connect] Requesting quotes for CPF ${cpf}, vehicle ${veiculo}`,
    )

    // Simulate delay
    await new Promise((r) => setTimeout(r, 1500))

    const quotes = [
      {
        seguradora: 'Porto Seguro',
        logo: 'https://lxfdqudvexpktlesfkro.supabase.co/storage/v1/object/public/Logos/Corretora/porto.png',
        valor_anual: 3500.0,
        franquia: 2500.0,
        parcelamento: '10x sem juros',
      },
      {
        seguradora: 'Bradesco Seguros',
        logo: 'https://lxfdqudvexpktlesfkro.supabase.co/storage/v1/object/public/Logos/Corretora/bradesco.png',
        valor_anual: 3100.0,
        franquia: 3000.0,
        parcelamento: '12x sem juros',
      },
      {
        seguradora: 'Allianz',
        logo: 'https://lxfdqudvexpktlesfkro.supabase.co/storage/v1/object/public/Logos/Corretora/allianz.png',
        valor_anual: 3800.0,
        franquia: 2000.0,
        parcelamento: '6x sem juros',
      },
    ]

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Save to cotacoes
    if (contato_id) {
      await supabase.schema('crm').from('quotations').insert({
        contact_id: contato_id,
        tipo_produto: 'Seguro Auto',
        dados_cotacao: { veiculo, cobertura, quotes },
        status: 'cotado_real',
      })
    }

    return new Response(JSON.stringify({ success: true, quotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    // Log to error_logs
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      )
      await supabase.from('error_logs').insert({
        funcao: 'cotacao-real',
        tipo_erro: e.name || 'Error',
        mensagem: e.message,
        stack_trace: e.stack,
      })
    } catch (err) {
      console.error('Failed to log error', err)
    }

    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
