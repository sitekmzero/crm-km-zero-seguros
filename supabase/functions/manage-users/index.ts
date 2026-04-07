import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, payload } = await req.json()
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Auth Header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: { headers: { Authorization: authHeader } },
      },
    )

    const {
      data: { user },
      error: authErr,
    } = await supabaseClient.auth.getUser()
    if (authErr || !user) throw new Error('Unauthorized')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single()
    if (!profile || (!profile.is_admin && profile.role !== 'admin')) {
      throw new Error('Forbidden: Only admins can perform this action')
    }

    const logAudit = async (acao: string, descricao: string) => {
      const ip =
        req.headers.get('x-real-ip') ||
        req.headers.get('x-forwarded-for') ||
        'unknown'
      await supabaseAdmin
        .schema('crm' as any)
        .from('audit_log')
        .insert({
          usuario_id: user.id,
          acao,
          descricao,
          ip_usuario: ip,
        })
    }

    let result = {}

    if (action === 'invite') {
      const { email, name, role } = payload
      const { data: inviteData, error: inviteErr } =
        await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email: email,
          options: {
            data: { name, role },
            redirectTo: 'https://crm-kmzero.goskip.app/update-password',
          },
        })
      if (inviteErr) throw inviteErr

      const inviteLink = inviteData.properties.action_link

      await supabaseAdmin.from('user_profiles').upsert({
        id: inviteData.user.id,
        email: email,
        full_name: name,
        role: role,
        is_admin: role === 'admin',
        status: 'ativo',
      })

      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contato@resend.dev',
            to: email,
            subject: 'Convite para o CRM KM Zero Seguros',
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #F5F2EA; padding: 40px; color: #0B1F3B;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
                  <div style="background-color: #0B1F3B; padding: 20px; text-align: center;">
                    <h1 style="color: #C8A24A; margin: 0;">KM Zero Seguros</h1>
                  </div>
                  <div style="padding: 30px;">
                    <h2>Olá, ${name}!</h2>
                    <p>Você foi convidado(a) para acessar o CRM da KM Zero Seguros como <strong>${role === 'admin' ? 'Administrador' : 'Vendedor'}</strong>.</p>
                    <p>Para começar, clique no botão abaixo para definir sua senha de acesso:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${inviteLink}" style="background-color: #C8A24A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Definir Minha Senha</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                    <p style="font-size: 12px; color: #666; word-break: break-all;">${inviteLink}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #666;">Em caso de dúvidas, entre em contato com <a href="mailto:contato@kmzero.com.br">contato@kmzero.com.br</a>.</p>
                  </div>
                </div>
              </div>
            `,
          }),
        })
      }

      await logAudit('criar_usuario', `Convidou usuário ${email} como ${role}`)
      result = { link: inviteLink }
    } else if (action === 'update_role') {
      const { target_user_id, role, email } = payload
      await supabaseAdmin
        .from('user_profiles')
        .update({ role, is_admin: role === 'admin' })
        .eq('id', target_user_id)
      await logAudit(
        'editar_usuario',
        `Alterou role do usuário ${email} para ${role}`,
      )
      result = { success: true }
    } else if (action === 'update_status') {
      const { target_user_id, status, email } = payload
      await supabaseAdmin
        .from('user_profiles')
        .update({ status })
        .eq('id', target_user_id)
      if (status === 'inativo') {
        await supabaseAdmin.auth.admin.updateUserById(target_user_id, {
          ban_duration: '876000h',
        })
      } else {
        await supabaseAdmin.auth.admin.updateUserById(target_user_id, {
          ban_duration: 'none',
        })
      }
      await logAudit(
        'editar_usuario',
        `Alterou status do usuário ${email} para ${status}`,
      )
      result = { success: true }
    } else if (action === 'reset_password') {
      const { target_user_id, email } = payload
      const { data: resetData, error: resetErr } =
        await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: 'https://crm-kmzero.goskip.app/update-password',
          },
        })
      if (resetErr) throw resetErr

      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'contato@resend.dev',
            to: email,
            subject: 'Redefinição de Senha - CRM KM Zero',
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #F5F2EA; padding: 40px; color: #0B1F3B;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
                  <div style="padding: 30px;">
                    <h2>Redefinição de Senha</h2>
                    <p>Você solicitou a redefinição de sua senha.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetData.properties.action_link}" style="background-color: #C8A24A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Redefinir Senha</a>
                    </div>
                  </div>
                </div>
              </div>
            `,
          }),
        })
      }

      await logAudit(
        'resetar_senha',
        `Solicitou redefinição de senha para ${email}`,
      )
      result = { success: true }
    } else {
      throw new Error('Invalid action')
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
