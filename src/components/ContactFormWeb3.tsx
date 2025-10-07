import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Zap } from "lucide-react";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  message: z.string().trim().max(1000).optional(),
});

const ContactFormWeb3 = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      
      setFormData({ name: "", email: "", message: "" });
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Connect With Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ready to Check Your Eligibility?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take the most comprehensive Polish citizenship by descent test available online
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-2">
          <div className="glass-card p-4 md:p-12 rounded-3xl relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 animate-fade-in group" onDoubleClick={() => setFormData({ ...formData, name: "" })}>
                  <Label htmlFor="name" className="text-sm font-normal text-foreground/90">Name *</Label>
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="glass-card border-2 border-border/50 focus:border-primary hover-glow focus:shadow-lg transition-all h-16 placeholder:text-muted-foreground/50 hover:border-primary/50 w-full relative z-10 bg-card/50 backdrop-blur"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </div>
                </div>
                <div className="space-y-3 animate-fade-in group" style={{ animationDelay: '0.1s' }} onDoubleClick={() => setFormData({ ...formData, email: "" })}>
                  <Label htmlFor="email" className="text-sm font-normal text-foreground/90">Email *</Label>
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary to-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=""
                      required
                      className="glass-card border-2 border-border/50 focus:border-primary hover-glow focus:shadow-lg transition-all h-16 placeholder:text-muted-foreground/50 hover:border-primary/50 w-full relative z-10 bg-card/50 backdrop-blur"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 animate-fade-in group" style={{ animationDelay: '0.2s' }} onDoubleClick={() => setFormData({ ...formData, message: "" })}>
                <Label htmlFor="message" className="text-sm font-normal text-foreground/90">Message</Label>
                <div className="relative overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-accent to-secondary opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition-opacity" />
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder=""
                    className="min-h-[240px] glass-card border-2 border-border/50 focus:border-primary hover-glow focus:shadow-lg transition-all placeholder:text-muted-foreground/50 hover:border-primary/50 resize-none w-full relative z-10 bg-card/50 backdrop-blur"
                    style={{ fontSize: '1.125rem', fontWeight: '400' }}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="text-xl font-bold px-12 h-16 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 w-full"
              >
                <Send className="h-5 w-5 mr-2 opacity-50" />
                <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Send Your Info
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            {[
              { icon: Zap, label: "AI Accurate Response", value: "< 5 mins" },
              { icon: Mail, label: "Human Detailed Response", value: "< 1 hour" },
              { icon: Zap, label: "Consultation Availability", value: "24/7" },
              { icon: Mail, label: "Initial Assessment", value: "Free" }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-lg hover-glow w-full max-w-[280px] mx-auto md:max-w-none">
                <stat.icon className="h-6 w-6 mb-3 opacity-50 text-primary" />
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