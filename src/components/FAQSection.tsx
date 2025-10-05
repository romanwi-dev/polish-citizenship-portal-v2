import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQSection = () => {
  const faqs = [
    {
      question: "What is Polish citizenship by descent?",
      answer: "Polish citizenship by descent allows individuals with Polish ancestors to claim citizenship through their family lineage. If you have Polish parents, grandparents, or great-grandparents, you may be eligible for Polish citizenship and an EU passport without needing to live in Poland."
    },
    {
      question: "How long does the process take?",
      answer: "The realistic timeline is 1.5 to 4 years, depending on the complexity of your case, document availability, and the workload of Polish authorities. We provide honest timelines based on actual case experience, not marketing promises."
    },
    {
      question: "What are the actual costs?",
      answer: "Our transparent pricing ranges from €3,500 to €12,500+ depending on the complexity of your case. This includes legal fees, document processing, translations, and administrative costs. We provide detailed cost breakdowns upfront with no hidden fees."
    },
    {
      question: "Do I need to speak Polish?",
      answer: "No, you don't need to speak Polish to obtain citizenship by descent. Our team handles all communications with Polish authorities in Polish, and all documents are professionally translated as needed."
    },
    {
      question: "What documents do I need?",
      answer: "Typically you'll need birth certificates, marriage certificates, death certificates, and other vital records from your Polish ancestors. We'll provide a detailed list based on your specific family tree and guide you through obtaining these documents."
    },
    {
      question: "Can I have dual citizenship?",
      answer: "Poland allows dual citizenship, so you can maintain your current citizenship while gaining Polish (EU) citizenship. However, you should verify that your current country also permits dual citizenship."
    },
    {
      question: "What are the benefits of Polish EU citizenship?",
      answer: "Polish citizenship grants you full EU citizenship rights: live, work, and study anywhere in the EU/EEA, visa-free travel to 180+ countries, access to European healthcare and education systems, and the ability to pass citizenship to your children."
    },
    {
      question: "What is your success rate?",
      answer: "We maintain a 100% success rate for eligible cases. Our AI analysis tool accurately assesses eligibility before we take on a case, ensuring we only proceed with applications that have a clear path to success."
    },
    {
      question: "How does the AI Deep Case Analysis work?",
      answer: "Our proprietary AI system analyzes your family tree, historical records, and legal requirements to provide an accurate assessment of your eligibility. It considers multiple legal pathways, potential obstacles, and provides a detailed roadmap for your citizenship application."
    },
    {
      question: "Do I need to visit Poland?",
      answer: "In most cases, you don't need to visit Poland during the application process. We can handle document submission and most procedures remotely. However, some cases may require a brief visit for final formalities or document collection."
    },
    {
      question: "What if my ancestor changed their name?",
      answer: "Name changes are common and don't prevent citizenship claims. We have extensive experience tracing lineage through name changes due to immigration, marriage, or other reasons. Our research team specializes in these complex cases."
    },
    {
      question: "Can Jewish descendants apply?",
      answer: "Yes, Polish-Jewish descendants are eligible for Polish citizenship by descent under the same laws. We have extensive experience with Jewish genealogy and understand the unique challenges of tracing Jewish Polish ancestry."
    }
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Frequently Asked Questions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Everything You Need to Know
            </h2>
            <p className="text-lg text-muted-foreground">
              Common questions about Polish citizenship by descent and our services
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card border border-primary/10 rounded-lg px-6 hover:border-primary/30 transition-all"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help!
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
