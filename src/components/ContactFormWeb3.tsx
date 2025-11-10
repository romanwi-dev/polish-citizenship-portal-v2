import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap, CheckCircle2, Clock, Gift } from "lucide-react";
import { z } from "zod";
import { CelebrationBackground } from "./backgrounds/CelebrationBackground";

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  message: z.string().trim().max(1000).optional(),
});

const ContactFormWeb3 = () => {
  const { toast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

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

  const toggleCardFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden overflow-x-hidden">
      
      {/* Celebration Background - Stars, Sparkles & Fireworks */}
      <div className="absolute inset-0 z-0">
        <CelebrationBackground />
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Connect With Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Check Your Eligibility and Chances
            </span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto px-0 md:px-2">
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
                className="p-4 md:p-12 rounded-lg w-full"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                
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
                        noMobileCaps
                        className="h-14 md:h-16 border-2 border-blue-500/20 hover:border-blue-500/30 focus:border-blue-500/40 hover-glow focus:shadow-lg transition-all backdrop-blur"
                        style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '400',
                          backgroundColor: 'rgba(10, 20, 45, 0.6)',
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
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
                        noMobileCaps
                        className="h-14 md:h-16 border-2 border-blue-500/20 hover:border-blue-500/30 focus:border-blue-500/40 hover-glow focus:shadow-lg transition-all backdrop-blur"
                        style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '400',
                          backgroundColor: 'rgba(10, 20, 45, 0.6)',
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
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
                      className="min-h-[240px] border-2 border-blue-500/20 hover:border-blue-500/30 focus:border-blue-500/40 hover-glow focus:shadow-lg transition-all resize-none backdrop-blur"
                      style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '400',
                        backgroundColor: 'rgba(10, 20, 45, 0.6)',
                        boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                      }}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 w-full"
                  >
                    <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
                      Send Your Info
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </form>
              </div>

              {/* Back Side - Thank You Message */}
              <div 
                className="glass-card p-4 md:p-12 rounded-lg w-full absolute top-0 left-0 flex flex-col items-center justify-center text-center min-h-[600px]"
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Thank You!
                  </h3>
                  <p className="text-xl text-muted-foreground mb-8">
                    Message received. We will get in touch with you in less than one hour...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-12">
            {[
              { 
                icon: Zap, 
                label: "AI Response", 
                value: "< 5 mins",
                details: "Advanced AI analyzes your case instantly based on 25,000+ cases and Polish law. Get preliminary assessment with document checklist."
              },
              { 
                icon: Mail, 
                label: "Human Response", 
                value: "< 1 hour",
                details: "Expert legal team reviews your case personally. Receive comprehensive analysis with timeline estimates and strategic recommendations."
              },
              { 
                icon: Clock, 
                label: "Consultation", 
                value: "24/7",
                details: "Book consultations at your convenience across all time zones. Video calls, phone, or email - we're available when you need us."
              },
              { 
                icon: Gift, 
                label: "Assessment", 
                value: "Free",
                details: "No obligation, no cost for initial eligibility review. We analyze your family history and determine your chances before any commitment."
              }
            ].map((stat, i) => (
              <div 
                key={i} 
                className="w-full max-w-[280px] mx-auto md:max-w-none cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={() => toggleCardFlip(i)}
              >
                <div 
                  className="relative w-full transition-transform duration-700"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: flippedCards.has(i) ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front Side */}
                  <div 
                    className="glass-card p-6 rounded-lg hover-glow w-full min-h-[180px] flex flex-col"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    <stat.icon className="h-6 w-6 mb-3 opacity-50 text-primary" />
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                    <div className="text-xs text-primary/50 mt-auto pt-2">Click for details</div>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="glass-card p-6 rounded-lg w-full absolute top-0 left-0 min-h-[180px] flex flex-col justify-center"
                    style={{ 
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="text-lg md:text-base text-primary font-bold mb-3">{stat.label}</div>
                    <p className="text-sm md:text-xs text-muted-foreground/50 leading-relaxed font-normal">
                      {stat.details}
                    </p>
                    <div className="text-xs text-primary/50 mt-auto pt-2">Click to flip back</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormWeb3;