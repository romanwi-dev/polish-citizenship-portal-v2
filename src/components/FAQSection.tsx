import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MainCTA } from "@/components/ui/main-cta";
import { Search, Users, Clock, DollarSign, FileText, AlertCircle, HelpCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

const FAQSection = () => {
  const { t, i18n } = useTranslation('landing');
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      id: "eligibility",
      title: t('faq.eligibility.title'),
      icon: Users,
      questions: [
        {
          question: t('faq.eligibility.q1'),
          answer: t('faq.eligibility.a1')
        },
        {
          question: t('faq.eligibility.q2'),
          answer: t('faq.eligibility.a2')
        },
        {
          question: t('faq.eligibility.q3'),
          answer: t('faq.eligibility.a3')
        },
        {
          question: t('faq.eligibility.q4'),
          answer: t('faq.eligibility.a4')
        },
        {
          question: t('faq.eligibility.q5'),
          answer: t('faq.eligibility.a5')
        }
      ]
    },
    {
      id: "process",
      title: t('faq.timeline.title'),
      icon: Clock,
      questions: [
        {
          question: t('faq.timeline.q1'),
          answer: t('faq.timeline.a1')
        },
        {
          question: t('faq.timeline.q2'),
          answer: t('faq.timeline.a2')
        },
        {
          question: t('faq.timeline.q3'),
          answer: t('faq.timeline.a3')
        },
        {
          question: t('faq.timeline.q4'),
          answer: t('faq.timeline.a4')
        },
        {
          question: t('faq.timeline.q5'),
          answer: t('faq.timeline.a5')
        }
      ]
    },
    {
      id: "costs",
      title: t('faq.costs.title'),
      icon: DollarSign,
      questions: [
        {
          question: t('faq.costs.q1'),
          answer: t('faq.costs.a1')
        },
        {
          question: t('faq.costs.q2'),
          answer: t('faq.costs.a2')
        },
        {
          question: t('faq.costs.q3'),
          answer: t('faq.costs.a3')
        },
        {
          question: t('faq.costs.q4'),
          answer: t('faq.costs.a4')
        },
        {
          question: t('faq.costs.q5'),
          answer: t('faq.costs.a5')
        }
      ]
    },
    {
      id: "documents",
      title: t('faq.documents.title'),
      icon: FileText,
      questions: [
        {
          question: t('faq.documents.q1'),
          answer: t('faq.documents.a1')
        },
        {
          question: t('faq.documents.q2'),
          answer: t('faq.documents.a2')
        },
        {
          question: t('faq.documents.q3'),
          answer: t('faq.documents.a3')
        },
        {
          question: t('faq.documents.q4'),
          answer: t('faq.documents.a4')
        },
        {
          question: t('faq.documents.q5'),
          answer: t('faq.documents.a5')
        }
      ]
    },
    {
      id: "common-issues",
      title: t('faq.issues.title'),
      icon: AlertCircle,
      questions: [
        {
          question: t('faq.issues.q1'),
          answer: t('faq.issues.a1')
        },
        {
          question: t('faq.issues.q2'),
          answer: t('faq.issues.a2')
        },
        {
          question: t('faq.issues.q3'),
          answer: t('faq.issues.a3')
        },
        {
          question: t('faq.issues.q4'),
          answer: t('faq.issues.a4')
        },
        {
          question: t('faq.issues.q5'),
          answer: t('faq.issues.a5')
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const isRTL = i18n.language === 'he';

  return (
    <section key={i18n.language} id="faq" className="py-12 md:py-20 relative overflow-hidden overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge - Above Title */}
          <div className="flex justify-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('faq.badge')}</span>
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center mb-32">
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {t('faq.title')}
              </span>
            </h2>
          </div>

          {/* Search Bar */}
          <div className="mb-8 w-full">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 pointer-events-none z-20`} />
              <Input
                type="text"
                placeholder={t('faq.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-12' : 'pl-12'} h-14 text-sm font-normal glass-card border-primary/20 focus:border-primary/40 transition-opacity relative z-10 placeholder:text-xs placeholder:font-light placeholder:opacity-40 w-full`}
                style={{ backgroundColor: 'rgba(10, 20, 45, 0.6)' }}
              />
            </div>
          </div>

          {/* FAQ Tabs */}
          <Tabs defaultValue="eligibility" className="w-full">
            <div className={`mb-8 w-full overflow-x-auto scrollbar-hide ${isRTL ? 'flex flex-row-reverse' : ''}`}>
              <TabsList className={`flex lg:grid w-max lg:w-full grid-cols-5 gap-2 h-auto p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex flex-col items-center gap-2 py-3 px-4 min-w-[140px] lg:min-w-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs font-medium whitespace-normal break-words hyphens-auto leading-tight"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-center leading-tight max-w-full">{category.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className={`mb-6 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Icon className="w-6 h-6 text-primary" />
                    <h3 className={`text-2xl font-bold text-primary ${isRTL ? 'text-right' : ''}`}>{category.title}</h3>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="glass-card border border-primary/10 rounded-lg px-6 hover:border-primary/30 transition-all"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        <AccordionTrigger className={`hover:no-underline py-6 ${isRTL ? 'flex-row-reverse justify-end [&>svg]:ml-0 [&>svg]:mr-auto' : ''}`}>
                          <span className={`text-lg font-semibold flex-1 ${isRTL ? 'text-right pl-4' : 'text-left pr-4'}`}>{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className={`text-muted-foreground pb-6 leading-relaxed text-lg font-faq-light font-light ${isRTL ? 'text-right' : 'text-left'}`}>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              );
            })}
          </Tabs>

          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No questions match your search. Try different keywords.</p>
            </div>
          )}

          <div className="flex justify-center mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <MainCTA
              onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
              ariaLabel="Take the Polish Citizenship Test to check your eligibility"
            >
              {t('hero.cta')}
            </MainCTA>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FAQSection;
