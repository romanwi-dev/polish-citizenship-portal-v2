import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Users, Clock, DollarSign, FileText, AlertCircle, HelpCircle } from "lucide-react";

const FAQSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      id: "eligibility",
      title: "ELIGIBILITY",
      icon: Users,
      questions: [
        {
          question: "Who is eligible for Polish citizenship by descent?",
          answer: "You may be eligible if you have Polish ancestors (parent, grandparent, great-grandparent) who were Polish citizens. The key is proving an unbroken chain of citizenship transmission from your Polish ancestor to you. This includes individuals of Polish and Polish-Jewish descent from around the world."
        },
        {
          question: "What if my ancestor left before 1920?",
          answer: "Leaving before 1920 does not automatically make you ineligible. Under the 1920 Citizenship Act and related treaty provisions, people connected to territories that became Poland could acquire (or be deemed to have acquired) Polish citizenship based on domicile/right of residence—even if they had emigrated earlier. We assess where the ancestor was domiciled on 31 January 1920 and shortly after. These cases are complex and document-heavy—our specialty."
        },
        {
          question: "Can I apply through my grandmother's line?",
          answer: "Yes, you can claim citizenship through female ancestors, though the rules vary depending on when your ancestor had children. Polish law changed over time regarding maternal transmission of citizenship. We analyze your specific family timeline to determine the best legal pathway through maternal lineage."
        },
        {
          question: "Can I claim through my great-grandparents?",
          answer: "Yes, many successful cases involve great-grandparents or even earlier generations. The key is proving the unbroken chain of citizenship transmission through each generation. The further back your Polish ancestor, the more complex the documentation requirements, but it's absolutely possible with proper legal representation."
        },
        {
          question: "Do I need to speak Polish?",
          answer: "No, you don't need to speak Polish to obtain citizenship by descent. This is confirmation of existing citizenship rights, not naturalization. Our team handles all communications with Polish authorities in Polish, and all documents are professionally translated by certified translators."
        }
      ]
    },
    {
      id: "process",
      title: "TIMELINE",
      icon: Clock,
      questions: [
        {
          question: "Why does confirmation take time?",
          answer: "Polish citizenship confirmation is a thorough legal process handled by provincial governors (voivodes) in Poland. The realistic timeline is 1.5 to 4 years because: (1) Polish authorities must verify all documents and legal claims thoroughly, (2) Historical records often require extensive research and verification, (3) Government offices in Poland face significant backlogs, (4) Complex cases involving pre-1920 emigration or multiple jurisdictions require additional scrutiny. We provide honest timelines based on actual case experience, not marketing promises."
        },
        {
          question: "Where do I file if I live outside Poland?",
          answer: "Applications are filed with the appropriate provincial governor (voivode) in Poland, determined by your ancestor's last place of residence in Poland or where their records are held. You don't need to be in Poland to file - we handle all submissions and communications with Polish authorities on your behalf. Most of our clients never visit Poland during the confirmation process."
        },
        {
          question: "What happens during the government phase?",
          answer: "After we submit your complete application, the provincial governor's office (voivodeship) reviews all documents, verifies the citizenship chain, and may request additional documents or clarifications. They conduct their own research in Polish archives and coordinate with other Polish government offices. During this phase, we monitor progress, respond to any inquiries, and keep you updated on the status."
        },
        {
          question: "Can the process be expedited?",
          answer: "Unfortunately, there is no legal mechanism to expedite government processing times in Poland. Anyone promising fast-track processing is being dishonest. The timeline depends on the complexity of your case, the efficiency of the specific voivodeship handling your application, and current government backlogs. What we can expedite is the preparation phase - gathering documents, conducting research, and preparing your legal brief."
        },
        {
          question: "What happens after a positive decision?",
          answer: "Once you receive confirmation of Polish citizenship, you can apply for a Polish passport and national ID card (dowód osobisty). The passport application is straightforward and typically takes 1-3 months. You can apply at any Polish consulate or, in some cases, we can assist with applications filed in Poland. With your Polish passport, you have full EU citizenship rights immediately."
        }
      ]
    },
    {
      id: "costs",
      title: "COSTS",
      icon: DollarSign,
      questions: [
        {
          question: "What is the total cost and how do payments work?",
          answer: "Our transparent pricing ranges from €3,500 to €12,500+ depending on case complexity, number of family members, and research requirements. This includes: (1) Complete case analysis and legal research, (2) Document procurement and verification, (3) All translations by certified translators, (4) Legal representation throughout the process, (5) All submissions and communications with Polish authorities. We provide detailed cost breakdowns upfront with no hidden fees. Payment is structured in phases aligned with project milestones."
        },
        {
          question: "What official fees should I expect?",
          answer: "Polish government fees are minimal - typically 50-100 PLN (approximately €10-25) for the confirmation decision certificate. Passport and ID card applications have separate fees of approximately 140 PLN (~€35) for passport and 50 PLN (~€12) for ID card. These government fees are not included in our legal services fees and are paid directly to Polish authorities."
        },
        {
          question: "Are there other expenses?",
          answer: "Additional costs may include: (1) Original document procurement from foreign archives or government offices (varies by country), (2) Apostilles or consular legalizations for foreign documents, (3) Sworn translations of documents in languages other than English or Polish, (4) International courier/shipping fees for original documents. We provide estimates for these costs during the initial analysis phase and help you minimize expenses."
        },
        {
          question: "Do you offer installment plans?",
          answer: "Yes, we structure payments in phases based on project milestones: Initial deposit upon engagement, milestone payments as we complete document collection, research, and application preparation, and final payment upon submission to Polish authorities. This ensures you pay as work progresses and gives you transparency throughout the process."
        },
        {
          question: "Is there a success fee or refund?",
          answer: "We maintain a 100% success rate for eligible cases because our AI analysis tool accurately assesses eligibility before we take on a case. We only accept cases where we're confident in a successful outcome. Our fees are for legal services rendered, not contingent on outcome. However, if our initial analysis determines you're not eligible, we don't proceed further and you're only charged for the analysis phase."
        }
      ]
    },
    {
      id: "documents",
      title: "DOCUMENTS",
      icon: FileText,
      questions: [
        {
          question: "What documents prove my claim?",
          answer: "Essential documents include: (1) Birth certificates for you and each ancestor in the citizenship chain, (2) Marriage certificates if full last names changed, (3) Death certificates for deceased ancestors, (4) Proof of your ancestor's Polish origin (birth records, passport, immigration records), (5) Documents showing your ancestor never renounced Polish citizenship. We guide you through obtaining each document and help locate records in archives worldwide. The specific documents needed vary based on your family circumstances."
        },
        {
          question: "What if my ancestor's Polish records were destroyed?",
          answer: "Record destruction during WWII is common but not insurmountable. We use alternative documentation strategies: (1) Search for duplicate records in church archives, neighboring jurisdictions, or secondary archives, (2) Use immigration/emigration records, passenger manifests, or naturalization documents that reference Polish origin, (3) Leverage testimonial evidence and family records where permitted, (4) Conduct research in multiple Polish and international archives. Our team has extensive experience reconstructing cases with destroyed or incomplete Polish records."
        },
        {
          question: "Do I need to prove my ancestor never renounced Polish citizenship?",
          answer: "Yes, this is a critical requirement. We must demonstrate that each person in the citizenship chain didn't lose Polish citizenship through naturalization in another country before passing citizenship to the next generation. We research naturalization records, use declarations, and in some cases, rely on legal presumptions. This is one of the most complex aspects of citizenship confirmation and requires expert legal analysis of historical citizenship laws."
        },
        {
          question: "Do translations have to be done in Poland?",
          answer: "Translations must be done by certified translators recognized by Polish authorities. This can include sworn translators in Poland or, in some cases, certified translators in your country if the Polish consulate accepts them. We work with a network of qualified translators worldwide and ensure all translations meet Polish legal requirements. All translations must include official stamps and translator certifications."
        },
        {
          question: "Do I need Polish civil records before I can get a passport?",
          answer: "After citizenship confirmation, you'll need to obtain Polish civil status documents (birth certificate, marriage certificate if applicable) from Polish civil registry offices (USC). These are required for passport applications. We can assist with this process, which typically involves registering your foreign documents in the Polish civil registry system. This is a straightforward administrative process once you have your citizenship confirmation."
        }
      ]
    },
    {
      id: "common-issues",
      title: "ISSUES",
      icon: AlertCircle,
      questions: [
        {
          question: '"Pre-1920 emigration" cases',
          answer: "If your ancestor left territories that later became Poland before 1918-1920, they may have been subjects of the Russian Empire, Austro-Hungarian Empire, or Prussian/German territories. Our analysis determines: (1) Whether your ancestor acquired Polish citizenship when Poland regained independence in 1918-1920, (2) Which historical citizenship laws apply to your case, (3) How border changes affect your claim, (4) What documentation strategies work best for your specific territorial situation. We specialize in these complex historical cases and have extensive experience with pre-1920 emigration."
        },
        {
          question: '"My ancestor naturalized abroad—does that break the chain?"',
          answer: "This is the most common obstacle in citizenship cases. If your ancestor naturalized in another country (e.g., became a U.S. citizen), they likely lost Polish citizenship at that moment - but there are critical nuances: (1) If they had children BEFORE naturalizing, those children may have acquired Polish citizenship at birth, (2) The timing of naturalization relative to births is crucial, (3) Some historical periods had different rules, (4) Lack of documentation about naturalization can sometimes work in your favor. We conduct thorough research in naturalization records and apply sophisticated legal analysis to determine if the citizenship chain survived naturalization."
        },
        {
          question: "Our full last name changed after immigration. Is that a problem?",
          answer: "Name changes are extremely common and don't prevent citizenship claims. Immigration officials often anglicized or modified Polish full last names. We establish identity continuity through: (1) Documents showing the name change (naturalization papers, court records, early U.S. documents showing both names), (2) Family tree documentation linking the different full last name variants, (3) Declarations or affidavits where permitted. Our research team specializes in tracing lineage through name changes due to immigration, marriage, translation variations, or deliberate changes."
        },
        {
          question: "Can Americans keep their U.S. citizenship after confirmation?",
          answer: "Yes, absolutely. Poland allows dual citizenship, and the United States does not prohibit dual citizenship. Confirming Polish citizenship doesn't affect your U.S. citizenship because you're not naturalizing - you're simply confirming citizenship rights you always had by descent. You maintain all rights and obligations of U.S. citizenship while gaining EU citizenship benefits. However, you should consult a U.S. tax advisor about potential reporting requirements for U.S. citizens abroad."
        },
        {
          question: "What if the application is refused?",
          answer: "Refusals are rare when working with experienced legal representation, but if it happens: (1) We analyze the refusal decision to understand the specific legal grounds, (2) We determine if an appeal is viable or if additional documentation can address the concerns, (3) We may identify alternative legal strategies or pathways. Our thorough upfront analysis minimizes refusal risk - we only proceed with cases we're confident will succeed. If our analysis determines you're not eligible, we advise you honestly before investing in a full application."
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
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Find Answers Instantly
              </span>
            </h2>
            <div className="mb-16" />
          </div>

          {/* Search Bar */}
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Type to filter questions (e.g., pre-1920, naturalization, translations)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base glass-card border-primary/20 focus:border-primary/40 relative z-10"
            />
          </div>

          {/* FAQ Tabs */}
          <Tabs defaultValue="eligibility" className="w-full">
            <div className="overflow-x-auto lg:overflow-visible mb-8">
              <TabsList className="inline-flex lg:grid w-max lg:w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-2 bg-background/50 backdrop-blur-sm border border-primary/10">
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

          {/* CTA */}
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-2xl font-bold px-20 py-6 h-auto rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 transition-all"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Request More Info
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
