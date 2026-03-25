import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch active contacts (not customer, not lost)
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, created_at, status, produto_interesse')
      .not('status', 'eq', 'customer')

    if (error) throw error
    if (!contacts) return new Response('No contacts', { status: 200 })

    let processed = 0

    for (const c of contacts) {
      let score = 0

      // 1. Time since creation (newer = better +20)
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(c.created_at).getTime()) /
          (1000 * 3600 * 24),
      )
      if (daysSinceCreation <= 3) score += 20
      else if (daysSinceCreation <= 7) score += 10
      else if (daysSinceCreation <= 15) score += 5

      // 2. Stage progression
      if (c.status === 'opportunity') score += 40
      else if (c.status === 'sales_qualified_lead') score += 30
      else if (c.status === 'marketing_qualified_lead') score += 15
      else if (c.status === 'lead') score += 5

      // 3. Interactions (approx 5 pts each, max 30)
      const { count } = await supabase
        .from('crm_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('contact_id', c.id)
      const intScore = Math.min((count || 0) * 5, 30)
      score += intScore

      // 4. High intent product
      if (
        c.produto_interesse === 'Seguro Auto' ||
        c.produto_interesse === 'Consórcio'
      )
        score += 10

      // Calculate probability based on score
      let prob = Math.round(score * 0.9)
      if (prob > 99) prob = 99

      await supabase
        .from('contacts')
        .update({ lead_score: score, probability: prob })
        .eq('id', c.id)
      processed++
    }

    return new Response(JSON.stringify({ success: true, updated: processed }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
