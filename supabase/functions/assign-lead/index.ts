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

    // Fetch active vendors and their configs
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

    const { data: vendorConfigs } = await supabase
      .from('vendor_config')
      .select('user_id, specialties')

    // Fetch contacts to calculate load
    const { data: contactsData } = await supabase
      .from('contacts')
      .select('proprietario_id, status')

    const vendorStats: Record<
      string,
      { activeLeads: number; specialties: string[]; isSpecialist: boolean }
    > = {}

    vendors.forEach((v) => {
      const config = vendorConfigs?.find((c) => c.user_id === v.id)
      vendorStats[v.id] = {
        activeLeads: 0,
        specialties: config?.specialties || [],
        isSpecialist: config?.specialties?.includes(produto) || false,
      }
    })

    contactsData?.forEach((c) => {
      if (c.proprietario_id && vendorStats[c.proprietario_id] !== undefined) {
        if (
          ['lead', 'marketing_qualified_lead', 'sales_qualified_lead'].includes(
            c.status,
          )
        ) {
          vendorStats[c.proprietario_id].activeLeads++
        }
      }
    })

    // Intelligent Assignment Logic
    // 1. Prioritize specialist
    // 2. Tie-break with lowest active leads load
    let selectedVendorId = vendors[0].id
    let bestScore = -999999

    for (const vendor of vendors) {
      const stats = vendorStats[vendor.id]
      let score = 0

      if (stats.isSpecialist) score += 1000 // heavy weight for specialist
      score -= stats.activeLeads // subtract load

      if (score > bestScore) {
        bestScore = score
        selectedVendorId = vendor.id
      }
    }

    // Assign
    await supabase
      .from('contacts')
      .update({ proprietario_id: selectedVendorId })
      .eq('id', contact_id)

    // Notify Vendor
    await supabase.from('app_notifications').insert({
      user_id: selectedVendorId,
      title: 'Novo Lead Atribuído',
      message:
        'Um novo lead foi atribuído a você pelo sistema de distribuição inteligente.',
      type: 'info',
    })

    return new Response(
      JSON.stringify({ success: true, assignedTo: selectedVendorId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
