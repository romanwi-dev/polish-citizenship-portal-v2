import { motion } from "framer-motion";
import { FileText, CheckCircle, CreditCard, FileCheck, Send, FolderSearch, Archive, Languages, Upload, Stamp, Clock, Zap, Award, Book, Users, Shield } from "lucide-react";
import { Button } from "./ui/button";
import timelineDocument from "@/assets/timeline-document.png";
import timelineStamp from "@/assets/timeline-stamp.png";
import timelineCourthouse from "@/assets/timeline-courthouse.png";
import timelineFamily from "@/assets/timeline-family.png";
import timelinePassport from "@/assets/timeline-passport.png";

const timelineSteps = [
  {
    number: "1",
    title: "PART 1 - FIRST STEPS",
    description: "First contact, citizenship test, family tree, eligibility examination, and eligibility call",
    duration: "Week 1",
    keyAction: "Initial Setup & Payment",
    priority: "Major Milestone",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
    illustration: timelineDocument,
  },
  {
    number: "2",
    title: "PART 2 - TERMS & PRICING",
    description: "Initial assessment, full process info with pricing, client confirmation, and document list",
    duration: "Week 1-2",
    keyAction: "Initial Setup & Payment",
    priority: "Foundation Building",
    icon: CreditCard,
    gradient: "from-cyan-500 to-blue-500",
    illustration: timelineDocument,
  },
  {
    number: "3",
    title: "PART 3 - ADVANCE & ACCOUNT",
    description: "Advance payment processing and opening client portal account",
    duration: "Week 2",
    keyAction: "Initial Setup & Payment",
    priority: "Major Milestone",
    icon: CheckCircle,
    gradient: "from-blue-500 to-indigo-500",
    illustration: timelineStamp,
  },
  {
    number: "4",
    title: "PART 4 - DETAILS & POAs",
    description: "Client provides basic details, POA preparation, and signed documents via FedEx",
    duration: "Week 2-3",
    keyAction: "Details & Application",
    priority: "Foundation Building",
    icon: FileCheck,
    gradient: "from-indigo-500 to-purple-500",
    illustration: timelineDocument,
  },
  {
    number: "5",
    title: "PART 5 - DATA & APPLICATION",
    description: "Master form completion, AI paperwork generation, and official citizenship application submission",
    duration: "Week 3-4",
    keyAction: "Details & Application",
    priority: "Major Milestone",
    icon: Send,
    gradient: "from-purple-500 to-pink-500",
    illustration: timelineDocument,
  },
  {
    number: "6",
    title: "PART 6 - LOCAL DOCUMENTS",
    description: "Document clarification, gathering local documents, and partner collaboration for collection",
    duration: "Week 4-8",
    keyAction: "Documentation & Translation",
    priority: "Major Milestone",
    icon: FolderSearch,
    gradient: "from-pink-500 to-rose-500",
    illustration: timelineDocument,
  },
  {
    number: "7",
    title: "PART 7 - POLISH DOCUMENTS",
    description: "Polish archives search, international search, and partner processing for archival documents",
    duration: "Week 4-12",
    keyAction: "Documentation & Translation",
    priority: "Major Milestone",
    icon: Archive,
    gradient: "from-rose-500 to-red-500",
    illustration: timelineFamily,
  },
  {
    number: "8",
    title: "PART 8 - TRANSLATIONS",
    description: "AI translation service, certified sworn translator certification, and translation agent supervision",
    duration: "Week 8-16",
    keyAction: "Documentation & Translation",
    priority: "Major Milestone",
    icon: Languages,
    gradient: "from-red-500 to-orange-500",
    illustration: timelineDocument,
  },
  {
    number: "9",
    title: "PART 9 - FILING DOCUMENTS",
    description: "Submitting local documents and detailed family information before initial response",
    duration: "Week 12-18",
    keyAction: "Filing & Civil Acts",
    priority: "Active Processing",
    icon: Upload,
    gradient: "from-orange-500 to-amber-500",
    illustration: timelineDocument,
  },
  {
    number: "10",
    title: "PART 10 - CIVIL ACTS",
    description: "Polish civil acts applications, payment processing, and dedicated civil acts agent supervision",
    duration: "Week 16-20",
    keyAction: "Filing & Civil Acts",
    priority: "Major Milestone",
    icon: Stamp,
    gradient: "from-amber-500 to-yellow-500",
    illustration: timelineStamp,
  },
  {
    number: "11",
    title: "PART 11 - INITIAL RESPONSE",
    description: "Receiving initial response from Masovian Voivoda's office and extending procedure term",
    duration: "Month 10-18",
    keyAction: "Government Processing",
    priority: "Major Milestone",
    icon: Clock,
    gradient: "from-yellow-500 to-lime-500",
    illustration: timelineCourthouse,
  },
  {
    number: "12",
    title: "PART 12 - PUSH SCHEMES",
    description: "Offering push schemes (PUSH, NUDGE, SIT-DOWN) and implementing strategies in practice",
    duration: "Month 12-20",
    keyAction: "Government Processing",
    priority: "Major Milestone",
    icon: Zap,
    gradient: "from-lime-500 to-green-500",
    illustration: timelineCourthouse,
  },
  {
    number: "13",
    title: "PART 13 - CITIZENSHIP DECISION",
    description: "Polish citizenship confirmation decision received and added to client portal account",
    duration: "Month 18-24",
    keyAction: "Citizenship Confirmation",
    priority: "Critical Milestone",
    icon: Award,
    gradient: "from-green-500 to-emerald-500",
    illustration: timelineStamp,
  },
  {
    number: "14",
    title: "PART 14 - POLISH PASSPORT",
    description: "Document preparation, final payment, FedEx delivery, consulate visit, and passport application",
    duration: "Month 20-26",
    keyAction: "Passport & Extended Services",
    priority: "Major Milestone",
    icon: Book,
    gradient: "from-emerald-500 to-teal-500",
    illustration: timelinePassport,
  },
  {
    number: "15",
    title: "PART 15 - EXTENDED SERVICES",
    description: "Extended family legal services for comprehensive ongoing support",
    duration: "Ongoing",
    keyAction: "Passport & Extended Services",
    priority: "Final Achievement",
    icon: Users,
    gradient: "from-teal-500 to-cyan-500",
    illustration: timelineFamily,
  }
];

export default function TimelineProcessEnhanced() {
  return (
    <section id="timeline" className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.1) 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-heading font-black mb-6 tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-fade-in-up glow-text drop-shadow-2xl">
              Complete Legal Process Timeline
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Your journey to Polish citizenship through our comprehensive 15-part process. Many parts are processed SIMULTANEOUSLY to save time.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {timelineSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`relative mb-16 md:mb-24 flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content Card */}
              <div className="w-full md:w-5/12">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-6 rounded-2xl hover-glow group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                        {step.number}
                      </span>
                      <span className="text-xs text-muted-foreground">{step.duration}</span>
                    </div>
                    <motion.h3 
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      whileInView={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.7, 
                        delay: index * 0.08,
                        type: "spring",
                        stiffness: 120
                      }}
                      viewport={{ once: true }}
                      className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
                    >
                      {step.title}
                    </motion.h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {step.keyAction}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                        {step.priority}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Center Circle with Illustration */}
              <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 animate-float"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                    <img 
                      src={step.illustration} 
                      alt={step.title}
                      className="w-16 h-16 object-contain opacity-90"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl -z-10" />
                </motion.div>
              </div>

              {/* Empty space for layout balance */}
              <div className="w-full md:w-5/12 hidden md:block" />
            </motion.div>
          ))}
        </div>

        {/* Expert Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 glass-card p-8 rounded-2xl max-w-3xl mx-auto"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-card-foreground">Expert Legal Guidance</h3>
              <p className="text-muted-foreground">
                Every case is unique. Our 20+ years of experience in Polish citizenship law ensures your application 
                receives professional attention at each critical stage. We handle complex genealogical research, 
                navigate bureaucratic requirements, and provide ongoing support throughout your journey.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 text-lg px-8 py-6"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Check Your Eligibility Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
