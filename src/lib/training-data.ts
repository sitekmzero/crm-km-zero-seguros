export const trainingModules = [
  {
    id: 'iniciante',
    title: 'Iniciante: Dominando o Básico',
    level: 'Iniciante',
    duration: '45 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Bem-vindo ao CRM!</h3>
      <p>Nesta trilha inicial, você garantirá autonomia total sobre o cadastro e gestão dos seus clientes. Dominar o básico é o primeiro passo para o sucesso em vendas na Km Zero.</p>
      
      <h4>1. Estrutura do Sistema</h4>
      <p>O CRM é dividido em módulos principais: Contatos, Cotações, Dashboard e Documentos. A navegação ocorre pelo menu lateral escuro, que pode ser expandido ou retraído.</p>
      
      <h4>2. Gestão de Contatos</h4>
      <p>Aprenda a cadastrar clientes corretamente. Use o botão <strong>Novo Contato</strong>. Preencha Nome, Telefone e E-mail. <strong>Dica de Ouro:</strong> Sempre preencha o CPF para evitar duplicatas futuras.</p>
      
      <h4>3. O Pipeline Kanban</h4>
      <p>Entenda as 6 fases: Assinante &gt; Lead &gt; MQL &gt; SQL &gt; Oportunidade &gt; Cliente. Arraste os cards para avançar a negociação. Cores indicam a temperatura do lead.</p>
      
      <h4>4. Suas Primeiras Cotações</h4>
      <p>Crie orçamentos formais vinculados aos clientes. Use o formato Vapt-Vupt para velocidade, ou Cotação Real para detalhamento financeiro que reflete no seu Dashboard.</p>

      <h4>5. Interações Básicas</h4>
      <p>Registre todas as suas chamadas, emails e reuniões na aba "Interações" dentro do perfil do cliente. Histórico é dinheiro.</p>
    `,
    questions: [
      {
        question: 'Qual campo é crucial para evitar contatos duplicados?',
        options: ['Nome', 'Telefone', 'CPF', 'Profissão'],
        correctAnswer: 2,
      },
      {
        question: 'O que o Kanban representa no CRM?',
        options: [
          'A folha de pagamento',
          'O funil visual de vendas e negociação',
          'A agenda de feriados',
          'A central de emails',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Qual estágio vem logo após "SQL" no funil padrão?',
        options: ['Cliente', 'Lead', 'Oportunidade', 'Assinante'],
        correctAnswer: 2,
      },
      {
        question:
          'Qual modelo de cotação usar para enviar um orçamento rápido pelo WhatsApp?',
        options: [
          'Real Completa',
          'Vapt-Vupt',
          'Gamified',
          'Nenhuma das opções',
        ],
        correctAnswer: 1,
      },
      {
        question:
          'Como registrar que você enviou uma mensagem importante ao lead?',
        options: [
          'Anotar em um post-it',
          'Criar uma Nota Interna na aba Interações',
          'Mudar o nome do lead',
          'Excluir o contato',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'intermediario',
    title: 'Intermediário: Automação e Velocidade',
    level: 'Intermediário',
    duration: '60 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Trabalhe Mais Inteligente</h3>
      <p>Agora que você domina o cadastro, vamos usar o sistema para economizar tempo automatizando tarefas repetitivas.</p>
      
      <h4>1. Campanhas de E-mail Automáticas</h4>
      <p>Ao mover um lead para a coluna "Oportunidade", o sistema pode enviar um e-mail pré-formatado automaticamente. Você não precisa redigir do zero.</p>
      
      <h4>2. Integração com WhatsApp</h4>
      <p>Clique no botão verde do WhatsApp no perfil do cliente. O sistema abre a janela de chat já com uma mensagem de saudação pronta, registrando a ação no histórico.</p>
      
      <h4>3. Central de Documentos</h4>
      <p>Guarde CNH, apólices antigas e contratos na aba Docs. Arquivos são indexados pela busca global.</p>

      <h4>4. Lead Scoring e Priorização</h4>
      <p>O CRM calcula a temperatura do lead de 0 a 100. Foque nos que estão "pegando fogo" (acima de 80) e deixe a automação esquentar os leads frios.</p>
    `,
    questions: [
      {
        question:
          'O que desencadeia um e-mail automático configurado pelo Admin?',
        options: [
          'O aniversário do cliente',
          'Mover o lead para uma coluna específica no Kanban',
          'Entrar no sistema',
          'Imprimir um PDF',
        ],
        correctAnswer: 1,
      },
      {
        question:
          'A integração de WhatsApp requer que você digite a saudação manual sempre?',
        options: [
          'Sim',
          'Não, o sistema preenche um template automático',
          'Apenas no mobile',
          'Apenas se o Admin aprovar',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Onde você deve armazenar a CNH do cliente?',
        options: [
          'Na aba Docs do perfil do contato',
          'Nos anexos da cotação',
          'Enviar para o seu próprio email',
          'No campo de Observações',
        ],
        correctAnswer: 0,
      },
      {
        question: 'O que faz o Lead Score subir rapidamente?',
        options: [
          'Deixar o lead parado',
          'Interagir com o lead e avançar no funil',
          'Deletar o lead',
          'Excluir documentos',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Como o sistema avisa que uma apólice vai vencer?',
        options: [
          'Sino de notificação e quadro vermelho nas Renovações Próximas',
          'Manda um SMS para o chefe',
          'Trava o acesso do usuário',
          'Muda a cor do sistema',
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: 'avancado',
    title: 'Avançado: Análise e Gestão',
    level: 'Avançado',
    duration: '50 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Decisões Baseadas em Dados</h3>
      <p>Explore as funções avançadas para se tornar um consultor analítico ou gestor completo.</p>
      
      <h4>1. Interpretando Gráficos no Dashboard</h4>
      <p>A Taxa de Conversão define sua eficiência. O Ticket Médio ajuda a prever receita. Entenda onde está o gargalo do seu funil.</p>
      
      <h4>2. Configurações de Administração e RLS</h4>
      <p>Admins usam a aba Settings para convidar usuários, ativar Atribuição Round Robin e gerenciar a segurança. O RLS garante que você só veja seus dados.</p>
      
      <h4>3. Troubleshooting e Logs</h4>
      <p>Aprenda a ler logs de auditoria para investigar alterações de status não autorizadas e validar envios de webhook via N8N.</p>
    `,
    questions: [
      {
        question: 'Como é calculada a Taxa de Conversão?',
        options: [
          'Soma das vendas',
          '(Clientes Fechados / Total de Leads) x 100',
          'Número de cotações geradas',
          'Tempo de resposta médio',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Qual a finalidade da atribuição Round Robin?',
        options: [
          'Excluir contatos inativos',
          'Dividir novos leads de forma igualitária entre os vendedores',
          'Exportar dados para Excel',
          'Hackear o sistema',
        ],
        correctAnswer: 1,
      },
      {
        question: 'O que o RLS (Row Level Security) garante?',
        options: [
          'Que o sistema seja rápido',
          'Que vendedores não vejam leads uns dos outros',
          'Que a senha seja forte',
          'Que o email chegue na caixa de entrada',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Onde um Admin configura novos templates de e-mail?',
        options: [
          'Na tela de Login',
          'No Dashboard',
          'Na aba Templates dentro de Configurações (/settings)',
          'No Kanban',
        ],
        correctAnswer: 2,
      },
      {
        question: 'Como preparar o Dashboard para uma apresentação física?',
        options: [
          'Tirar foto da tela',
          'Usar o botão "Exportar PDF" no topo da página',
          'Copiar para o Word',
          'Escrever os números a mão',
        ],
        correctAnswer: 1,
      },
    ],
  },
]

export const bestPractices = [
  {
    id: 'bp1',
    title: 'Gestão Inteligente de Tempo',
    desc: 'Use o Score Verde (80+) para priorizar ligações diárias. Filtre o Kanban por leads quentes ao chegar no escritório.',
    fullContent:
      'A regra de ouro de vendas na Km Zero é focar primeiro em quem quer comprar agora. Chegando no escritório, acesse o Kanban, filtre por Lead Score Maior que 80. Realize suas ligações entre 09:00 e 11:00. Deixe as tarefas administrativas e organização de documentos para o fim da tarde.',
  },
  {
    id: 'bp2',
    title: 'Qualidade de Leads',
    desc: 'Sempre exija CPF na entrada de dados manuais. Um CRM limpo evita trabalho duplo na emissão.',
    fullContent:
      'Um banco de dados sujo custa vendas. Se o cliente não informar o CPF, use a tática de confirmar os dados mínimos para a primeira Cotação Vapt-Vupt, mas recuse prosseguir para Proposta Formal sem a documentação completa. A aba Docs deve ter no mínimo CNH e Comprovante de Residência.',
  },
  {
    id: 'bp3',
    title: 'Aumento de Conversão',
    desc: 'Não deixe leads na mesma coluna por mais de 5 dias. Use o follow-up rápido via WhatsApp para forçar avanço ou arquivamento.',
    fullContent:
      'A velocidade de resposta dita a conversão. Leads que ficam estacionados como "MQL" esfriam. Se o contato não responde após 3 tentativas em canais diferentes (Email, WhatsApp, Ligação), mova-o para uma lista de reengajamento (automação) ou feche como "Perdido".',
  },
  {
    id: 'bp4',
    title: 'Otimização de Automações',
    desc: 'Deixe as saudações pesadas para o E-mail automático de transição de fase. Foque seu tempo no relacionamento humano.',
    fullContent:
      'Você não é um robô. Confie nas Edge Functions do sistema para disparar o "Obrigado pelo seu contato" e o "Seu seguro vence em 30 dias". Use o seu tempo de WhatsApp apenas para tirar objeções específicas e fechar o preço.',
  },
  {
    id: 'bp5',
    title: 'Análise Diária de Dados',
    desc: 'Compare sua Taxa de Conversão mensal. Se está caindo, reveja seus scripts de abordagem e o tempo médio de envio de propostas.',
    fullContent:
      'No final do dia, gaste 5 minutos no Dashboard. Verifique se o Ticket Médio das suas vendas está cobrindo a sua meta. Utilize o painel de "Renovações Próximas" para garantir dinheiro no bolso antes mesmo de buscar novos leads no mercado.',
  },
]

export const visualWorkflows = [
  {
    id: 'wf1',
    title: 'A Jornada Completa do Lead',
    steps: [
      {
        name: 'Captação (Assinante)',
        detail: 'Visitante baixa um material rico no site.',
      },
      {
        name: 'Conversão (Lead)',
        detail: 'Pede explicitamente uma cotação na Landing Page.',
      },
      {
        name: 'Qualificação (MQL/SQL)',
        detail: 'Triagem de dados e confirmação via WhatsApp.',
      },
      {
        name: 'Negociação (Oportunidade)',
        detail: 'Cotação formal apresentada e em análise.',
      },
      {
        name: 'Fechamento (Cliente)',
        detail: 'Pagamento efetuado e apólice na aba Docs.',
      },
    ],
  },
  {
    id: 'wf2',
    title: 'Automação de E-mail via Resend',
    steps: [
      {
        name: 'Ação do Vendedor',
        detail: 'Arrasta o card de Lead para Oportunidade.',
      },
      {
        name: 'Trigger do Banco',
        detail: 'Supabase detecta o UPDATE na coluna status.',
      },
      {
        name: 'Edge Function',
        detail: 'O script captura o ID do template correspondente.',
      },
      {
        name: 'Processamento',
        detail: 'Substitui {{nome}} e envia para a API da Resend.',
      },
      {
        name: 'Log de Sucesso',
        detail: 'Registro gravado silenciosamente no Histórico.',
      },
    ],
  },
  {
    id: 'wf3',
    title: 'Processo Rigoroso de Emissão',
    steps: [
      {
        name: 'Aprovação Final',
        detail: 'Cliente dá o OK no preço e envia o PIX/Cartão.',
      },
      {
        name: 'Upload Docs',
        detail: 'Vendedor sobe CNH e Doc do Carro no CRM.',
      },
      {
        name: 'Portal Seguradora',
        detail: 'Transmissão da proposta para a Porto/SulAmérica.',
      },
      {
        name: 'Apólice Gerada',
        detail: 'Vendedor faz o download da apólice aprovada.',
      },
      {
        name: 'Anexo no CRM',
        detail: 'Documento é indexado. Vencimento é agendado (365d).',
      },
    ],
  },
  {
    id: 'wf4',
    title: 'Fluxo Analítico de Relatórios',
    steps: [
      {
        name: 'Extração',
        detail: 'Admin abre a página de Relatórios Avançados.',
      },
      {
        name: 'Filtro',
        detail: 'Seleciona os últimos 30 dias de performance.',
      },
      {
        name: 'Análise de Gargalo',
        detail: 'Identifica retenção anormal na coluna "MQL".',
      },
      {
        name: 'Intervenção',
        detail: 'Faz reunião de alinhamento com os corretores.',
      },
      {
        name: 'Exportação',
        detail: 'Gera PDF do Funil para envio à Diretoria.',
      },
    ],
  },
  {
    id: 'wf5',
    title: 'Distribuição Round Robin (Admin)',
    steps: [
      {
        name: 'Lead Inbound',
        detail: 'Lead entra por integração via Webhook/N8N.',
      },
      {
        name: 'Atribuição',
        detail: 'O CRM checa qual vendedor "Ativo" tem menos leads abertos.',
      },
      {
        name: 'Transferência',
        detail: 'Atualiza o proprietario_id no Supabase automaticamente.',
      },
      {
        name: 'Notificação',
        detail: 'Dispara alerta na interface e Slack do Vendedor sorteado.',
      },
      {
        name: 'SLA Start',
        detail: 'Inicia o relógio de resposta rápida (Meta: 15 min).',
      },
    ],
  },
]
