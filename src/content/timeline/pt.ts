import { TimelineStep } from './types';

export const timelinePt: TimelineStep[] = [
  {
    number: '1',
    title: 'PRIMEIROS PASSOS',
    description: 'Primeiro contato, teste de cidadania, árvore genealógica, exame de elegibilidade e chamada de elegibilidade',
    duration: 'Semana 1',
    keyAction: 'Configuração Inicial e Pagamento',
    priority: 'Marco Principal',
    detailedInfo: 'Os primeiros passos em sua jornada de cidadania polonesa incluem seu contato inicial conosco, fazer nosso teste abrangente de cidadania, preencher o formulário de árvore genealógica, passar por exame de elegibilidade e ter uma ligação de elegibilidade com nossos especialistas. Esta fase fundamental estabelece seu caso e determina seu caminho de qualificação.',
    keyPoints: ['Faça o primeiro contato por site, email ou WhatsApp', 'Complete o teste de elegibilidade de cidadania polonesa online', 'Preencha árvore genealógica detalhada com informações de ancestrais', 'Receba exame de elegibilidade e consulta telefônica'],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '2',
    title: 'TERMOS E PREÇOS',
    description: 'Avaliação inicial, informações completas do processo com preços, confirmação do cliente e lista de documentos',
    duration: 'Semana 1-2',
    keyAction: 'Configuração Inicial e Pagamento',
    priority: 'Construção de Base',
    detailedInfo: 'Fornecemos uma avaliação inicial do seu caso, enviamos informações completas do processo com preços transparentes, recebemos sua confirmação para prosseguir e enviamos por email a lista completa de todos os documentos necessários. Esta etapa garante que você entenda os custos, cronograma e requisitos antes de avançar.',
    keyPoints: ['Receba avaliação inicial do seu caso de cidadania', 'Obtenha informações completas do processo com detalhamento de preços', 'Confirme sua decisão de prosseguir com a aplicação', 'Receba lista abrangente de documentos necessários'],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '3',
    title: 'ADIANTAMENTO E CONTA',
    description: 'Processamento de pagamento adiantado e abertura de conta no portal do cliente',
    duration: 'Semana 2',
    keyAction: 'Configuração Inicial e Pagamento',
    priority: 'Marco Principal',
    detailedInfo: 'Você faz o pagamento de entrada para iniciar seu caso oficialmente. Abrimos sua conta dedicada no portal onde você pode acompanhar o progresso, enviar documentos e comunicar-se com nossa equipe de forma segura durante todo o processo.',
    keyPoints: ['Processe o pagamento de entrada para iniciação do caso', 'Crie conta segura no portal do cliente', 'Acesse painel do caso e sistema de upload de documentos', 'Estabeleça canal de comunicação seguro com equipe jurídica'],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '4',
    title: 'DETALHES E PROCURAÇÕES',
    description: 'Cliente fornece detalhes básicos, preparação de procuração e documentos assinados via FedEx',
    duration: 'Semana 2-3',
    keyAction: 'Detalhes e Aplicação',
    priority: 'Construção de Base',
    detailedInfo: 'Você fornece detalhes básicos incluindo cópia do passaporte, endereço, cópia da certidão de nascimento, número de telefone e histórico familiar essencial. Preparamos as Procurações (POAs), enviamos por email, e você as devolve assinadas para nosso escritório em Varsóvia por FedEx. Essas POAs nos autorizam legalmente a representá-lo na Polônia.',
    keyPoints: ['Fornecer informações básicas do cliente e cópias de documentos', 'Receber Procurações preparadas por email', 'Assinar POAs e enviá-las por FedEx para o escritório de Varsóvia', 'Confirmar que a equipe jurídica está oficialmente autorizada'],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '5',
    title: 'DADOS E APLICAÇÃO',
    description: 'Preenchimento do formulário mestre, geração de documentação por IA e submissão oficial da aplicação de cidadania',
    duration: 'Semana 3-4',
    keyAction: 'Detalhes e Aplicação',
    priority: 'Marco Principal',
    detailedInfo: 'Você preenche o FORMULÁRIO MESTRE em sua conta que inclui todos os dados necessários para processar o caso completamente. Nosso Agente de IA gera toda a documentação necessária, cria o rascunho da solicitação de cidadania e a submete. Então aguardamos a resposta inicial que tipicamente leva 10-18 meses. Enviamos por email uma cópia da submissão oficial da solicitação e a adicionamos à sua conta.',
    keyPoints: ['Preencher formulário mestre abrangente no portal do cliente', 'Agente de IA gera documentação e rascunho da solicitação', 'Submeter solicitação oficial de cidadania polonesa', 'Receber confirmação de submissão e iniciar período de espera de 10-18 meses'],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '6',
    title: 'DOCUMENTOS LOCAIS',
    description: 'Esclarecimento de documentos, coleta de documentos locais e colaboração com parceiros para coleta',
    duration: 'Semana 4-8',
    keyAction: 'Documentação e Tradução',
    priority: 'Construção de Base',
    detailedInfo: 'Esclarecemos a lista de documentos locais que você precisa coletar, ajudamos você a reunir certidões de nascimento, casamento, atos de naturalização e registros militares. Conectamos você com nossos parceiros locais quando necessário para ajudar a coletar documentos. Recebemos os documentos, examinamos e selecionamos quais traduzir e arquivar em seu caso de cidadania em andamento.',
    keyPoints: ['Receba lista de documentos locais necessários para seu caso específico', 'Coleta de certidões, atos de naturalização e registros militares', 'Conectamos você com parceiros locais para assistência quando necessário', 'Exame e seleção de documentos para tradução e arquivamento'],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '7',
    title: 'DOCUMENTOS POLONESES',
    description: 'Pesquisa em arquivos poloneses, pesquisa internacional e processamento por parceiros para documentos de arquivo',
    duration: 'Semana 4-12',
    keyAction: 'Documentação e Tradução',
    priority: 'Construção de Base',
    detailedInfo: 'Realizamos pesquisas minuciosas nos arquivos poloneses por documentos históricos de seus ancestrais. Isso inclui pesquisas em arquivos internacionais em vários países onde registros poloneses possam existir. Também ajudamos a pesquisar pertences familiares por documentos poloneses antigos. Nossos parceiros confiáveis processam cada solicitação de busca.',
    keyPoints: ['Pesquisa abrangente nos arquivos poloneses por documentos de ancestrais', 'Pesquisas em arquivos internacionais em países relevantes', 'Pesquisa em pertences familiares por documentos poloneses antigos', 'Recuperação assistida por parceiros e seleção especializada para arquivamento'],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '8',
    title: 'TRADUÇÕES',
    description: 'Serviço de tradução por IA, certificação de tradutor juramentado e supervisão do agente de tradução',
    duration: 'Semana 8-16',
    keyAction: 'Documentação e Tradução',
    priority: 'Construção de Base',
    detailedInfo: 'Todos os documentos em língua estrangeira passam por nosso serviço de tradução por IA para tradução inicial. Essas traduções por IA são então revisadas e certificadas por Tradutores Juramentados Poloneses que adicionam seus carimbos e assinaturas oficiais. Nosso Agente de Traduções dedicado supervisiona todo o processo.',
    keyPoints: [
      'Tradução inicial alimentada por IA de todos os documentos estrangeiros',
      'Certificação por Tradutores Juramentados Poloneses com carimbos oficiais',
      'Agente de Traduções dedicado supervisiona todo o fluxo de trabalho',
      'Verificação dupla independente de erros antes do arquivamento com autoridades'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '9',
    title: 'ARQUIVAMENTO DE DOCUMENTOS',
    description: 'Envio de documentos locais e poloneses antes da resposta inicial quando possível',
    duration: 'Semana 12-20',
    keyAction: 'Documentação e Tradução',
    priority: 'Construção de Base',
    detailedInfo: 'Submetemos todos os documentos locais coletados (certidões de nascimento, casamento, atos de naturalização, registros militares) e documentos de arquivo poloneses às autoridades de cidadania. Também submetemos documentação detalhada de informações familiares. O objetivo é concluir este arquivamento de documentos antes de receber a resposta inicial em sua aplicação de cidadania sempre que possível.',
    keyPoints: [
      'Submeter documentos de nascimento, casamento, naturalização e militares',
      'Arquivar documentos de arquivo poloneses recuperados de pesquisas históricas',
      'Fornecer documentação abrangente de árvore genealógica',
      'Completar antes da resposta inicial para cronograma mais rápido quando possível'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '10',
    title: 'ATOS CIVIS',
    description: 'Aplicações de certidões de nascimento/casamento polonesas, submissões e supervisão de agente dedicado',
    duration: 'Semana 16-24',
    keyAction: 'Processamento Governamental',
    priority: 'Marco Principal',
    detailedInfo: 'Nosso Agente de Atos Civis dedicado prepara aplicações para certidões de nascimento e casamento polonesas para você e seus ancestrais. Isso envolve processamento de pagamento para os escritórios de Registro Civil Polonês. Submetemos essas aplicações ao escritório de Registro Civil Polonês relevante (determinado pelo local de nascimento/casamento do ancestral).',
    keyPoints: [
      'Preparação de aplicações de atos civis poloneses com agente dedicado',
      'Processamento de pagamento para taxas do escritório de Registro Civil Polonês',
      'Submissão ao escritório de Registro Civil apropriado baseado na localização',
      'Receber certidões oficiais de nascimento/casamento polonesas para caso de cidadania'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '11',
    title: 'RESPOSTA INICIAL',
    description: 'Recebimento de carta do governo, avaliação de demandas, extensão de prazo e aguardo de evidências adicionais',
    duration: 'Mês 10-18',
    keyAction: 'Processamento Governamental',
    priority: 'Marco Principal',
    detailedInfo: 'Você recebe a carta de RESPOSTA INICIAL do escritório do Voivoda da Mazóvia em seu caso de cidadania polonesa. Avaliamos as demandas e solicitações feitas pelo governo. Enviamos uma cópia da carta com explicações detalhadas do que significa. Se necessário, estendemos o prazo do procedimento de cidadania.',
    keyPoints: [
      'Receber Resposta Inicial do escritório do Voivoda da Mazóvia',
      'Avaliação detalhada de demandas e solicitações do governo',
      'Estender prazo do procedimento de cidadania se tempo adicional for necessário',
      'Reunir e submeter evidências adicionais conforme solicitado pelas autoridades'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '12',
    title: 'ESQUEMAS DE IMPULSO',
    description: 'Explicação de esquemas PUSH, NUDGE, SIT-DOWN, pagamentos e implementação',
    duration: 'Mês 12-24',
    keyAction: 'Processamento Governamental',
    priority: 'Construção de Base',
    detailedInfo: 'Oferecemos nossos esquemas especializados de impulso para acelerar seu caso: PUSH (submissões escritas), NUDGE (ligações telefônicas para autoridades) e SIT-DOWN (reuniões presenciais em Varsóvia). Explicamos cada esquema em detalhes incluindo custos e impacto esperado. Após seu pagamento pelos esquemas escolhidos, os introduzimos na prática com as autoridades.',
    keyPoints: [
      'Três opções de aceleração: PUSH, NUDGE, SIT-DOWN explicadas em detalhes',
      'Preços transparentes e impacto esperado para cada esquema',
      'Processamento de pagamento e implementação com autoridades',
      'Múltiplas rodadas possíveis para manter o impulso do caso'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '13',
    title: 'DECISÃO DE CIDADANIA',
    description: 'Decisão de confirmação de cidadania polonesa recebida, enviada por e-mail ao cliente e adicionada ao portal',
    duration: 'Mês 18-36',
    keyAction: 'Etapas Finais',
    priority: 'Marco Principal',
    detailedInfo: 'O governo polonês emite sua DECISÃO DE CONFIRMAÇÃO DE CIDADANIA final. Se positiva, enviamos uma cópia da decisão oficial por e-mail e a adicionamos à sua conta do portal. Se a decisão for negativa, imediatamente preparamos e arquivamos um recurso ao Ministério do Interior (dentro do prazo de 2 semanas exigido).',
    keyPoints: [
      'Decisão final de cidadania recebida do governo polonês',
      'Positiva: Confirmação oficial enviada por e-mail e adicionada ao portal',
      'Negativa: Recurso preparado e arquivado dentro do prazo de 2 semanas',
      'Processo de recurso: 6-12 meses adicionais com boa taxa de sucesso'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '14',
    title: 'PASSAPORTE POLONÊS',
    description: 'Preparação de documentos, pagamento final, envio FedEx, agendamento de consulado',
    duration: 'Mês 20-40',
    keyAction: 'Etapas Finais',
    priority: 'Marco Principal',
    detailedInfo: 'Preparamos todos os documentos necessários para você solicitar seu passaporte polonês no Consulado Polonês mais próximo. Após processar o PAGAMENTO FINAL por nossos serviços, enviamos todos os documentos preparados para você via FedEx. Também ajudamos você a agendar sua visita ao Consulado Polonês.',
    keyPoints: [
      'Pacote completo de documentos preparado para aplicação de passaporte',
      'Pagamento final processado e documentos enviados via FedEx',
      'Visita ao consulado agendada no local mais próximo de você',
      'Submeter aplicação e receber passaporte polonês dentro de 4-8 semanas'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  },
  {
    number: '15',
    title: 'SERVIÇOS ESTENDIDOS',
    description: 'Serviços jurídicos para família estendida disponíveis após confirmação bem-sucedida de cidadania',
    duration: 'Contínuo',
    keyAction: 'Etapas Finais',
    priority: 'Construção de Base',
    detailedInfo: 'Oferecemos serviços jurídicos familiares estendidos para ajudar outros membros de sua família a obter cidadania polonesa. Com sua cidadania estabelecida, agora podemos ajudar seu cônjuge, filhos e outros familiares elegíveis a obter cidadania polonesa também, aproveitando seu caso bem-sucedido.',
    keyPoints: [
      'Avaliação de elegibilidade de membros da família',
      'Processo simplificado baseado em sua cidadania estabelecida',
      'Assistência para cônjuge e filhos',
      'Suporte estendido para familiares adicionais elegíveis'
    ],
    clickToSeeDetails: 'Clique para ver detalhes',
    openAccountLabel: 'Abrir Conta'
  }
];