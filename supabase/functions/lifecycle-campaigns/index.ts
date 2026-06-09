import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    console.log('Starting lifecycle-campaigns edge function...')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const metaAccessToken = Deno.env.get('META_ACCESS_TOKEN')
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

    if (!metaAccessToken || !whatsappPhoneId) {
      console.warn(
        'Missing Meta credentials (META_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID).',
      )
    }

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD
    const todayMonthDay = todayStr.substring(5) // MM-DD

    const date7DaysFromNow = new Date()
    date7DaysFromNow.setDate(today.getDate() + 7)
    const targetPolicyExpiresDate = date7DaysFromNow.toISOString().split('T')[0]

    const date60DaysAgo = new Date()
    date60DaysAgo.setDate(today.getDate() - 60)
    const targetClosedWonDate = date60DaysAgo.toISOString().split('T')[0]

    let processedCount = 0

    // Helper to send message and log history
    const sendCampaign = async (
      lead: any,
      template: string,
      logMsg: string,
    ) => {
      if (lead.last_campaign_sent_at) {
        const lastSentDate = new Date(lead.last_campaign_sent_at)
          .toISOString()
          .split('T')[0]
        if (lastSentDate === todayStr) return // Already sent today, skip to prevent spam
      }

      if (metaAccessToken && whatsappPhoneId) {
        const waRes = await fetch(
          `https://graph.facebook.com/v20.0/${whatsappPhoneId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${metaAccessToken}`,
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: lead.phone,
              type: 'template',
              template: {
                name: template,
                language: { code: 'pt_BR' },
                components: [
                  {
                    type: 'body',
                    parameters: [
                      {
                        type: 'text',
                        text: lead.name.split(' ')[0] || 'Cliente',
                      },
                    ],
                  },
                ],
              },
            }),
          },
        )

        if (!waRes.ok) {
          const errText = await waRes.text()
          console.error(`Failed to send ${template} to ${lead.phone}`, errText)
          return
        }
      } else {
        console.log(
          `[Mock] Whatsapp integration skipped (missing tokens). Template: ${template}`,
        )
      }

      console.log(logMsg)

      await supabase.from('messages').insert({
        lead_id: lead.id,
        sender: 'ia',
        content: `Campanha automática enviada: [Template: ${template}]`,
        is_draft: false,
      })

      await supabase
        .from('leads')
        .update({
          last_campaign_sent_at: new Date().toISOString(),
        })
        .eq('id', lead.id)

      processedCount++
    }

    // 1. Anniversary Rule
    const { data: leadsAnniversary } = await supabase
      .from('leads')
      .select('id, name, phone, birth_date, last_campaign_sent_at')
      .not('birth_date', 'is', null)

    if (leadsAnniversary) {
      for (const lead of leadsAnniversary) {
        if (lead.birth_date && lead.birth_date.substring(5) === todayMonthDay) {
          await sendCampaign(
            lead,
            'kmzero_parabens_aniversario',
            `Dispatched anniversary message for lead ${lead.id}`,
          )
        }
      }
    }

    // 2. Insurance Renewal Rule
    const { data: leadsRenewal } = await supabase
      .from('leads')
      .select('id, name, phone, policy_expires_at, last_campaign_sent_at')
      .eq('policy_expires_at', targetPolicyExpiresDate)

    if (leadsRenewal) {
      for (const lead of leadsRenewal) {
        await sendCampaign(
          lead,
          'kmzero_renovacao_seguro',
          `Dispatched insurance renewal message for lead ${lead.id}`,
        )
      }
    }

    // 3. Cross-selling Rule
    const { data: leadsCrossSell } = await supabase
      .from('leads')
      .select(
        'id, name, phone, closed_won_at, product_interest, last_campaign_sent_at',
      )
      .gte('closed_won_at', `${targetClosedWonDate}T00:00:00.000Z`)
      .lte('closed_won_at', `${targetClosedWonDate}T23:59:59.999Z`)
      .eq('product_interest', 'seguro_auto')

    if (leadsCrossSell) {
      for (const lead of leadsCrossSell) {
        await sendCampaign(
          lead,
          'kmzero_cross_sell_residencial',
          `Dispatched cross-selling message for lead ${lead.id}`,
        )
      }
    }

    console.log(
      `Lifecycle campaigns edge function finished. Total processed: ${processedCount}`,
    )

    return new Response(
      JSON.stringify({ success: true, processed: processedCount }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (err: any) {
    console.error('Error in lifecycle campaigns:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
