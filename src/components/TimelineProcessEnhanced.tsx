import { motion } from "framer-motion";
import { CheckCircle2, FileText, Scale, Users, Building2, Award, Clock, AlertCircle, Shield, FileCheck, Stamp, Globe } from "lucide-react";
import { Button } from "./ui/button";
import timelineDocument from "@/assets/timeline-document.png";
import timelineStamp from "@/assets/timeline-stamp.png";
import timelineCourthouse from "@/assets/timeline-courthouse.png";
import timelineFamily from "@/assets/timeline-family.png";
import timelinePassport from "@/assets/timeline-passport.png";

const timelineSteps = [
  {
    number: 1,
    title: "Initial Case Assessment",
    description: "Comprehensive evaluation of your eligibility for Polish citizenship by descent.",
    duration: "1-2 weeks",
    keyAction: "Document collection begins",
    priority: "Critical",
    icon: FileText,
    gradient: "from-blue-500 to-blue-600",
    illustration: timelineDocument,
  },
  {
    number: 2,
    title: "Genealogical Research",
    description: "Detailed ancestry verification and family tree documentation from Polish archives.",
    duration: "4-8 weeks",
    keyAction: "Archive requests submitted",
    priority: "Essential",
    icon: Users,
    gradient: "from-blue-600 to-cyan-500",
    illustration: timelineFamily,
  },
  {
    number: 3,
    title: "Document Acquisition",
    description: "Obtaining vital records (birth, marriage, death certificates) from Polish authorities.",
    duration: "6-12 weeks",
    keyAction: "Official certificates obtained",
    priority: "Critical",
    icon: FileCheck,
    gradient: "from-cyan-500 to-blue-500",
    illustration: timelineDocument,
  },
  {
    number: 4,
    title: "Legal Document Preparation",
    description: "Professional translation and apostille certification of all required documents.",
    duration: "2-4 weeks",
    keyAction: "Translations & apostilles",
    priority: "Required",
    icon: Scale,
    gradient: "from-blue-500 to-indigo-600",
    illustration: timelineStamp,
  },
  {
    number: 5,
    title: "Application Compilation",
    description: "Complete citizenship application assembly with all supporting documentation.",
    duration: "1-2 weeks",
    keyAction: "Final review completed",
    priority: "Critical",
    icon: FileText,
    gradient: "from-indigo-600 to-blue-600",
    illustration: timelineDocument,
  },
  {
    number: 6,
    title: "Submission to Polish Authorities",
    description: "Official filing of citizenship application to the appropriate voivodeship office.",
    duration: "1 week",
    keyAction: "Application submitted",
    priority: "Milestone",
    icon: Building2,
    gradient: "from-blue-600 to-cyan-500",
    illustration: timelineCourthouse,
  },
  {
    number: 7,
    title: "Administrative Processing",
    description: "Polish authorities review and verify all submitted documentation and claims.",
    duration: "12-24 months",
    keyAction: "Awaiting decision",
    priority: "Patience Required",
    icon: Clock,
    gradient: "from-cyan-500 to-blue-500",
    illustration: timelineCourthouse,
  },
  {
    number: 8,
    title: "Citizenship Confirmation",
    description: "Receipt of official Polish citizenship decision and confirmation certificate.",
    duration: "Varies",
    keyAction: "Decision received",
    priority: "Final Step",
    icon: Award,
    gradient: "from-blue-500 to-indigo-600",
    illustration: timelineStamp,
  },
  {
    number: 9,
    title: "Polish Passport Application",
    description: "Application for Polish passport and national ID card.",
    duration: "4-6 weeks",
    keyAction: "Identity documents",
    priority: "Post-Citizenship",
    icon: Globe,
    gradient: "from-indigo-600 to-blue-600",
    illustration: timelinePassport,
  },
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
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary">
            Your Journey to Polish Citizenship
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A transparent, step-by-step process designed with 20+ years of expertise in Polish citizenship law
          </p>
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
                  whileHover={{ scale: 1.02, rotateY: 5 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-6 rounded-2xl hover-glow group"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-primary">Step {step.number}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                          {step.priority}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-card-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-secondary" />
                          <span className="text-muted-foreground">Duration: <strong className="text-card-foreground">{step.duration}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">Key Action: <strong className="text-card-foreground">{step.keyAction}</strong></span>
                        </div>
                      </div>
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
