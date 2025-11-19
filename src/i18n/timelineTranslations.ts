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

  // Spanish, German, Russian, Ukrainian - use English as fallback
  es: [], // Will be filled with English
  de: [], // Will be filled with English
  ru: [], // Will be filled with English
  uk: []  // Will be filled with English
};

// Fill missing languages with English content
const englishSteps = TIMELINE_TRANSLATIONS.en;
TIMELINE_TRANSLATIONS.es = englishSteps;
TIMELINE_TRANSLATIONS.de = englishSteps;
TIMELINE_TRANSLATIONS.ru = englishSteps;
TIMELINE_TRANSLATIONS.uk = englishSteps;
