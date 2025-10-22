import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const LightThemeHero2 = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Minimal Badge */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-full">
              Simple. Clear. Effective.
            </span>
          </div>

          {/* Ultra-clean Heading */}
          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 text-center mb-8 leading-none tracking-tight">
            Polish
            <br />
            <span className="text-slate-400">Citizenship</span>
          </h1>

          {/* Minimal Description */}
          <p className="text-xl md:text-2xl text-slate-600 text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            Your path to European citizenship made simple
          </p>

          {/* Clean CTA */}
          <div className="flex justify-center mb-16">
            <Button
              size="lg"
              className="text-lg px-10 py-7 bg-slate-900 text-white hover:bg-slate-800 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={() => window.open('https://poland-citizenship-test.typeform.com/to/VWIaQFRG', '_blank')}
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Minimal Feature List */}
          <div className="max-w-md mx-auto space-y-4">
            {[
              'Expert legal guidance',
              'End-to-end support',
              'Transparent pricing'
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-slate-700"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeHero2;
