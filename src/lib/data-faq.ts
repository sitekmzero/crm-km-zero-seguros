export const faqData = [
  {
    cat: 'Acesso e Segurança',
    q: 'Como resetar minha senha?',
    a: 'Se você é vendedor, peça ao Administrador para enviar um link de redefinição na aba Configurações > Usuários. O link chegará no seu e-mail.',
  },
  {
    cat: 'Acesso e Segurança',
    q: 'O que o Vendedor não consegue ver?',
    a: 'A política de RLS (Segurança) impede que vendedores vejam leads de outros colegas. Apenas o Admin vê tudo.',
  },
  {
    cat: 'Acesso e Segurança',
    q: 'Onde vejo os logs de auditoria?',
    a: 'Admins podem acessar o Menu Lateral > Auditoria para ver IP, data e hora de ações críticas.',
  },
  {
    cat: 'Acesso e Segurança',
    q: 'Como desativar um usuário que saiu da empresa?',
    a: 'Vá em Configurações > Usuários, clique em Editar no usuário e mude o status para Inativo. O acesso será revogado imediatamente.',
  },
  {
    cat: 'Acesso e Segurança',
    q: 'O sistema desloga sozinho?',
    a: 'Por segurança, tokens JWT expiram e renovam automaticamente. Se houver inatividade prolongada, pode ser necessário logar novamente.',
  },

  {
    cat: 'Gestão de Contatos',
    q: 'O CPF é obrigatório ao criar um contato?',
    a: 'Não é obrigatório, mas é altamente recomendado preencher para facilitar a emissão da apólice no futuro e evitar duplicatas.',
  },
  {
    cat: 'Gestão de Contatos',
    q: 'Como busco um cliente antigo?',
    a: 'Use a barra de busca no topo do Dashboard ou Kanban. Você pode buscar por Nome, E-mail ou CPF.',
  },
  {
    cat: 'Gestão de Contatos',
    q: 'Posso deletar um contato?',
    a: 'Sim, dentro do perfil do contato há o botão de exclusão, mas use com cuidado pois exclui o histórico também.',
  },
  {
    cat: 'Gestão de Contatos',
    q: 'Como registrar uma ligação que fiz?',
    a: 'Abra o card do cliente, vá na aba Interações e crie uma "Nota Interna" detalhando a ligação.',
  },
  {
    cat: 'Gestão de Contatos',
    q: 'O que é o filtro de Lead Score?',
    a: 'Permite mostrar apenas leads Quentes (Score > 80), ajudando a priorizar quem está mais propenso a comprar hoje.',
  },

  {
    cat: 'Pipeline e Kanban',
    q: 'O que significa a cor Vermelha em um Card?',
    a: 'Normalmente indica que o lead está inativo há muito tempo ou possui pendências críticas urgentes.',
  },
  {
    cat: 'Pipeline e Kanban',
    q: 'Posso pular etapas no funil?',
    a: 'O sistema permite, mas é boa prática passar por todas as etapas para manter as métricas de conversão precisas.',
  },
  {
    cat: 'Pipeline e Kanban',
    q: 'O que acontece quando arrasto para "Oportunidade"?',
    a: 'Se configurado, o sistema dispara um e-mail automático com o template vinculado a este estágio.',
  },
  {
    cat: 'Pipeline e Kanban',
    q: 'Como vejo leads em forma de tabela?',
    a: 'No topo da tela de Contatos, clique no botão "Tabela" (ao lado do botão de busca) para alterar a visualização.',
  },
  {
    cat: 'Pipeline e Kanban',
    q: 'O que é MQL?',
    a: 'Marketing Qualified Lead. É o lead que já tem perfil para compra e estamos montando a cotação.',
  },

  {
    cat: 'Cotações e Propostas',
    q: 'O que é uma Cotação Vapt-Vupt?',
    a: 'É um modelo rápido que exige apenas marca/modelo para dar uma estimativa de valor rápido pelo WhatsApp.',
  },
  {
    cat: 'Cotações e Propostas',
    q: 'Como vinculo uma cotação a um cliente?',
    a: 'Vá em Cotações > Nova Cotação e selecione o cliente no menu suspenso. Ele deve estar cadastrado antes.',
  },
  {
    cat: 'Cotações e Propostas',
    q: 'Cotação aceita muda o status do cliente?',
    a: 'Sim, quando marcada como "Aceita", o sistema sugere/move o cliente para as fases finais do funil.',
  },
  {
    cat: 'Cotações e Propostas',
    q: 'Posso anexar a apólice na cotação?',
    a: 'As apólices reais devem ser anexadas na aba "Docs" dentro do perfil do cliente, e não apenas na cotação.',
  },
  {
    cat: 'Cotações e Propostas',
    q: 'Onde vejo os produtos mais cotados?',
    a: 'No Dashboard, o gráfico de "Por Produto" consolida as informações de todas as cotações registradas.',
  },

  {
    cat: 'Automações',
    q: 'Como ativo a atribuição Round Robin?',
    a: 'Admins podem ir em Configurações > Dados da Empresa e ativar o switch "Distribuição Automática".',
  },
  {
    cat: 'Automações',
    q: 'O WhatsApp é disparado sozinho?',
    a: 'Não, o envio de WhatsApp exige que você clique no botão para abrir o app web/mobile com a mensagem pré-preenchida, por questões de política do WhatsApp.',
  },
  {
    cat: 'Automações',
    q: 'Como os e-mails automáticos funcionam?',
    a: 'Admins criam Templates em /settings vinculados a um Estágio (ex: Lead). Quando o vendedor move o card para lá, o e-mail vai ocultamente via Resend.',
  },
  {
    cat: 'Automações',
    q: 'Como o Lead Score sobe?',
    a: 'Ganha pontos ao ser recém-criado, ao avançar de etapa no funil, ao receber interações (notas) e por produtos de alto valor.',
  },
  {
    cat: 'Automações',
    q: 'Para que serve a URL do N8N?',
    a: 'Para conectar o CRM a outros softwares (ex: RD Station). Cada mudança no CRM envia um "webhook" para o N8N processar.',
  },

  {
    cat: 'Relatórios e Dashboards',
    q: 'Como calculam a Taxa de Conversão?',
    a: 'Total de clientes fechados (Status Customer) dividido pelo total de leads recebidos no período selecionado.',
  },
  {
    cat: 'Relatórios e Dashboards',
    q: 'Como exporto o dashboard para reunião?',
    a: 'Clique no botão "Exportar PDF" no canto superior direito da tela do Dashboard. O layout foi otimizado para impressão.',
  },
  {
    cat: 'Relatórios e Dashboards',
    q: 'Por que o Ranking não aparece para mim?',
    a: 'O Ranking e a visão consolidada da equipe são restritos aos Administradores. Vendedores veem apenas suas próprias metas.',
  },
  {
    cat: 'Relatórios e Dashboards',
    q: 'De onde vêm os Alertas de Renovação?',
    a: 'O sistema rastreia as apólices cadastradas na aba de Políticas do cliente. Apólices vencendo em 30 dias geram o alerta.',
  },
  {
    cat: 'Relatórios e Dashboards',
    q: 'O gráfico do funil mostra todos os leads?',
    a: 'Mostra os leads ativos no período selecionado (ex: últimos 30 dias), distribuídos por onde estão atualmente.',
  },
]
