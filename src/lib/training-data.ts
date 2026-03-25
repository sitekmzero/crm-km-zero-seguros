export const trainingModules = [
  {
    id: 'iniciante-passos',
    title: 'Iniciante: Primeiros Passos',
    level: 'Iniciante',
    duration: '15 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Bem-vindo ao CRM Km Zero!</h3>
      <p>Neste módulo, você aprenderá o básico para acessar e navegar no sistema de forma segura.</p>
      <h4>Passo a Passo: Login</h4>
      <ol>
        <li>Acesse o endereço oficial do CRM no seu navegador.</li>
        <li>Insira seu e-mail corporativo.</li>
        <li>Digite sua senha (definida através do convite que você recebeu por e-mail).</li>
        <li>Clique no botão "Entrar".</li>
      </ol>
      <h4>Dicas de Segurança</h4>
      <ul>
        <li>Nunca compartilhe sua senha com colegas.</li>
        <li>Sempre faça logout (sair) ao utilizar computadores compartilhados.</li>
      </ul>
    `,
    questions: [
      {
        question:
          'Qual é a forma recomendada de acessar o CRM pela primeira vez?',
        options: [
          'Pedindo a senha do colega',
          'Através do link de convite recebido no e-mail',
          'Criando uma conta com e-mail pessoal',
          'Acessando o site público da Km Zero',
        ],
        correctAnswer: 1,
      },
      {
        question: 'O que você deve fazer ao usar um computador compartilhado?',
        options: [
          'Salvar a senha no navegador',
          'Deixar a aba aberta',
          'Fazer logout (Sair) ao terminar',
          'Desligar o monitor',
        ],
        correctAnswer: 2,
      },
      {
        question:
          'Quem possui acesso à tela de configurações globais e auditoria?',
        options: [
          'Apenas Administradores',
          'Apenas Vendedores',
          'Qualquer usuário',
          'Clientes',
        ],
        correctAnswer: 0,
      },
      {
        question: 'Como a senha inicial é definida?',
        options: [
          'O RH envia por WhatsApp',
          'O sistema gera uma senha aleatória',
          'Através do fluxo de redefinição/convite no seu e-mail',
          'A senha padrão é 123456',
        ],
        correctAnswer: 2,
      },
      {
        question:
          'Qual navegador é o mais recomendado para usar o CRM Km Zero?',
        options: ['Internet Explorer', 'Google Chrome', 'Opera', 'Safari'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'iniciante-contatos',
    title: 'Iniciante: Gestão de Contatos',
    level: 'Iniciante',
    duration: '20 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Criando e Gerenciando Contatos</h3>
      <p>Aprenda a adicionar novos leads manualmente e editar suas informações.</p>
      <h4>Como Criar:</h4>
      <ol>
        <li>No menu principal (Dashboard ou Contatos), clique em "Adicionar Contato".</li>
        <li>Preencha os campos obrigatórios (Nome, E-mail ou Telefone).</li>
        <li>Recomendamos sempre preencher o CPF para validações futuras de apólices.</li>
        <li>Clique em "Salvar".</li>
      </ol>
      <p>Você pode buscar contatos pela barra superior usando nome, e-mail ou CPF.</p>
    `,
    questions: [
      {
        question:
          'Quais são os campos mínimos recomendados ao criar um contato?',
        options: [
          'Apenas o Nome',
          'Nome e pelo menos E-mail ou Telefone',
          'Apenas o CPF',
          'Endereço completo',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Por que o preenchimento do CPF é importante?',
        options: [
          'Para emitir nota fiscal de comissão',
          'Para validações futuras e emissão de apólices reais',
          'Apenas para controle interno',
          'Não é importante',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Como você pode encontrar um contato rapidamente?',
        options: [
          'Rolando a tela até achar',
          'Pedindo para o administrador',
          'Usando a barra de busca no topo da tela',
          'Exportando para Excel',
        ],
        correctAnswer: 2,
      },
      {
        question: 'Se um cliente mudar de telefone, o que você deve fazer?',
        options: [
          'Criar um novo contato',
          'Editar o contato existente',
          'Excluir e criar de novo',
          'Anotar no caderno',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Onde fica o botão de "Adicionar Contato"?',
        options: [
          'Dentro das Configurações',
          'No canto inferior esquerdo',
          'No topo da tela de Contatos/Kanban',
          'No relatório em PDF',
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'intermediario-kanban',
    title: 'Intermediário: Pipeline e Kanban',
    level: 'Intermediário',
    duration: '25 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>O Coração das Vendas</h3>
      <p>O Kanban visualiza a jornada do seu cliente em 6 etapas cruciais:</p>
      <ul>
        <li><strong>Assinante:</strong> Baixou material, sem intenção de compra.</li>
        <li><strong>Lead:</strong> Pediu contato.</li>
        <li><strong>MQL / SQL:</strong> Qualificado, estamos cotando.</li>
        <li><strong>Oportunidade:</strong> Proposta enviada, negociando.</li>
        <li><strong>Cliente:</strong> Venda fechada!</li>
      </ul>
      <p>Arraste e solte os cards para avançar. Isso dispara automações (como e-mails) nos bastidores.</p>
    `,
    questions: [
      {
        question:
          'O que acontece quando você arrasta um card de estágio no Kanban?',
        options: [
          'O card muda de cor apenas',
          'Automações (como envio de e-mails) podem ser disparadas',
          'O cliente é deletado',
          'Uma cotação é gerada automaticamente',
        ],
        correctAnswer: 1,
      },
      {
        question:
          'Qual estágio indica que o cliente já recebeu a proposta e está negociando?',
        options: ['Lead', 'Assinante', 'Oportunidade', 'SQL'],
        correctAnswer: 2,
      },
      {
        question: 'O que o Lead Score verde (80+) indica?',
        options: [
          'Que o cliente desistiu',
          'Que é um lead frio e sem prioridade',
          'Que é uma prioridade diária com alta chance de fechamento',
          'Que a apólice venceu',
        ],
        correctAnswer: 2,
      },
      {
        question: 'Como registrar que você ligou para o cliente?',
        options: [
          'Anotar no papel',
          'Abrir o card do cliente e adicionar uma Nota Interna na aba Interações',
          'Mandar um email para o chefe',
          'Mudar o nome do cliente',
        ],
        correctAnswer: 1,
      },
      {
        question: 'O que significa a sigla MQL?',
        options: [
          'Marketing Qualified Lead',
          'Many Questions Left',
          'Minimum Quota Level',
          'Master Qualification List',
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: 'intermediario-cotacoes',
    title: 'Intermediário: Cotações',
    level: 'Intermediário',
    duration: '30 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Emitindo Cotações e Fechando Negócios</h3>
      <p>Utilize a tela de Cotações para registrar formalmente propostas.</p>
      <ul>
        <li>Acesse o menu "Cotações" na lateral.</li>
        <li>Selecione o Cliente e o Produto (Ex: Seguro Auto).</li>
        <li>Preencha a placa ou marca/modelo do veículo.</li>
        <li>Quando o cliente aceitar, atualize o status para "Aceita" — ele se tornará um "Cliente" no Kanban.</li>
      </ul>
    `,
    questions: [
      {
        question:
          'Onde você acessa o sistema para criar uma nova Cotação no CRM?',
        options: [
          'Menu lateral esquerdo em "Cotações"',
          'Menu "Configurações"',
          'Apenas via WhatsApp',
          'Na página inicial de Assinantes',
        ],
        correctAnswer: 0,
      },
      {
        question:
          'O que acontece automaticamente quando o status da Cotação é marcado como "Aceita"?',
        options: [
          'O CRM envia um boleto',
          'O contato correspondente avança para as etapas finais do Kanban',
          'O cadastro é excluído',
          'A cotação é cancelada',
        ],
        correctAnswer: 1,
      },
      {
        question:
          'Quais dados são essenciais para cotar um Seguro Auto (padrão)?',
        options: [
          'Apenas a cor do carro',
          'Marca, Modelo ou Placa do veículo',
          'Tamanho do porta-malas',
          'O nome da mãe do cliente',
        ],
        correctAnswer: 1,
      },
      {
        question:
          'Para gerar inteligência no Dashboard "Por Produto", o que você deve fazer?',
        options: [
          'Não preencher o tipo de produto',
          'Anotar em uma planilha à parte',
          'Selecionar corretamente o "Tipo de Produto" na Cotação',
          'Pedir pro cliente mandar um e-mail',
        ],
        correctAnswer: 2,
      },
      {
        question:
          'Você pode ter múltiplas cotações ativas para um mesmo cliente?',
        options: ['Sim', 'Não', 'Apenas para Consórcios', 'O sistema bloqueia'],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: 'avancado-dashboard',
    title: 'Avançado: Dashboards e Análise',
    level: 'Avançado',
    duration: '20 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Interpretando Seus Números</h3>
      <p>A tela Dashboard Estratégico permite que você acompanhe o quão perto está de bater suas metas.</p>
      <p>Observe a "Taxa de Conversão" para entender quantos leads são necessários para fechar uma venda. Utilize os filtros de período (7, 30 ou 90 dias) para análises sazonais.</p>
    `,
    questions: [
      {
        question: 'O que a métrica "Taxa de Conversão" representa?',
        options: [
          'O percentual de leads que viraram clientes finais',
          'O tempo que o cliente demora pra responder',
          'O valor total das vendas',
          'O número de e-mails enviados',
        ],
        correctAnswer: 0,
      },
      {
        question: 'Como exportar os gráficos para uma reunião?',
        options: [
          'Tirando foto com celular',
          'Clicando em "Exportar PDF" no topo do dashboard',
          'Não é possível exportar',
          'Apenas o administrador pode ver os gráficos',
        ],
        correctAnswer: 1,
      },
      {
        question:
          'O painel de Alertas de Renovação exibe apólices vencendo em até:',
        options: ['7 dias', '15 dias', '30 dias', '6 meses'],
        correctAnswer: 2,
      },
      {
        question: 'Se você é Vendedor, o Dashboard exibe dados de quem?',
        options: [
          'De todos os vendedores',
          'Apenas os seus dados e resultados',
          'Dados fictícios',
          'Apenas dados de marketing',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Para que serve o gráfico "Funil de Vendas"?',
        options: [
          'Para ver onde os leads estão travados no processo',
          'Para calcular comissões',
          'Para emitir boletos',
          'Apenas estética',
        ],
        correctAnswer: 0,
      },
    ],
  },
  {
    id: 'avancado-automações',
    title: 'Avançado: Automações (Admin)',
    level: 'Avançado',
    duration: '30 min',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    content: `
      <h3>Fazendo o CRM Trabalhar Por Você</h3>
      <p>O CRM possui gatilhos automáticos. Administradores podem configurar:</p>
      <ul>
        <li><strong>Templates de E-mail:</strong> Configurados em /settings. Disparam ao mover colunas no Kanban.</li>
        <li><strong>Distribuição Round Robin:</strong> Distribui leads novos equitativamente entre os vendedores online.</li>
        <li><strong>Webhooks (N8N):</strong> Integra com outros sistemas (RD Station, ERPs).</li>
      </ul>
    `,
    questions: [
      {
        question: 'O que faz a distribuição "Round Robin"?',
        options: [
          'Exclui leads antigos',
          'Distribui leads de forma equitativa entre a equipe de vendas',
          'Gera relatórios em PDF',
          'Envia mensagens no Instagram',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Onde o Administrador edita o texto dos e-mails automáticos?',
        options: [
          'Na tela de Cotações',
          'No Kanban',
          'Na aba Templates dentro de Configurações',
          'Pedindo suporte ao TI',
        ],
        correctAnswer: 2,
      },
      {
        question:
          'O que aciona o envio de um e-mail com template "Oportunidade"?',
        options: [
          'Quando o vendedor loga no sistema',
          'Quando o contato é movido para a coluna Oportunidade no Kanban',
          'A cada 24 horas',
          'Quando o cliente faz aniversário',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Para que serve o campo N8N Webhook nas configurações?',
        options: [
          'Para mudar a cor do sistema',
          'Para integração avançada com outros softwares e envios de dados',
          'Para bloquear acessos',
          'Para calcular juros',
        ],
        correctAnswer: 1,
      },
      {
        question:
          'Como o sistema avisa o vendedor sobre uma nova atribuição de lead?',
        options: [
          'Envia uma carta via Correios',
          'O vendedor tem que adivinhar',
          'Através das notificações em tempo real (sininho no topo)',
          'Toca um alarme alto no computador',
        ],
        correctAnswer: 2,
      },
    ],
  },
]
