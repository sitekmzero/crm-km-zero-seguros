import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { venda_id, cliente_nome, produto, seguradora_nome, valor, status } =
      await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'contato@resend.dev',
          to: 'contato@kmzero.com.br',
          subject: `Nova Venda Online: ${produto}`,
          html: `<p>Uma nova venda online foi registrada!</p>
                 <ul>
                   <li><strong>Cliente:</strong> ${cliente_nome || 'N/A'}</li>
                   <li><strong>Produto:</strong> ${produto || 'N/A'}</li>
                   <li><strong>Seguradora:</strong> ${seguradora_nome || 'N/A'}</li>
                   <li><strong>Valor:</strong> R$ ${valor || '0,00'}</li>
                   <li><strong>Status:</strong> ${status || 'N/A'}</li>
                 </ul>`,
        }),
      })
    }

    const slack = Deno.env.get('SLACK_WEBHOOK_URL')
    if (slack) {
      await fetch(slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *Nova Venda Online Registrada!* 🚨\n\n*Cliente:* ${cliente_nome || 'N/A'}\n*Produto:* ${produto || 'N/A'}\n*Seguradora:* ${seguradora_nome || 'N/A'}\n*Valor:* R$ ${valor || '0,00'}\n*Status:* ${status || 'N/A'}`,
        }),
      })
    }

    if (venda_id) {
      await supabase.from('notificacoes_vendas').insert({
        venda_id,
        tipo: 'email_slack',
        status: 'enviado',
      })
    }

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
