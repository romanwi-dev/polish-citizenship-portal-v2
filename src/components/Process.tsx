import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Initial Consultation",
    description: "We assess your eligibility and discuss your family history in a free consultation.",
  },
  {
    number: "02",
    title: "Document Collection",
    description: "We help gather necessary documents including birth, marriage, and citizenship records.",
  },
  {
    number: "03",
    title: "Application Preparation",
    description: "Our legal team prepares and reviews your complete citizenship application.",
  },
  {
    number: "04",
    title: "Submission & Follow-up",
    description: "We submit your application and handle all communication with Polish authorities.",
  },
];

const Process = () => {
  return (
    <section className="py-20 bg-secondary text-white">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple Process
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Four straightforward steps to reclaim your Polish citizenship
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6 text-2xl font-bold shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-white/70 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;