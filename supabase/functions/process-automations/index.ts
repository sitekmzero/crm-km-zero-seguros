import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders })

  try {
    const payload = await req.json()
    // payload should contain: record, old_record, type (INSERT/UPDATE)
    const { record, old_record, type } = payload

    if (!record || !record.id) throw new Error('Invalid payload')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const supabase = createClient(supabaseUrl, supabaseKey)

    const stageChanged =
      type === 'UPDATE' && old_record && record.status !== old_record.status
    const isNew = type === 'INSERT'

    // 1. Process Automated Emails (Templates) based on Stage
    if ((stageChanged || isNew) && resendApiKey && record.email) {
      const targetStage = record.status
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('stage', targetStage)
        .limit(1)
        .maybeSingle()

      if (template) {
        let body = template.body
          .replace('{{nome_cliente}}', record.first_name)
          .replace('{{produto}}', record.produto_interesse || 'nossos produtos')

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'crm@resend.dev',
            to: record.email,
            subject: template.subject,
            html: body,
          }),
        })
      }
    }

    // 2. Fetch Vendor Config for Integrations
    if (record.proprietario_id) {
      const { data: config } = await supabase
        .schema('crm')
        .from('vendor_config')
        .select('*')
        .eq('user_id', record.proprietario_id)
        .maybeSingle()

      if (config) {
        // Pipedrive Sync
        if (config.pipedrive_api_key && stageChanged) {
          // simplified pipedrive sync via fetch to pipedrive api
          // Real implementation would map CRM status to Pipeline Stage IDs
          console.log(
            `Syncing deal to Pipedrive for vendor ${record.proprietario_id}`,
          )
        }

        // N8N Webhook trigger
        if (config.n8n_webhook_url && (stageChanged || isNew)) {
          await fetch(config.n8n_webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: type, contact: record }),
          }).catch((err) => console.error('N8N Webhook failed:', err))
        }
      }
    }

    // 3. Create In-App Notification for urgent changes (e.g. Lead Score > 80 just assigned)
    if (isNew && record.lead_score >= 80 && record.proprietario_id) {
      await supabase
        .schema('crm')
        .from('app_notifications')
        .insert({
          user_id: record.proprietario_id,
          title: '🔥 Lead Quente Atribuído',
          message: `${record.first_name} tem um score alto (${record.lead_score}). Entre em contato rápido!`,
          priority: 'high',
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
