import { FileText, CheckCircle, CreditCard, FileCheck, Send, FolderSearch, Archive, Languages, Upload, Stamp, Clock, Zap, Award, Book, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const timelineSteps = [
  {
    number: "1",
    title: "PART 1 - FIRST STEPS",
    description: "First contact, citizenship test, family tree, eligibility examination, and eligibility call",
    duration: "Week 1",
    keyAction: "Initial Setup & Payment",
    priority: "Major Milestone",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    number: "2",
    title: "PART 2 - TERMS & PRICING",
    description: "Initial assessment, full process info with pricing, client confirmation, and document list",
    duration: "Week 1-2",
    keyAction: "Initial Setup & Payment",
    priority: "Foundation Building",
    icon: CreditCard,
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    number: "3",
    title: "PART 3 - ADVANCE & ACCOUNT",
    description: "Advance payment processing and opening client portal account",
    duration: "Week 2",
    keyAction: "Initial Setup & Payment",
    priority: "Major Milestone",
    icon: CheckCircle,
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    number: "4",
    title: "PART 4 - DETAILS & POAs",
    description: "Client provides basic details, POA preparation, and signed documents via FedEx",
    duration: "Week 2-3",
    keyAction: "Details & Application",
    priority: "Foundation Building",
    icon: FileCheck,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    number: "5",
    title: "PART 5 - DATA & APPLICATION",
    description: "Master form completion, AI paperwork generation, and official citizenship application submission",
    duration: "Week 3-4",
    keyAction: "Details & Application",
    priority: "Major Milestone",
    icon: Send,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    number: "6",
    title: "PART 6 - LOCAL DOCUMENTS",
    description: "Document clarification, gathering local documents, and partner collaboration for collection",
    duration: "Week 4-8",
    keyAction: "Documentation & Translation",
    priority: "Major Milestone",
    icon: FolderSearch,
    gradient: "from-pink-500 to-rose-500"
  },
  {
    number: "7",
    title: "PART 7 - POLISH DOCUMENTS",
    description: "Polish archives search, international search, and partner processing for archival documents",
    duration: "Week 4-12",
    keyAction: "Documentation & Translation",
    priority: "Major Milestone",
    icon: Archive,
    gradient: "from-rose-500 to-red-500"
  },
  {
    number: "8",
    title: "PART 8 - TRANSLATIONS",
    description: "AI translation service, certified sworn translator certification, and translation agent supervision",
    duration: "Week 8-16",
    keyAction: "Documentation & Translation",
    priority: "Major Milestone",
    icon: Languages,
    gradient: "from-red-500 to-orange-500"
  },
  {
    number: "9",
    title: "PART 9 - FILING DOCUMENTS",
    description: "Submitting local documents and detailed family information before initial response",
    duration: "Week 12-18",
    keyAction: "Filing & Civil Acts",
    priority: "Active Processing",
    icon: Upload,
    gradient: "from-orange-500 to-amber-500"
  },
  {
    number: "10",
    title: "PART 10 - CIVIL ACTS",
    description: "Polish civil acts applications, payment processing, and dedicated civil acts agent supervision",
    duration: "Week 16-20",
    keyAction: "Filing & Civil Acts",
    priority: "Major Milestone",
    icon: Stamp,
    gradient: "from-amber-500 to-yellow-500"
  },
  {
    number: "11",
    title: "PART 11 - INITIAL RESPONSE",
    description: "Receiving initial response from Masovian Voivoda's office and extending procedure term",
    duration: "Month 10-18",
    keyAction: "Government Processing",
    priority: "Major Milestone",
    icon: Clock,
    gradient: "from-yellow-500 to-lime-500"
  },
  {
    number: "12",
    title: "PART 12 - PUSH SCHEMES",
    description: "Offering push schemes (PUSH, NUDGE, SIT-DOWN, SLOW) and implementing strategies in practice",
    duration: "Month 12-20",
    keyAction: "Government Processing",
    priority: "Major Milestone",
    icon: Zap,
    gradient: "from-lime-500 to-green-500"
  },
  {
    number: "13",
    title: "PART 13 - CITIZENSHIP DECISION",
    description: "Polish citizenship confirmation decision received and added to client portal account",
    duration: "Month 18-24",
    keyAction: "Citizenship Confirmation",
    priority: "Critical Milestone",
    icon: Award,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    number: "14",
    title: "PART 14 - POLISH PASSPORT",
    description: "Document preparation, final payment, FedEx delivery, consulate visit, and passport application",
    duration: "Month 20-26",
    keyAction: "Passport & Extended Services",
    priority: "Major Milestone",
    icon: Book,
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    number: "15",
    title: "PART 15 - EXTENDED SERVICES",
    description: "Extended family legal services for comprehensive ongoing support",
    duration: "Ongoing",
    keyAction: "Passport & Extended Services",
    priority: "Final Achievement",
    icon: Users,
    gradient: "from-teal-500 to-cyan-500"
  }
];

const TimelineProcess = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('timelineProcess.title')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('timelineProcess.subtitle')}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Central Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-secondary to-accent transform -translate-x-1/2" />

          {/* Timeline Steps */}
          <div className="space-y-12">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div 
                  key={index} 
                  className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ 
                    // V4 timeline micro-tuning — safe
                    duration: 0.4, 
                    delay: index * 0.04, 
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="glass-card p-4 rounded-lg hover-glow group cursor-pointer h-[220px] flex flex-col justify-center items-center">
                      <div className="flex flex-col items-center text-center gap-2 w-full">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${step.gradient}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 flex flex-col items-center w-full">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                              {step.number}
                            </span>
                            <span className="text-sm md:text-xs text-muted-foreground">{t(`timelineProcess.stage${step.number}Duration`)}</span>
                          </div>
                          <h3 className="text-sm md:text-base font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap">
                            {t(`timelineProcess.stage${step.number}`)}
                          </h3>
                          <p className="text-sm md:text-xs text-muted-foreground mb-2 px-2 text-center line-clamp-2">
                            {t(`timelineProcess.stage${step.number}Desc`)}
                          </p>
                          <div className="flex flex-wrap gap-1 justify-center mb-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {t(`timelineProcess.stage${step.number}Action`)}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
                              {step.priority}
                            </span>
                          </div>
                          <p className="text-sm md:text-xs text-muted-foreground/60">Click to see details</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 items-center justify-center">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${step.gradient} shadow-glow flex items-center justify-center`}>
                      <div className="w-4 h-4 rounded-full bg-background" />
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block w-5/12" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Expert Tip */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="glass-card p-8 rounded-lg border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Expert Tip - Polish Citizenship Guidance
                </h3>
                <p className="text-muted-foreground">
                  Polish citizenship by descent requires careful documentation and legal expertise. Each case is unique - trust the process and follow professional guidance for the best results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Check Your Eligibility and Chances</h3>
          <button
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-lg font-semibold shadow-glow hover-glow transition-all"
          >
            POLISH CITIZENSHIP TEST
          </button>
        </div>
      </div>
    </section>
  );
};

export default TimelineProcess;
