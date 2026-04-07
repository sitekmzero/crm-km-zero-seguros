import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { contact_id, produto } = await req.json()
    if (!contact_id) throw new Error('contact_id is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check Round Robin flag
    const { data: configRow } = await supabase
      .from('corretora_config')
      .select('round_robin_enabled')
      .single()
    const isRoundRobin = configRow?.round_robin_enabled || false

    const { data: vendors, error: vErr } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'vendedor')
    if (vErr || !vendors || vendors.length === 0) {
      return new Response(
        JSON.stringify({ success: false, note: 'No vendors available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { data: contactsData } = await supabase
      .schema('crm')
      .from('contacts')
      .select('proprietario_id, status')
      .in('status', [
        'lead',
        'marketing_qualified_lead',
        'sales_qualified_lead',
      ])

    let selectedVendorId = vendors[0].id

    if (isRoundRobin) {
      // Pure Round Robin: assign to vendor with minimum active leads
      const counts: Record<string, number> = {}
      vendors.forEach((v) => (counts[v.id] = 0))
      contactsData?.forEach((c) => {
        if (c.proprietario_id && counts[c.proprietario_id] !== undefined)
          counts[c.proprietario_id]++
      })

      let minCount = Infinity
      for (const id in counts) {
        if (counts[id] < minCount) {
          minCount = counts[id]
          selectedVendorId = id
        }
      }
    } else {
      // Legacy Specialist Assignment
      const { data: vendorConfigs } = await supabase
        .schema('crm')
        .from('vendor_config')
        .select('user_id, specialties')
      let bestScore = -999999
      for (const v of vendors) {
        const c = vendorConfigs?.find((c) => c.user_id === v.id)
        const isSpecialist = c?.specialties?.includes(produto) || false
        const activeCount =
          contactsData?.filter((cc) => cc.proprietario_id === v.id).length || 0
        const score = (isSpecialist ? 1000 : 0) - activeCount
        if (score > bestScore) {
          bestScore = score
          selectedVendorId = v.id
        }
      }
    }

    // Assign
    await supabase
      .schema('crm')
      .from('contacts')
      .update({ proprietario_id: selectedVendorId })
      .eq('id', contact_id)

    // Notify Vendor via Realtime Notif
    await supabase.schema('crm').from('app_notifications').insert({
      user_id: selectedVendorId,
      title: 'Novo Lead Atribuído',
      message:
        'Um novo lead foi atribuído a você pelo sistema de distribuição automática.',
      type: 'info',
    })

    return new Response(
      JSON.stringify({
        success: true,
        assignedTo: selectedVendorId,
        method: isRoundRobin ? 'round-robin' : 'specialist',
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
