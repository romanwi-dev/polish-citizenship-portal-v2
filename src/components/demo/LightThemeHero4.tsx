import { Button } from "@/components/ui/button";
import { Building2, Users2, Award, TrendingUp } from "lucide-react";

const LightThemeHero4 = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Corporate Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold">
                <Building2 className="h-4 w-4" />
                Established 2009
              </div>

              {/* Professional Heading */}
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                Polish Citizenship
                <br />
                <span className="text-slate-600">Legal Services</span>
              </h1>

              {/* Professional Description */}
              <p className="text-lg text-slate-700 leading-relaxed max-w-xl">
                Premier immigration law firm specializing in Polish citizenship by descent. 
                Our team of certified attorneys provides comprehensive legal support throughout your application process.
              </p>

              {/* Professional CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-slate-900 text-white hover:bg-slate-800 h-14 px-8 text-base font-semibold"
                  onClick={() => window.open('https://poland-citizenship-test.typeform.com/to/VWIaQFRG', '_blank')}
                >
                  Schedule Consultation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-900 text-slate-900 hover:bg-slate-50 h-14 px-8 text-base font-semibold"
                >
                  View Our Services
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-slate-600 font-medium">Accredited Firm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-slate-600 font-medium">Licensed Attorneys</span>
                </div>
              </div>
            </div>

            {/* Right Column - Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: TrendingUp, value: "15+", label: "Years in Business", bg: "bg-blue-50", text: "text-blue-900" },
                { icon: Users2, value: "10,000+", label: "Clients Served", bg: "bg-emerald-50", text: "text-emerald-900" },
                { icon: Award, value: "98%", label: "Success Rate", bg: "bg-amber-50", text: "text-amber-900" },
                { icon: Building2, value: "5", label: "Office Locations", bg: "bg-purple-50", text: "text-purple-900" }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.bg} p-8 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1`}
                >
                  <stat.icon className={`h-10 w-10 ${stat.text} mb-4`} />
                  <div className={`text-4xl font-bold ${stat.text} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-700 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeHero4;
