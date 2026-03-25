import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const { contact_id } = await req.json()
    if (!contact_id) throw new Error('contact_id is required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch active vendors
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

    // Logic: find vendor with least active leads (status = lead or mql)
    const { data: contactsData } = await supabase
      .from('contacts')
      .select('proprietario_id')
      .in('status', ['lead', 'marketing_qualified_lead'])

    const leadCount: Record<string, number> = {}
    vendors.forEach((v) => (leadCount[v.id] = 0))

    contactsData?.forEach((c) => {
      if (c.proprietario_id && leadCount[c.proprietario_id] !== undefined) {
        leadCount[c.proprietario_id]++
      }
    })

    // Find the one with minimum
    let selectedVendorId = vendors[0].id
    let minLeads = leadCount[selectedVendorId]

    for (const vendor of vendors) {
      if (leadCount[vendor.id] < minLeads) {
        minLeads = leadCount[vendor.id]
        selectedVendorId = vendor.id
      }
    }

    // Assign
    await supabase
      .from('contacts')
      .update({ proprietario_id: selectedVendorId })
      .eq('id', contact_id)

    // Optionally notify the vendor via email

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
