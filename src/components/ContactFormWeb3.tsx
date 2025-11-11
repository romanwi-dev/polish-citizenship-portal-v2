import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Zap, CheckCircle2, Clock, Gift } from "lucide-react";
import { z } from "zod";
import { CelebrationBackground } from "./backgrounds/CelebrationBackground";

const COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "South Africa", "Brazil", 
  "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France", "Other"
];

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  country: z.string().min(1, "Please select a country"),
  polishAncestor: z.string().min(1, "Please select your Polish ancestor"),
  polishDocuments: z.string().min(1, "Please select an option"),
});

const ContactFormWeb3 = () => {
  const { toast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    polishAncestor: "",
    polishDocuments: "",
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
      
      setFormData({ name: "", email: "", country: "", polishAncestor: "", polishDocuments: "" });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
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

        <div className="max-w-full md:max-w-[1400px] mx-auto px-0 md:px-2">
          <div className="relative w-full min-h-[900px] md:min-h-[750px]" style={{ perspective: '1000px' }}>
            <div 
              className="relative w-full h-full transition-transform duration-700"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front Side - Form */}
              <div 
                className={`w-full absolute inset-0 ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  opacity: isFlipped ? 0 : 1,
                  transition: 'opacity 0s 0.35s'
                }}
              >
                <div className="glass-card p-6 md:p-12 rounded-2xl backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
                  <form 
                    onSubmit={handleSubmit} 
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-base bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Name *</Label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, name: "" });
                          }}
                          placeholder=""
                          required
                          autoComplete="name"
                          className="h-14 border-2 border-blue-900/30 hover-glow focus:shadow-lg bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-xl md:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Email *</Label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, email: "" });
                          }}
                          placeholder=""
                          required
                          autoComplete="email"
                          className="h-14 border-2 border-blue-900/30 hover-glow focus:shadow-lg bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-xl md:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                      <Label htmlFor="country" className="text-base bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleSelectChange("country", value)}
                      >
                        <SelectTrigger className="!h-14 !border-2 !border-blue-900/30 hover-glow focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent">
                          <SelectValue placeholder="Select your country" className="!text-sm bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-[100]">
                          {COUNTRIES.map((country) => (
                            <SelectItem
                              key={country}
                              value={country}
                              className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3"
                            >
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <Label htmlFor="polishAncestor" className="text-base bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Polish Ancestor</Label>
                      <Select
                        value={formData.polishAncestor}
                        onValueChange={(value) => handleSelectChange("polishAncestor", value)}
                      >
                        <SelectTrigger className="!h-14 !border-2 !border-blue-900/30 hover-glow focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent">
                          <SelectValue placeholder="Select your Polish ancestor" className="!text-sm bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-[100]">
                          <SelectItem value="mother" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">Mother</SelectItem>
                          <SelectItem value="father" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">Father</SelectItem>
                          <SelectItem value="grandmother" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">Grandmother</SelectItem>
                          <SelectItem value="grandfather" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">Grandfather</SelectItem>
                          <SelectItem value="great-grandmother" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">Great-grandmother</SelectItem>
                          <SelectItem value="great-grandfather" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">Great-grandfather</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                      <Label htmlFor="polishDocuments" className="text-base bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Polish Documents</Label>
                      <Select
                        value={formData.polishDocuments}
                        onValueChange={(value) => handleSelectChange("polishDocuments", value)}
                      >
                        <SelectTrigger className="!h-14 !border-2 !border-blue-900/30 hover-glow focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent">
                          <SelectValue placeholder="Select an option" className="!text-sm bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-2 z-[100]">
                          <SelectItem value="have-documents" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">I have some Polish documents of my family</SelectItem>
                          <SelectItem value="no-documents" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">I don't have any Polish documents</SelectItem>
                          <SelectItem value="need-check" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">I need to check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      className="text-xl md:text-2xl font-bold px-12 py-6 md:px-20 h-24 md:h-20 rounded-lg !bg-blue-50/30 dark:!bg-blue-950/30 hover:!bg-blue-50/40 dark:hover:!bg-blue-950/40 !border-2 !border-blue-900/30 hover-glow focus:shadow-lg transition-all backdrop-blur w-full"
                    >
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
                        Send Your Info
                      </span>
                    </Button>
                  </form>
                </div>
              </div>

              {/* Back Side - Thank You Message */}
              <div 
                className={`w-full absolute inset-0 ${!isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  opacity: isFlipped ? 1 : 0,
                  transition: 'opacity 0s 0.35s'
                }}
              >
                <div className="glass-card p-6 md:p-12 rounded-2xl backdrop-blur-xl border-2 border-primary/20 shadow-2xl min-h-[600px] flex flex-col items-center justify-center">
                  <div className="relative z-10 space-y-6 text-center">
                    <p className="text-foreground text-2xl md:text-3xl font-semibold">
                      Thank you. We will get back to you shortly...
                    </p>
                    <Button
                      onClick={() => {
                        setIsFlipped(false);
                        setFormData({ name: "", email: "", country: "", polishAncestor: "", polishDocuments: "" });
                      }}
                      variant="outline"
                      className="hover-glow"
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-32 md:mt-32 lg:mt-32">
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
                  className="relative w-full h-full transition-transform duration-700"
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
                    <div className="text-center flex-1 flex flex-col items-center justify-center">
                      <stat.icon className="h-6 w-6 mb-3 opacity-50 text-primary" />
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-lg md:text-xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stat.label}</div>
                    </div>
                    <div className="text-xs text-primary/50 text-center mt-8">Click for details</div>
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
                    <div className="text-lg md:text-2xl text-primary font-bold mb-3">{stat.label}</div>
                    <p className="text-sm md:text-lg text-muted-foreground/70 leading-relaxed">
                      {stat.details}
                    </p>
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