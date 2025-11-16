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
  const { t, i18n } = useTranslation();
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

  return (
    <section id="faq" className="py-24 relative overflow-hidden overflow-x-hidden" dir={i18n.language === 'he' ? 'rtl' : 'ltr'}>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('faq.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {t('faq.title')}
              </span>
            </h2>
          </div>

          {/* Search Bar */}
          <div className="mb-8 w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 pointer-events-none z-20" />
              <Input
                type="text"
                placeholder={t('faq.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-sm font-normal glass-card border-primary/20 focus:border-primary/40 transition-opacity relative z-10 placeholder:text-xs placeholder:font-light placeholder:opacity-40 w-full"
                style={{ backgroundColor: 'rgba(10, 20, 45, 0.6)' }}
              />
            </div>
          </div>

          {/* FAQ Tabs */}
          <Tabs defaultValue="eligibility" className="w-full">
            <div className="mb-8 w-full overflow-x-auto scrollbar-hide">
              <TabsList className="flex lg:grid w-max lg:w-full grid-cols-5 gap-2 h-auto p-2">
                {faqCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex flex-col items-center gap-2 py-3 px-4 min-w-[140px] lg:min-w-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs font-medium whitespace-nowrap"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-center leading-tight">{category.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className="mb-6 flex items-center gap-3">
                    <Icon className="w-6 h-6 text-primary" />
                    <h3 className="text-2xl font-bold text-primary">{category.title}</h3>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="glass-card border border-primary/10 rounded-lg px-6 hover:border-primary/30 transition-all"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-6">
                          <span className="text-lg font-semibold pr-4 opacity-50">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-lg font-faq-light font-light">
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

          <MainCTA
            wrapperClassName="flex justify-center mt-40 mb-20 animate-fade-in"
            animationDelay="400ms"
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            ariaLabel="Take the Polish Citizenship Test to check your eligibility"
          >
            {t('hero.cta')}
          </MainCTA>

        </div>
      </div>
    </section>
  );
};

export default FAQSection;
