import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit Application',
      saveProgress: 'Save Progress',
      
      // Steps
      step: 'Step',
      of: 'of',
      steps: {
        basicInfo: 'Basic Information',
        contact: 'Contact Details',
        passport: 'Passport',
        family: 'Family Background',
        polishConnection: 'Polish Connection',
        additional: 'Additional Information',
        review: 'Review & Submit',
      },
      
      // Common fields
      firstName: 'First Name(s)',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth',
      sex: 'Sex',
      male: 'Male',
      female: 'Female',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Street Address',
      city: 'City',
      state: 'State/Province',
      zipCode: 'ZIP/Postal Code',
      country: 'Country',
      
      // Passport
      passportNumber: 'Passport Number',
      passportIssueDate: 'Issue Date',
      passportExpiryDate: 'Expiry Date',
      passportCountry: 'Issuing Country',
      
      // Family
      fatherName: "Father's Full Name",
      motherName: "Mother's Full Name",
      maritalStatus: 'Marital Status',
      single: 'Single',
      married: 'Married',
      divorced: 'Divorced',
      widowed: 'Widowed',
      
      // Polish Connection
      polishAncestor: 'Do you have Polish ancestors?',
      ancestorDetails: 'Please provide details about your Polish ancestor(s)',
      polishDocuments: 'Do you have any Polish documents?',
      
      // Options
      yes: 'Yes',
      no: 'No',
      dontKnow: "I don't know",
      optional: '(Optional)',
      required: 'Required',
      
      // Messages
      progressSaved: 'Progress saved successfully',
      submitting: 'Submitting your application...',
      submitted: 'Application submitted successfully!',
      error: 'An error occurred. Please try again.',
      pleaseComplete: 'Please complete all required fields',
      
      // Navigation - Demo
      nav: {
        register: 'Register / Login',
        signOut: 'Sign Out',
        navigation: 'Navigation'
      },
      
      // About Section - Demo
      about: {
        badge: 'Legal Expertise Since 2003',
        title: 'Why Choose Us for Your Polish Citizenship Journey?',
        description: 'We bring two decades of specialized experience in Polish citizenship law, combining traditional legal expertise with cutting-edge AI technology to streamline your path to obtaining Polish and EU citizenship through ancestry.',
        card1Title: 'Expert Legal Guidance',
        card1Text: 'Our team specializes exclusively in Polish citizenship by descent cases, with an unmatched 100% success rate across 20,000+ cases. We know every detail of the process.',
        card2Title: 'AI-Powered Efficiency',
        card2Text: 'Leverage our proprietary AI systems that analyze your eligibility, predict timelines, and automate document processing - reducing typical processing time by 40%.',
        card3Title: 'Lifetime EU Benefits',
        card3Text: 'Gain full Polish citizenship and EU passport rights - live, work, study anywhere in the EU. Pass citizenship to your descendants forever.',
        cta: 'Take Polish Citizenship Test'
      },
      
      // Services Section - Demo
      services: {
        badge: 'Next-Gen Legal Services',
        title: 'Comprehensive Citizenship Solutions',
        description: 'End-to-end support powered by AI and legal expertise',
        service1Title: 'AI Eligibility Analysis',
        service1Desc: 'Instant analysis of your family tree and documents to determine citizenship eligibility with 99.9% accuracy.',
        service2Title: 'Document Collection',
        service2Desc: 'We handle all archival research, birth certificates, marriage records, and historical document gathering across Poland.',
        service3Title: 'Application Processing',
        service3Desc: 'Expert preparation and submission of all citizenship applications with real-time tracking and status updates.',
        service4Title: 'Legal Representation',
        service4Desc: 'Full Power of Attorney services with certified translations and official government correspondence.',
        service5Title: 'Archive Research',
        service5Desc: 'Deep dive into Polish state archives, Jewish historical societies, and international databases for ancestral records.',
        service6Title: 'Passport Assistance',
        service6Desc: 'Complete support for obtaining your Polish passport and PESEL number after citizenship confirmation.',
        cta: 'Take Polish Citizenship Test'
      },
      
      // Footer - Demo
      footer: {
        description: 'Expert legal guidance for people of Polish and Polish-Jewish descent from around the world. Unmatched 100% success rate, realistic timelines, transparent pricing. Since 2003.',
        servicesTitle: 'Services',
        resourcesTitle: 'Resources',
        aiAnalysis: 'AI Analysis',
        legalGuidance: 'Legal Guidance',
        documentProcessing: 'Document Processing',
        pricing: 'Pricing',
        takeTest: 'Take Test',
        familyTree: 'Family Tree',
        aboutProcess: 'About Process',
        contact: 'Contact',
        copyright: 'PolishCitizenship.pl - Expert Legal Services Since 2003',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        contactUs: 'Contact Us'
      }
    },
  },
  es: {
    translation: {
      nav: {
        register: 'Registrarse / Iniciar Sesión',
        signOut: 'Cerrar Sesión',
        navigation: 'Navegación'
      },
      about: {
        badge: 'Experiencia Legal Desde 2003',
        title: '¿Por Qué Elegirnos para Tu Proceso de Ciudadanía Polaca?',
        description: 'Aportamos dos décadas de experiencia especializada en derecho de ciudadanía polaca, combinando experiencia legal tradicional con tecnología de IA de vanguardia para agilizar tu camino hacia la obtención de ciudadanía polaca y de la UE por ascendencia.',
        card1Title: 'Orientación Legal Experta',
        card1Text: 'Nuestro equipo se especializa exclusivamente en casos de ciudadanía polaca por descendencia, con una tasa de éxito incomparable del 100% en más de 20,000 casos. Conocemos cada detalle del proceso.',
        card2Title: 'Eficiencia Impulsada por IA',
        card2Text: 'Aprovecha nuestros sistemas de IA propietarios que analizan tu elegibilidad, predicen plazos y automatizan el procesamiento de documentos, reduciendo el tiempo de procesamiento típico en un 40%.',
        card3Title: 'Beneficios de la UE de por Vida',
        card3Text: 'Obtén ciudadanía polaca completa y derechos de pasaporte de la UE: vive, trabaja, estudia en cualquier lugar de la UE. Transmite la ciudadanía a tus descendientes para siempre.',
        cta: 'Realizar Test de Ciudadanía Polaca'
      },
      services: {
        badge: 'Servicios Legales de Nueva Generación',
        title: 'Soluciones Integrales de Ciudadanía',
        description: 'Apoyo de principio a fin impulsado por IA y experiencia legal',
        service1Title: 'Análisis de Elegibilidad con IA',
        service1Desc: 'Análisis instantáneo de tu árbol genealógico y documentos para determinar la elegibilidad de ciudadanía con un 99.9% de precisión.',
        service2Title: 'Recopilación de Documentos',
        service2Desc: 'Manejamos toda la investigación de archivos, certificados de nacimiento, registros matrimoniales y recopilación de documentos históricos en toda Polonia.',
        service3Title: 'Procesamiento de Solicitudes',
        service3Desc: 'Preparación y presentación experta de todas las solicitudes de ciudadanía con seguimiento en tiempo real y actualizaciones de estado.',
        service4Title: 'Representación Legal',
        service4Desc: 'Servicios completos de poder notarial con traducciones certificadas y correspondencia oficial del gobierno.',
        service5Title: 'Investigación de Archivos',
        service5Desc: 'Investigación profunda en archivos estatales polacos, sociedades históricas judías y bases de datos internacionales para registros ancestrales.',
        service6Title: 'Asistencia con Pasaporte',
        service6Desc: 'Apoyo completo para obtener tu pasaporte polaco y número PESEL después de la confirmación de ciudadanía.',
        cta: 'Comienza Tu Viaje'
      },
      footer: {
        description: 'Orientación legal experta para personas de ascendencia polaca y judío-polaca de todo el mundo. Tasa de éxito incomparable del 100%, plazos realistas, precios transparentes. Desde 2003.',
        servicesTitle: 'Servicios',
        resourcesTitle: 'Recursos',
        aiAnalysis: 'Análisis IA',
        legalGuidance: 'Orientación Legal',
        documentProcessing: 'Procesamiento de Documentos',
        pricing: 'Precios',
        takeTest: 'Hacer Test',
        familyTree: 'Árbol Genealógico',
        aboutProcess: 'Sobre el Proceso',
        contact: 'Contacto',
        copyright: 'PolishCitizenship.pl - Servicios Legales Expertos Desde 2003',
        privacy: 'Política de Privacidad',
        terms: 'Términos de Servicio',
        contactUs: 'Contáctanos'
      }
    }
  },
  pt: {
    translation: {
      nav: {
        register: 'Registrar / Entrar',
        signOut: 'Sair',
        navigation: 'Navegação'
      },
      about: {
        badge: 'Experiência Jurídica Desde 2003',
        title: 'Por Que Nos Escolher para Sua Jornada de Cidadania Polonesa?',
        description: 'Trazemos duas décadas de experiência especializada em lei de cidadania polonesa, combinando expertise jurídica tradicional com tecnologia de IA de ponta para agilizar seu caminho para obter cidadania polonesa e da UE por ancestralidade.',
        card1Title: 'Orientação Jurídica Especializada',
        card1Text: 'Nossa equipe se especializa exclusivamente em casos de cidadania polonesa por descendência, com uma taxa de sucesso incomparável de 100% em mais de 20.000 casos. Conhecemos cada detalhe do processo.',
        card2Title: 'Eficiência Impulsionada por IA',
        card2Text: 'Aproveite nossos sistemas de IA proprietários que analisam sua elegibilidade, preveem cronogramas e automatizam o processamento de documentos - reduzindo o tempo típico de processamento em 40%.',
        card3Title: 'Benefícios Vitalícios da UE',
        card3Text: 'Obtenha cidadania polonesa completa e direitos de passaporte da UE - viva, trabalhe, estude em qualquer lugar da UE. Transmita a cidadania aos seus descendentes para sempre.',
        cta: 'Fazer Teste de Cidadania Polonesa'
      },
      services: {
        badge: 'Serviços Jurídicos de Nova Geração',
        title: 'Soluções Abrangentes de Cidadania',
        description: 'Suporte completo impulsionado por IA e expertise jurídica',
        service1Title: 'Análise de Elegibilidade por IA',
        service1Desc: 'Análise instantânea de sua árvore genealógica e documentos para determinar elegibilidade de cidadania com 99,9% de precisão.',
        service2Title: 'Coleta de Documentos',
        service2Desc: 'Cuidamos de toda pesquisa de arquivo, certidões de nascimento, registros de casamento e coleta de documentos históricos em toda a Polônia.',
        service3Title: 'Processamento de Solicitação',
        service3Desc: 'Preparação e submissão especializada de todas as solicitações de cidadania com rastreamento em tempo real e atualizações de status.',
        service4Title: 'Representação Legal',
        service4Desc: 'Serviços completos de procuração com traduções certificadas e correspondência oficial do governo.',
        service5Title: 'Pesquisa de Arquivo',
        service5Desc: 'Investigação profunda em arquivos estatais poloneses, sociedades históricas judaicas e bancos de dados internacionais para registros ancestrais.',
        service6Title: 'Assistência com Passaporte',
        service6Desc: 'Suporte completo para obter seu passaporte polonês e número PESEL após confirmação de cidadania.',
        cta: 'Comece Sua Jornada'
      },
      footer: {
        description: 'Orientação jurídica especializada para pessoas de descendência polonesa e judaico-polonesa de todo o mundo. Taxa de sucesso incomparável de 100%, cronogramas realistas, preços transparentes. Desde 2003.',
        servicesTitle: 'Serviços',
        resourcesTitle: 'Recursos',
        aiAnalysis: 'Análise IA',
        legalGuidance: 'Orientação Jurídica',
        documentProcessing: 'Processamento de Documentos',
        pricing: 'Preços',
        takeTest: 'Fazer Teste',
        familyTree: 'Árvore Genealógica',
        aboutProcess: 'Sobre o Processo',
        contact: 'Contato',
        copyright: 'PolishCitizenship.pl - Serviços Jurídicos Especializados Desde 2003',
        privacy: 'Política de Privacidade',
        terms: 'Termos de Serviço',
        contactUs: 'Entre em Contato'
      }
    }
  },
  de: {
    translation: {
      nav: {
        register: 'Registrieren / Anmelden',
        signOut: 'Abmelden',
        navigation: 'Navigation'
      },
      about: {
        badge: 'Rechtliche Expertise Seit 2003',
        title: 'Warum Uns für Ihre Polnische Staatsbürgerschaft Wählen?',
        description: 'Wir bringen zwei Jahrzehnte spezialisierter Erfahrung im polnischen Staatsbürgerschaftsrecht mit und kombinieren traditionelle juristische Expertise mit modernster KI-Technologie, um Ihren Weg zur polnischen und EU-Staatsbürgerschaft durch Abstammung zu optimieren.',
        card1Title: 'Expertenberatung',
        card1Text: 'Unser Team spezialisiert sich ausschließlich auf Fälle polnischer Staatsbürgerschaft durch Abstammung, mit einer unübertroffenen Erfolgsquote von 100% bei über 20.000 Fällen. Wir kennen jedes Detail des Prozesses.',
        card2Title: 'KI-Gestützte Effizienz',
        card2Text: 'Nutzen Sie unsere proprietären KI-Systeme, die Ihre Berechtigung analysieren, Zeitpläne vorhersagen und die Dokumentenverarbeitung automatisieren - wodurch die typische Bearbeitungszeit um 40% reduziert wird.',
        card3Title: 'Lebenslange EU-Vorteile',
        card3Text: 'Erhalten Sie die volle polnische Staatsbürgerschaft und EU-Passrechte - leben, arbeiten, studieren Sie überall in der EU. Geben Sie die Staatsbürgerschaft für immer an Ihre Nachkommen weiter.',
        cta: 'Polnischen Staatsbürgerschaftstest Machen'
      },
      services: {
        badge: 'Rechtsdienstleistungen der Nächsten Generation',
        title: 'Umfassende Staatsbürgerschaftslösungen',
        description: 'End-to-End-Unterstützung durch KI und rechtliche Expertise',
        service1Title: 'KI-Berechtigungsanalyse',
        service1Desc: 'Sofortige Analyse Ihres Stammbaums und Ihrer Dokumente zur Bestimmung der Staatsbürgerschaftsberechtigung mit 99,9% Genauigkeit.',
        service2Title: 'Dokumentensammlung',
        service2Desc: 'Wir übernehmen alle Archivrecherchen, Geburtsurkunden, Heiratsurkunden und das Sammeln historischer Dokumente in ganz Polen.',
        service3Title: 'Antragsbearbeitung',
        service3Desc: 'Fachgerechte Vorbereitung und Einreichung aller Staatsbürgerschaftsanträge mit Echtzeit-Tracking und Statusaktualisierungen.',
        service4Title: 'Rechtsvertretung',
        service4Desc: 'Vollständige Vollmachtsdienste mit beglaubigten Übersetzungen und offizieller Regierungskorrespondenz.',
        service5Title: 'Archivrecherche',
        service5Desc: 'Tiefgehende Recherche in polnischen Staatsarchiven, jüdischen Geschichtsvereinen und internationalen Datenbanken für Ahnenunterlagen.',
        service6Title: 'Passunterstützung',
        service6Desc: 'Vollständige Unterstützung bei der Erlangung Ihres polnischen Passes und Ihrer PESEL-Nummer nach Bestätigung der Staatsbürgerschaft.',
        cta: 'Starten Sie Ihre Reise'
      },
      footer: {
        description: 'Fachkundige Rechtsberatung für Menschen polnischer und polnisch-jüdischer Abstammung aus der ganzen Welt. Unübertroffene 100% Erfolgsquote, realistische Zeitpläne, transparente Preise. Seit 2003.',
        servicesTitle: 'Dienstleistungen',
        resourcesTitle: 'Ressourcen',
        aiAnalysis: 'KI-Analyse',
        legalGuidance: 'Rechtsberatung',
        documentProcessing: 'Dokumentenverarbeitung',
        pricing: 'Preise',
        takeTest: 'Test Machen',
        familyTree: 'Stammbaum',
        aboutProcess: 'Über den Prozess',
        contact: 'Kontakt',
        copyright: 'PolishCitizenship.pl - Fachkundige Rechtsdienstleistungen Seit 2003',
        privacy: 'Datenschutz',
        terms: 'Nutzungsbedingungen',
        contactUs: 'Kontaktieren Sie Uns'
      }
    }
  },
  fr: {
    translation: {
      nav: {
        register: "S'inscrire / Se Connecter",
        signOut: 'Se Déconnecter',
        navigation: 'Navigation'
      },
      about: {
        badge: 'Expertise Juridique Depuis 2003',
        title: 'Pourquoi Nous Choisir pour Votre Parcours de Citoyenneté Polonaise?',
        description: "Nous apportons deux décennies d'expérience spécialisée en droit de la citoyenneté polonaise, combinant une expertise juridique traditionnelle avec une technologie d'IA de pointe pour rationaliser votre parcours vers l'obtention de la citoyenneté polonaise et européenne par ascendance.",
        card1Title: 'Conseils Juridiques Experts',
        card1Text: "Notre équipe se spécialise exclusivement dans les cas de citoyenneté polonaise par descendance, avec un taux de réussite inégalé de 100% sur plus de 20 000 cas. Nous connaissons chaque détail du processus.",
        card2Title: "Efficacité Propulsée par l'IA",
        card2Text: "Exploitez nos systèmes d'IA propriétaires qui analysent votre éligibilité, prédisent les délais et automatisent le traitement des documents - réduisant le temps de traitement typique de 40%.",
        card3Title: 'Avantages UE à Vie',
        card3Text: "Obtenez la pleine citoyenneté polonaise et les droits de passeport UE - vivez, travaillez, étudiez n'importe où dans l'UE. Transmettez la citoyenneté à vos descendants pour toujours.",
        cta: 'Passer le Test de Citoyenneté Polonaise'
      },
      services: {
        badge: 'Services Juridiques Nouvelle Génération',
        title: 'Solutions Complètes de Citoyenneté',
        description: "Support de bout en bout propulsé par l'IA et l'expertise juridique",
        service1Title: "Analyse d'Éligibilité par IA",
        service1Desc: "Analyse instantanée de votre arbre généalogique et documents pour déterminer l'éligibilité à la citoyenneté avec 99,9% de précision.",
        service2Title: 'Collection de Documents',
        service2Desc: 'Nous gérons toutes les recherches archivistiques, actes de naissance, registres de mariage et collecte de documents historiques à travers la Pologne.',
        service3Title: 'Traitement des Demandes',
        service3Desc: 'Préparation et soumission expertes de toutes les demandes de citoyenneté avec suivi en temps réel et mises à jour de statut.',
        service4Title: 'Représentation Légale',
        service4Desc: 'Services complets de procuration avec traductions certifiées et correspondance officielle du gouvernement.',
        service5Title: 'Recherche Archivistique',
        service5Desc: "Plongée profonde dans les archives d'État polonaises, les sociétés historiques juives et les bases de données internationales pour les dossiers ancestraux.",
        service6Title: 'Assistance Passeport',
        service6Desc: "Support complet pour obtenir votre passeport polonais et numéro PESEL après confirmation de citoyenneté.",
        cta: 'Commencez Votre Voyage'
      },
      footer: {
        description: "Conseils juridiques experts pour les personnes d'ascendance polonaise et judéo-polonaise du monde entier. Taux de réussite inégalé de 100%, délais réalistes, prix transparents. Depuis 2003.",
        servicesTitle: 'Services',
        resourcesTitle: 'Ressources',
        aiAnalysis: 'Analyse IA',
        legalGuidance: 'Conseils Juridiques',
        documentProcessing: 'Traitement de Documents',
        pricing: 'Tarifs',
        takeTest: 'Passer le Test',
        familyTree: 'Arbre Généalogique',
        aboutProcess: 'À Propos du Processus',
        contact: 'Contact',
        copyright: 'PolishCitizenship.pl - Services Juridiques Experts Depuis 2003',
        privacy: 'Politique de Confidentialité',
        terms: 'Conditions de Service',
        contactUs: 'Nous Contacter'
      }
    }
  },
  he: {
    translation: {
      nav: {
        register: 'הרשמה / התחברות',
        signOut: 'התנתקות',
        navigation: 'ניווט'
      },
      about: {
        badge: 'מומחיות משפטית מאז 2003',
        title: 'למה לבחור בנו למסע האזרחות הפולנית שלך?',
        description: 'אנו מביאים שני עשורים של ניסיון מיוחד בחוק האזרחות הפולנית, משלבים מומחיות משפטית מסורתית עם טכנולוגיית AI מתקדמת כדי לייעל את הדרך שלך להשגת אזרחות פולנית ואירופאית דרך מוצא.',
        card1Title: 'ייעוץ משפטי מומחה',
        card1Text: 'הצוות שלנו מתמחה אך ורק במקרי אזרחות פולנית דרך מוצא, עם שיעור הצלחה ללא תחרות של 100% במעל 20,000 מקרים. אנו מכירים כל פרט בתהליך.',
        card2Title: 'יעילות מבוססת AI',
        card2Text: 'נצל את מערכות ה-AI הקנייניות שלנו שמנתחות את הזכאות שלך, צופות ציר זמן ומאוטמטות עיבוד מסמכים - מקטינות את זמן העיבוד הטיפוסי ב-40%.',
        card3Title: 'הטבות EU לכל החיים',
        card3Text: 'קבל אזרחות פולנית מלאה וזכויות דרכון EU - חיה, עבוד, למד בכל מקום באיחוד האירופי. העבר אזרחות לצאצאיך לנצח.',
        cta: 'בצע מבחן אזרחות פולנית'
      },
      services: {
        badge: 'שירותים משפטיים מהדור הבא',
        title: 'פתרונות אזרחות מקיפים',
        description: 'תמיכה מקצה לקצה מופעלת על ידי AI ומומחיות משפטית',
        service1Title: 'ניתוח זכאות AI',
        service1Desc: 'ניתוח מיידי של עץ המשפחה והמסמכים שלך לקביעת זכאות לאזרחות עם דיוק של 99.9%.',
        service2Title: 'איסוף מסמכים',
        service2Desc: 'אנו מטפלים בכל המחקר הארכיוני, תעודות לידה, רישומי נישואין ואיסוף מסמכים היסטוריים ברחבי פולין.',
        service3Title: 'עיבוד בקשות',
        service3Desc: 'הכנה והגשה מקצועית של כל בקשות האזרחות עם מעקב בזמן אמת ועדכוני סטטוס.',
        service4Title: 'ייצוג משפטי',
        service4Desc: 'שירותי ייפוי כוח מלאים עם תרגומים מאושרים והתכתבות ממשלתית רשמית.',
        service5Title: 'מחקר ארכיוני',
        service5Desc: 'צלילה עמוקה לארכיוני המדינה הפולנית, אגודות היסטוריות יהודיות ומאגרי מידע בינלאומיים לרישומי אבות.',
        service6Title: 'סיוע בדרכון',
        service6Desc: 'תמיכה מלאה בקבלת הדרכון הפולני ומספר PESEL שלך לאחר אישור האזרחות.',
        cta: 'התחל את המסע שלך'
      },
      footer: {
        description: 'ייעוץ משפטי מומחה לאנשים ממוצא פולני ויהודי-פולני מרחבי העולם. שיעור הצלחה ללא תחרות של 100%, לוחות זמנים ריאליים, תמחור שקוף. מאז 2003.',
        servicesTitle: 'שירותים',
        resourcesTitle: 'משאבים',
        aiAnalysis: 'ניתוח AI',
        legalGuidance: 'ייעוץ משפטי',
        documentProcessing: 'עיבוד מסמכים',
        pricing: 'תמחור',
        takeTest: 'בצע מבחן',
        familyTree: 'עץ משפחה',
        aboutProcess: 'אודות התהליך',
        contact: 'צור קשר',
        copyright: 'PolishCitizenship.pl - שירותים משפטיים מומחים מאז 2003',
        privacy: 'מדיניות פרטיות',
        terms: 'תנאי שירות',
        contactUs: 'צור קשר'
      }
    }
  },
  ru: {
    translation: {
      nav: {
        register: 'Регистрация / Вход',
        signOut: 'Выйти',
        navigation: 'Навигация'
      },
      about: {
        badge: 'Юридическая Экспертиза с 2003 года',
        title: 'Почему Выбрать Нас для Вашего Пути к Польскому Гражданству?',
        description: 'Мы привносим два десятилетия специализированного опыта в законе о польском гражданстве, сочетая традиционную юридическую экспертизу с передовой технологией ИИ для оптимизации вашего пути к получению польского и европейского гражданства по происхождению.',
        card1Title: 'Экспертная Юридическая Консультация',
        card1Text: 'Наша команда специализируется исключительно на делах о польском гражданстве по происхождению, с непревзойденной 100% успешностью в более чем 20 000 делах. Мы знаем каждую деталь процесса.',
        card2Title: 'Эффективность на Основе ИИ',
        card2Text: 'Используйте наши собственные системы ИИ, которые анализируют вашу приемлемость, прогнозируют сроки и автоматизируют обработку документов - сокращая типичное время обработки на 40%.',
        card3Title: 'Пожизненные Преимущества ЕС',
        card3Text: 'Получите полное польское гражданство и права паспорта ЕС - живите, работайте, учитесь где угодно в ЕС. Передайте гражданство своим потомкам навсегда.',
        cta: 'Пройти Тест на Польское Гражданство'
      },
      services: {
        badge: 'Юридические Услуги Нового Поколения',
        title: 'Комплексные Решения по Гражданству',
        description: 'Полная поддержка на основе ИИ и юридической экспертизы',
        service1Title: 'Анализ Приемлемости ИИ',
        service1Desc: 'Мгновенный анализ вашего генеалогического древа и документов для определения приемлемости гражданства с точностью 99,9%.',
        service2Title: 'Сбор Документов',
        service2Desc: 'Мы занимаемся всеми архивными исследованиями, свидетельствами о рождении, записями о браке и сбором исторических документов по всей Польше.',
        service3Title: 'Обработка Заявлений',
        service3Desc: 'Экспертная подготовка и подача всех заявлений на гражданство с отслеживанием в реальном времени и обновлениями статуса.',
        service4Title: 'Юридическое Представительство',
        service4Desc: 'Полные услуги доверенности с заверенными переводами и официальной правительственной перепиской.',
        service5Title: 'Архивные Исследования',
        service5Desc: 'Глубокое погружение в польские государственные архивы, еврейские исторические общества и международные базы данных для поиска записей предков.',
        service6Title: 'Помощь с Паспортом',
        service6Desc: 'Полная поддержка в получении польского паспорта и номера PESEL после подтверждения гражданства.',
        cta: 'Начните Ваше Путешествие'
      },
      footer: {
        description: 'Экспертная юридическая консультация для людей польского и польско-еврейского происхождения со всего мира. Непревзойденная 100% успешность, реалистичные сроки, прозрачные цены. С 2003 года.',
        servicesTitle: 'Услуги',
        resourcesTitle: 'Ресурсы',
        aiAnalysis: 'Анализ ИИ',
        legalGuidance: 'Юридическая Консультация',
        documentProcessing: 'Обработка Документов',
        pricing: 'Цены',
        takeTest: 'Пройти Тест',
        familyTree: 'Генеалогическое Древо',
        aboutProcess: 'О Процессе',
        contact: 'Контакт',
        copyright: 'PolishCitizenship.pl - Экспертные Юридические Услуги с 2003 года',
        privacy: 'Политика Конфиденциальности',
        terms: 'Условия Обслуживания',
        contactUs: 'Свяжитесь с Нами'
      }
    }
  },
  ua: {
    translation: {
      nav: {
        register: 'Реєстрація / Вхід',
        signOut: 'Вийти',
        navigation: 'Навігація'
      },
      about: {
        badge: 'Юридична Експертиза з 2003 року',
        title: 'Чому Обрати Нас для Вашого Шляху до Польського Громадянства?',
        description: 'Ми привносимо два десятиліття спеціалізованого досвіду в законі про польське громадянство, поєднуючи традиційну юридичну експертизу з передовою технологією ШІ для оптимізації вашого шляху до отримання польського та європейського громадянства за походженням.',
        card1Title: 'Експертна Юридична Консультація',
        card1Text: 'Наша команда спеціалізується виключно на справах про польське громадянство за походженням, з неперевершеною 100% успішністю в понад 20 000 справах. Ми знаємо кожну деталь процесу.',
        card2Title: 'Ефективність на Основі ШІ',
        card2Text: 'Використовуйте наші власні системи ШІ, які аналізують вашу прийнятність, прогнозують терміни та автоматизують обробку документів - скорочуючи типовий час обробки на 40%.',
        card3Title: 'Довічні Переваги ЄС',
        card3Text: 'Отримайте повне польське громадянство та права паспорта ЄС - живіть, працюйте, навчайтесь будь-де в ЄС. Передайте громадянство своїм нащадкам назавжди.',
        cta: 'Пройти Тест на Польське Громадянство'
      },
      services: {
        badge: 'Юридичні Послуги Нового Покоління',
        title: 'Комплексні Рішення з Громадянства',
        description: 'Повна підтримка на основі ШІ та юридичної експертизи',
        service1Title: 'Аналіз Прийнятності ШІ',
        service1Desc: 'Миттєвий аналіз вашого генеалогічного дерева та документів для визначення прийнятності громадянства з точністю 99,9%.',
        service2Title: 'Збір Документів',
        service2Desc: 'Ми займаємося всіма архівними дослідженнями, свідоцтвами про народження, записами про шлюб та збором історичних документів по всій Польщі.',
        service3Title: 'Обробка Заяв',
        service3Desc: 'Експертна підготовка та подача всіх заяв на громадянство з відстеженням в реальному часі та оновленнями статусу.',
        service4Title: 'Юридичне Представництво',
        service4Desc: 'Повні послуги довіреності з завіреними перекладами та офіційним урядовим листуванням.',
        service5Title: 'Архівні Дослідження',
        service5Desc: 'Глибоке занурення в польські державні архіви, єврейські історичні товариства та міжнародні бази даних для пошуку записів предків.',
        service6Title: 'Допомога з Паспортом',
        service6Desc: 'Повна підтримка в отриманні польського паспорта та номера PESEL після підтвердження громадянства.',
        cta: 'Почніть Вашу Подорож'
      },
      footer: {
        description: 'Експертна юридична консультація для людей польського та польсько-єврейського походження з усього світу. Неперевершена 100% успішність, реалістичні терміни, прозорі ціни. З 2003 року.',
        servicesTitle: 'Послуги',
        resourcesTitle: 'Ресурси',
        aiAnalysis: 'Аналіз ШІ',
        legalGuidance: 'Юридична Консультація',
        documentProcessing: 'Обробка Документів',
        pricing: 'Ціни',
        takeTest: 'Пройти Тест',
        familyTree: 'Генеалогічне Дерево',
        aboutProcess: 'Про Процес',
        contact: 'Контакт',
        copyright: 'PolishCitizenship.pl - Експертні Юридичні Послуги з 2003 року',
        privacy: 'Політика Конфіденційності',
        terms: 'Умови Обслуговування',
        contactUs: "Зв'яжіться з Нами"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

// Handle RTL for Hebrew
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
