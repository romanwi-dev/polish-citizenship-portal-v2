import { motion } from "framer-motion";
import { UserPlus, Calendar, FileCheck, Rocket } from "lucide-react";
import { Button } from "./ui/button";
import onboardingStep1 from "@/assets/onboarding-step1.png";
import onboardingStep2 from "@/assets/onboarding-step2.png";
import onboardingStep3 from "@/assets/onboarding-step3.png";
import onboardingStep4 from "@/assets/onboarding-step4.png";

const onboardingSteps = [
  {
    number: "01",
    title: "Initial Contact & Assessment",
    description: "Fill out our quick eligibility questionnaire. We'll review your family history and determine if you qualify for Polish citizenship by descent.",
    icon: UserPlus,
    illustration: onboardingStep1,
    gradient: "from-primary to-secondary",
  },
  {
    number: "02",
    title: "Expert Consultation Call",
    description: "Schedule a free consultation with our experienced legal team. We'll discuss your case, answer questions, and outline the complete process and timeline.",
    icon: Calendar,
    illustration: onboardingStep2,
    gradient: "from-secondary to-accent",
  },
  {
    number: "03",
    title: "Document Preparation",
    description: "We'll guide you through gathering necessary documents. Our team handles translations, archival research, and all Polish bureaucratic requirements.",
    icon: FileCheck,
    illustration: onboardingStep3,
    gradient: "from-accent to-primary",
  },
  {
    number: "04",
    title: "Application & Success",
    description: "We submit your application and manage the entire process. Track your progress through our client portal until you receive your Polish citizenship confirmation.",
    icon: Rocket,
    illustration: onboardingStep4,
    gradient: "from-primary to-secondary",
  },
];

export default function ClientOnboardingSection() {
  return (
    <section id="how-to-start" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.05) 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-fade-in-up glow-text drop-shadow-2xl text-3d-forward text-framed">
              How to Start Your Case
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Join thousands of successful clients who achieved Polish citizenship with our expert legal guidance
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {onboardingSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.div
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-8 rounded-2xl h-full hover-glow group"
              >
                {/* Illustration */}
                <div className="mb-6 relative">
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                    <img 
                      src={step.illustration} 
                      alt={step.title}
                      className="w-40 h-40 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <div className={`absolute top-4 left-4 text-6xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-20`}>
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <motion.h3 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300"
                  >
                    {step.title}
                  </motion.h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 text-lg px-8 py-6 font-heading font-bold"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Your Journey Today
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
