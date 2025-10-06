import { Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Button } from "./ui/button";

const AIAnalysisSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Expert Analysis</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-12">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Comprehensive Case Analysis
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-4xl mr-auto text-left mb-8">
              We evaluate the probability of success and estimate the timeline for each case of Polish citizenship by descent based on our extensive experience processing cases over the last twenty years. Our expert knowledge allows us to offer personalized guidance and support to our clients right from the initial consultation. We can identify potential challenges and opportunities unique to each case, ensuring a more streamlined and efficient application process.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-4xl mr-auto text-left mb-8">
              Our clients benefit from reduced uncertainty and increased confidence, knowing that their application is backed by years of practical experience. Furthermore, our comprehensive knowledge base, enriched with years of case history, serves as a powerful resource for case evaluation. This continuous learning from past cases enables us to adapt to changing legal landscapes and procedural requirements.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-4xl mr-auto text-left mb-16">
              In essence, our deep domain expertise and professional honesty, deeply implemented in our core values as legal advisers, marks our commitment to assist individuals in obtaining Polish citizenship by descent. Our dedication to excellence ensures that we provide exceptional service and maximize the likelihood of successful outcomes for our clients.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card p-8 rounded-lg hover-glow">
              <div className="w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Success Prediction</h3>
              <p className="text-muted-foreground">
                Analyze case strength based on family history, documents, and legal precedents for accurate probability assessment.
              </p>
            </div>

            <div className="glass-card p-8 rounded-lg hover-glow">
              <div className="w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                <Clock className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Timeline & Cost Estimation</h3>
              <p className="text-muted-foreground">
                Predict processing time and total costs based on complexity, document availability, and current processing speeds.
              </p>
            </div>

            <div className="glass-card p-8 rounded-lg hover-glow">
              <div className="w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Risk Assessment</h3>
              <p className="text-muted-foreground">
                Identify potential obstacles, document gaps, and legal challenges before starting the process.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIAnalysisSection;