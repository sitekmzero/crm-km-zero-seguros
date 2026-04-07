import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    // Find contacts in Lead or MQL with no interactions in last 3 days
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString()

    const { data: contacts, error } = await supabase
      .schema('crm' as any)
      .from('contacts')
      .select('*, user_profiles:proprietario_id(email, full_name)')
      .in('status', ['lead', 'marketing_qualified_lead'])
      .lt('last_activity_date', threeDaysAgo)
      .not('proprietario_id', 'is', null)

    if (error) throw error

    // Group by owner
    const byOwner: Record<string, any> = {}
    contacts?.forEach((c) => {
      const email = c.user_profiles?.email
      if (!email) return
      if (!byOwner[email]) byOwner[email] = []
      byOwner[email].push(c)
    })

    if (resendApiKey) {
      for (const [email, list] of Object.entries(byOwner)) {
        const listHtml = list
          .map(
            (c: any) =>
              `<li>${c.first_name} ${c.last_name || ''} - ${c.phone || c.email}</li>`,
          )
          .join('')
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'crm@resend.dev',
            to: email,
            subject: 'Lembrete de Follow-up (CRM Km Zero)',
            html: `<p>Olá,</p><p>Os seguintes contatos não recebem interação há mais de 3 dias:</p><ul>${listHtml}</ul><p>Por favor, realize um follow-up.</p>`,
          }),
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: contacts?.length }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
