import { useState, useEffect, lazy, Suspense } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Zap, CheckCircle2 } from "lucide-react";
import { z } from "zod";

// Lazy load 3D component
const Hero3DMap = lazy(() => import("./Hero3DMap"));

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  message: z.string().trim().max(1000).optional(),
});

const ContactFormWeb3 = () => {
  const { toast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Defer 3D component loading
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoadMap(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      contactSchema.parse(formData);
      
      setIsFlipped(true);
      
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
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-b from-primary/5 to-background" />}>
          {shouldLoadMap && <Hero3DMap />}
        </Suspense>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-[1]" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse z-[1]" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-700 z-[1]" />
      
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
          <div className="relative w-full" style={{ perspective: '1000px' }}>
            <div 
              className="relative w-full transition-transform duration-700"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side - Form */}
              <div 
                className="glass-card p-4 md:p-12 rounded-3xl w-full"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl" />
                
                <form 
                  onSubmit={handleSubmit} 
                  className="space-y-8 relative z-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 animate-fade-in" onDoubleClick={() => setFormData({ ...formData, name: "" })}>
                      <Label htmlFor="name" className="text-sm font-light text-foreground/90">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder=""
                        required
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </div>
                    <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }} onDoubleClick={() => setFormData({ ...formData, email: "" })}>
                      <Label htmlFor="email" className="text-sm font-light text-foreground/90">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder=""
                        required
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
                        style={{ fontSize: '1.125rem', fontWeight: '400' }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }} onDoubleClick={() => setFormData({ ...formData, message: "" })}>
                    <Label htmlFor="message" className="text-sm font-light text-foreground/90">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder=""
                      className="min-h-[240px] border-2 hover-glow focus:shadow-lg transition-all resize-none bg-card/50 backdrop-blur uppercase"
                      style={{ fontSize: '1.125rem', fontWeight: '400' }}
                    />
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

              {/* Back Side - Thank You Message */}
              <div 
                className="glass-card p-4 md:p-12 rounded-3xl w-full absolute top-0 left-0 flex flex-col items-center justify-center text-center min-h-[600px]"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl" />
                
                <div className="relative z-10">
                  <CheckCircle2 className="h-20 w-20 text-primary mb-6 animate-scale-in mx-auto" />
                  <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Thank You!
                  </h3>
                  <p className="text-xl text-muted-foreground mb-8 max-w-md">
                    We've received your message and will get in touch with you shortly.
                  </p>
                </div>
              </div>
            </div>
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