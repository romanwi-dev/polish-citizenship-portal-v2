import { Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Button } from "./ui/button";

const AIAnalysisSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Analysis</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI Deep Case Analyzes
              </span>
            </h2>
            
            <div className="mb-16">
              <p className="text-xl text-muted-foreground max-w-6xl text-left mb-8">
                We are now able to 'predict' the probability of success and the time of the procedure in advance in each case of Polish citizenship by descent with HIGH ACCURACY based on the cases we processed over the last twenty years, with AI analyzes and human-expert knowledge. This has revolutionized our approach, allowing us to offer personalized guidance and support to our clients right from the initial consultation. By leveraging this combination of AI and expert insights, we can identify potential challenges and opportunities unique to each case, ensuring a more streamlined and efficient application process.
              </p>
              
              <p className="text-lg text-muted-foreground max-w-6xl text-left mb-8">
                Our clients benefit from reduced uncertainty and increased confidence, knowing that their application is backed by a robust predictive framework. Furthermore, our comprehensive database, enriched with years of historical data, serves as a powerful resource for refining our predictive models. This continuous learning process not only enhances the accuracy of our predictions but also enables us to adapt to changing legal landscapes and procedural requirements.
              </p>
              
              <p className="text-lg text-muted-foreground max-w-6xl text-left">
                In essence, the integration of AI technology with our deep domain expertise, and professional honesty deeply implemented in our core politics as legal advisers, marks a significant leap forward in our ability to assist individuals in obtaining Polish citizenship by descent. Our commitment to innovation ensures that we remain at the forefront of our field, providing exceptional service and maximizing the likelihood of successful outcomes for our clients.
              </p>
            </div>
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
      </div>
    </section>
  );
};

export default AIAnalysisSection;