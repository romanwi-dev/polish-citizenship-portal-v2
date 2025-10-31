import { Check, Train, Plane, Zap } from "lucide-react";
import { Button } from "./ui/button";

const PricingSection = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Transparent Real Pricing</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                True Transparent Pricing
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16">
              Professional Polish citizenship by descent application services. The process involves complex legal requirements and requires expert guidance.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Standard */}
            <div className="glass-card p-8 rounded-3xl hover-glow relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Train className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Standard</h3>
                  <p className="text-sm text-muted-foreground">Like traveling by train</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  €1,500 - €3,500
                </div>
                <div className="text-sm text-muted-foreground">375-583 EUR per installment</div>
                <div className="text-sm text-muted-foreground">4-6 installments</div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Timeline</div>
                <div className="text-lg font-semibold">36-48 months average</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Lower installment values</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic legal guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Standard document processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Regular case updates</span>
                </li>
              </ul>

              <Button 
                className="w-full" 
                variant="outline"
                onClick={scrollToContact}
              >
                Get Started
              </Button>
            </div>

            {/* Expedited - Most Popular */}
            <div className="glass-card p-8 rounded-3xl hover-glow relative border-2 border-primary/50">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold whitespace-nowrap min-w-[120px] text-center">
                Most Popular
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Expedited</h3>
                  <p className="text-sm text-muted-foreground">Like business class flight</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">
                  €3,500 - €8,000
                </div>
                <div className="text-sm text-muted-foreground">500-889 EUR per installment</div>
                <div className="text-sm text-muted-foreground">7-9 installments</div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Timeline</div>
                <div className="text-lg font-semibold">18-36 months</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">50% higher installment value</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Priority case handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Expedited document processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Phone & email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Weekly progress updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Dedicated case manager</span>
                </li>
              </ul>

              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-glow"
                onClick={scrollToContact}
              >
                Get Started
              </Button>
            </div>

            {/* VIP */}
            <div className="glass-card p-8 rounded-3xl hover-glow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent/80 to-primary/80 text-white text-sm font-semibold whitespace-nowrap min-w-[120px] text-center">
                Waitlist...
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">VIP</h3>
                  <p className="text-sm text-muted-foreground">Like flying private jet</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">
                  €12,500+
                </div>
                <div className="text-sm text-muted-foreground">Flat fee per person</div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-muted-foreground mb-1">Timeline</div>
                <div className="text-lg font-semibold">14-18 months</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Fastest processing possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">White glove service</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Direct government liaison</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">24/7 support access</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Daily updates if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Personal legal team</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">All schemes included</span>
                </li>
              </ul>

              <Button 
                className="w-full" 
                variant="outline"
                onClick={scrollToContact}
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-card/10 hover:bg-card/20 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-border/30" 
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            aria-label="Take the Polish Citizenship Test to check your eligibility"
          >
            <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
              Take Polish Citizenship Test
            </span>
            <div className="absolute inset-0 bg-card/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;