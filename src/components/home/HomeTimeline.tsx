// TODO: Add i18n keys later - currently hard-coded English only
import { motion } from "framer-motion";
import { FileSearch, FileText, Scale, FolderOpen, Languages, Send, FileCheck, Award, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimelineStep {
  number: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const timelineSteps: TimelineStep[] = [
  {
    number: 1,
    title: "Eligibility Check & Family Tree",
    description: "We analyze your ancestry line and confirm eligibility for Polish citizenship by descent. Free initial assessment.",
    icon: FileSearch,
  },
  {
    number: 2,
    title: "Terms, Pricing & Engagement",
    description: "Transparent pricing and clear process roadmap. No hidden fees. Pay advance and open your secure client portal account.",
    icon: FileText,
  },
  {
    number: 3,
    title: "Power of Attorney & Data Collection",
    description: "Submit your passport and basic details. We prepare POA documents for you to sign and return. Complete the master intake form.",
    icon: Scale,
  },
  {
    number: 4,
    title: "Document Collection - Local & Polish",
    description: "Gather birth, marriage certificates, and naturalization records. We coordinate Polish archive searches through trusted partners.",
    icon: FolderOpen,
  },
  {
    number: 5,
    title: "Translations & Evidence Bundle",
    description: "All documents are professionally translated by Polish Certified Sworn Translators and verified for accuracy.",
    icon: Languages,
  },
  {
    number: 6,
    title: "Filing the Citizenship Application",
    description: "We submit your complete application to the Masovian Voivoda's office in Warsaw on your behalf.",
    icon: Send,
  },
  {
    number: 7,
    title: "Government Review & Decision",
    description: "Wait 10-18 months for initial response. We handle all correspondence and can apply push/nudge strategies to accelerate.",
    icon: FileCheck,
  },
  {
    number: 8,
    title: "Decision, Civil Acts & Passport",
    description: "Upon approval, we request Polish birth/marriage certificates, prepare all documents, and guide you through passport application.",
    icon: Award,
  },
];

export default function HomeTimeline() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Plane className="w-4 h-4 mr-2" />
            Complete Legal Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Path to Polish Citizenship
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From eligibility check to passport in hand — a clear roadmap with expert support at every stage.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {timelineSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-2">
                        <span className="text-lg font-bold text-primary">{step.number}</span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-secondary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-heading font-bold mb-2 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
