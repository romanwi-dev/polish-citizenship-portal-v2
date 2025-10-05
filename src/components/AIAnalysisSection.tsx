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
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Analysis</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-3d-forward text-framed">
                AI Deep Case Analyzes
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-6">
              We are now able to 'predict' the probability of success and the time of the procedure in advance in each case of Polish citizenship by descent with HIGH ACCURACY based on the cases we processed over the last twenty years, with AI analyzes and human-expert knowledge. This has revolutionized our approach, allowing us to offer personalized guidance and support to our clients right from the initial consultation. By leveraging this combination of AI and expert insights, we can identify potential challenges and opportunities unique to each case, ensuring a more streamlined and efficient application process.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-4">
              Our clients benefit from reduced uncertainty and increased confidence, knowing that their application is backed by a robust predictive framework. Furthermore, our comprehensive database, enriched with years of historical data, serves as a powerful resource for refining our predictive models. This continuous learning process not only enhances the accuracy of our predictions but also enables us to adapt to changing legal landscapes and procedural requirements.
            </p>
            
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              In essence, the integration of AI technology with our deep domain expertise, and professional honesty deeply implemented in our core politics as legal advisers, marks a significant leap forward in our ability to assist individuals in obtaining Polish citizenship by descent. Our commitment to innovation ensures that we remain at the forefront of our field, providing exceptional service and maximizing the likelihood of successful outcomes for our clients.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card p-8 rounded-2xl hover-glow">
              <div className="w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Success Prediction</h3>
              <p className="text-muted-foreground">
                Analyze case strength based on family history, documents, and legal precedents for accurate probability assessment.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-glow">
              <div className="w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                <Clock className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Timeline & Cost Estimation</h3>
              <p className="text-muted-foreground">
                Predict processing time and total costs based on complexity, document availability, and current processing speeds.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl hover-glow">
              <div className="w-14 h-14 mb-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Risk Assessment</h3>
              <p className="text-muted-foreground">
                Identify potential obstacles, document gaps, and legal challenges before starting the process.
              </p>
            </div>
          </div>

          {/* AI Analysis Preview Card */}
          <div className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-8 text-center">AI Analysis Preview</h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Success Probability</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    87%
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Estimated Timeline</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                    28 months
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Case Complexity</div>
                  <div className="text-2xl font-bold">Medium</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Document Availability</div>
                  <div className="text-2xl font-bold">Limited</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                    180+
                  </div>
                  <div className="text-sm text-muted-foreground">Data Points</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-1">
                    5K+
                  </div>
                  <div className="text-sm text-muted-foreground">Historical Cases</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-1">
                    2-3 min
                  </div>
                  <div className="text-sm text-muted-foreground">To Complete</div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-glow hover-glow"
                  onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU', '_blank')}
                >
                  Request AI Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAnalysisSection;