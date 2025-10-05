import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Shield, Zap } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  wallet: z.string().trim().max(100),
  message: z.string().trim().min(1, { message: "Message is required" }).max(1000),
});

const ContactFormWeb3 = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    wallet: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      contactSchema.parse(formData);
      
      toast({
        title: "Message Sent!",
        description: "Our AI will analyze your case within 24 hours.",
      });
      
      setFormData({ name: "", email: "", wallet: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 rounded-full glass-card mb-6">
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Connect With Us
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Start Your Journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant AI-powered eligibility assessment
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 rounded-3xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3 animate-fade-in">
                  <Label htmlFor="name" className="text-foreground text-lg font-semibold">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="glass-card border-border/50 focus:border-primary focus:scale-[1.02] transition-all duration-300 h-14 text-lg placeholder:text-muted-foreground/50 hover:border-primary/50"
                  />
                </div>
                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="email" className="text-foreground text-lg font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="glass-card border-border/50 focus:border-primary focus:scale-[1.02] transition-all duration-300 h-14 text-lg placeholder:text-muted-foreground/50 hover:border-primary/50"
                  />
                </div>
              </div>
              
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Label htmlFor="wallet" className="text-foreground text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Wallet Address (Optional)
                </Label>
                <Input
                  id="wallet"
                  name="wallet"
                  value={formData.wallet}
                  onChange={handleChange}
                  placeholder="0x... (for blockchain-verified document storage)"
                  className="glass-card border-border/50 focus:border-primary focus:scale-[1.02] transition-all duration-300 h-14 text-lg font-mono placeholder:text-muted-foreground/50 hover:border-primary/50"
                />
              </div>
              
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Label htmlFor="message" className="text-foreground text-lg font-semibold">Tell Us About Your Polish Heritage *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your Polish ancestry, available documents, and citizenship goals..."
                  required
                  className="min-h-[200px] glass-card border-border/50 focus:border-primary focus:scale-[1.01] transition-all duration-300 text-lg placeholder:text-muted-foreground/50 hover:border-primary/50 resize-none"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-white text-lg py-6 hover-glow group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Launch AI Analysis
                  <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </form>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-border/30">
              {[
                { icon: Zap, text: "Instant AI Response" },
                { icon: Shield, text: "Blockchain Secured" },
                { icon: Send, text: "24/7 Availability" }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { label: "Average Response", value: "< 2 hours" },
              { label: "AI Accuracy", value: "99.7%" },
              { label: "Cases Processed", value: "10,000+" }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl text-center hover-glow">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormWeb3;