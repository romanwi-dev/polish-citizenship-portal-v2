export interface TimelineStep {
  id: string;
  weekLabel: string;
  title: string;
  subtitle: string;
  detailedInfo: string;
  keyPoints: string[];
  bottomInfo: string;
  ctaLabel: string;
}

type SupportedLanguage = 'en' | 'es' | 'pt' | 'de' | 'fr' | 'he' | 'ru' | 'uk';

export const TIMELINE_TRANSLATIONS: Record<SupportedLanguage, TimelineStep[]> = {
  en: [
    {
      id: '1',
      weekLabel: 'Week 1',
      title: 'FIRST STEPS',
      subtitle: 'First contact, citizenship test, family tree, eligibility examination, and eligibility call',
      detailedInfo: 'The first steps in your Polish citizenship journey include your initial contact with us, taking our comprehensive citizenship test, completing the family tree form, undergoing eligibility examination, and having an eligibility call with our experts. This foundational phase establishes your case and determines your qualification pathway.',
      keyPoints: [
        'Make first contact via website, email, or WhatsApp',
        'Complete online Polish citizenship eligibility test',
        'Fill out detailed family tree with ancestor information',
        'Receive eligibility examination and consultation call'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '2',
      weekLabel: 'Week 1-2',
      title: 'TERMS & PRICING',
      subtitle: 'Initial assessment, full process info with pricing, client confirmation, and document list',
      detailedInfo: 'After completing the eligibility examination, we email you a detailed initial assessment explaining whether you qualify for Polish citizenship. If eligible, we send comprehensive information about the full process including transparent pricing for all stages. Once you confirm your decision to proceed, we provide a complete list of all documents you\'ll need to gather. This stage ensures complete clarity on costs, timeline, and requirements before you commit.',
      keyPoints: [
        'Receive detailed initial assessment via email',
        'Review full process information with complete pricing breakdown',
        'Confirm your decision to proceed with citizenship application',
        'Receive comprehensive list of all required documents'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '3',
      weekLabel: 'Week 2',
      title: 'ADVANCE & ACCOUNT',
      subtitle: 'Advance payment processing and opening client portal account',
      detailedInfo: 'Once you decide to move forward, we process your advance payment to initiate the case officially. Simultaneously, we create your personalized account on our client portal where you\'ll track progress, upload documents, communicate with our team, and access all case materials. This portal becomes your central hub for the entire citizenship journey.',
      keyPoints: [
        'Process advance payment to officially open your case',
        'Create personalized client portal account for case management',
        'Access secure dashboard to track all progress and milestones',
        'Centralized platform for documents, communication, and updates'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '4',
      weekLabel: 'Week 2-3',
      title: 'DETAILS & POAs',
      subtitle: 'Client provides basic details, POA preparation, and signed documents via FedEx',
      detailedInfo: 'You provide essential details including passport copy, current address, birth certificate copy, phone number, and key family history information. Our legal team prepares official Powers of Attorney documents that authorize us to represent you in Poland. You sign these POA documents and send them via FedEx to our Warsaw office. Once received, we can legally act on your behalf throughout the entire citizenship process.',
      keyPoints: [
        'Submit basic details: passport, address, birth certificate, phone, family history',
        'Receive professionally prepared Power of Attorney documents',
        'Sign POA documents and send via FedEx to Warsaw office',
        'Legal authorization established for full representation in Poland'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '5',
      weekLabel: 'Week 3-4',
      title: 'DATA & APPLICATION',
      subtitle: 'Master form completion, AI paperwork generation, and official citizenship application submission',
      detailedInfo: 'You fill out the MASTER FORM on your account portal which contains all data needed to process your case fully. Our AI Agent uses this information to generate all necessary paperwork, create the draft citizenship application (OBY form), and submit it officially to Polish authorities. The application enters the processing queue (typically 10-18 months for initial response). You receive emailed copies of the official submission for your records, and documents are added to your portal.',
      keyPoints: [
        'Complete comprehensive MASTER FORM with all required family/personal data',
        'AI Agent generates all paperwork including citizenship application',
        'Review and approve generated documents before submission',
        'Official application submitted, copy sent to you and added to portal'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '6',
      weekLabel: 'Week 3-8',
      title: 'LOCAL DOCUMENTS',
      subtitle: 'Document list clarification, gathering, advisory services, and receiving/examining documents',
      detailedInfo: 'We clarify exactly which local documents you need based on your specific case. You gather birth certificates, marriage certificates, naturalization records, and military documents from your country. Our local agent partners can assist with difficult-to-obtain documents. Once received, we examine everything carefully to select which items need translation and filing in your citizenship case.',
      keyPoints: [
        'Receive clarified list of documents specific to your case',
        'Gather documents: birth/marriage certificates, naturalization, military records',
        'Partner assistance available for difficult-to-obtain documents',
        'Expert examination and selection of documents for translation/filing'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '7',
      weekLabel: 'Week 4-12',
      title: 'POLISH DOCUMENTS',
      subtitle: 'Archive searches in Poland and internationally, partner coordination, and receiving archival documents',
      detailedInfo: 'Our dedicated Civil Acts Agent conducts comprehensive searches in Polish national archives for your ancestors\' vital records. We coordinate international archive searches when family members emigrated or lived in other countries. We work with partners to search family possessions for old Polish documents. All discovered archival materials are examined and selected for potential use in strengthening your case.',
      keyPoints: [
        'Polish archives search conducted by specialized Civil Acts Agent',
        'International archive searches across relevant countries',
        'Family possession searches for old Polish documents',
        'Partner-assisted document retrieval and expert selection for filing'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '8',
      weekLabel: 'Week 5-10',
      title: 'TRANSLATIONS',
      subtitle: 'AI translation service, certification by Polish translator, independent review, and quality assurance',
      detailedInfo: 'All non-Polish documents are translated using our AI-assisted translation portal for speed and consistency. Translations are then certified by Polish Certified Sworn Translators who provide official stamps and signatures required by law. Our dedicated Translations Agent supervises the entire workflow. Independent agents double-check all translations for accuracy before documents are filed with authorities, ensuring the highest quality and no errors.',
      keyPoints: [
        'AI-assisted translation portal for efficient document processing',
        'Certification by Polish Certified Sworn Translators with official stamps',
        'Dedicated Translations Agent supervises entire workflow',
        'Independent double-check for errors before filing with authorities'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '9',
      weekLabel: 'Week 8-14',
      title: 'FILING DOCUMENTS',
      subtitle: 'Submission of local documents, Polish archival materials, and detailed family information',
      detailedInfo: 'We officially file all collected and translated documents with the citizenship authorities. This includes your local birth/marriage certificates, naturalization acts, military records from your country, Polish archival documents we\'ve retrieved, and comprehensive family tree documentation. Ideally completed before the initial response arrives from authorities (10-18 months), which helps accelerate your case timeline.',
      keyPoints: [
        'Submit all local documents: birth/marriage certificates, naturalization, military',
        'File Polish archival documents retrieved from historical searches',
        'Provide comprehensive family tree and genealogical documentation',
        'Complete before initial response for faster timeline when possible'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '10',
      weekLabel: 'Week 6-16',
      title: 'CIVIL ACTS',
      subtitle: 'Preparation and submission of Polish civil registry applications, payment processing, and receiving certificates',
      detailedInfo: 'Our Civil Acts Agent prepares official applications for Polish birth and marriage certificates from Polish Civil Registry offices where your ancestors were registered. We charge the required payment to cover Polish Civil Registry office fees. Applications are submitted to the appropriate registry office based on historical location. You receive the official Polish vital records which strengthen your citizenship application significantly.',
      keyPoints: [
        'Civil Acts Agent prepares applications for ancestors\' Polish vital records',
        'Payment processing for Polish Civil Registry office fees',
        'Submission to appropriate Civil Registry office based on location',
        'Receive official Polish birth/marriage certificates for citizenship case'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '11',
      weekLabel: 'Month 10-18',
      title: 'INITIAL RESPONSE',
      subtitle: 'Receiving WSC letter, evaluating demands, providing explanations, and submitting additional evidence',
      detailedInfo: 'The INITIAL RESPONSE letter arrives from the Masovian Voivoda\'s office (the government authority processing your case). We carefully evaluate their demands, document requests, and any questions raised. You receive a copy of the letter with our detailed explanations of what it means and next steps. We can extend the citizenship procedure term if additional time is needed. We await and submit any additional evidence the government has requested.',
      keyPoints: [
        'Receive initial response letter from Masovian Voivoda\'s office',
        'Detailed evaluation of government demands and requests',
        'Extend citizenship procedure term if additional time needed',
        'Gather and submit additional evidence as requested by authorities'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '12',
      weekLabel: 'Ongoing',
      title: 'PUSH SCHEMES',
      subtitle: 'Offering acceleration options, payment processing, and implementing strategic interventions',
      detailedInfo: 'We offer three optional case acceleration schemes: PUSH (written strategic communication), NUDGE (follow-up communications), and SIT-DOWN (in-person meeting with officials). Each scheme has specific benefits, costs, and expected timeline impact. Payment is processed for your chosen scheme(s). We then implement strategic interventions with the government authorities to move your case forward faster. Multiple rounds of push schemes can be used throughout the process if desired.',
      keyPoints: [
        'Three schemes available: PUSH, NUDGE, SIT-DOWN with detailed explanations',
        'Transparent pricing and expected impact for each scheme',
        'Payment processing and implementation with authorities',
        'Multiple rounds possible to maintain case momentum'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '13',
      weekLabel: 'Month 14-24',
      title: 'CITIZENSHIP DECISION',
      subtitle: 'Receiving confirmation decision, document verification, and updating client portal',
      detailedInfo: 'The Polish citizenship confirmation decision is received from authorities. We immediately email you a copy with explanations of the decision and what it means. The decision is added to your portal account for permanent access. If positive, we begin preparations for your Polish passport application. If negative (rare), we prepare and file an appeal to the Ministry of Interior within the 2-week deadline, with good success rates on appeals.',
      keyPoints: [
        'Official decision received from Polish citizenship authorities',
        'Positive: Official confirmation emailed and added to portal',
        'Negative: Appeal prepared and filed within 2-week deadline',
        'Appeal process: 6-12 additional months with good success rate'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '14',
      weekLabel: 'Month 1-2 after decision',
      title: 'POLISH PASSPORT',
      subtitle: 'Document preparation, final payment, FedEx delivery, consulate appointment, and passport application',
      detailedInfo: 'With citizenship confirmed, we prepare all documents needed for your Polish passport application at the Polish Consulate. Final payment is processed to cover comprehensive service completion. All required documents are sent to you via FedEx with detailed instructions. We schedule your appointment at the Polish Consulate nearest to you. You attend the appointment, submit your application, and receive your Polish passport within 4-8 weeks. EU citizenship achieved!',
      keyPoints: [
        'Comprehensive document package prepared for passport application',
        'Final payment processed and documents sent via FedEx',
        'Consulate visit scheduled at location nearest to you',
        'Submit application and receive Polish passport within 4-8 weeks'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    },
    {
      id: '15',
      weekLabel: 'Ongoing',
      title: 'EXTENDED SERVICES',
      subtitle: 'Extended family legal services and comprehensive support for family citizenship applications',
      detailedInfo: 'After securing your Polish citizenship, we offer extended legal services for additional family members. Spouses and children can leverage your established citizenship for their own applications with expedited processing. We provide the same comprehensive support for each family member\'s journey. Your citizenship creates generational benefits - Polish and EU citizenship for your entire family line.',
      keyPoints: [
        'Extended services available for spouse and children',
        'Children and descendants automatically qualify',
        'Complete passport and documentation assistance',
        'Generational benefits: Polish & EU citizenship for entire family line'
      ],
      bottomInfo: 'Click to see details',
      ctaLabel: 'Open Account'
    }
  ],
  
  // Portuguese
  pt: [
    {
      id: '1',
      weekLabel: 'Semana 1',
      title: 'PRIMEIROS PASSOS',
      subtitle: 'Primeiro contato, teste de cidadania, árvore genealógica, exame de elegibilidade e chamada de elegibilidade',
      detailedInfo: 'Os primeiros passos em sua jornada de cidadania polonesa incluem seu contato inicial conosco, fazer nosso teste abrangente de cidadania, preencher o formulário de árvore genealógica, passar por exame de elegibilidade e ter uma ligação de elegibilidade com nossos especialistas. Esta fase fundamental estabelece seu caso e determina seu caminho de qualificação.',
      keyPoints: ['Faça o primeiro contato por site, email ou WhatsApp', 'Complete o teste de elegibilidade de cidadania polonesa online', 'Preencha árvore genealógica detalhada com informações de ancestrais', 'Receba exame de elegibilidade e consulta telefônica'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '2',
      weekLabel: 'Semana 1-2',
      title: 'TERMOS E PREÇOS',
      subtitle: 'Avaliação inicial, informações completas do processo com preços, confirmação do cliente e lista de documentos',
      detailedInfo: 'Fornecemos uma avaliação inicial do seu caso, enviamos informações completas do processo com preços transparentes, recebemos sua confirmação para prosseguir e enviamos por email a lista completa de todos os documentos necessários. Esta etapa garante que você entenda os custos, cronograma e requisitos antes de avançar.',
      keyPoints: ['Receba avaliação inicial do seu caso de cidadania', 'Obtenha informações completas do processo com detalhamento de preços', 'Confirme sua decisão de prosseguir com a aplicação', 'Receba lista abrangente de documentos necessários'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '3',
      weekLabel: 'Semana 2',
      title: 'ADIANTAMENTO E CONTA',
      subtitle: 'Processamento de pagamento adiantado e abertura de conta no portal do cliente',
      detailedInfo: 'Você faz o pagamento de entrada para iniciar seu caso oficialmente. Abrimos sua conta dedicada no portal onde você pode acompanhar o progresso, enviar documentos e comunicar-se com nossa equipe de forma segura durante todo o processo.',
      keyPoints: ['Processe o pagamento de entrada para iniciação do caso', 'Crie conta segura no portal do cliente', 'Acesse painel do caso e sistema de upload de documentos', 'Estabeleça canal de comunicação seguro com equipe jurídica'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '4',
      weekLabel: 'Semana 2-3',
      title: 'DETALHES E PROCURAÇÕES',
      subtitle: 'Cliente fornece detalhes básicos, preparação de procuração e documentos assinados via FedEx',
      detailedInfo: 'Você fornece detalhes básicos incluindo cópia do passaporte, endereço, cópia da certidão de nascimento, número de telefone e histórico familiar essencial. Preparamos as Procurações (POAs), enviamos por email, e você as devolve assinadas para nosso escritório em Varsóvia por FedEx. Essas POAs nos autorizam legalmente a representá-lo na Polônia.',
      keyPoints: ['Fornecer informações básicas do cliente e cópias de documentos', 'Receber Procurações preparadas por email', 'Assinar POAs e enviá-las por FedEx para o escritório de Varsóvia', 'Confirmar que a equipe jurídica está oficialmente autorizada'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '5',
      weekLabel: 'Semana 3-4',
      title: 'DADOS E APLICAÇÃO',
      subtitle: 'Preenchimento do formulário mestre, geração de documentação por IA e submissão oficial da aplicação de cidadania',
      detailedInfo: 'Você preenche o FORMULÁRIO MESTRE em sua conta que inclui todos os dados necessários para processar o caso completamente. Nosso Agente de IA gera toda a documentação necessária, cria o rascunho da solicitação de cidadania e a submete. Então aguardamos a resposta inicial que tipicamente leva 10-18 meses. Enviamos por email uma cópia da submissão oficial da solicitação e a adicionamos à sua conta.',
      keyPoints: ['Preencha formulário mestre abrangente com dados pessoais e familiares', 'Sistema IA gera aplicação de cidadania com base nas informações', 'Revise a aplicação gerada para precisão', 'Submeta aplicação finalizada às autoridades polonesas'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '6',
      weekLabel: 'Semana 3-8',
      title: 'DOCUMENTOS LOCAIS',
      subtitle: 'Esclarecimento da lista de documentos, coleta, serviços de assessoria e recebimento/exame de documentos',
      detailedInfo: 'Esclarecemos os documentos exatos necessários, ajudamos a coletar certidões de nascimento/casamento locais, registros de naturalização e documentos militares. Nossos parceiros auxiliam na coleta e examinamos tudo para selecionar quais itens precisam de tradução e arquivo.',
      keyPoints: ['Esclarecer requisitos específicos de documentos', 'Coletar certidões de nascimento, casamento e naturalização', 'Conectar com rede de parceiros para assistência', 'Submeter documentos coletados pelo portal seguro'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '7',
      weekLabel: 'Semana 4-12',
      title: 'DOCUMENTOS POLONESES',
      subtitle: 'Buscas em arquivos poloneses e internacionais, coordenação de parceiros e recebimento de documentos arquivísticos',
      detailedInfo: 'Conduzimos buscas abrangentes em arquivos poloneses, coordenamos pesquisas internacionais, trabalhamos com parceiros para encontrar documentos poloneses antigos e recebemos/examinamos todos os materiais arquivísticos.',
      keyPoints: ['Iniciar buscas em arquivos nacionais poloneses', 'Coordenar buscas internacionais de arquivos', 'Trabalhar com parceiros para localizar documentos históricos', 'Revisar e autenticar materiais descobertos'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '8',
      weekLabel: 'Semana 5-10',
      title: 'TRADUÇÕES',
      subtitle: 'Serviço de tradução IA, certificação por tradutor polonês, revisão independente e garantia de qualidade',
      detailedInfo: 'Documentos são traduzidos usando serviços assistidos por IA, certificados por Tradutores Juramentados Poloneses, verificados por agentes independentes para garantir precisão e preparados para submissão oficial.',
      keyPoints: ['Traduzir todos documentos não-poloneses com IA', 'Certificar traduções com Tradutor Juramentado Polonês', 'Verificação independente de qualidade das traduções', 'Preparar pacote final de traduções para submissão'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '9',
      weekLabel: 'Semana 8-14',
      title: 'ARQUIVAMENTO DE DOCUMENTOS',
      subtitle: 'Submissão de documentos locais, materiais arquivísticos poloneses e informações familiares detalhadas',
      detailedInfo: 'Submetemos todos os documentos locais (certidões de nascimento/casamento, atos de naturalização, registros militares), documentos arquivísticos poloneses e informações familiares detalhadas às autoridades antes da resposta inicial.',
      keyPoints: ['Submeter documentos locais incluindo registros vitais', 'Arquivar documentos poloneses descobertos', 'Fornecer informações familiares detalhadas', 'Completar submissão antes da resposta governamental'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '10',
      weekLabel: 'Semana 6-16',
      title: 'ATOS CIVIS',
      subtitle: 'Preparação e submissão de aplicações de registro civil polonês, processamento de pagamento e recebimento de certidões',
      detailedInfo: 'Preparamos aplicações de atos civis poloneses (certidões de nascimento e casamento dos registros poloneses), submetemos aos escritórios relevantes, processamos pagamentos necessários e recebemos os documentos oficiais.',
      keyPoints: ['Preparar aplicações para certidões polonesas', 'Submeter requisições aos registros civis', 'Processar pagamento para documentos oficiais', 'Receber registros vitais poloneses'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '11',
      weekLabel: 'Mês 10-18',
      title: 'RESPOSTA INICIAL',
      subtitle: 'Recebimento de carta WSC, avaliação de demandas, fornecimento de explicações e submissão de evidências adicionais',
      detailedInfo: 'Recebemos a RESPOSTA INICIAL do escritório do Voivoda da Mazóvia, avaliamos as demandas do governo, enviamos cópia com explicações detalhadas, estendemos o prazo se necessário e submetemos evidências adicionais solicitadas.',
      keyPoints: ['Receber carta de resposta inicial', 'Avaliar demandas governamentais', 'Revisar detalhes com gerente de caso', 'Preparar e submeter documentação adicional'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '12',
      weekLabel: 'Contínuo',
      title: 'ESQUEMAS DE ACELERAÇÃO',
      subtitle: 'Oferta de opções de aceleração, processamento de pagamento e implementação de intervenções estratégicas',
      detailedInfo: 'Oferecemos nossos esquemas de aceleração (PUSH, NUDGE, SIT-DOWN) com explicações detalhadas, processamos pagamentos para esquemas escolhidos e implementamos intervenções estratégicas para acelerar seu caso.',
      keyPoints: ['Revisar esquemas disponíveis: PUSH, NUDGE e SIT-DOWN', 'Selecionar estratégia apropriada baseada na urgência', 'Processar pagamento adicional para serviço escolhido', 'Implementar intervenções para expeditar processamento'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '13',
      weekLabel: 'Mês 14-24',
      title: 'DECISÃO DE CIDADANIA',
      subtitle: 'Recebimento de decisão de confirmação, verificação de documento e atualização do portal do cliente',
      detailedInfo: 'A decisão de confirmação de cidadania polonesa é recebida, enviamos cópia por email com explicações, adicionamos à sua conta no portal e iniciamos preparações para o processo de aplicação de passaporte polonês.',
      keyPoints: ['Receber decisão oficial de confirmação', 'Revisar documento e verificar detalhes', 'Adicionar decisão à conta do portal', 'Iniciar preparação para aplicação de passaporte'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '14',
      weekLabel: 'Mês 1-2 após decisão',
      title: 'PASSAPORTE POLONÊS',
      subtitle: 'Preparação de documentos, pagamento final, entrega FedEx, agendamento de consulado e aplicação de passaporte',
      detailedInfo: 'Preparamos todos os documentos necessários para sua aplicação de passaporte polonês, processamos o pagamento final, enviamos tudo via FedEx, agendamos sua visita ao consulado e orientamos através do processo de aplicação.',
      keyPoints: ['Preparar pacote completo de documentos', 'Processar pagamento final', 'Receber envio FedEx com documentos necessários', 'Agendar e comparecer ao Consulado Polonês'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    },
    {
      id: '15',
      weekLabel: 'Contínuo',
      title: 'SERVIÇOS ESTENDIDOS',
      subtitle: 'Serviços jurídicos estendidos para família e suporte abrangente para aplicações familiares',
      detailedInfo: 'Após garantir sua cidadania, oferecemos serviços jurídicos estendidos para membros adicionais da família, ajudando cônjuges e filhos a aproveitarem sua cidadania estabelecida para suas próprias aplicações.',
      keyPoints: ['Acessar serviços jurídicos para membros da família', 'Aproveitar cidadania estabelecida para aplicações de cônjuge e filhos', 'Utilizar processamento expedito para dependentes', 'Completar jornada completa de cidadania familiar'],
      bottomInfo: 'Clique para ver detalhes',
      ctaLabel: 'Abrir Conta'
    }
  ],

  // French
  fr: [
    {
      id: '1',
      weekLabel: 'Semaine 1',
      title: 'PREMIÈRES ÉTAPES',
      subtitle: 'Premier contact, test de citoyenneté, arbre généalogique, examen d\'éligibilité et appel d\'éligibilité',
      detailedInfo: 'Les premières étapes de votre parcours vers la citoyenneté polonaise incluent votre contact initial avec nous, la réalisation de notre test complet de citoyenneté, le remplissage du formulaire d\'arbre généalogique, l\'examen d\'éligibilité et un appel d\'éligibilité avec nos experts. Cette phase fondamentale établit votre dossier et détermine votre voie de qualification.',
      keyPoints: [
        'Faire le premier contact via le site web, email ou WhatsApp',
        'Compléter le test d\'éligibilité à la citoyenneté polonaise en ligne',
        'Remplir l\'arbre généalogique détaillé avec les informations des ancêtres',
        'Recevoir l\'examen d\'éligibilité et l\'appel de consultation'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '2',
      weekLabel: 'Semaine 1-2',
      title: 'TERMES & TARIFICATION',
      subtitle: 'Évaluation initiale, informations complètes sur le processus avec tarification, confirmation du client et liste de documents',
      detailedInfo: 'Après confirmation que vous êtes éligible, nous envoyons un rapport d\'évaluation détaillé par email expliquant nos conclusions, votre parcours vers la citoyenneté et exactement quels documents seront nécessaires. Vous recevez également des informations complètes sur le processus avec prix transparent, calendrier réaliste, schémas push optionnels (PUSH/NUDGE/SIT-DOWN) et conditions claires.',
      keyPoints: [
        'Email du rapport d\'évaluation avec résultats et chemin vers la citoyenneté',
        'Informations complètes du processus avec prix, calendrier et conditions',
        'Confirmation du client pour poursuivre formellement',
        'Liste de documents détaillée adaptée à votre cas'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '3',
      weekLabel: 'Semaine 2',
      title: 'AVANCE & COMPTE',
      subtitle: 'Traitement du paiement d\'avance et ouverture du compte portail client',
      detailedInfo: 'Pour commencer officiellement, vous effectuez le paiement d\'avance et nous ouvrons immédiatement votre compte sécurisé sur le portail. Ce portail client vous donne accès 24/7 pour soumettre des documents, suivre la progression, voir les jalons du cas et communiquer avec notre équipe.',
      keyPoints: [
        'Traitement du paiement d\'avance pour démarrer officiellement',
        'Compte portail client activé immédiatement',
        'Accès 24/7 pour téléchargement de documents et suivi de progression',
        'Communication centralisée avec notre équipe juridique'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '4',
      weekLabel: 'Semaine 2-3',
      title: 'DÉTAILS & PROCURATIONS',
      subtitle: 'Le client fournit les détails de base, préparation de la procuration et documents signés par FedEx',
      detailedInfo: 'Une fois votre compte actif, vous fournissez des détails essentiels via le portail - copie du passeport, adresse, copie de l\'acte de naissance, numéro de téléphone et historique familial de base. Ces informations nous permettent de préparer vos documents de procuration (POA). Nous les préparons professionnellement, les envoyons par email pour votre signature électronique.',
      keyPoints: [
        'Soumission des détails de base via le portail sécurisé',
        'Préparation professionnelle du document de procuration',
        'Signature électronique pour commodité',
        'Envoi FedEx des POA signés à Varsovie pour traitement officiel'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '5',
      weekLabel: 'Semaine 3-4',
      title: 'DONNÉES & DEMANDE',
      subtitle: 'Remplissage du formulaire maître, génération de paperasse par IA et soumission officielle de la demande de citoyenneté',
      detailedInfo: 'Vous remplissez le FORMULAIRE MAÎTRE en ligne qui contient toutes les données nécessaires pour traiter pleinement votre cas. Notre Agent IA génère tous les documents nécessaires, crée le projet de demande de citoyenneté, et le soumet officiellement aux autorités polonaises. Vous recevez des copies par email pour vos dossiers.',
      keyPoints: [
        'Remplir le formulaire maître avec données personnelles et familiales',
        'Le système IA génère la candidature basée sur les informations',
        'Réviser la candidature générée pour exactitude',
        'Soumettre la candidature finalisée aux autorités polonaises'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '6',
      weekLabel: 'Semaine 3-8',
      title: 'DOCUMENTS LOCAUX',
      subtitle: 'Clarification de la liste de documents, collecte, services consultatifs et réception/examen des documents',
      detailedInfo: 'Nous clarifions les documents exacts nécessaires, vous aidons à collecter les certificats de naissance/mariage locaux, les dossiers de naturalisation et les documents militaires. Nos partenaires assistent dans la collecte et nous examinons tout pour sélectionner quels éléments nécessitent traduction et archivage.',
      keyPoints: [
        'Clarifier les exigences spécifiques de documents',
        'Collecter certificats de naissance, mariage et naturalisation',
        'Se connecter avec le réseau de partenaires pour assistance',
        'Soumettre les documents collectés via le portail sécurisé'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '7',
      weekLabel: 'Semaine 4-12',
      title: 'DOCUMENTS POLONAIS',
      subtitle: 'Recherches dans les archives polonaises et internationales, coordination des partenaires et réception de documents d\'archives',
      detailedInfo: 'Nous effectuons des recherches complètes dans les archives polonaises, coordonnons les recherches internationales, travaillons avec des partenaires pour trouver d\'anciens documents polonais et recevons/examinons tous les matériaux d\'archives.',
      keyPoints: [
        'Lancer des recherches dans les archives nationales polonaises',
        'Coordonner les recherches d\'archives internationales',
        'Travailler avec les partenaires pour localiser des documents historiques',
        'Réviser et authentifier les matériaux découverts'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '8',
      weekLabel: 'Semaine 5-10',
      title: 'TRADUCTIONS',
      subtitle: 'Service de traduction IA, certification par traducteur polonais, révision indépendante et assurance qualité',
      detailedInfo: 'Les documents sont traduits en utilisant des services assistés par IA, certifiés par des Traducteurs Assermentés Polonais, vérifiés par des agents indépendants pour garantir l\'exactitude et préparés pour la soumission officielle.',
      keyPoints: [
        'Traduire tous les documents non-polonais avec IA',
        'Certifier les traductions avec Traducteur Assermenté Polonais',
        'Vérification indépendante de qualité des traductions',
        'Préparer le paquet final de traductions pour soumission'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '9',
      weekLabel: 'Semaine 8-14',
      title: 'DÉPÔT DE DOCUMENTS',
      subtitle: 'Soumission de documents locaux, matériaux d\'archives polonais et informations familiales détaillées',
      detailedInfo: 'Nous soumettons tous les documents locaux (certificats de naissance/mariage, actes de naturalisation, dossiers militaires), documents d\'archives polonais et informations familiales détaillées aux autorités avant la réponse initiale.',
      keyPoints: [
        'Soumettre les documents locaux incluant registres vitaux',
        'Archiver les documents polonais découverts',
        'Fournir des informations familiales détaillées',
        'Compléter la soumission avant la réponse gouvernementale'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '10',
      weekLabel: 'Semaine 6-16',
      title: 'ACTES CIVILS',
      subtitle: 'Préparation et soumission de demandes de registre civil polonais, traitement du paiement et réception des certificats',
      detailedInfo: 'Nous préparons les demandes d\'actes civils polonais (certificats de naissance et mariage des registres polonais), les soumettons aux bureaux pertinents, traitons les paiements nécessaires et recevons les documents officiels.',
      keyPoints: [
        'Préparer les demandes pour certificats polonais',
        'Soumettre les requêtes aux registres civils',
        'Traiter le paiement pour documents officiels',
        'Recevoir les registres vitaux polonais'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '11',
      weekLabel: 'Mois 10-18',
      title: 'RÉPONSE INITIALE',
      subtitle: 'Réception de lettre WSC, évaluation des demandes, fourniture d\'explications et soumission de preuves supplémentaires',
      detailedInfo: 'Nous recevons la RÉPONSE INITIALE du bureau du Voïvode de Mazovie, évaluons les demandes du gouvernement, envoyons une copie avec des explications détaillées, prolongeons le délai si nécessaire et soumettons les preuves supplémentaires demandées.',
      keyPoints: [
        'Recevoir la lettre de réponse initiale',
        'Évaluer les demandes gouvernementales',
        'Réviser les détails avec le gestionnaire de cas',
        'Préparer et soumettre la documentation supplémentaire'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '12',
      weekLabel: 'Continu',
      title: 'SCHÉMAS D\'ACCÉLÉRATION',
      subtitle: 'Offre d\'options d\'accélération, traitement du paiement et mise en œuvre d\'interventions stratégiques',
      detailedInfo: 'Nous offrons nos schémas d\'accélération (PUSH, NUDGE, SIT-DOWN) avec des explications détaillées, traitons les paiements pour les schémas choisis et mettons en œuvre des interventions stratégiques pour accélérer votre dossier.',
      keyPoints: [
        'Réviser les schémas disponibles: PUSH, NUDGE et SIT-DOWN',
        'Sélectionner la stratégie appropriée basée sur l\'urgence',
        'Traiter le paiement supplémentaire pour le service choisi',
        'Mettre en œuvre des interventions pour accélérer le traitement'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '13',
      weekLabel: 'Mois 14-24',
      title: 'DÉCISION DE CITOYENNETÉ',
      subtitle: 'Réception de décision de confirmation, vérification du document et mise à jour du portail client',
      detailedInfo: 'La décision de confirmation de citoyenneté polonaise est reçue, nous envoyons une copie par email avec des explications, l\'ajoutons à votre compte portail et commençons les préparations pour le processus de demande de passeport polonais.',
      keyPoints: [
        'Recevoir la décision officielle de confirmation',
        'Réviser le document et vérifier les détails',
        'Ajouter la décision au compte du portail',
        'Commencer la préparation pour la demande de passeport'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '14',
      weekLabel: 'Mois 1-2 après décision',
      title: 'PASSEPORT POLONAIS',
      subtitle: 'Préparation de documents, paiement final, livraison FedEx, rendez-vous au consulat et demande de passeport',
      detailedInfo: 'Nous préparons tous les documents nécessaires pour votre demande de passeport polonais, traitons le paiement final, envoyons tout via FedEx, planifions votre visite au consulat et vous guidons à travers le processus de demande.',
      keyPoints: [
        'Préparer le paquet complet de documents',
        'Traiter le paiement final',
        'Recevoir l\'envoi FedEx avec documents nécessaires',
        'Planifier et assister au Consulat Polonais'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    },
    {
      id: '15',
      weekLabel: 'Continu',
      title: 'SERVICES ÉTENDUS',
      subtitle: 'Services juridiques étendus pour la famille et support complet pour les demandes familiales',
      detailedInfo: 'Après avoir sécurisé votre citoyenneté, nous offrons des services juridiques étendus pour les membres supplémentaires de la famille, aidant les conjoints et enfants à tirer parti de votre citoyenneté établie pour leurs propres demandes.',
      keyPoints: [
        'Accéder aux services juridiques pour membres de la famille',
        'Tirer parti de la citoyenneté pour demandes de conjoint et enfants',
        'Utiliser le traitement accéléré pour les dépendants',
        'Compléter le parcours complet de citoyenneté familiale'
      ],
      bottomInfo: 'Cliquez pour voir les détails',
      ctaLabel: 'Ouvrir un Compte'
    }
  ],

  // Hebrew
  he: [
    {
      id: '1',
      weekLabel: 'שבוע 1',
      title: 'צעדים ראשונים',
      subtitle: 'קשר ראשון, מבחן אזרחות, עץ משפחה, בדיקת זכאות ושיחת זכאות',
      detailedInfo: 'אנו מספקים ייעוץ בינה מלאכותית מקיף עם ניתוח עץ משפחה מפורט. הבינה המלאכותית שלנו בוחנת את הזכאות שלך (כן, אולי, לא) ומעריכה את קושי המקרה בסולם 1-10. בהתבסס על ניסיוננו של למעלה מ-20 שנה ו-25,000+ מקרים מוצלחים, אנו מספקים הערכה ראשונית מדויקת של סיכויי ההצלחה שלך.',
      keyPoints: [
        'בדיקת אזרחות מופעלת בינה מלאכותית עם ניתוח עץ משפחה מפורט',
        'בחינת זכאות (כן, אולי, לא) והערכת קושי מקרה (1-10)',
        'שיחת זכאות עם הנחיה מקצועית לגבי הצעדים הבאים',
        'התייעצות מקצועית המבוססת על 20+ שנות ניסיון'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '2',
      weekLabel: 'שבוע 1-2',
      title: 'תנאים ותמחור',
      subtitle: 'הערכה ראשונית, מידע מלא על התהליך עם תמחור, אישור לקוח ורשימת מסמכים',
      detailedInfo: 'לאחר אישור הזכאות הראשונית, אנו שולחים הערכה מפורטת עם מידע מלא על התהליך. אתה מקבל פירוט ברור של כל השלבים, לוחות זמנים צפויים ותמחור שקוף. לאחר אישורך להמשיך, אתה מקבל רשימה מקיפה של כל המסמכים הנדרשים למקרה שלך.',
      keyPoints: [
        'קבלת הערכה ראשונית מפורטת עם רמת זכאות',
        'קבלת מידע מקיף על התהליך עם לוח זמנים ותמחור',
        'אישור הלקוח להמשך וקבלת רשימת מסמכים נדרשים',
        'תמחור שקוף ללא עמלות נסתרות'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '3',
      weekLabel: 'שבוע 2',
      title: 'מקדמה וחשבון',
      subtitle: 'עיבוד תשלום מקדמה ופתיחת חשבון פורטל לקוח',
      detailedInfo: 'כאשר אתה מאשר להמשיך, אנו דורשים תשלום מקדמה ופותחים חשבון מאובטח בפורטל שלנו. חשבון הפורטל שלך מספק גישה 24/7 לסטטוס המקרה, העלאת מסמכים, תקשורת עם צוותנו ומעקב אחר כל שלב בתהליך האזרחות שלך.',
      keyPoints: [
        'עיבוד תשלום מקדמה מאובטח להתחלת המקרה שלך',
        'פתיחת חשבון פורטל מקוון עם גישה מאובטחת 24/7',
        'לוח מחוונים למעקב אחר מקרה עם עדכונים בזמן אמת',
        'מערכת העלאת מסמכים ותקשורת ישירה עם צוותך המשפטי'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '4',
      weekLabel: 'שבוע 2-3',
      title: 'פרטים וייפויי כוח',
      subtitle: 'הלקוח מספק פרטים בסיסיים, הכנת ייפוי כוח ומסמכים חתומים דרך FedEx',
      detailedInfo: 'אתה מספק פרטים בסיסיים חיוניים כולל עותקי דרכון, תעודות לידה, כתובת נוכחית ופרטים היסטוריים חיוניים של המשפחה. ה-OCR המופעל בינה מלאכותית שלנו לדרכונים ממלא אוטומטית פרטי שם/תאריך לידה/מין/מספר/תאריך תפוגה, חוסך לך זמן ומבטיח דיוק.',
      keyPoints: [
        'העלאת דרכון עם מילוי אוטומטי מופעל OCR',
        'הגשת מסמכי לידה ואימות כתובת נוכחית',
        'שיתוף היסטוריה משפחתית חיונית ופרטי אבות קדומים',
        'קבלת POA מוכן, חתימה אלקטרונית ושליחה דרך FedEx לוורשה'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '5',
      weekLabel: 'שבוע 3-4',
      title: 'נתונים ובקשה',
      subtitle: 'השלמת טופס ראשי, יצירת מסמכים באמצעות AI והגשת בקשת אזרחות רשמית',
      detailedInfo: 'אתה משלים את הטופס הראשי בחשבון שלך עם כל הנתונים הנדרשים. סוכן ה-AI שלנו מייצר את כל המסמכים, יוצר טיוטת בקשת אזרחות ומגיש אותה רשמית. אתה מקבל עותקים של בקשת האזרחות הרשמית לרשומות שלך.',
      keyPoints: [
        'השלם טופס ראשי מקיף עם נתונים אישיים ומשפחתיים',
        'מערכת AI יוצרת בקשת אזרחות על בסיס המידע',
        'סקור את הבקשה שנוצרה לדיוק',
        'הגש בקשה סופית לרשויות הפולניות'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '6',
      weekLabel: 'שבוע 3-8',
      title: 'מסמכים מקומיים',
      subtitle: 'הבהרת רשימת מסמכים, איסוף, שירותי ייעוץ וקבלת/בדיקת מסמכים',
      detailedInfo: 'אנו מבהירים את המסמכים המדויקים הנדרשים, עוזרים לך לאסוף תעודות לידה/נישואין מקומיות, רישומי הפקרה ומסמכים צבאיים. השותפים שלנו מסייעים באיסוף ואנו בוחנים הכל כדי לבחור אילו פריטים זקוקים לתרגום והגשה.',
      keyPoints: [
        'הבהר דרישות מסמכים ספציפיות',
        'אסוף תעודות לידה, נישואין והפקרה',
        'התחבר לרשת השותפים לסיוע',
        'הגש מסמכים שנאספו דרך הפורטל המאובטח'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '7',
      weekLabel: 'שבוע 4-12',
      title: 'מסמכים פולניים',
      subtitle: 'חיפושים בארכיונים פולניים ובינלאומיים, תיאום שותפים וקבלת מסמכי ארכיון',
      detailedInfo: 'אנו מבצעים חיפושים מקיפים בארכיונים הפולניים, מתאמים חיפושים בינלאומיים, עובדים עם שותפים כדי למצוא מסמכים פולניים ישנים ומקבלים/בוחנים את כל החומרים הארכיוניים.',
      keyPoints: [
        'התחל חיפושים בארכיונים הלאומיים הפולניים',
        'תאם חיפושים בארכיונים בינלאומיים',
        'עבוד עם שותפים לאתר מסמכים היסטוריים',
        'סקור ואמת חומרים שהתגלו'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '8',
      weekLabel: 'שבוע 5-10',
      title: 'תרגומים',
      subtitle: 'שירות תרגום AI, אישור על ידי מתרגם פולני, ביקורת עצמאית והבטחת איכות',
      detailedInfo: 'מסמכים מתורגמים באמצעות שירותים בעזרת AI, מאושרים על ידי מתרגמים משבעים פולניים, נבדקים על ידי סוכנים עצמאיים כדי להבטיח דיוק ומוכנים להגשה רשמית.',
      keyPoints: [
        'תרגם את כל המסמכים הלא-פולניים עם AI',
        'אשר תרגומים עם מתרגם משבע פולני',
        'בדיקת איכות עצמאית של תרגומים',
        'הכן חבילת תרגומים סופית להגשה'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '9',
      weekLabel: 'שבוע 8-14',
      title: 'הגשת מסמכים',
      subtitle: 'הגשת מסמכים מקומיים, חומרי ארכיון פולניים ומידע משפחתי מפורט',
      detailedInfo: 'אנו מגישים את כל המסמכים המקומיים (תעודות לידה/נישואין, מעשי הפקרה, רישומים צבאיים), מסמכי ארכיון פולניים ומידע משפחתי מפורט לרשויות לפני שהתגובה הראשונית מגיעה.',
      keyPoints: [
        'הגש מסמכים מקומיים כולל רישומים חיוניים',
        'הגש מסמכים פולניים שהתגלו',
        'ספק מידע משפחתי מפורט',
        'השלם הגשת מסמכים לפני תגובה ממשלתית'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '10',
      weekLabel: 'שבוע 6-16',
      title: 'מעשים אזרחיים',
      subtitle: 'הכנה והגשת בקשות לרישום אזרחי פולני, עיבוד תשלום וקבלת תעודות',
      detailedInfo: 'אנו מכינים בקשות למעשים אזרחיים פולניים (תעודות לידה ונישואין מרשומות פולניות), מגישים אותן למשרדים הרלוונטיים, מעבדים תשלומים נדרשים ומקבלים את המסמכים הרשמיים.',
      keyPoints: [
        'הכן בקשות לתעודות פולניות',
        'הגש בקשות לרישום האזרחי',
        'עבד תשלום למסמכים רשמיים',
        'קבל רישומים חיוניים פולניים'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '11',
      weekLabel: 'חודש 10-18',
      title: 'תגובה ראשונית',
      subtitle: 'קבלת מכתב WSC, הערכת דרישות, מתן הסברים והגשת ראיות נוספות',
      detailedInfo: 'אנו מקבלים את התגובה הראשונית ממשרד ה-Voivoda של מזוביה, מעריכים את דרישות הממשלה, שולחים לך עותק עם הסברים מפורטים, מאריכים את תקופת ההליך אם צריך ומגישים ראיות נוספות שהתבקשו.',
      keyPoints: [
        'קבל מכתב תגובה ראשונית',
        'העריך דרישות ממשלתיות',
        'סקור פרטים עם מנהל המקרה',
        'הכן והגש תיעוד נוסף'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '12',
      weekLabel: 'מתמשך',
      title: 'תוכניות האצה',
      subtitle: 'הצעת אפשרויות האצה, עיבוד תשלום ויישום התערבויות אסטרטגיות',
      detailedInfo: 'אנו מציעים את תוכניות ההאצה שלנו (PUSH, NUDGE, SIT-DOWN) עם הסברים מפורטים, מעבדים תשלומים עבור התוכניות שנבחרו ומיישמים התערבויות אסטרטגיות כדי להאיץ את המקרה שלך.',
      keyPoints: [
        'סקור תוכניות זמינות: PUSH, NUDGE ו-SIT-DOWN',
        'בחר אסטרטגיה מתאימה על בסיס דחיפות',
        'עבד תשלום נוסף לשירות שנבחר',
        'יישם התערבויות להאצת עיבוד'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '13',
      weekLabel: 'חודש 14-24',
      title: 'החלטת אזרחות',
      subtitle: 'קבלת החלטת אישור, אימות מסמך ועדכון פורטל הלקוח',
      detailedInfo: 'החלטת אישור האזרחות הפולנית מתקבלת, אנו שולחים לך עותק בדוא"ל עם הסברים, מוסיפים אותה לחשבון הפורטל שלך ומתחילים הכנות לתהליך בקשת הדרכון הפולני.',
      keyPoints: [
        'קבל החלטת אישור רשמית',
        'סקור מסמך ואמת פרטים',
        'הוסף החלטה לחשבון הפורטל',
        'התחל הכנה לבקשת דרכון'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '14',
      weekLabel: 'חודש 1-2 אחרי החלטה',
      title: 'דרכון פולני',
      subtitle: 'הכנת מסמכים, תשלום סופי, משלוח FedEx, תור בקונסוליה ובקשת דרכון',
      detailedInfo: 'אנו מכינים את כל המסמכים הנדרשים לבקשת הדרכון הפולני שלך, מעבדים את התשלום הסופי, שולחים הכל דרך FedEx, מתזמנים את הביקור שלך בקונסוליה ומנחים אותך דרך תהליך הבקשה.',
      keyPoints: [
        'הכן חבילת מסמכים מלאה',
        'עבד תשלום סופי',
        'קבל משלוח FedEx עם מסמכים נדרשים',
        'תזמן והשתתף בקונסוליה הפולנית'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    },
    {
      id: '15',
      weekLabel: 'מתמשך',
      title: 'שירותים מורחבים',
      subtitle: 'שירותים משפטיים מורחבים למשפחה ותמיכה מקיפה לבקשות משפחתיות',
      detailedInfo: 'לאחר הבטחת האזרחות שלך, אנו מציעים שירותים משפטיים מורחבים לבני משפחה נוספים, עוזרים לבני זוג וילדים למנף את האזרחות המבוססת שלך לבקשות שלהם.',
      keyPoints: [
        'גש לשירותים משפטיים לבני משפחה',
        'מנף אזרחות לבקשות בן זוג וילדים',
        'השתמש בעיבוד מואץ עבור תלויים',
        'השלם מסע אזרחות משפחתי מלא'
      ],
      bottomInfo: 'לחץ לראות פרטים',
      ctaLabel: 'פתח חשבון'
    }
  ],

  es: [
    {
      id: '1',
      weekLabel: 'Semana 1',
      title: 'PRIMEROS PASOS',
      subtitle: 'Primer contacto, test de ciudadanía, árbol genealógico, examen de elegibilidad y llamada de evaluación',
      detailedInfo: 'Los primeros pasos en tu proceso de ciudadanía polaca incluyen el contacto inicial con nosotros, realizar nuestro test integral de ciudadanía, completar el formulario del árbol genealógico, someterse al examen de elegibilidad y tener una llamada de evaluación con nuestros expertos. Esta fase fundamental establece tu caso y determina tu vía de cualificación.',
      keyPoints: [
        'Primer contacto a través del sitio web, correo electrónico o WhatsApp',
        'Completar el test de elegibilidad de ciudadanía polaca en línea',
        'Llenar el árbol genealógico detallado con información de antepasados',
        'Recibir examen de elegibilidad y llamada de consulta'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '2',
      weekLabel: 'Semana 1-2',
      title: 'TÉRMINOS Y PRECIOS',
      subtitle: 'Evaluación inicial, información completa del proceso con precios, confirmación del cliente y lista de documentos',
      detailedInfo: 'Después de completar el examen de elegibilidad, te enviamos por correo una evaluación inicial detallada explicando si calificas para la ciudadanía polaca. Si eres elegible, enviamos información completa sobre el proceso incluyendo precios transparentes para todas las etapas. Una vez que confirmes tu decisión de proceder, proporcionamos una lista completa de todos los documentos que necesitarás reunir. Esta etapa asegura claridad total sobre costos, cronograma y requisitos antes de comprometerte.',
      keyPoints: [
        'Recibir evaluación inicial detallada por correo electrónico',
        'Revisar información completa del proceso con desglose de precios',
        'Confirmar tu decisión de proceder con la solicitud de ciudadanía',
        'Recibir lista completa de todos los documentos requeridos'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '3',
      weekLabel: 'Semana 2',
      title: 'ANTICIPO Y CUENTA',
      subtitle: 'Procesamiento del pago anticipado y apertura de cuenta del portal del cliente',
      detailedInfo: 'Una vez que decidas seguir adelante, procesamos tu pago anticipado para iniciar oficialmente el caso. Simultáneamente, creamos tu cuenta personalizada en nuestro portal de clientes donde podrás hacer seguimiento del progreso, cargar documentos, comunicarte con nuestro equipo y acceder a todos los materiales del caso. Este portal se convierte en tu centro central para todo el proceso de ciudadanía.',
      keyPoints: [
        'Procesar pago anticipado para abrir oficialmente tu caso',
        'Crear cuenta personalizada del portal para gestión del caso',
        'Acceder al panel seguro para rastrear todo el progreso y etapas',
        'Plataforma centralizada para documentos, comunicación y actualizaciones'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '4',
      weekLabel: 'Semana 2-3',
      title: 'DETALLES Y PODERES',
      subtitle: 'Cliente proporciona detalles básicos, preparación de poderes y documentos firmados vía FedEx',
      detailedInfo: 'Proporcionas detalles esenciales incluyendo copia del pasaporte, dirección actual, copia del certificado de nacimiento, número de teléfono e información clave del historial familiar. Nuestro equipo legal prepara documentos oficiales de Poder que nos autorizan a representarte en Polonia. Firmas estos documentos de Poder y los envías vía FedEx a nuestra oficina en Varsovia. Una vez recibidos, podemos actuar legalmente en tu nombre durante todo el proceso de ciudadanía.',
      keyPoints: [
        'Enviar detalles básicos: pasaporte, dirección, certificado de nacimiento, teléfono, historial familiar',
        'Recibir documentos de Poder preparados profesionalmente',
        'Firmar documentos de Poder y enviar vía FedEx a oficina en Varsovia',
        'Autorización legal establecida para representación completa en Polonia'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '5',
      weekLabel: 'Semana 3-4',
      title: 'DATOS Y SOLICITUD',
      subtitle: 'Cliente completa el formulario maestro, el agente de IA genera documentación y se envía la solicitud',
      detailedInfo: 'Completas nuestro formulario maestro integral en tu cuenta que incluye todos los datos necesarios para procesar el caso completo. Nuestro agente de IA genera automáticamente todos los documentos legales necesarios basados en esta información. Presentamos oficialmente tu solicitud de ciudadanía a las autoridades polacas. Comienza el período de espera de la respuesta inicial (10-18 meses). Te enviamos una copia de la presentación oficial de la solicitud de ciudadanía polaca.',
      keyPoints: [
        'Completar formulario maestro integral con todos los datos del caso',
        'El agente de IA genera automáticamente toda la documentación legal',
        'Presentar solicitud oficial de ciudadanía a autoridades polacas',
        'Recibir copia de confirmación de presentación de solicitud'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '6',
      weekLabel: 'Semana 4-60',
      title: 'DOCUMENTOS LOCALES',
      subtitle: 'Aclaración de lista de documentos, recopilación de documentos locales, asesoramiento por agente local',
      detailedInfo: 'Aclaramos exactamente qué documentos locales necesitas reunir de tu país de residencia. Recopilas estos documentos vitales incluyendo certificados de nacimiento, matrimonio, actas de naturalización, registros militares, etc. Te conectamos con nuestros socios globales en tu área que pueden ayudarte a obtener estos documentos si los necesitas. Recibimos los documentos de ti o de los socios, los examinamos y seleccionamos cuáles traducir y archivar en tu caso de ciudadanía en curso.',
      keyPoints: [
        'Recibir lista clarificada de todos los documentos locales necesarios',
        'Reunir certificados de nacimiento, matrimonio, naturalización, registros militares',
        'Conectarse con nuestros socios locales para asistencia en recopilación de documentos',
        'Revisión experta y selección de documentos para traducir y archivar'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '7',
      weekLabel: 'Semana 4-60',
      title: 'DOCUMENTOS POLACOS',
      subtitle: 'Búsqueda de archivos polacos e internacionales, búsqueda de posesiones familiares',
      detailedInfo: 'Realizamos búsquedas exhaustivas en archivos polacos para registros históricos de tus antepasados. También buscamos en archivos internacionales según sea necesario. Te conectamos con nuestros socios especializados para procesar cada búsqueda. Guiamos la búsqueda a través de posesiones familiares de posibles documentos polacos antiguos. Recibimos documentos de archivo, los examinamos y elegimos cuáles posiblemente traducir y archivar en tu caso de ciudadanía en curso.',
      keyPoints: [
        'Realizar búsquedas exhaustivas de archivos polacos para registros de antepasados',
        'Buscar en archivos internacionales según sea necesario para el caso',
        'Conectarse con socios para procesamiento especializado de búsqueda de archivos',
        'Examinar documentos históricos para inclusión relevante en el caso'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '8',
      weekLabel: 'Semana 5-65',
      title: 'TRADUCCIONES',
      subtitle: 'Traducciones de documentos, certificación con traductor jurado polaco, verificación doble de errores',
      detailedInfo: 'Posiblemente procesamos traducciones en nuestro portal con servicio de traducción de IA. Certificamos todas las traducciones con Traductores Jurados Polacos oficiales según lo requiere la ley polaca. Nuestro agente de traducciones dedicado supervisa todo el proceso de traducción. Un agente independiente verifica todas las traducciones para cualquier error. Solo se presentan traducciones perfectas, certificadas y legalmente válidas con tu caso.',
      keyPoints: [
        'Procesar traducciones de documentos a través del portal con asistencia de IA',
        'Certificar todas las traducciones con Traductores Jurados Polacos oficiales',
        'Supervisión dedicada del agente de traducciones para control de calidad',
        'Verificación independiente de todas las traducciones para precisión perfecta'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '9',
      weekLabel: 'Semana 6-66',
      title: 'ARCHIVO DE DOCUMENTOS',
      subtitle: 'Presentación de documentos locales y polacos, junto con información familiar detallada',
      detailedInfo: 'Presentamos todos los documentos locales recopilados (certificados de nacimiento, matrimonio, actas de naturalización, registros militares) y documentos de archivos polacos a las autoridades. Junto con estos documentos, presentamos información familiar detallada e integral. Intentamos hacer esto ANTES de recibir la respuesta inicial en la solicitud de ciudadanía si es posible para acelerar el proceso general.',
      keyPoints: [
        'Presentar todos los documentos locales certificados a las autoridades polacas',
        'Archivar documentos históricos polacos obtenidos de archivos',
        'Presentar información familiar detallada e integral',
        'Completar presentación de documentos antes de la respuesta inicial si es posible'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '10',
      weekLabel: 'Semana 7-67',
      title: 'ACTAS CIVILES',
      subtitle: 'Preparación de solicitudes de actas civiles polacas, pago de actas civiles y presentación',
      detailedInfo: 'Preparamos solicitudes de actas civiles polacas (certificados de nacimiento y matrimonio de antepasados polacos). Este proceso está supervisado por nuestro agente de actas civiles dedicado. Te cobramos el pago por el procesamiento de actas civiles polacas. Presentamos las solicitudes a la oficina de registro civil polaca relevante. Recibimos certificados oficiales de nacimiento y matrimonio polacos cuando están listos.',
      keyPoints: [
        'Preparar profesionalmente solicitudes de actas civiles polacas',
        'Supervisión dedicada del agente de actas civiles para el proceso',
        'Procesar pago para tarifas de solicitud de actas civiles',
        'Recibir certificados oficiales de nacimiento y matrimonio de registros polacos'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '11',
      weekLabel: 'Semana 50-70',
      title: 'RESPUESTA INICIAL',
      subtitle: 'Recibir respuesta inicial de la Voivodía de Mazovia, evaluación de demandas, carta al cliente',
      detailedInfo: 'Recibimos la RESPUESTA INICIAL de la oficina del Voivoda de Mazovia en tu caso de ciudadanía polaca. Evaluamos cuidadosamente las demandas planteadas por el gobierno. Enviamos una copia de la carta con explicaciones detalladas a ti. Extendemos el plazo del procedimiento de ciudadanía según sea necesario. Esperamos evidencia adicional (documentos e información) de ti según lo solicitado por las autoridades.',
      keyPoints: [
        'Recibir respuesta inicial oficial de la Voivodía de Mazovia',
        'Análisis experto de todas las demandas y requisitos del gobierno',
        'Enviar copia de la respuesta con explicaciones detalladas al cliente',
        'Gestionar extensiones de plazos y solicitudes de evidencia adicionales'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '12',
      weekLabel: 'Semana 71-90',
      title: 'ESQUEMAS DE IMPULSO',
      subtitle: 'Ofrecer esquemas PUSH/NUDGE/SIT-DOWN, explicar detalles, procesar pagos, implementar',
      detailedInfo: 'Ofrecemos nuestros esquemas de impulso al cliente: PUSH (presión básica), NUDGE (recordatorios regulares) y SIT-DOWN (reuniones personales con funcionarios). Explicamos cada esquema en detalle incluyendo costos y beneficios esperados. Procesamos pagos para los esquemas seleccionados. Introducimos los esquemas en la práctica contactando a funcionarios del gobierno. Recibimos la 2ª respuesta del gobierno. Introducimos los esquemas nuevamente según sea necesario para progreso continuo.',
      keyPoints: [
        'Explicar esquemas PUSH, NUDGE y SIT-DOWN al cliente con detalles de precios',
        'Procesar pagos para esquemas de impulso seleccionados',
        'Implementar contacto estratégico con funcionarios del gobierno',
        'Introducir esquemas nuevamente según sea necesario para resultados óptimos'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '13',
      weekLabel: 'Semana 91-110',
      title: 'DECISIÓN DE CIUDADANÍA',
      subtitle: 'Recibir decisión de confirmación de ciudadanía polaca o presentar apelación si es negativa',
      detailedInfo: 'Recibimos la decisión oficial de confirmación de ciudadanía polaca de las autoridades. Te enviamos una copia de la decisión y la agregamos a tu cuenta del portal. Si la decisión es positiva, procedemos a la emisión del pasaporte polaco. Si la decisión es negativa, preparamos y presentamos una apelación al Ministerio del Interior dentro del plazo máximo de 2 semanas.',
      keyPoints: [
        'Recibir decisión oficial de confirmación de ciudadanía polaca',
        'Enviar copia de la decisión y actualizar cuenta del portal del cliente',
        'Si es positivo: proceder inmediatamente a la emisión del pasaporte polaco',
        'Si es negativo: preparar y presentar apelación dentro de 2 semanas'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '14',
      weekLabel: 'Semana 111-115',
      title: 'PASAPORTE POLACO',
      subtitle: 'Preparar documentos del consulado, cobrar pago final, programar visita, solicitar pasaporte',
      detailedInfo: 'Preparamos todos los documentos necesarios para que solicites tu pasaporte polaco en el consulado. Cobramos el pago final por nuestros servicios. Enviamos todos los documentos vía FedEx. Programamos tu cita de visita al consulado polaco. Tú solicitas el pasaporte en la cita. Obtienes tu pasaporte polaco (típicamente dentro de 4-6 semanas después de la cita).',
      keyPoints: [
        'Preparar documentación completa del consulado para solicitud de pasaporte',
        'Procesar pago final de servicios y enviar materiales vía FedEx',
        'Programar cita oficial del consulado polaco',
        'Obtener pasaporte polaco dentro de 4-6 semanas después de solicitar'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    },
    {
      id: '15',
      weekLabel: 'Después',
      title: 'SERVICIOS EXTENDIDOS',
      subtitle: 'Servicios legales familiares extendidos para cónyuge, hijos y familiares adicionales',
      detailedInfo: 'Una vez que obtienes la ciudadanía polaca, ofrecemos servicios legales familiares extendidos. Procesamos solicitudes de ciudadanía para tu cónyuge usando tu nueva ciudadanía polaca. Procesamos solicitudes de ciudadanía para todos tus hijos menores y mayores. Asistimos a padres, abuelos, hermanos y otros familiares cercanos que puedan calificar. Usamos procesamiento acelerado para dependientes. Completamos el viaje de ciudadanía familiar completo.',
      keyPoints: [
        'Procesar solicitud de ciudadanía del cónyuge basada en tu ciudadanía',
        'Gestionar solicitudes de ciudadanía para hijos menores y mayores',
        'Asistir a padres, abuelos, hermanos y familiares extendidos',
        'Usar procesamiento acelerado para dependientes',
        'Completar viaje de ciudadanía familiar completo'
      ],
      bottomInfo: 'Haz clic para ver detalles',
      ctaLabel: 'Abrir cuenta'
    }
  ],

  de: [
    {
      id: '1',
      weekLabel: 'Woche 1',
      title: 'ERSTE SCHRITTE',
      subtitle: 'Erstkontakt, Staatsbürgerschaftstest, Stammbaum, Eignungsprüfung und Beratungsgespräch',
      detailedInfo: 'Die ersten Schritte auf Ihrem Weg zur polnischen Staatsbürgerschaft umfassen Ihren ersten Kontakt mit uns, die Durchführung unseres umfassenden Staatsbürgerschaftstests, das Ausfüllen des Stammbaum-Formulars, die Eignungsprüfung und ein Beratungsgespräch mit unseren Experten. Diese grundlegende Phase etabliert Ihren Fall und bestimmt Ihren Qualifikationsweg.',
      keyPoints: [
        'Erstkontakt über Website, E-Mail oder WhatsApp',
        'Online-Eignungstest für polnische Staatsbürgerschaft absolvieren',
        'Detaillierten Stammbaum mit Vorfahreninformationen ausfüllen',
        'Eignungsprüfung und Beratungsgespräch erhalten'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '2',
      weekLabel: 'Woche 1-2',
      title: 'BEDINGUNGEN & PREISE',
      subtitle: 'Erstbewertung, vollständige Prozessinformationen mit Preisen, Kundenbestätigung und Dokumentenliste',
      detailedInfo: 'Nach Abschluss der Eignungsprüfung senden wir Ihnen per E-Mail eine detaillierte Erstbewertung, die erklärt, ob Sie sich für die polnische Staatsbürgerschaft qualifizieren. Bei Eignung senden wir umfassende Informationen über den gesamten Prozess einschließlich transparenter Preise für alle Phasen. Sobald Sie Ihre Entscheidung zur Fortsetzung bestätigen, stellen wir eine vollständige Liste aller Dokumente bereit, die Sie sammeln müssen. Diese Phase gewährleistet vollständige Klarheit über Kosten, Zeitplan und Anforderungen, bevor Sie sich verpflichten.',
      keyPoints: [
        'Detaillierte Erstbewertung per E-Mail erhalten',
        'Vollständige Prozessinformationen mit Preisaufschlüsselung prüfen',
        'Entscheidung zur Fortsetzung des Staatsbürgerschaftsantrags bestätigen',
        'Umfassende Liste aller erforderlichen Dokumente erhalten'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '3',
      weekLabel: 'Woche 2',
      title: 'ANZAHLUNG & KONTO',
      subtitle: 'Bearbeitung der Anzahlung und Eröffnung des Kundenportal-Kontos',
      detailedInfo: 'Sobald Sie sich entscheiden, fortzufahren, bearbeiten wir Ihre Anzahlung, um den Fall offiziell zu eröffnen. Gleichzeitig erstellen wir Ihr personalisiertes Konto auf unserem Kundenportal, wo Sie den Fortschritt verfolgen, Dokumente hochladen, mit unserem Team kommunizieren und auf alle Fallmaterialien zugreifen können. Dieses Portal wird zu Ihrer zentralen Anlaufstelle für die gesamte Staatsbürgerschaftsreise.',
      keyPoints: [
        'Anzahlung bearbeiten, um Ihren Fall offiziell zu eröffnen',
        'Personalisiertes Kundenportal-Konto für Fallmanagement erstellen',
        'Zugriff auf sicheres Dashboard zur Verfolgung aller Fortschritte und Meilensteine',
        'Zentralisierte Plattform für Dokumente, Kommunikation und Updates'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '4',
      weekLabel: 'Woche 2-3',
      title: 'DETAILS & VOLLMACHTEN',
      subtitle: 'Kunde liefert grundlegende Details, Vollmachtsvorbereitung und signierte Dokumente per FedEx',
      detailedInfo: 'Sie stellen wesentliche Details bereit, einschließlich Passkopie, aktuelle Adresse, Geburtsurkunde, Telefonnummer und wichtige Familiengeschichte. Unser Rechtsteam bereitet offizielle Vollmachtsdokumente vor, die uns autorisieren, Sie in Polen zu vertreten. Sie unterzeichnen diese Vollmachtsdokumente und senden sie per FedEx an unser Büro in Warschau. Nach Erhalt können wir während des gesamten Staatsbürgerschaftsprozesses rechtlich in Ihrem Namen handeln.',
      keyPoints: [
        'Grundlegende Details einreichen: Pass, Adresse, Geburtsurkunde, Telefon, Familiengeschichte',
        'Professionell vorbereitete Vollmachtsdokumente erhalten',
        'Vollmachtsdokumente unterzeichnen und per FedEx an Warschauer Büro senden',
        'Rechtliche Autorisierung für vollständige Vertretung in Polen etabliert'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '5',
      weekLabel: 'Woche 3-4',
      title: 'DATEN & ANTRAG',
      subtitle: 'Kunde füllt Masterformular aus, KI-Agent generiert Unterlagen und reicht Antrag ein',
      detailedInfo: 'Sie füllen unser umfassendes Masterformular in Ihrem Konto aus, das alle Daten enthält, die für die Bearbeitung des vollständigen Falls erforderlich sind. Unser KI-Agent generiert automatisch alle erforderlichen rechtlichen Dokumente basierend auf diesen Informationen. Wir reichen Ihren Staatsbürgerschaftsantrag offiziell bei den polnischen Behörden ein. Die Wartezeit auf die erste Antwort beginnt (10-18 Monate). Wir senden Ihnen eine Kopie der offiziellen Einreichung des polnischen Staatsbürgerschaftsantrags.',
      keyPoints: [
        'Umfassendes Masterformular mit allen Falldaten ausfüllen',
        'KI-Agent generiert automatisch alle rechtlichen Unterlagen',
        'Offiziellen Staatsbürgerschaftsantrag bei polnischen Behörden einreichen',
        'Bestätigungskopie der Antragseinreichung erhalten'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '6',
      weekLabel: 'Woche 4-60',
      title: 'LOKALE DOKUMENTE',
      subtitle: 'Klärung der Dokumentenliste, Sammlung lokaler Dokumente, Beratung durch lokalen Agenten',
      detailedInfo: 'Wir klären genau, welche lokalen Dokumente Sie aus Ihrem Wohnsitzland sammeln müssen. Sie sammeln diese wichtigen Dokumente, einschließlich Geburts-, Heiratsurkunden, Einbürgerungsurkunden, Militärunterlagen usw. Wir verbinden Sie mit unseren globalen Partnern in Ihrer Region, die Ihnen bei Bedarf beim Erhalt dieser Dokumente helfen können. Wir erhalten die Dokumente von Ihnen oder von Partnern, prüfen sie und wählen aus, welche übersetzt und in Ihrem laufenden Staatsbürgerschaftsfall archiviert werden sollen.',
      keyPoints: [
        'Geklärte Liste aller benötigten lokalen Dokumente erhalten',
        'Geburts-, Heiratsurkunden, Einbürgerungsurkunden, Militärunterlagen sammeln',
        'Mit unseren lokalen Partnern für Unterstützung bei der Dokumentenbeschaffung verbinden',
        'Expertenprüfung und Auswahl von Dokumenten zur Übersetzung und Archivierung'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '7',
      weekLabel: 'Woche 4-60',
      title: 'POLNISCHE DOKUMENTE',
      subtitle: 'Polnische und internationale Archivsuche, Suche nach Familienbesitz',
      detailedInfo: 'Wir führen gründliche Suchen in polnischen Archiven nach historischen Aufzeichnungen Ihrer Vorfahren durch. Wir durchsuchen auch internationale Archive nach Bedarf. Wir verbinden Sie mit unseren spezialisierten Partnern, um jede Suche zu verarbeiten. Wir leiten die Suche durch Familienbesitz nach möglichen alten polnischen Dokumenten. Wir erhalten Archivdokumente, prüfen sie und wählen aus, welche möglicherweise übersetzt und in Ihrem laufenden Staatsbürgerschaftsfall archiviert werden sollen.',
      keyPoints: [
        'Gründliche polnische Archivsuchen nach Vorfahrenaufzeichnungen durchführen',
        'Internationale Archive nach Bedarf für den Fall durchsuchen',
        'Mit Partnern für spezialisierte Archivsuchbearbeitung verbinden',
        'Historische Dokumente auf relevante Aufnahme in den Fall prüfen'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '8',
      weekLabel: 'Woche 5-65',
      title: 'ÜBERSETZUNGEN',
      subtitle: 'Dokumentenübersetzungen, Zertifizierung mit polnischem vereidigtem Übersetzer, Doppelprüfung auf Fehler',
      detailedInfo: 'Wir verarbeiten möglicherweise Übersetzungen auf unserem Portal mit KI-Übersetzungsdienst. Wir zertifizieren alle Übersetzungen mit offiziellen polnischen vereidigten Übersetzern wie vom polnischen Recht gefordert. Unser dedizierter Übersetzungsagent überwacht den gesamten Übersetzungsprozess. Ein unabhängiger Agent überprüft alle Übersetzungen auf Fehler. Nur perfekte, zertifizierte und rechtlich gültige Übersetzungen werden mit Ihrem Fall eingereicht.',
      keyPoints: [
        'Dokumentenübersetzungen über Portal mit KI-Unterstützung verarbeiten',
        'Alle Übersetzungen mit offiziellen polnischen vereidigten Übersetzern zertifizieren',
        'Dedizierte Überwachung des Übersetzungsagenten für Qualitätskontrolle',
        'Unabhängige Überprüfung aller Übersetzungen auf perfekte Genauigkeit'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '9',
      weekLabel: 'Woche 6-66',
      title: 'EINREICHUNG VON DOKUMENTEN',
      subtitle: 'Einreichung lokaler und polnischer Dokumente zusammen mit detaillierten Familieninformationen',
      detailedInfo: 'Wir reichen alle gesammelten lokalen Dokumente (Geburts-, Heiratsurkunden, Einbürgerungsurkunden, Militärunterlagen) und polnische Archivdokumente bei den Behörden ein. Zusammen mit diesen Dokumenten reichen wir detaillierte und umfassende Familieninformationen ein. Wir versuchen dies VOR Erhalt der ersten Antwort im Staatsbürgerschaftsantrag zu tun, wenn möglich, um den Gesamtprozess zu beschleunigen.',
      keyPoints: [
        'Alle zertifizierten lokalen Dokumente bei polnischen Behörden einreichen',
        'Historische polnische Dokumente aus Archiven archivieren',
        'Detaillierte und umfassende Familieninformationen einreichen',
        'Dokumenteneinreichung vor erster Antwort wenn möglich abschließen'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '10',
      weekLabel: 'Woche 7-67',
      title: 'STANDESAMTLICHE URKUNDEN',
      subtitle: 'Vorbereitung polnischer Standesamtsanträge, Zahlung für standesamtliche Urkunden und Einreichung',
      detailedInfo: 'Wir bereiten Anträge für polnische Standesamtsurkunden vor (Geburts- und Heiratsurkunden polnischer Vorfahren). Dieser Prozess wird von unserem dedizierten Standesamtsagenten überwacht. Wir berechnen die Zahlung für die Bearbeitung polnischer Standesamtsurkunden. Wir reichen die Anträge beim relevanten polnischen Standesamt ein. Wir erhalten offizielle polnische Geburts- und Heiratsurkunden, wenn sie fertig sind.',
      keyPoints: [
        'Professionelle Vorbereitung polnischer Standesamtsanträge',
        'Dedizierte Überwachung des Standesamtsagenten für den Prozess',
        'Zahlung für Standesamtsantragsgebühren verarbeiten',
        'Offizielle Geburts- und Heiratsurkunden aus polnischen Registern erhalten'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '11',
      weekLabel: 'Woche 50-70',
      title: 'ERSTE ANTWORT',
      subtitle: 'Erste Antwort von der Woiwodschaft Masowien erhalten, Forderungen bewerten, Brief an Kunden',
      detailedInfo: 'Wir erhalten die ERSTE ANTWORT vom Büro des Woiwoden von Masowien in Ihrem polnischen Staatsbürgerschaftsfall. Wir bewerten sorgfältig die von der Regierung gestellten Forderungen. Wir senden Ihnen eine Kopie des Briefes mit detaillierten Erklärungen. Wir verlängern die Frist des Staatsbürgerschaftsverfahrens nach Bedarf. Wir warten auf zusätzliche Beweise (Dokumente und Informationen) von Ihnen, wie von den Behörden gefordert.',
      keyPoints: [
        'Offizielle erste Antwort von der Woiwodschaft Masowien erhalten',
        'Expertenanalyse aller Regierungsforderungen und Anforderungen',
        'Kopie der Antwort mit detaillierten Erklärungen an Kunden senden',
        'Fristverlängerungen und zusätzliche Beweisanforderungen verwalten'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '12',
      weekLabel: 'Woche 71-90',
      title: 'PUSH-SCHEMATA',
      subtitle: 'PUSH/NUDGE/SIT-DOWN-Schemata anbieten, Details erklären, Zahlungen verarbeiten, implementieren',
      detailedInfo: 'Wir bieten dem Kunden unsere Push-Schemata an: PUSH (grundlegender Druck), NUDGE (regelmäßige Erinnerungen) und SIT-DOWN (persönliche Treffen mit Beamten). Wir erklären jedes Schema im Detail, einschließlich Kosten und erwarteter Vorteile. Wir verarbeiten Zahlungen für ausgewählte Schemata. Wir setzen die Schemata in der Praxis um, indem wir Regierungsbeamte kontaktieren. Wir erhalten die 2. Antwort der Regierung. Wir setzen die Schemata nach Bedarf erneut ein für kontinuierlichen Fortschritt.',
      keyPoints: [
        'PUSH-, NUDGE- und SIT-DOWN-Schemata dem Kunden mit Preisdetails erklären',
        'Zahlungen für ausgewählte Push-Schemata verarbeiten',
        'Strategischen Kontakt mit Regierungsbeamten implementieren',
        'Schemata nach Bedarf für optimale Ergebnisse erneut einsetzen'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '13',
      weekLabel: 'Woche 91-110',
      title: 'STAATSBÜRGERSCHAFTSENTSCHEIDUNG',
      subtitle: 'Bestätigungsentscheidung zur polnischen Staatsbürgerschaft erhalten oder Berufung einlegen wenn negativ',
      detailedInfo: 'Wir erhalten die offizielle Bestätigungsentscheidung zur polnischen Staatsbürgerschaft von den Behörden. Wir senden Ihnen eine Kopie der Entscheidung und fügen sie Ihrem Portalkonto hinzu. Bei positiver Entscheidung fahren wir mit der Ausstellung des polnischen Passes fort. Bei negativer Entscheidung bereiten wir eine Berufung beim Innenministerium vor und reichen sie innerhalb der maximalen 2-Wochen-Frist ein.',
      keyPoints: [
        'Offizielle Bestätigungsentscheidung zur polnischen Staatsbürgerschaft erhalten',
        'Kopie der Entscheidung senden und Kundenportalkonto aktualisieren',
        'Bei Positiv: sofort mit Ausstellung des polnischen Passes fortfahren',
        'Bei Negativ: Berufung innerhalb von 2 Wochen vorbereiten und einreichen'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '14',
      weekLabel: 'Woche 111-115',
      title: 'POLNISCHER PASS',
      subtitle: 'Konsulatsdokumente vorbereiten, Endzahlung erheben, Besuch planen, Pass beantragen',
      detailedInfo: 'Wir bereiten alle Dokumente vor, die Sie benötigen, um Ihren polnischen Pass beim Konsulat zu beantragen. Wir erheben die Endzahlung für unsere Dienste. Wir senden alle Dokumente per FedEx. Wir planen Ihren Besuchstermin beim polnischen Konsulat. Sie beantragen den Pass beim Termin. Sie erhalten Ihren polnischen Pass (typischerweise innerhalb von 4-6 Wochen nach dem Termin).',
      keyPoints: [
        'Vollständige Konsulatsdokumentation für Passantrag vorbereiten',
        'Endzahlung für Dienste verarbeiten und Materialien per FedEx senden',
        'Offiziellen Termin beim polnischen Konsulat planen',
        'Polnischen Pass innerhalb von 4-6 Wochen nach Antragstellung erhalten'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    },
    {
      id: '15',
      weekLabel: 'Danach',
      title: 'ERWEITERTE DIENSTE',
      subtitle: 'Erweiterte rechtliche Familiendienstleistungen für Ehepartner, Kinder und weitere Familienmitglieder',
      detailedInfo: 'Sobald Sie die polnische Staatsbürgerschaft erhalten, bieten wir erweiterte rechtliche Familiendienstleistungen an. Wir bearbeiten Staatsbürgerschaftsanträge für Ihren Ehepartner unter Verwendung Ihrer neuen polnischen Staatsbürgerschaft. Wir bearbeiten Staatsbürgerschaftsanträge für alle Ihre minderjährigen und volljährigen Kinder. Wir unterstützen Eltern, Großeltern, Geschwister und andere nahe Verwandte, die sich qualifizieren könnten. Wir nutzen beschleunigte Bearbeitung für Angehörige. Wir vervollständigen die gesamte familiäre Staatsbürgerschaftsreise.',
      keyPoints: [
        'Staatsbürgerschaftsantrag des Ehepartners basierend auf Ihrer Staatsbürgerschaft bearbeiten',
        'Staatsbürgerschaftsanträge für minderjährige und volljährige Kinder verwalten',
        'Eltern, Großeltern, Geschwister und erweiterte Familie unterstützen',
        'Beschleunigte Bearbeitung für Angehörige nutzen',
        'Gesamte familiäre Staatsbürgerschaftsreise vervollständigen'
      ],
      bottomInfo: 'Klicken Sie für Details',
      ctaLabel: 'Konto eröffnen'
    }
  ],

  ru: [
    {
      id: '1',
      weekLabel: 'Неделя 1',
      title: 'ПЕРВЫЕ ШАГИ',
      subtitle: 'Первый контакт, тест на гражданство, генеалогическое древо, проверка права и консультация',
      detailedInfo: 'Первые шаги в вашем путешествии к польскому гражданству включают первоначальный контакт с нами, прохождение нашего комплексного теста на гражданство, заполнение формы генеалогического древа, проверку права на гражданство и консультацию с нашими экспертами. Эта основополагающая фаза устанавливает ваше дело и определяет путь вашей квалификации.',
      keyPoints: [
        'Первый контакт через веб-сайт, электронную почту или WhatsApp',
        'Пройти онлайн-тест на право получения польского гражданства',
        'Заполнить подробное генеалогическое древо с информацией о предках',
        'Получить проверку права и консультацию'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '2',
      weekLabel: 'Неделя 1-2',
      title: 'УСЛОВИЯ И ЦЕНЫ',
      subtitle: 'Первоначальная оценка, полная информация о процессе с ценами, подтверждение клиента и список документов',
      detailedInfo: 'После завершения проверки права мы отправляем вам по электронной почте подробную первоначальную оценку, объясняющую, имеете ли вы право на польское гражданство. Если вы подходите, мы отправляем всеобъемлющую информацию о полном процессе, включая прозрачные цены для всех этапов. После того как вы подтвердите свое решение продолжить, мы предоставляем полный список всех документов, которые вам нужно собрать. Этот этап обеспечивает полную ясность по расходам, срокам и требованиям до вашего обязательства.',
      keyPoints: [
        'Получить подробную первоначальную оценку по электронной почте',
        'Проверить полную информацию о процессе с разбивкой цен',
        'Подтвердить ваше решение продолжить подачу заявления на гражданство',
        'Получить полный список всех необходимых документов'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '3',
      weekLabel: 'Неделя 2',
      title: 'АВАНС И АККАУНТ',
      subtitle: 'Обработка авансового платежа и открытие аккаунта клиентского портала',
      detailedInfo: 'Как только вы решите двигаться вперед, мы обрабатываем ваш авансовый платеж, чтобы официально открыть дело. Одновременно мы создаем ваш персонализированный аккаунт на нашем клиентском портале, где вы будете отслеживать прогресс, загружать документы, общаться с нашей командой и получать доступ ко всем материалам дела. Этот портал становится вашим центральным узлом для всего пути к гражданству.',
      keyPoints: [
        'Обработать авансовый платеж для официального открытия вашего дела',
        'Создать персонализированный аккаунт клиентского портала для управления делом',
        'Получить доступ к безопасной панели управления для отслеживания всего прогресса и этапов',
        'Централизованная платформа для документов, коммуникации и обновлений'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '4',
      weekLabel: 'Неделя 2-3',
      title: 'ДЕТАЛИ И ДОВЕРЕННОСТИ',
      subtitle: 'Клиент предоставляет базовые данные, подготовка доверенностей и подписанные документы через FedEx',
      detailedInfo: 'Вы предоставляете необходимые данные, включая копию паспорта, текущий адрес, копию свидетельства о рождении, номер телефона и ключевую информацию о семейной истории. Наша юридическая команда готовит официальные документы доверенности, которые уполномочивают нас представлять вас в Польше. Вы подписываете эти документы доверенности и отправляете их через FedEx в наш офис в Варшаве. После получения мы можем законно действовать от вашего имени на протяжении всего процесса получения гражданства.',
      keyPoints: [
        'Отправить базовые данные: паспорт, адрес, свидетельство о рождении, телефон, семейную историю',
        'Получить профессионально подготовленные документы доверенности',
        'Подписать документы доверенности и отправить через FedEx в варшавский офис',
        'Установлена юридическая авторизация для полного представительства в Польше'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '5',
      weekLabel: 'Неделя 3-4',
      title: 'ДАННЫЕ И ЗАЯВЛЕНИЕ',
      subtitle: 'Клиент заполняет главную форму, агент ИИ генерирует документы и подает заявление',
      detailedInfo: 'Вы заполняете нашу всеобъемлющую главную форму в вашем аккаунте, которая включает все данные, необходимые для обработки полного дела. Наш агент ИИ автоматически генерирует все необходимые юридические документы на основе этой информации. Мы официально подаем ваше заявление на гражданство в польские органы. Начинается период ожидания первоначального ответа (10-18 месяцев). Мы отправляем вам копию официальной подачи заявления на польское гражданство.',
      keyPoints: [
        'Заполнить всеобъемлющую главную форму со всеми данными дела',
        'Агент ИИ автоматически генерирует всю юридическую документацию',
        'Подать официальное заявление на гражданство в польские органы',
        'Получить подтверждающую копию подачи заявления'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '6',
      weekLabel: 'Неделя 4-60',
      title: 'МЕСТНЫЕ ДОКУМЕНТЫ',
      subtitle: 'Уточнение списка документов, сбор местных документов, консультация местного агента',
      detailedInfo: 'Мы уточняем, какие именно местные документы вам нужно собрать из вашей страны проживания. Вы собираете эти жизненно важные документы, включая свидетельства о рождении, браке, акты натурализации, военные записи и т.д. Мы связываем вас с нашими глобальными партнерами в вашем регионе, которые могут помочь вам получить эти документы при необходимости. Мы получаем документы от вас или от партнеров, проверяем их и выбираем, какие перевести и подать в ваше текущее дело о гражданстве.',
      keyPoints: [
        'Получить уточненный список всех необходимых местных документов',
        'Собрать свидетельства о рождении, браке, натурализации, военные записи',
        'Связаться с нашими местными партнерами для помощи в сборе документов',
        'Экспертная проверка и выбор документов для перевода и подачи'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '7',
      weekLabel: 'Неделя 4-60',
      title: 'ПОЛЬСКИЕ ДОКУМЕНТЫ',
      subtitle: 'Поиск в польских и международных архивах, поиск в семейных владениях',
      detailedInfo: 'Мы проводим тщательные поиски в польских архивах исторических записей ваших предков. Мы также ищем в международных архивах по мере необходимости. Мы связываем вас с нашими специализированными партнерами для обработки каждого поиска. Мы направляем поиск через семейные владения для возможных старых польских документов. Мы получаем архивные документы, проверяем их и выбираем, какие возможно перевести и подать в ваше текущее дело о гражданстве.',
      keyPoints: [
        'Провести тщательные поиски в польских архивах записей о предках',
        'Искать в международных архивах по мере необходимости для дела',
        'Связаться с партнерами для специализированной обработки архивного поиска',
        'Проверить исторические документы на релевантное включение в дело'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '8',
      weekLabel: 'Неделя 5-65',
      title: 'ПЕРЕВОДЫ',
      subtitle: 'Переводы документов, сертификация с польским присяжным переводчиком, двойная проверка на ошибки',
      detailedInfo: 'Мы возможно обрабатываем переводы на нашем портале с помощью сервиса перевода ИИ. Мы сертифицируем все переводы с официальными польскими присяжными переводчиками, как того требует польское законодательство. Наш специализированный агент переводов контролирует весь процесс перевода. Независимый агент проверяет все переводы на любые ошибки. Только идеальные, сертифицированные и юридически действительные переводы подаются с вашим делом.',
      keyPoints: [
        'Обрабатывать переводы документов через портал с помощью ИИ',
        'Сертифицировать все переводы с официальными польскими присяжными переводчиками',
        'Специализированный контроль агента переводов для контроля качества',
        'Независимая проверка всех переводов на идеальную точность'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '9',
      weekLabel: 'Неделя 6-66',
      title: 'ПОДАЧА ДОКУМЕНТОВ',
      subtitle: 'Подача местных и польских документов вместе с подробной семейной информацией',
      detailedInfo: 'Мы подаем все собранные местные документы (свидетельства о рождении, браке, акты натурализации, военные записи) и польские архивные документы в органы. Вместе с этими документами мы подаем подробную и всеобъемлющую семейную информацию. Мы стараемся сделать это ДО получения первоначального ответа по заявлению на гражданство, если возможно, чтобы ускорить общий процесс.',
      keyPoints: [
        'Подать все сертифицированные местные документы в польские органы',
        'Подать исторические польские документы, полученные из архивов',
        'Представить подробную и всеобъемлющую семейную информацию',
        'Завершить подачу документов до первоначального ответа, если возможно'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '10',
      weekLabel: 'Неделя 7-67',
      title: 'ГРАЖДАНСКИЕ АКТЫ',
      subtitle: 'Подготовка заявлений на польские гражданские акты, оплата гражданских актов и подача',
      detailedInfo: 'Мы готовим заявления на польские гражданские акты (свидетельства о рождении и браке польских предков). Этот процесс контролируется нашим специализированным агентом гражданских актов. Мы взимаем плату за обработку польских гражданских актов. Мы подаем заявления в соответствующее польское управление записи актов гражданского состояния. Мы получаем официальные польские свидетельства о рождении и браке, когда они готовы.',
      keyPoints: [
        'Профессионально подготовить заявления на польские гражданские акты',
        'Специализированный контроль агента гражданских актов для процесса',
        'Обработать оплату сборов за заявления на гражданские акты',
        'Получить официальные свидетельства о рождении и браке из польских записей'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '11',
      weekLabel: 'Неделя 50-70',
      title: 'ПЕРВОНАЧАЛЬНЫЙ ОТВЕТ',
      subtitle: 'Получить первоначальный ответ от Мазовецкого воеводства, оценка требований, письмо клиенту',
      detailedInfo: 'Мы получаем ПЕРВОНАЧАЛЬНЫЙ ОТВЕТ от офиса Мазовецкого воеводы по вашему делу о польском гражданстве. Мы тщательно оцениваем требования, выдвинутые правительством. Мы отправляем вам копию письма с подробными объяснениями. Мы продлеваем срок процедуры гражданства по мере необходимости. Мы ожидаем дополнительные доказательства (документы и информацию) от вас по запросу органов.',
      keyPoints: [
        'Получить официальный первоначальный ответ от Мазовецкого воеводства',
        'Экспертный анализ всех правительственных требований и запросов',
        'Отправить копию ответа с подробными объяснениями клиенту',
        'Управлять продлениями сроков и запросами дополнительных доказательств'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '12',
      weekLabel: 'Неделя 71-90',
      title: 'СХЕМЫ ПОДТАЛКИВАНИЯ',
      subtitle: 'Предложение схем PUSH/NUDGE/SIT-DOWN, объяснение деталей, обработка платежей, внедрение',
      detailedInfo: 'Мы предлагаем клиенту наши схемы подталкивания: PUSH (базовое давление), NUDGE (регулярные напоминания) и SIT-DOWN (личные встречи с чиновниками). Мы объясняем каждую схему подробно, включая расходы и ожидаемые выгоды. Мы обрабатываем платежи за выбранные схемы. Мы внедряем схемы на практике, связываясь с правительственными чиновниками. Мы получаем 2-й ответ от правительства. Мы внедряем схемы снова по мере необходимости для непрерывного прогресса.',
      keyPoints: [
        'Объяснить схемы PUSH, NUDGE и SIT-DOWN клиенту с деталями цен',
        'Обработать платежи за выбранные схемы подталкивания',
        'Внедрить стратегический контакт с правительственными чиновниками',
        'Внедрить схемы снова по мере необходимости для оптимальных результатов'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '13',
      weekLabel: 'Неделя 91-110',
      title: 'РЕШЕНИЕ О ГРАЖДАНСТВЕ',
      subtitle: 'Получить решение о подтверждении польского гражданства или подать апелляцию при отрицательном результате',
      detailedInfo: 'Мы получаем официальное решение о подтверждении польского гражданства от органов. Мы отправляем вам копию решения и добавляем ее в ваш аккаунт портала. При положительном решении мы переходим к выдаче польского паспорта. При отрицательном решении мы готовим и подаем апелляцию в Министерство внутренних дел в течение максимального срока 2 недели.',
      keyPoints: [
        'Получить официальное решение о подтверждении польского гражданства',
        'Отправить копию решения и обновить аккаунт клиентского портала',
        'При положительном: немедленно перейти к выдаче польского паспорта',
        'При отрицательном: подготовить и подать апелляцию в течение 2 недель'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '14',
      weekLabel: 'Неделя 111-115',
      title: 'ПОЛЬСКИЙ ПАСПОРТ',
      subtitle: 'Подготовить консульские документы, взять финальный платеж, запланировать визит, подать на паспорт',
      detailedInfo: 'Мы готовим все документы, необходимые для подачи на ваш польский паспорт в консульстве. Мы взимаем финальный платеж за наши услуги. Мы отправляем все документы через FedEx. Мы планируем ваш визит в польское консульство. Вы подаете на паспорт на встрече. Вы получаете ваш польский паспорт (обычно в течение 4-6 недель после встречи).',
      keyPoints: [
        'Подготовить полную консульскую документацию для заявления на паспорт',
        'Обработать финальный платеж за услуги и отправить материалы через FedEx',
        'Запланировать официальную встречу в польском консульстве',
        'Получить польский паспорт в течение 4-6 недель после подачи'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    },
    {
      id: '15',
      weekLabel: 'После',
      title: 'РАСШИРЕННЫЕ УСЛУГИ',
      subtitle: 'Расширенные семейные юридические услуги для супруга, детей и дополнительных членов семьи',
      detailedInfo: 'После получения польского гражданства мы предлагаем расширенные семейные юридические услуги. Мы обрабатываем заявления на гражданство для вашего супруга, используя ваше новое польское гражданство. Мы обрабатываем заявления на гражданство для всех ваших несовершеннолетних и совершеннолетних детей. Мы помогаем родителям, бабушкам и дедушкам, братьям и сестрам и другим близким родственникам, которые могут квалифицироваться. Мы используем ускоренную обработку для иждивенцев. Мы завершаем полное семейное путешествие к гражданству.',
      keyPoints: [
        'Обработать заявление супруга на гражданство на основе вашего гражданства',
        'Управлять заявлениями на гражданство для несовершеннолетних и совершеннолетних детей',
        'Помогать родителям, бабушкам и дедушкам, братьям и сестрам и расширенной семье',
        'Использовать ускоренную обработку для иждивенцев',
        'Завершить полное семейное путешествие к гражданству'
      ],
      bottomInfo: 'Нажмите для просмотра деталей',
      ctaLabel: 'Открыть аккаунт'
    }
  ],

  uk: [
    {
      id: '1',
      weekLabel: 'Тиждень 1',
      title: 'ПЕРШІ КРОКИ',
      subtitle: 'Перший контакт, тест на громадянство, генеалогічне дерево, перевірка права та консультація',
      detailedInfo: 'Перші кроки у вашій подорожі до польського громадянства включають початковий контакт з нами, проходження нашого комплексного тесту на громадянство, заповнення форми генеалогічного дерева, перевірку права на громадянство та консультацію з нашими експертами. Ця фундаментальна фаза встановлює вашу справу та визначає шлях вашої кваліфікації.',
      keyPoints: [
        'Перший контакт через веб-сайт, електронну пошту або WhatsApp',
        'Пройти онлайн-тест на право отримання польського громадянства',
        'Заповнити детальне генеалогічне дерево з інформацією про предків',
        'Отримати перевірку права та консультацію'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '2',
      weekLabel: 'Тиждень 1-2',
      title: 'УМОВИ ТА ЦІНИ',
      subtitle: 'Початкова оцінка, повна інформація про процес з цінами, підтвердження клієнта та список документів',
      detailedInfo: 'Після завершення перевірки права ми надсилаємо вам електронною поштою детальну початкову оцінку, що пояснює, чи маєте ви право на польське громадянство. Якщо ви підходите, ми надсилаємо всеохоплюючу інформацію про повний процес, включаючи прозорі ціни для всіх етапів. Після того як ви підтвердите своє рішення продовжити, ми надаємо повний список усіх документів, які вам потрібно зібрати. Цей етап забезпечує повну ясність щодо витрат, термінів та вимог до вашого зобов\'язання.',
      keyPoints: [
        'Отримати детальну початкову оцінку електронною поштою',
        'Перевірити повну інформацію про процес з розбивкою цін',
        'Підтвердити ваше рішення продовжити подачу заяви на громадянство',
        'Отримати повний список усіх необхідних документів'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '3',
      weekLabel: 'Тиждень 2',
      title: 'АВАНС ТА АКАУНТ',
      subtitle: 'Обробка авансового платежу та відкриття акаунта клієнтського порталу',
      detailedInfo: 'Як тільки ви вирішите рухатися вперед, ми обробляємо ваш авансовий платіж, щоб офіційно відкрити справу. Одночасно ми створюємо ваш персоналізований акаунт на нашому клієнтському порталі, де ви будете відстежувати прогрес, завантажувати документи, спілкуватися з нашою командою та отримувати доступ до всіх матеріалів справи. Цей портал стає вашим центральним вузлом для всього шляху до громадянства.',
      keyPoints: [
        'Обробити авансовий платіж для офіційного відкриття вашої справи',
        'Створити персоналізований акаунт клієнтського порталу для управління справою',
        'Отримати доступ до безпечної панелі керування для відстеження всього прогресу та етапів',
        'Централізована платформа для документів, комунікації та оновлень'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '4',
      weekLabel: 'Тиждень 2-3',
      title: 'ДЕТАЛІ ТА ДОВІРЕНОСТІ',
      subtitle: 'Клієнт надає базові дані, підготовка довіреностей та підписані документи через FedEx',
      detailedInfo: 'Ви надаєте необхідні дані, включаючи копію паспорта, поточну адресу, копію свідоцтва про народження, номер телефону та ключову інформацію про сімейну історію. Наша юридична команда готує офіційні документи довіреності, які уповноважують нас представляти вас у Польщі. Ви підписуєте ці документи довіреності та відправляєте їх через FedEx до нашого офісу у Варшаві. Після отримання ми можемо законно діяти від вашого імені протягом усього процесу отримання громадянства.',
      keyPoints: [
        'Відправити базові дані: паспорт, адресу, свідоцтво про народження, телефон, сімейну історію',
        'Отримати професійно підготовлені документи довіреності',
        'Підписати документи довіреності та відправити через FedEx до варшавського офісу',
        'Встановлена юридична авторизація для повного представництва в Польщі'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '5',
      weekLabel: 'Тиждень 3-4',
      title: 'ДАНІ ТА ЗАЯВА',
      subtitle: 'Клієнт заповнює головну форму, агент ШІ генерує документи та подає заяву',
      detailedInfo: 'Ви заповнюєте нашу всеохоплюючу головну форму у вашому акаунті, яка включає всі дані, необхідні для обробки повної справи. Наш агент ШІ автоматично генерує всі необхідні юридичні документи на основі цієї інформації. Ми офіційно подаємо вашу заяву на громадянство до польських органів. Починається період очікування початкової відповіді (10-18 місяців). Ми надсилаємо вам копію офіційної подачі заяви на польське громадянство.',
      keyPoints: [
        'Заповнити всеохоплюючу головну форму з усіма даними справи',
        'Агент ШІ автоматично генерує всю юридичну документацію',
        'Подати офіційну заяву на громадянство до польських органів',
        'Отримати підтверджуючу копію подачі заяви'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '6',
      weekLabel: 'Тиждень 4-60',
      title: 'МІСЦЕВІ ДОКУМЕНТИ',
      subtitle: 'Уточнення списку документів, збір місцевих документів, консультація місцевого агента',
      detailedInfo: 'Ми уточнюємо, які саме місцеві документи вам потрібно зібрати з вашої країни проживання. Ви збираєте ці життєво важливі документи, включаючи свідоцтва про народження, шлюб, акти натуралізації, військові записи тощо. Ми з\'єднуємо вас з нашими глобальними партнерами у вашому регіоні, які можуть допомогти вам отримати ці документи за необхідності. Ми отримуємо документи від вас або від партнерів, перевіряємо їх та вибираємо, які перекласти та подати у вашу поточну справу про громадянство.',
      keyPoints: [
        'Отримати уточнений список усіх необхідних місцевих документів',
        'Зібрати свідоцтва про народження, шлюб, натуралізацію, військові записи',
        'Зв\'язатися з нашими місцевими партнерами для допомоги у зборі документів',
        'Експертна перевірка та вибір документів для перекладу та подачі'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '7',
      weekLabel: 'Тиждень 4-60',
      title: 'ПОЛЬСЬКІ ДОКУМЕНТИ',
      subtitle: 'Пошук у польських та міжнародних архівах, пошук у сімейних володіннях',
      detailedInfo: 'Ми проводимо ретельні пошуки в польських архівах історичних записів ваших предків. Ми також шукаємо в міжнародних архівах за необхідності. Ми з\'єднуємо вас з нашими спеціалізованими партнерами для обробки кожного пошуку. Ми направляємо пошук через сімейні володіння для можливих старих польських документів. Ми отримуємо архівні документи, перевіряємо їх та вибираємо, які можливо перекласти та подати у вашу поточну справу про громадянство.',
      keyPoints: [
        'Провести ретельні пошуки в польських архівах записів про предків',
        'Шукати в міжнародних архівах за необхідності для справи',
        'Зв\'язатися з партнерами для спеціалізованої обробки архівного пошуку',
        'Перевірити історичні документи на релевантне включення у справу'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '8',
      weekLabel: 'Тиждень 5-65',
      title: 'ПЕРЕКЛАДИ',
      subtitle: 'Переклади документів, сертифікація з польським присяжним перекладачем, подвійна перевірка на помилки',
      detailedInfo: 'Ми можливо обробляємо переклади на нашому порталі за допомогою сервісу перекладу ШІ. Ми сертифікуємо всі переклади з офіційними польськими присяжними перекладачами, як того вимагає польське законодавство. Наш спеціалізований агент перекладів контролює весь процес перекладу. Незалежний агент перевіряє всі переклади на будь-які помилки. Тільки ідеальні, сертифіковані та юридично дійсні переклади подаються з вашою справою.',
      keyPoints: [
        'Обробляти переклади документів через портал за допомогою ШІ',
        'Сертифікувати всі переклади з офіційними польськими присяжними перекладачами',
        'Спеціалізований контроль агента перекладів для контролю якості',
        'Незалежна перевірка всіх перекладів на ідеальну точність'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '9',
      weekLabel: 'Тиждень 6-66',
      title: 'ПОДАЧА ДОКУМЕНТІВ',
      subtitle: 'Подача місцевих та польських документів разом з детальною сімейною інформацією',
      detailedInfo: 'Ми подаємо всі зібрані місцеві документи (свідоцтва про народження, шлюб, акти натуралізації, військові записи) та польські архівні документи до органів. Разом з цими документами ми подаємо детальну та всеохоплюючу сімейну інформацію. Ми намагаємося зробити це ДО отримання початкової відповіді по заяві на громадянство, якщо можливо, щоб прискорити загальний процес.',
      keyPoints: [
        'Подати всі сертифіковані місцеві документи до польських органів',
        'Подати історичні польські документи, отримані з архівів',
        'Представити детальну та всеохоплюючу сімейну інформацію',
        'Завершити подачу документів до початкової відповіді, якщо можливо'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '10',
      weekLabel: 'Тиждень 7-67',
      title: 'ЦИВІЛЬНІ АКТИ',
      subtitle: 'Підготовка заяв на польські цивільні акти, оплата цивільних актів та подача',
      detailedInfo: 'Ми готуємо заяви на польські цивільні акти (свідоцтва про народження та шлюб польських предків). Цей процес контролюється нашим спеціалізованим агентом цивільних актів. Ми стягуємо плату за обробку польських цивільних актів. Ми подаємо заяви до відповідного польського управління запису актів цивільного стану. Ми отримуємо офіційні польські свідоцтва про народження та шлюб, коли вони готові.',
      keyPoints: [
        'Професійно підготувати заяви на польські цивільні акти',
        'Спеціалізований контроль агента цивільних актів для процесу',
        'Обробити оплату зборів за заяви на цивільні акти',
        'Отримати офіційні свідоцтва про народження та шлюб з польських записів'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '11',
      weekLabel: 'Тиждень 50-70',
      title: 'ПОЧАТКОВА ВІДПОВІДЬ',
      subtitle: 'Отримати початкову відповідь від Мазовецького воєводства, оцінка вимог, лист клієнту',
      detailedInfo: 'Ми отримуємо ПОЧАТКОВУ ВІДПОВІДЬ від офісу Мазовецького воєводи по вашій справі про польське громадянство. Ми ретельно оцінюємо вимоги, висунуті урядом. Ми надсилаємо вам копію листа з детальними поясненнями. Ми продовжуємо термін процедури громадянства за необхідності. Ми очікуємо додаткові докази (документи та інформацію) від вас за запитом органів.',
      keyPoints: [
        'Отримати офіційну початкову відповідь від Мазовецького воєводства',
        'Експертний аналіз усіх урядових вимог та запитів',
        'Відправити копію відповіді з детальними поясненнями клієнту',
        'Управляти продовженнями термінів та запитами додаткових доказів'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '12',
      weekLabel: 'Тиждень 71-90',
      title: 'СХЕМИ ПІДШТОВХУВАННЯ',
      subtitle: 'Пропозиція схем PUSH/NUDGE/SIT-DOWN, пояснення деталей, обробка платежів, впровадження',
      detailedInfo: 'Ми пропонуємо клієнту наші схеми підштовхування: PUSH (базовий тиск), NUDGE (регулярні нагадування) та SIT-DOWN (особисті зустрічі з чиновниками). Ми пояснюємо кожну схему детально, включаючи витрати та очікувані вигоди. Ми обробляємо платежі за обрані схеми. Ми впроваджуємо схеми на практиці, зв\'язуючись з урядовими чиновниками. Ми отримуємо 2-гу відповідь від уряду. Ми впроваджуємо схеми знову за необхідності для безперервного прогресу.',
      keyPoints: [
        'Пояснити схеми PUSH, NUDGE та SIT-DOWN клієнту з деталями цін',
        'Обробити платежі за обрані схеми підштовхування',
        'Впровадити стратегічний контакт з урядовими чиновниками',
        'Впровадити схеми знову за необхідності для оптимальних результатів'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '13',
      weekLabel: 'Тиждень 91-110',
      title: 'РІШЕННЯ ПРО ГРОМАДЯНСТВО',
      subtitle: 'Отримати рішення про підтвердження польського громадянства або подати апеляцію при негативному результаті',
      detailedInfo: 'Ми отримуємо офіційне рішення про підтвердження польського громадянства від органів. Ми надсилаємо вам копію рішення та додаємо її до вашого акаунта порталу. При позитивному рішенні ми переходимо до видачі польського паспорта. При негативному рішенні ми готуємо та подаємо апеляцію до Міністерства внутрішніх справ протягом максимального терміну 2 тижні.',
      keyPoints: [
        'Отримати офіційне рішення про підтвердження польського громадянства',
        'Відправити копію рішення та оновити акаунт клієнтського порталу',
        'При позитивному: негайно перейти до видачі польського паспорта',
        'При негативному: підготувати та подати апеляцію протягом 2 тижнів'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '14',
      weekLabel: 'Тиждень 111-115',
      title: 'ПОЛЬСЬКИЙ ПАСПОРТ',
      subtitle: 'Підготувати консульські документи, стягнути фінальний платіж, запланувати візит, подати на паспорт',
      detailedInfo: 'Ми готуємо всі документи, необхідні для подачі на ваш польський паспорт у консульстві. Ми стягуємо фінальний платіж за наші послуги. Ми відправляємо всі документи через FedEx. Ми плануємо ваш візит до польського консульства. Ви подаєте на паспорт на зустрічі. Ви отримуєте ваш польський паспорт (зазвичай протягом 4-6 тижнів після зустрічі).',
      keyPoints: [
        'Підготувати повну консульську документацію для заяви на паспорт',
        'Обробити фінальний платіж за послуги та відправити матеріали через FedEx',
        'Запланувати офіційну зустріч у польському консульстві',
        'Отримати польський паспорт протягом 4-6 тижнів після подачі'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    },
    {
      id: '15',
      weekLabel: 'Після',
      title: 'РОЗШИРЕНІ ПОСЛУГИ',
      subtitle: 'Розширені сімейні юридичні послуги для подружжя, дітей та додаткових членів сім\'ї',
      detailedInfo: 'Після отримання польського громадянства ми пропонуємо розширені сімейні юридичні послуги. Ми обробляємо заяви на громадянство для вашого подружжя, використовуючи ваше нове польське громадянство. Ми обробляємо заяви на громадянство для всіх ваших неповнолітніх та повнолітніх дітей. Ми допомагаємо батькам, бабусям та дідусям, братам та сестрам та іншим близьким родичам, які можуть кваліфікуватися. Ми використовуємо прискорену обробку для утриманців. Ми завершуємо повну сімейну подорож до громадянства.',
      keyPoints: [
        'Обробити заяву подружжя на громадянство на основі вашого громадянства',
        'Управляти заявами на громадянство для неповнолітніх та повнолітніх дітей',
        'Допомагати батькам, бабусям та дідусям, братам та сестрам та розширеній сім\'ї',
        'Використовувати прискорену обробку для утриманців',
        'Завершити повну сімейну подорож до громадянства'
      ],
      bottomInfo: 'Натисніть для перегляду деталей',
      ctaLabel: 'Відкрити акаунт'
    }
  ],

  // ... keep existing pt, fr, he translations
};
