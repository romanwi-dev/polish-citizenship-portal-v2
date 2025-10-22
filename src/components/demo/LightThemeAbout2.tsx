import { FileText, Users, Clock } from "lucide-react";

const LightThemeAbout2 = () => {
  const features = [
    {
      icon: FileText,
      title: "Document Handling",
      description: "We manage all paperwork from start to finish"
    },
    {
      icon: Users,
      title: "Personal Support",
      description: "Dedicated case manager for your application"
    },
    {
      icon: Clock,
      title: "Fast Processing",
      description: "Streamlined process to minimize waiting time"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Minimal Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Why Choose Us
            </h2>
            <div className="w-16 h-1 bg-slate-900 mx-auto" />
          </div>

          {/* Clean Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 text-center group hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="bg-white p-8 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">15+</div>
              <div className="text-sm text-slate-600">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">10k+</div>
              <div className="text-sm text-slate-600">Cases Handled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">98%</div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeAbout2;
