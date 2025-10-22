import { Scale, FileCheck, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const LightThemeAbout4 = () => {
  const services = [
    {
      icon: Scale,
      title: "Legal Consultation",
      description: "Initial case assessment with certified immigration attorneys to determine eligibility and strategy.",
      features: ["Eligibility review", "Document audit", "Strategy planning"]
    },
    {
      icon: FileCheck,
      title: "Application Management",
      description: "Complete preparation and submission of citizenship applications with full documentation support.",
      features: ["Document preparation", "Application filing", "Status tracking"]
    },
    {
      icon: Clock,
      title: "Process Acceleration",
      description: "Expedited processing through established government relationships and proven legal strategies.",
      features: ["Priority handling", "Government liaison", "Timeline optimization"]
    },
    {
      icon: Shield,
      title: "Compliance Assurance",
      description: "Comprehensive legal protection ensuring full compliance with Polish immigration regulations.",
      features: ["Legal compliance", "Risk mitigation", "Ongoing support"]
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Professional Header */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1 bg-slate-900" />
              <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Our Services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Comprehensive Legal Support
            </h2>
            <p className="text-lg text-slate-700 max-w-3xl">
              Our firm provides end-to-end legal services for Polish citizenship applications, 
              ensuring compliance and maximizing success rates through proven methodologies.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200 rounded-lg p-8 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 ml-[72px]">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                      <span className="text-sm text-slate-600 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Corporate CTA */}
          <div className="bg-slate-900 rounded-lg p-10 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">
                  Schedule a Consultation
                </h3>
                <p className="text-slate-300 text-lg mb-6">
                  Speak with our citizenship experts to discuss your case and receive a detailed assessment.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 font-semibold"
                >
                  Book Appointment
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="text-3xl font-bold mb-2">24-48h</div>
                  <div className="text-sm text-slate-300">Initial Response</div>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <div className="text-3xl font-bold mb-2">100%</div>
                  <div className="text-sm text-slate-300">Confidential</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeAbout4;
