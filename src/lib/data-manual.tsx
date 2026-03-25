import {
  BookOpen,
  Map,
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  Settings,
  LifeBuoy,
} from 'lucide-react'

export const manualSectionsData = [
  {
    id: 'inicio',
    title: 'Primeiros Passos',
    icon: BookOpen,
    content: (
      <div>
        <p className="text-lg text-gray-600 mb-4">
          Bem-vindo ao Manual Consultivo da KM Zero Seguros. Este guia foi
          desenvolvido para orientar sua jornada em nosso CRM.
        </p>
        <p className="text-gray-600">
          Navegue pelo menu lateral para explorar cada módulo em profundidade,
          desde a estruturação do cadastro de clientes até a emissão da apólice.
          Nosso sistema foi desenhado pensando na usabilidade e eficiência do
          consultor, então cada botão e campo tem um propósito focado em
          acelerar o fechamento das suas vendas.
        </p>
      </div>
    ),
  },
  {
    id: 'jornada',
    title: 'Jornada do Lead',
    icon: Map,
    content: (
      <div>
        <h3 className="text-xl font-bold text-[#0B1F3B] mb-3">
          O Caminho até a Emissão
        </h3>
        <p className="mb-4">
          A Jornada do Lead define as etapas pelas quais um cliente passa, desde
          o primeiro contato até o fechamento. Você movimenta o cliente por
          essas etapas através do Kanban.
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Assinante:</strong> Consumiu conteúdo gratuito, mas ainda
            não pediu cotação.
          </li>
          <li>
            <strong>Lead:</strong> Solicitou contato comercial ativamente no
            site ou via telefone.
          </li>
          <li>
            <strong>MQL (Qualificado pelo Marketing):</strong> Lead validado com
            informações mínimas preenchidas.
          </li>
          <li>
            <strong>SQL (Qualificado por Vendas):</strong> Lead abordado, onde
            foi confirmada a intenção real de compra.
          </li>
          <li>
            <strong>Oportunidade:</strong> Cotação apresentada e em fase de
            negociação de valores.
          </li>
          <li>
            <strong>Cliente:</strong> Apólice emitida, venda fechada com
            sucesso.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Dashboard Estratégico',
    icon: LayoutDashboard,
    content: (
      <div>
        <p className="mb-4">
          O Dashboard consolida seus principais KPIs de forma visual e em tempo
          real. Ele existe em duas versões:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Visão do Vendedor:</strong> Foca nos leads recebidos hoje,
            nas tarefas diárias, e nas apólices dos seus clientes que estão
            prestes a vencer.
          </li>
          <li>
            <strong>Visão do Administrador:</strong> Agrupa as métricas de todo
            o time, mostra o ranking de conversão entre os consultores e a
            receita global estimada no período.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'contatos',
    title: 'Gestão de Contatos',
    icon: Users,
    content: (
      <div>
        <h3 className="text-xl font-bold text-[#0B1F3B] mb-3">
          O Coração do CRM
        </h3>
        <p className="mb-4">
          Utilize a visão Kanban (Quadro) ou Tabela para gerenciar seus
          contatos. Dicas importantes:
        </p>
        <ul className="space-y-2 list-decimal pl-5">
          <li>
            <strong>Sempre exija o CPF:</strong> O sistema utiliza o e-mail ou o
            CPF para prevenir cadastros duplicados. Sem essa chave, você pode
            ter conflitos.
          </li>
          <li>
            <strong>Interações Rápidas:</strong> Clique no botão verde do
            WhatsApp direto no card para abrir a conversa já com uma saudação. O
            sistema registra a ação automaticamente.
          </li>
          <li>
            <strong>Score e Temperatura:</strong> O ícone de fogo e o número (0
            a 100) indicam a probabilidade de fechamento. Foque primeiro nos
            leads com score &gt; 80.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'cotacoes',
    title: 'Gestão de Cotações',
    icon: FileText,
    content: (
      <div>
        <p className="mb-4">
          A ferramenta de Cotação permite orçar os seguros e atrelá-los ao
          perfil do cliente para registro histórico.
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Cotação Vapt-Vupt:</strong> Usada para passar uma estimativa
            rápida via WhatsApp. Você insere o veículo e o valor aproximado.
          </li>
          <li>
            <strong>Cotação Real:</strong> Envolve o preenchimento dos dados
            completos, vinculação com a Seguradora parceira e definição do
            status (Pendente, Aceita, Recusada). As cotações Aceitas alimentam
            os gráficos financeiros do Dashboard.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'relatorios',
    title: 'Relatórios de Performance',
    icon: BarChart,
    content: (
      <div>
        <p className="mb-4">
          Exporte relatórios detalhados de funil de vendas e ranking de
          consultores em formato PDF para apresentações de resultados ou
          fechamento de mês.
        </p>
        <p>
          Os gráficos exibem onde há maior retenção de leads (Gargalos) e qual o
          tempo médio de conversão, auxiliando nas decisões gerenciais para
          otimizar o fluxo de atendimento.
        </p>
      </div>
    ),
  },
  {
    id: 'administracao',
    title: 'Administração de Sistema',
    icon: Settings,
    content: (
      <div>
        <h3 className="text-xl font-bold text-[#0B1F3B] mb-3">
          Privilégios Administrativos
        </h3>
        <p className="mb-4">
          Acesso exclusivo para gestores e diretores. A guia de Configurações
          possui recursos avançados:
        </p>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong>Round Robin:</strong> Ao ativar, novos leads que chegam pelo
            site são distribuídos matematicamente de forma igualitária para os
            vendedores com status "Ativo".
          </li>
          <li>
            <strong>Integrações:</strong> Permite injetar webhooks (como o do
            N8N ou Slack) e configurar a chave API do Pipedrive caso utilize em
            paralelo.
          </li>
          <li>
            <strong>Convites de Usuários:</strong> Emita Links Mágicos para
            novos colaboradores definirem sua senha, com total controle sobre o
            cargo (Vendedor vs Admin).
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'suporte',
    title: 'Suporte Técnico e Escalada',
    icon: LifeBuoy,
    content: (
      <div>
        <p className="mb-4">
          Em caso de instabilidade, tela em branco, ou e-mails não chegando,
          siga o protocolo de atendimento:
        </p>
        <ol className="space-y-2 list-decimal pl-5">
          <li>
            Acesse a aba <strong>Auditoria (Logs)</strong> para verificar se a
            falha consta no registro sistêmico.
          </li>
          <li>
            Se o erro for de compilação ou de banco de dados (Unauthorized),
            acione a equipe de TI no canal interno do Slack designado.
          </li>
          <li>
            Sugerimos usar Google Chrome atualizado para melhor performance
            visual.
          </li>
        </ol>
      </div>
    ),
  },
]

const terms = [
  [
    'MQL',
    'Marketing Qualified Lead. Contato com interesse inicial gerado pelas redes sociais.',
    'Fase de transição para o setor de vendas.',
    'Lead que baixou o Guia de Seguro Auto.',
  ],
  [
    'SQL',
    'Sales Qualified Lead. Contato validado pronto para receber abordagem focada.',
    'Sinal verde para gerar cotação.',
    'Cliente que pediu orçamento de frota empresarial.',
  ],
  [
    'Lead Scoring',
    'Mecanismo de pontuação que classifica o engajamento numérico do contato.',
    'Ordenação de prioridades na lista.',
    'Lead Score 90 = ligar nos próximos 10 minutos.',
  ],
  [
    'Round Robin',
    'Algoritmo de distribuição igualitária e sequencial de leads entre a equipe.',
    'Atribuição automática e justa.',
    'Sistema entrega 1 lead novo para cada consultor online.',
  ],
  [
    'Edge Function',
    'Função serverless de back-end executada perto da localidade do usuário.',
    'Arquitetura técnica que poupa servidor.',
    'Script automático de envio do email de boas-vindas.',
  ],
  [
    'Webhook',
    'Comunicação passiva entre sistemas onde um envia dados quando ocorre um evento.',
    'Integrações N8N.',
    'Receber dados direto do RD Station quando o lead preenche a LP.',
  ],
  [
    'RLS',
    'Row Level Security. Camada de segurança do Supabase que bloqueia visibilidade de dados não autorizados.',
    'Segurança e Isolamento.',
    'Um vendedor não consegue ver a lista de clientes de outro vendedor.',
  ],
  [
    'Lead',
    'Registro de um potencial cliente com dados mínimos de contato.',
    'Topo do funil comercial.',
    'Visitante que preencheu o formulário do site Fale Conosco.',
  ],
  [
    'Prospect',
    'Lead qualificado que atende estritamente ao Perfil de Cliente Ideal (ICP).',
    'Meio do funil de conversão.',
    'Empresa logística com 50+ frotas precisando de renovação.',
  ],
  [
    'CRM',
    'Customer Relationship Management. Sistema de gestão do relacionamento.',
    'A plataforma que operamos.',
    'Onde gerenciamos os clientes da Km Zero Seguros.',
  ],
  [
    'Pipeline',
    'Representação visual das etapas ordenadas do processo de vendas corporativo.',
    'Quadro Kanban principal.',
    'A jornada da coluna Lead até a coluna Cliente.',
  ],
  [
    'Kanban',
    'Método visual originado pela Toyota focado na gestão ágil do fluxo de trabalho.',
    'Interface principal do sistema.',
    'Ação de arrastar cards (post-its) entre colunas de status.',
  ],
  [
    'Dashboard',
    'Painel de controle com a consolidação visual dos indicadores e gráficos macro.',
    'Tela inicial analítica.',
    'Onde se visualiza a taxa de conversão diária atualizada.',
  ],
  [
    'KPI',
    'Key Performance Indicator. Métrica tangível que valida se um objetivo foi atingido.',
    'Gestão de metas.',
    'Atingir taxa de conversão acima de 15% neste trimestre.',
  ],
  [
    'Churn Rate',
    'Índice que mede a taxa de evasão/cancelamento da base de clientes ativos.',
    'Renovações e Suporte.',
    'A cada 100 clientes, 5 não renovaram a apólice (Churn de 5%).',
  ],
  [
    'LTV',
    'Lifetime Value. A estimativa da receita financeira total gerada por um cliente ao longo da sua permanência.',
    'Projeção de lucros.',
    'Cliente de seguro residencial renovando por 10 anos seguidos.',
  ],
  [
    'CAC',
    'Custo de Aquisição de Clientes. O total investido para fechar um contrato novo.',
    'Marketing e ADS.',
    'A corretora gastou R$150 em anúncios para gerar uma venda fechada.',
  ],
  [
    'Ticket Médio',
    'O valor financeiro médio de todas as apólices divididas pelo número de vendas.',
    'Análise da receita por consultor.',
    'A corretora fecha, em média, R$ 2.500 por seguro de frota.',
  ],
  [
    'Conversão',
    'Ato absoluto de transformar uma cotação em venda finalizada e paga.',
    'Fechamento na ponta.',
    "Lead mudado para o status 'Cliente' e apólice gerada.",
  ],
  [
    'Follow-up',
    'Contato contínuo e acompanhamento disciplinado até fechar ou recusar a venda.',
    'Rotina obrigatória do consultor.',
    'Mensagem enviada via WhatsApp 48 horas após emissão da proposta.',
  ],
  [
    'Onboarding',
    'Integração do cliente recém chegado instruindo sobre canais de sinistro e benefícios.',
    'Boas-vindas corporativas.',
    'Envio automático do manual do segurado via PDF no e-mail.',
  ],
  [
    'SLA',
    'Service Level Agreement. Acordo de nível de serviço que define tempo limite de ação.',
    'Regras de resposta e qualidade.',
    'Política interna de responder a um novo lead do site em até 30 minutos.',
  ],
  [
    'Gatilho',
    'Condição lógica sistêmica que dispara uma automação secundária em cascata.',
    'Eventos técnicos do banco.',
    "A mudança manual do lead para 'Oportunidade' é o gatilho que envia email.",
  ],
  [
    'Automação',
    'Processo rotineiro que ocorre de forma autônoma sem a dependência da ação humana.',
    'Escalabilidade e ganho de tempo.',
    'Envio do aviso de expiração de apólice exatamente 30 dias antes.',
  ],
  [
    'Supabase',
    'Plataforma de Back-end as a Service (BaaS) que gerencia nosso banco PostgreSQL.',
    'Infraestrutura na nuvem.',
    'Onde todas as informações, cotações e acessos ficam protegidos.',
  ],
  [
    'Resend',
    'Serviço terceirizado de API de e-mail transacional otimizado para evitar spam.',
    'Motor de disparo de e-mails.',
    'A integração usada para o e-mail de recuperação de senha dos corretores.',
  ],
  [
    'N8N',
    'Plataforma avançada de automação de fluxos baseada em nós para interligar sistemas diferentes.',
    'Conexão de dados da web.',
    'Usado para receber leads do Facebook Ads e injetar na base do Supabase.',
  ],
  [
    'Pipedrive',
    'CRM de vendas espelhado. Sistema alternativo que pode ser sincronizado por Webhooks.',
    'Integração legado opcional.',
    'Sincronizar a mudança de fases dos cards de forma bidirecional com o CRM Km Zero.',
  ],
  [
    'API',
    'Application Programming Interface. Protocolo técnico para sistemas se comunicarem por código.',
    'Backend.',
    'API usada para buscar automaticamente os modelos dos veículos pelo site da FIPE.',
  ],
  [
    'JSON',
    'Notação leve de troca de dados, formato textual padronizado usado entre o frontend e backend.',
    'Estrutura do banco de dados.',
    'Como os dados da Cotação Complexa (Marca, Ano, Valor) ficam armazenados.',
  ],
  [
    'Endpoint',
    'A URL web de extremidade onde uma API aguarda o contato externo para executar uma ação.',
    'Conexão de Integração.',
    'A rota HTTPS do nosso webhook que escuta as novas chamadas recebidas.',
  ],
  [
    'JWT',
    'JSON Web Token. Criptografia usada para garantir que a sessão logada do navegador é segura.',
    'Criptografia e Login.',
    'Mecanismo que mantém o consultor ativo no sistema durante as horas de trabalho.',
  ],
  [
    'UUID',
    'Universally Unique Identifier. Código único randômico para evitar conflito de chaves primárias.',
    'Banco de Dados.',
    'ID invisível, ex: 123e4567-e89b-12d3... vinculado a cada novo contato.',
  ],
  [
    'Cotação Vapt-Vupt',
    'Registro de cotação simplificado, focado puramente no valor comercial rápido sem amarras formais.',
    'Agilidade de negociação livre.',
    'Salvar no sistema o preço informal passado ao cliente no WhatsApp.',
  ],
  [
    'Apólice',
    'O contrato documentado que comprova legalmente a cobertura do bem perante a Seguradora.',
    'Emissão de comprovante oficial.',
    'O arquivo PDF baixado e indexado na central de documentos do cliente.',
  ],
  [
    'Sinistro',
    'A ocorrência fática de um risco coberto materializado que gerará custo à seguradora e corretora.',
    'Atendimento de emergência.',
    'A colisão ou furto veicular reportado pelo segurado num final de semana.',
  ],
  [
    'Endosso',
    'Documento de alteração de dados técnicos da apólice vigente que pode alterar ou não o valor do prêmio.',
    'Manutenção administrativa constante.',
    'Quando o cliente informa a troca da placa do carro segurado ou muda o CEP.',
  ],
  [
    'Franquia',
    'A parte do prejuízo com valor previamente combinado que é de responsabilidade financeira do segurado.',
    'Custos complementares do sinistro.',
    'A franquia reduzida de R$2.000,00 que o cliente pagou ao consertar o carro.',
  ],
  [
    'Prêmio',
    'A importância financeira principal que o cliente paga para a seguradora para obter a transferência de risco.',
    'Cobrança financeira da Venda.',
    'O montante fechado em R$1.200 pagos no PIX correspondente ao seguro auto anual.',
  ],
  [
    'Proposta',
    'Documento preparatório preenchido com dados finos e encaminhado à seguradora aguardando o aceite formal.',
    'Venda e pré-venda ativa.',
    'O envio da proposta inicial estruturada via sistema da Porto Seguro.',
  ],
  [
    'Renovação',
    'O ato de prolongar e renegociar a vigência das coberturas da apólice após o ciclo anual estar finalizando.',
    'Retenção agressiva de lucro.',
    'Consultor entrar em contato ativamente um mês antes do seguro do HB20 expirar.',
  ],
  [
    'Cross-selling',
    'A estratégia ativa de realizar a oferta de um seguro suplementar ao que o cliente já possui na corretora.',
    'Expansão da receita interna.',
    'Ofertá-lo um seguro de Vida após a venda bem sucedida do seguro do carro dele.',
  ],
  [
    'Up-selling',
    'Incentivar um incremento de categorias, coberturas ou qualidade do produto da venda atual ou antiga.',
    'Melhoria financeira de base.',
    'Convencer a contratação do acréscimo da cobertura contra danos estéticos morais ampliados.',
  ],
  [
    'Funil de Vendas',
    'Conceito estrutural da jornada de maturação do mercado com foco em funilamento matemático numérico.',
    'Visão analítica macro do Diretor.',
    'Notar que o gargalo real de saída do funil fica sempre na fase de orçamentos altos.',
  ],
  [
    'Inbound Marketing',
    'A metodologia de captar e qualificar potenciais clientes passivamente por atração e autoridade.',
    'Estratégia comercial do Site e Redes.',
    'Os leads chegando espontaneamente pelo Blog do Guia do Consórcio Automotivo Km Zero.',
  ],
  [
    'Outbound Marketing',
    'A tática contundente de prospecção ativa via telefonia direta e e-mail marketing intrusivo.',
    'Caça comercial pesada.',
    'A listagem fria importada via CSV que sofre ligações frias constantes de vendedores no dia a dia.',
  ],
  [
    'Landing Page',
    'Página com elemento limpo focado puramente em gerar o Opt-In de conversão sem dispersão externa.',
    'Ambiente de Captação e Ads.',
    'A URL restrita com formulário e botão de cadastro exclusivo do Seguro de RC Profissional Médicos.',
  ],
  [
    'CTA',
    'Call to Action. A instrução central desenhada visualmente para o usuário clicar obrigatoriamente.',
    'Engajamento e UI/UX Web.',
    "A barra clicável laranja escrita 'Receber Minha Cotação Automotiva Agora Mesmo!' na LP.",
  ],
  [
    'Opt-in',
    'O registro documentado de autorização para o tratamento e envio de comunicações comerciais explícitas.',
    'Termos de Privacidade.',
    'A caixa de checkbox assinada confirmando que leu e concordou com o armazenamento LGPD.',
  ],
  [
    'Opt-out',
    'O mecanismo oposto de exclusão limpa do armazenamento de dados perante envio de automações intrusivas.',
    'Direito sistêmico LGPD.',
    "O link obrigatório no fundo do footer da Resend para 'descadastrar-se dessa lista promocional' em um clique.",
  ],
  [
    'LGPD',
    'Lei Geral de Proteção de Dados (13.709/2018). Obriga controle granular dos dados guardados das pessoas.',
    'Compliance legislativo nacional obrigatório.',
    'O expurgo dos dados médicos se um seguro prestamista for negado e contestado perante o Procon.',
  ],
  [
    'GDPR',
    'O arcabouço rigoroso de regulamentação europeia global de proteção de integridade da informação limpa.',
    'Compliance de sistemas globais integrados.',
    'O cumprimento nativo que o banco de dados Supabase na nuvem já provê contra falhas graves.',
  ],
]

export const glossaryData = terms.map((t) => ({
  term: t[0],
  definition: t[1],
  context: t[2],
  example: t[3],
}))

const faqs = [
  [
    'Como redefinir minha senha se eu esquecer o acesso?',
    "Clique em 'Esqueci a senha' na tela de Login. Se você já tem a sessão ativa e só quer mudar, use a página de configurações de perfil. O sistema emite um email de recuperação via API segura Resend para validar a redefinição.",
    '/update-password',
    'Acessar Configurações',
  ],
  [
    'Como adicionar e qualificar um novo lead manually?',
    "Para inserir novos leads fora da captação do site, vá na página inicial Kanban, encontre o botão dourado 'Adicionar Contato', abra o formulário Dialog e preencha todos os dados. Obrigatório focar no telefone para a integração posterior com o ícone do WhatsApp.",
    '/',
    'Abrir Quadro Inicial',
  ],
  [
    'O que fazer de emergência se um evento de Webhook ou API começar a falhar constantemente?',
    "Se integrações começarem a travar (ex. leads do N8N não entrando), o procedimento padrão é primeiro acessar a aba 'Auditoria' na visão Admin, conferir os logs HTTP no painel da Supabase Functions, ou reportar nos canais Slack oficiais da Km Zero e da equipe GoSkip.",
    '/audit',
    'Acessar Auditoria Geral',
  ],
  [
    'Como a lógica do atalho Round Robin opera nos bastidores da plataforma?',
    'O modelo do Round Robin ativado (na aba Empresa pelo Admin) faz varredura na tabela. Ele verifica o número de leads em aberto de cada consultor no grupo de atendimento e lança novos tickets sistematicamente para balancear o peso de vendas igual.',
    '/settings',
    'Visualizar Aba Empresa',
  ],
  [
    'Onde acesso a totalidade das minhas cotações históricas efetuadas ou reprovadas?',
    "As cotações possuem aba exclusiva no menu vertical da esquerda chamada 'Cotações', mas também ficam intimamente listadas e fixas no painel lateral deslizante individualizado do contato no Kanban quando a venda final se resolve.",
    '/quotations',
    'Explorar Painel de Cotações',
  ],
  [
    'Qual o jeito correto de alterar definitivamente as fases de funil do lead?',
    "O fluxo mestre pede o método de arraste suave interativo nos cards do Quadro de Visão Kanban. Alternativamente, abrir detalhes completos e editar o combo 'Status' realiza o mesmo disparo da trigger do banco, validando os horários da migração.",
    '/',
    'Acesse o Kanban Atual',
  ],
  [
    'Como um gestor consegue construir ou editar do zero um template fixo de E-mail HTML transacional?',
    "Administradores autorizados contam com a sub-aba 'Templates' contida nas configurações mestre da corporação. Cada texto aceita wildcards, que são substituições fixas usando colchetes dinâmicos (como '{{nome}}').",
    '/settings',
    'Painel Gestor Configs',
  ],
  [
    'Por que sou impedido de analisar ou pesquisar os leads e orçamentos do meu parceiro comercial?',
    'Pelo rigor sistêmico do RLS (Row Level Security) programado no banco PostgreSQL Supabase. É um cofre que oculta totalmente as tabelas de leads para quem não os criou, ou se não for um Admin super usuário com isenção total.',
    '/treinamento/modulo/avancado',
    'Veja Treinamento Nível 3',
  ],
  [
    'Como materializo e baixo para meu superior os relatórios sintéticos de volume de vendas em PDF?',
    "Nas sessões de Relatórios ou no próprio Dashboard tático, pressione a opção de botão Outline 'Exportar PDF' no cabeçalho master. Ele emula interface otimizada sem menus laterais na impressão limpa usando o renderizador PDF do browser da vez.",
    '/reports',
    'Exportar Funil Hoje',
  ],
  [
    "O que de fato diferencia no conceito mercadológico um lead genérico comum de um rotulado 'MQL' na KmZero?",
    "O selo de Marketing Qualified Lead traduz que há engajamento medido: um comportamento passivo rastreado, seja através do download gratuito do 'Ebook Guia Seguros Auto' ou interações frequentes rastreadas pelo CRM ao invés de um 'frio' importado de banco de dados alheio.",
    '/manual/glossario',
    'Leia Todo Glossário',
  ],
  [
    "Qual a fórmula pesada dos cálculos algorítmicos que geram o 'Lead Scoring' termométrico e como se altera o valor?",
    "Ele baseia-se num sistema cronometrado cumulativo inteligente por peso. Recebe até +20 pontos por ser recente, +40 se migrar rapidamente até 'Oportunidade', e recebe soma extra limitada por interações repetidas atestadas pelo histórico interno do painel.",
    '/treinamento/modulo/intermediario',
    'Entenda Intermediário',
  ],
  [
    'É possível fazer injeções maciças de bases CSV ou Excel sem derrubar o banco de contatos no painel normal?',
    "Totalmente. Para isso encontre o botão 'Upload' ou 'Importar CSV'. O software dispõe de um parsing nativo integrado que varre e cadastra cada linha em colunas alinhadas no modelo interno. Sugere-se limpar falhas ou células corrompidas de texto antecipadamente.",
    '/',
    'Botão Central Home',
  ],
  [
    'O fluxo ativo nativo entre CRM KmZero e aplicativo corporativo WhatsApp dispensa plugins complexos ou não?',
    'Sim, as aberturas fluídas evitam dependências, com links dinâmicos nativos formatados gerando hiperlinks protocolados da URL api.whatsapp nativo do navegador, injetando saudações parametrizadas prontas com o telefone do cliente previamente sanitizado em cache seguro.',
    '/',
    'Verificar nos Cards',
  ],
  [
    'Ocorreu de a automação principal do evento de e-mail pular uma trigger ou falhar perante o cliente. Quais os motivos de base?',
    "Possíveis checagens para erro de rotina em Edge Function: o e-mail cadastrado estava ausente de preenchimento, digitado errado (exemplo: .combr), ou falhou autenticação Resend da variável de ambiente VITE oculta. Analise os 'Logs de Audit'.",
    '/settings',
    'Rever Config de E-mail',
  ],
  [
    'Tenho permissões plenas de remoção no sistema se eu for o dono absoluto primário do contato no kanban dele?',
    "Sim, possuindo autorização, clique ativamente no menu reticências 'Três pontos' sobre o Lead, e opte pela função drástica 'Excluir'. Importante apontar que isso apagará subjacentes e cascateará a exclusão das notas integradas nas tabelas relacionais em banco Supabase.",
    '/',
    'Dashboard',
  ],
  [
    'Como devo prosseguir a nível corretor para atestar que enviei ao repositório a apólice digital do seguro corporativo atrelado?',
    "Utilize a página mestre 'Documentos'. Ou simplesmente engatilhe no Perfil Individual do Contato a subjanela Arquivos. Escolha do HD o comprovante PDF ou imagens. Isso sincronizará com a hospedagem em Storage da Supabase em subpastas vinculadas individualmente.",
    '/documents',
    'Ir para Pasta Root Documentos',
  ],
  [
    'Para fins de Retenção Ativa do segurado anual, a que localizo com velocidade clientes na iminência drástica do prazo?',
    "Utilizando a tela Dashboard como base gerencial, a métrica painel listada 'Renovações Próximas' captura instantaneamente apólices num raio cravado e iminente de alerta para até 30 ou menos dias corridos em vermelho de tensão, requerendo follow-ups cruciais.",
    '/dashboard',
    'Métricas Executivas',
  ],
  [
    'Sobre extrações massivas, PDF é possível, porém o sistema suporta relatórios visuais isolados por período específico da equipe?',
    "Totalmente abrangente para Administradores. Há o Dropdown 'Período' no Dashboard com seletores dinâmicos de 7, 30 ou mais abrangente de 90 dias que refaz contas de SQL e cruza contra os perfis em barra nativa da biblioteca robusta do banco Recharts do React UI.",
    '/dashboard',
    'Revisar Meu Painel Analítico',
  ],
  [
    'As movimentações obscuras ou destrutivas causam histórico visualizável blindado para gerência consultar com precisão temporal na nuvem?',
    "Logicamente. A aba log de Auditoria é alimentada silenciosamente no evento 'Insert' ou exclusão gravando IP nativo, fuso horário, descrição de string em base inalterável e assinada via Trigger de SQL para reprimir violações indesejadas de segurança de acessos.",
    '/audit',
    'Consultar Aba Fechada de Log',
  ],
  [
    "Recebo no banner de erro o código rígido 'Unauthorized'. Em quais instâncias esse bug técnico bloqueia minha permissão de entrada no CRM?",
    'Uma requisição API foi feita após token JWT expirar duramente pelo tempo no LocalStorage da máquina, ou houve tentativa explícita na URL forçando navegação manual atrevidamente nas abas de configuração ocultas dedicadas estritamente a diretores setados com admin mestre.',
    '/login',
    'Retornar Log in',
  ],
  [
    'O Layout Front-End e o Kanban resistem fielmente a uma utilização no celular mobile por consultores em visitas externas corporativas diárias?',
    'A UI reage dinamicamente com quebra de grid (Tailwind responsive blocks) ativando do navegador um Sheet Drawer lateral com Menu Hambúrguer. A experiência do Drag-and-Drop converte as abas Kanban flexíveis permitindo toque tátil da tela nas divisões.',
    '/',
    'Ir em Mobile View',
  ],
  [
    "O Fluxo prático de expandir a equipe de forma limpa pelo painel requer cadastro prévio e envios fixos, como faço para o 'Magic Link' da auth atuar?",
    "Para segurança da Supabase Auth de origem orgânica, vá em 'Configurações' aba de 'Usuários', digite e-mail com privilégio determinado. A Edge Function emitirá gatilho oculto sem expor senhas fracas. O funcionário assume controle na tela 'Update Password'.",
    '/settings',
    'Sub-Aba Novo Usuário',
  ],
  [
    'A suspensão emergencial para demissão sem excluir histórico do atendente pode atuar imediatamente travando sua visão aos quadros de leads fechados?',
    "O procedimento correto consiste em edição de cargo (Status: Inativo) no Painel Mestre 'Usuários' da aba de engrenagem. Ao submeter update, a chamada trava em RLS o UUID permanentemente, forçando banimento '876000h' pela Auth API Admin no ato temporal.",
    '/settings',
    'Gerir Usuários de Time',
  ],
  [
    "Qual momento da Jornada de Seguro Auto de fato exige o 'Vapt-Vupt' ou Cotação densa baseada em dados finos via modelo do site?",
    'Para simulação relâmpago pedida via WhatsApp onde valores preliminares cativam sem cansar (Aba Cotações Mestre > Botão Inserir Rápido). Se fechar verbalmente a emissão ou usar robôs para análise sistêmica bancária de franquias exatas opte pela versão detalhada do schema JSON.',
    '/quotations',
    'Criar Nova Simulação Base',
  ],
  [
    'Como extrair insights competitivos transparentes com listagem visível focada entre colegas na mesma corporação de vendas usando o dashboard geral?',
    'No menu restrito aos líderes que possuem booleano de is_admin ativado na coluna, o Dashboard processa e ordena o Map Reativo baseando conversão total gerando posições visuais Ouro/Prata/Bronze das estátisticas de vitórias totais ranqueadas sobre leads trabalhados mensalmente.',
    '/dashboard',
    'Classificação Visual Vendas',
  ],
  [
    'Após conclusão maçante das etapas vídeo no módulo online de reciclagem EAD, onde o PDF certificado validado é impresso pela infra da KMS?',
    "Na trilha macro 'Academia' com preenchimento da progress bar inteira focada a 100%. A emissão oculta 'Hidden Print Block' desbloqueia visual no footer, acionando o Window.Print renderizado contendo logo, nome criptografado em session Auth e assinatura limpa atestada visualmente.",
    '/treinamento',
    'Gerar Diploma Hoje',
  ],
  [
    'Onde recorro por instabilidade no serviço se o provedor do serviço SaaS estiver off-line impedindo trabalho de emissão constante em dias tensos?',
    "Navegue para a parte tática 'Suporte' listada na lateral do Manual Consultivo. Orientações exigem verificar a rede local. Persistindo erro técnico na base Vercel/Vite/Supabase contate através dos endpoints expostos do gestor comercial via email ou canais de API Slack corporativo.",
    '/manual/suporte',
    'Ler Base Suporte Helpdesk',
  ],
  [
    'Se minha hierarquia quiser sobrepor e quebrar a rigidez do layout original mesclando cores na aba mestre corporativa de edição Admin UI, isso é viável hoje?',
    'As constantes variáveis no CSS puro root de Primary e Background de toda arquitetura Tailwind possuem referências em `corretora_config` na tabela SQL remota para uso em relatórios emitidos. Embora não sobreponha forçado a Home base bege e dourada principal para garantir a UX.',
    '/settings',
    'Painel Cores Empresa',
  ],
  [
    'Com qual frequência e método o cronômetro do sistema atesta um alerta vermelho de ciclo expirado ou perto de 30 dias limites à renegociar base auto ou residencial?',
    "Dinamica temporal do TypeScript aciona nas rotas front comparando new Date diário filtrado por limite inferior via select Supabase com a coluna estática 'expiration_date' cravada na entidade apólice anexada nos documentos PDF daquele CPF exato referenciado relacional na primary.",
    '/dashboard',
    'Reagir às Renovações',
  ],
  [
    'O mecanismo legal e funcional de inativação e destruição global ou rescisão total de uma conta restrita perante o GDPR e leis na web tem base forte restritiva?',
    'Destruir a auth nativa do UUID inteiro atinge base atômica e é um veto intransponível no painel a não ser por delegação estrita de dono master autenticado pela Super Role Key Admin em supabase local, restrita para uso cirúrgico por requisições backend ocultadas.',
    '/settings',
    'Restrições Globais Contas',
  ],
]

export const faqData = faqs.map((f) => ({
  question: f[0],
  answer: f[1],
  links: [{ url: f[2], label: f[3] }],
}))
