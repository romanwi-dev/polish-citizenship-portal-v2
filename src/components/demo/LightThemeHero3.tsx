import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Star } from "lucide-react";

const LightThemeHero3 = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Colorful Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Vibrant Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-sm font-bold text-white">
              Premium Legal Services
            </span>
          </div>

          {/* Bold Gradient Heading */}
          <h1 className="text-6xl md:text-8xl font-black leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Unlock Your
              <br />
              European Future
            </span>
          </h1>

          {/* Colorful Description */}
          <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Fast-track your Polish citizenship with our expert team. 
            Join thousands who've claimed their European heritage.
          </p>

          {/* Bold CTA */}
          <div className="pt-4">
            <Button
              size="lg"
              className="text-lg px-12 py-8 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-[0_20px_60px_rgba(147,51,234,0.4)] hover:-translate-y-2 hover:scale-105 transition-all duration-300"
              onClick={() => window.open('https://poland-citizenship-test.typeform.com/to/VWIaQFRG', '_blank')}
            >
              <Zap className="mr-2 h-6 w-6" />
              <span className="font-black">Start Free Assessment</span>
            </Button>
          </div>

          {/* Colorful Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            {[
              { icon: Star, label: 'Success Rate', value: '98%', color: 'from-blue-500 to-cyan-500' },
              { icon: Zap, label: 'Average Processing', value: '12mo', color: 'from-purple-500 to-pink-500' },
              { icon: Sparkles, label: 'Happy Clients', value: '10k+', color: 'from-pink-500 to-rose-500' }
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm border-2 border-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-4xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm font-bold text-slate-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeHero3;
