// TODO: Add i18n keys later - currently hard-coded English only
import { motion } from "framer-motion";
import { Shield, Globe, Zap, Users, Brain, Award, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

const benefits: Benefit[] = [
  {
    icon: Award,
    text: "End-to-end support: from family tree to passport",
  },
  {
    icon: Shield,
    text: "Specialized only in Polish citizenship by descent",
  },
  {
    icon: Globe,
    text: "8-language client portal for global accessibility",
  },
  {
    icon: Users,
    text: "Secure handling of passports and personal documents",
  },
  {
    icon: Brain,
    text: "Human lawyers + AI assistants for speed and accuracy",
  },
  {
    icon: Zap,
    text: "Transparent pricing with no hidden fees",
  },
  {
    icon: Check,
    text: "Trusted partners for archives, translations, and civil registries",
  },
];

export default function OnboardingBenefits() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Why start your Polish citizenship journey here?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Not just another website — a legacy project built by specialists who understand every nuance of Polish citizenship law.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <Card className="h-full hover:shadow-md transition-all duration-300 border-primary/10 hover:border-primary/30">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {benefit.text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Legacy Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-8 text-center">
              <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
                <Award className="w-4 h-4 mr-2" />
                Legacy Project
              </Badge>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                This isn't just another citizenship service. We've spent years building relationships with Polish archives,
                civil registries, and sworn translators. Our AI-powered document analysis works alongside experienced
                immigration lawyers to give you the fastest, most reliable path to your Polish passport.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
