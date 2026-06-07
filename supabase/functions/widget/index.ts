import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const fnUrl = `${supabaseUrl}/functions/v1/webchat-webhook`

  const js = `
    (function() {
      if (document.getElementById('kmz-widget-btn')) return;

      const btn = document.createElement('div');
      btn.id = 'kmz-widget-btn';
      btn.style.cssText = 'position:fixed;bottom:24px;right:24px;width:64px;height:64px;background:#0B1F3B;border-radius:50%;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;z-index:999999;transition:transform 0.2s, background 0.2s;';
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8A24A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      
      const chat = document.createElement('div');
      chat.style.cssText = 'position:fixed;bottom:100px;right:24px;width:360px;height:540px;background:#fff;border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,0.15);display:none;flex-direction:column;z-index:999999;overflow:hidden;font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;border:1px solid rgba(0,0,0,0.1);';
      
      const header = document.createElement('div');
      header.style.cssText = 'background:#0B1F3B;padding:20px;color:#fff;font-weight:600;display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #C8A24A;font-size:16px;';
      header.innerHTML = '<div style="display:flex;align-items:center;gap:12px;"><div style="width:10px;height:10px;background:#10b981;border-radius:50%;"></div> KM Zero Assistente</div><button id="kmz-close" style="background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:24px;padding:0;line-height:1;margin-top:-4px;">&times;</button>';
      
      const msgs = document.createElement('div');
      msgs.style.cssText = 'flex:1;padding:20px;overflow-y:auto;background:#f8fafc;display:flex;flex-direction:column;gap:12px;';
      
      const form = document.createElement('form');
      form.style.cssText = 'padding:16px;background:#fff;border-top:1px solid #e2e8f0;display:flex;gap:10px;align-items:center;';
      
      const input = document.createElement('input');
      input.placeholder = 'Digite sua mensagem...';
      input.style.cssText = 'flex:1;padding:12px 16px;border:1px solid #cbd5e1;border-radius:24px;outline:none;font-size:14px;background:#f1f5f9;transition:border-color 0.2s;';
      input.onfocus = () => input.style.borderColor = '#C8A24A';
      input.onblur = () => input.style.borderColor = '#cbd5e1';
      
      const send = document.createElement('button');
      send.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
      send.style.cssText = 'background:#C8A24A;color:#fff;border:none;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;';
      send.onmouseover = () => send.style.background = '#b38f3d';
      send.onmouseout = () => send.style.background = '#C8A24A';
      
      form.appendChild(input);
      form.appendChild(send);
      chat.appendChild(header);
      chat.appendChild(msgs);
      chat.appendChild(form);
      document.body.appendChild(btn);
      document.body.appendChild(chat);
      
      let leadId = localStorage.getItem('kmz_lead_id');
      
      btn.onclick = () => {
        const isClosed = chat.style.display === 'none';
        chat.style.display = isClosed ? 'flex' : 'none';
        btn.style.transform = isClosed ? 'scale(0.9)' : 'scale(1)';
        if (isClosed) input.focus();
      };
      
      document.getElementById('kmz-close').onclick = () => chat.style.display = 'none';
      
      function addMsg(text, isBot) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.maxWidth = '85%';
        wrapper.style.alignSelf = isBot ? 'flex-start' : 'flex-end';
        
        const d = document.createElement('div');
        d.style.cssText = 'padding:12px 16px;font-size:14px;line-height:1.5;word-wrap:break-word;box-shadow:0 1px 2px rgba(0,0,0,0.05);';
        if(isBot) {
          d.style.background = '#fff';
          d.style.color = '#334155';
          d.style.borderRadius = '16px 16px 16px 4px';
          d.style.border = '1px solid #e2e8f0';
        } else {
          d.style.background = '#0B1F3B';
          d.style.color = '#fff';
          d.style.borderRadius = '16px 16px 4px 16px';
        }
        
        let htmlText = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
        htmlText = htmlText.replace(/\\n/g, '<br>');
        d.innerHTML = htmlText;
        
        wrapper.appendChild(d);
        msgs.appendChild(wrapper);
        msgs.scrollTop = msgs.scrollHeight;
      }
      
      if(!leadId) {
        setTimeout(() => addMsg('Olá! Sou a IA da KM Zero Seguros. Como posso ajudar você hoje?', true), 800);
      }
      
      let isWaiting = false;
      
      form.onsubmit = async (e) => {
        e.preventDefault();
        if (isWaiting) return;
        const text = input.value.trim();
        if(!text) return;
        
        addMsg(text, false);
        input.value = '';
        isWaiting = true;
        
        const loadingId = 'loading-' + Date.now();
        const loading = document.createElement('div');
        loading.id = loadingId;
        loading.style.cssText = 'align-self:flex-start;background:#e2e8f0;padding:8px 12px;border-radius:16px 16px 16px 4px;font-size:12px;color:#64748b;margin-top:4px;';
        loading.innerHTML = 'Digitando...';
        msgs.appendChild(loading);
        msgs.scrollTop = msgs.scrollHeight;
        
        try {
          const res = await fetch('${fnUrl}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, lead_id: leadId })
          });
          const data = await res.json();
          document.getElementById(loadingId)?.remove();
          
          if(data.lead_id) {
            leadId = data.lead_id;
            localStorage.setItem('kmz_lead_id', leadId);
          }
          if(data.reply) {
            addMsg(data.reply, true);
          }
        } catch(err) {
          document.getElementById(loadingId)?.remove();
          addMsg('Erro de conexão. Tente novamente mais tarde.', true);
        } finally {
          isWaiting = false;
        }
      };
    })();
  `

  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
    },
  })
})
