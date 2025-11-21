import { useState, useCallback, memo } from "react";
import { Mail, Zap, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainCTA } from "@/components/ui/main-cta";
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
import { z } from "zod";
import { CelebrationBackground } from "./backgrounds/CelebrationBackground";
import EUCelebrationSection from "./EUCelebrationSection";
import thankYou1 from "@/assets/thank-you/thank-you-1.jpg";
import { useTranslation } from "react-i18next";
import { BenefitCard } from "./BenefitCard";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "South Africa", "Brazil", 
  "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France", "Other"
];

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  country: z.string().min(1, "Please select a country"),
  polishAncestor: z.string().min(1, "Please select your Polish ancestor"),
  yearOfEmigration: z.string().optional(),
  polishDocuments: z.string().min(1, "Please select an option"),
});

const ContactFormWeb3 = memo(() => {
  const { t, i18n } = useTranslation('landing');
  const { toast } = useToast();
  const [isFlipped, setIsFlipped] = useState(false);
  const isRTL = i18n.language === 'he';
  
  // Debug logging removed for production
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    polishAncestor: "",
    yearOfEmigration: "",
    polishDocuments: "",
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      contactSchema.parse(formData);
      
      setIsFlipped(true);
      
      setFormData({ name: "", email: "", country: "", polishAncestor: "", yearOfEmigration: "", polishDocuments: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    }
  }, [formData, toast]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, selectionStart, selectionEnd } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Restore cursor position after state update
    requestAnimationFrame(() => {
      if (e.target && selectionStart !== null) {
        e.target.setSelectionRange(selectionStart, selectionEnd);
      }
    });
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const toggleCardFlip = useCallback((index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  return (
    <section 
      id="contact" 
      className="pt-12 md:pt-20 pb-0 relative overflow-hidden overflow-x-hidden"
      aria-labelledby="contact-heading"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      
      {/* Celebration Background - Stars, Sparkles & Fireworks */}
      <div className="absolute inset-0 z-0">
        <CelebrationBackground />
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        {/* Badge - Above Title */}
        <div className="flex justify-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card w-fit max-w-[280px] mx-auto md:max-w-none border border-primary/30">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('contact.badge')}</span>
          </div>
        </div>
        
        {/* Title */}
        <div className="text-center mb-32">
          <h2 
            id="contact-heading" 
            className="text-4xl md:text-5xl font-heading font-black tracking-tight"
          >
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('contact.title')}
            </span>
          </h2>
        </div>

        <div className="max-w-full md:max-w-[1400px] mx-auto px-0 md:px-2 mt-16">
          <div 
            className="relative w-full animate-fade-in z-20" 
            style={{ 
              perspective: '1000px',
              animationDelay: '100ms',
              height: '900px'
            }}
          >
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
                    aria-label="Contact form"
                    noValidate
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">{t('contact.nameLabel')} *</Label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t('contact.namePlaceholder')}
                          required
                          autoComplete="name"
                          aria-required="true"
                          aria-invalid={formData.name.length > 0 && formData.name.trim().length === 0}
                          className="h-14 border-2 border-blue-900/30 form-input-glow bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-xl md:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">{t('contact.emailLabel')} *</Label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t('contact.emailPlaceholder')}
                          required
                          autoComplete="email"
                          className="h-14 border-2 border-blue-900/30 form-input-glow bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-xl md:text-base w-full rounded-md px-3 outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Country + Polish Ancestor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">{t('contact.countryLabel')}</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => handleSelectChange("country", value)}
                        >
                          <SelectTrigger className={cn(
                            "!h-14 !border-2 !border-blue-900/30 dark:!shadow-none focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent",
                            isRTL && "[&>svg]:order-first [&>svg]:mr-2"
                          )}>
                            <SelectValue placeholder={t('contact.countryPlaceholder')} className="!text-sm bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-card dark:border-border bg-background border-2 z-[100] max-h-[300px] overflow-auto">
                            {COUNTRIES.map((country) => (
                              <SelectItem
                                key={country}
                                value={country}
                                className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 dark:bg-card dark:hover:bg-primary/10 bg-background hover:bg-primary/5"
                              >
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="polishAncestor" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">{t('contact.ancestorLabel')}</Label>
                        <Select
                          value={formData.polishAncestor}
                          onValueChange={(value) => handleSelectChange("polishAncestor", value)}
                        >
                          <SelectTrigger className={cn(
                            "!h-14 !border-2 !border-blue-900/30 dark:!shadow-none focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent",
                            isRTL && "[&>svg]:order-first [&>svg]:mr-2"
                          )}>
                            <SelectValue placeholder={t('contact.ancestorPlaceholder')} className="!text-sm bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-card dark:border-border bg-background border-2 z-[100]">
                            <SelectItem value="mother" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">{t('contact.ancestorMother')}</SelectItem>
                            <SelectItem value="father" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">{t('contact.ancestorFather')}</SelectItem>
                            <SelectItem value="grandmother" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">{t('contact.ancestorGrandmother')}</SelectItem>
                            <SelectItem value="grandfather" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">{t('contact.ancestorGrandfather')}</SelectItem>
                            <SelectItem value="great-grandmother" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">{t('contact.ancestorGreatGrandmother')}</SelectItem>
                            <SelectItem value="great-grandfather" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3">{t('contact.ancestorGreatGrandfather')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 3: Year of Emigration + Polish Documents */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="yearOfEmigration" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">{t('contact.yearLabel')}</Label>
                        <Select
                          value={formData.yearOfEmigration}
                          onValueChange={(value) => handleSelectChange("yearOfEmigration", value)}
                        >
                          <SelectTrigger className={cn(
                            "!h-14 !border-2 !border-blue-900/30 dark:!shadow-none focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent",
                            isRTL && "[&>svg]:order-first [&>svg]:mr-2"
                          )}>
                            <SelectValue placeholder={t('contact.yearPlaceholder')} className="!text-sm bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-card dark:border-border bg-background border-2 z-[100]">
                            <SelectItem value="before-1920" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">before 1920</SelectItem>
                            <SelectItem value="1920-1939" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">1920 - 1939</SelectItem>
                            <SelectItem value="1939-1951" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">1939 - 1951</SelectItem>
                            <SelectItem value="1951-1962" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">1951 - 1962</SelectItem>
                            <SelectItem value="1962-1989" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">1962 - 1989</SelectItem>
                            <SelectItem value="1989-2004" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">1989 - 2004</SelectItem>
                            <SelectItem value="after-2004" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">after 2004</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="polishDocuments" className="text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">{t('contact.polishDocuments')}</Label>
                        <Select
                          value={formData.polishDocuments}
                          onValueChange={(value) => handleSelectChange("polishDocuments", value)}
                        >
                          <SelectTrigger className={cn(
                            "!h-14 !border-2 !border-blue-900/30 dark:!shadow-none focus:shadow-lg !bg-blue-50/30 dark:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-lg [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent",
                            isRTL && "[&>svg]:order-first [&>svg]:mr-2"
                          )}>
                            <SelectValue placeholder={t('contact.selectOption')} className="!text-sm bg-gradient-to-r from-slate-500 to-slate-700 bg-clip-text text-transparent" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-card dark:border-border bg-background border-2 z-[100]">
                            <SelectItem value="have-documents" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">{t('contact.haveDocuments')}</SelectItem>
                            <SelectItem value="no-documents" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">{t('contact.noDocuments')}</SelectItem>
                            <SelectItem value="need-check" className="text-xl md:text-lg cursor-pointer hover:bg-primary/10 py-3 text-foreground">{t('contact.needCheck')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      size="lg"
                      className="text-xl md:text-2xl font-bold px-12 py-6 md:px-20 h-24 md:h-20 rounded-lg !bg-blue-50/30 dark:!bg-blue-950/30 hover:!bg-blue-50/40 dark:hover:!bg-blue-950/40 !border-2 !border-blue-900/30 transition-all duration-300 hover:scale-105 hover:shadow-xl backdrop-blur w-full"
                    >
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
                        {t('contact.submitButton')}
                      </span>
                    </Button>
                  </form>
                </div>
              </div>

              {/* Back Side - Thank You Message */}
              <div 
                className={`w-full h-[900px] absolute inset-0 ${!isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                style={{ 
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  opacity: isFlipped ? 1 : 0,
                  transition: 'opacity 0s 0.35s'
                }}
              >
                <div className="glass-card p-6 md:p-12 rounded-2xl backdrop-blur-xl border-2 border-primary/20 shadow-2xl h-full flex flex-col md:flex-row items-center justify-center gap-8 relative overflow-hidden">
                  {/* Left Side - Image */}
                  <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
                    <img 
                      src={thankYou1} 
                      alt="Professional with passport" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  {/* Right Side - Message */}
                  <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-12 text-center px-4">
                    <p className="bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent text-2xl md:text-3xl font-semibold">
                      {t('contact.thankYouMessage')}
                    </p>
                    <Button
                      onClick={() => {
                        setIsFlipped(false);
                        setFormData({ name: "", email: "", country: "", polishAncestor: "", yearOfEmigration: "", polishDocuments: "" });
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

          {/* Five Sequential Arrows Animation */}
          <div 
            className="flex justify-center -mt-8 md:-mt-32 mb-2 cursor-pointer hover:opacity-80 transition-opacity relative z-10"
            onClick={() => {
              const responseCard = document.getElementById('response-time-card');
              if (responseCard) {
                responseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/20 animate-[bounce_1.5s_ease-in-out_infinite]" 
                style={{ animationDelay: '0s' }} />
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/40 animate-[bounce_1.5s_ease-in-out_infinite]" 
                style={{ animationDelay: '0.15s' }} />
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/60 animate-[bounce_1.5s_ease-in-out_infinite]" 
                style={{ animationDelay: '0.3s' }} />
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/80 animate-[bounce_1.5s_ease-in-out_infinite]" 
                style={{ animationDelay: '0.45s' }} />
              <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary animate-[bounce_1.5s_ease-in-out_infinite]" 
                style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 max-w-md mx-auto mt-0 mb-24">
            {[
              { 
                icon: Zap, 
                label: t('contact.benefit1Title'), 
                value: t('contact.benefit1Desc'),
                details: "Advanced AI analyzes your case instantly based on 25,000+ cases and Polish law. Get preliminary assessment with document checklist.",
                id: "response-time-card"
              },
              { 
                icon: Mail, 
                label: t('contact.benefit2Title'), 
                value: t('contact.benefit2Desc'),
                details: "Expert legal team reviews your case personally. Receive comprehensive analysis with timeline estimates and strategic recommendations."
              },
              { 
                icon: Clock, 
                label: t('contact.benefit3Title'), 
                value: t('contact.benefit3Desc'),
                details: "Book consultations at your convenience across all time zones. Video calls, phone, or email - we're available when you need us."
              },
              { 
                icon: Gift, 
                label: t('contact.benefit4Title'), 
                value: t('contact.benefit4Desc'),
                details: "No obligation, no cost for initial eligibility review. We analyze your family history and determine your chances before any commitment."
              }
            ].map((stat, i) => (
              <BenefitCard
                key={`benefit-${i}`}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                details={stat.details}
                id={stat.id}
                index={i}
                isFlipped={flippedCards.has(i)}
                onToggleFlip={() => toggleCardFlip(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

ContactFormWeb3.displayName = 'ContactFormWeb3';

export default ContactFormWeb3;