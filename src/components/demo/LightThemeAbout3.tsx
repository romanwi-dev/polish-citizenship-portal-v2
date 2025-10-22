import { Shield, Rocket, Award, Heart } from "lucide-react";

const LightThemeAbout3 = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Bank-level security for all your documents",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Rocket,
      title: "Lightning Fast",
      description: "Streamlined process saves you months",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Award,
      title: "Expert Team",
      description: "15+ years of immigration expertise",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Heart,
      title: "Personal Touch",
      description: "Dedicated support every step of the way",
      gradient: "from-rose-500 to-orange-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Bold Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Why We're Different
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We don't just process applications—we make dreams come true
            </p>
          </div>

          {/* Vibrant Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm border-2 border-white rounded-3xl p-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bold CTA Card */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h3 className="text-4xl font-black mb-4">Ready to Get Started?</h3>
            <p className="text-xl mb-8 opacity-90">Join 10,000+ successful applicants today</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-left">
                <div className="text-3xl font-black">24-48h</div>
                <div className="text-sm opacity-90">Initial Response</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-white/30" />
              <div className="text-left">
                <div className="text-3xl font-black">100%</div>
                <div className="text-sm opacity-90">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeAbout3;
