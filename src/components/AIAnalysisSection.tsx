import { Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";


const FlippableAICard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  textColor, 
  index 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string; 
  textColor: string; 
  index: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-[280px] cursor-pointer"
      style={{ 
        perspective: '1000px'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`w-14 h-14 mb-4 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${textColor}`} />
          </div>
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 rounded-lg`} />
          <div className="relative z-10 text-center">
            <p className="text-muted-foreground italic">
              Click to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIAnalysisSection = () => {
  return (
    <section className="relative py-24 overflow-hidden overflow-x-hidden">
      
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
            
            <div className="mb-16 max-w-6xl mx-auto px-6 md:px-0">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
                We are now able to 'predict' the probability of success and the time of the procedure in advance in each case of Polish citizenship by descent with HIGH ACCURACY based on the cases we processed over the last twenty years, with AI analyzes and human-expert knowledge. This has revolutionized our approach, allowing us to offer personalized guidance and support to our clients right from the initial consultation. By leveraging this combination of AI and expert insights, we can identify potential challenges and opportunities unique to each case, ensuring a more streamlined and efficient application process.
              </p>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 text-justify">
                Our clients benefit from reduced uncertainty and increased confidence, knowing that their application is backed by a robust predictive framework. Furthermore, our comprehensive database, enriched with years of historical data, serves as a powerful resource for refining our predictive models. This continuous learning process not only enhances the accuracy of our predictions but also enables us to adapt to changing legal landscapes and procedural requirements.
              </p>
              
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-justify">
                In essence, the integration of AI technology with our deep domain expertise, and professional honesty deeply implemented in our core politics as legal advisers, marks a significant leap forward in our ability to assist individuals in obtaining Polish citizenship by descent. Our commitment to innovation ensures that we remain at the forefront of our field, providing exceptional service and maximizing the likelihood of successful outcomes for our clients.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <FlippableAICard 
              icon={TrendingUp}
              title="Success Prediction"
              description="Analyze case strength based on family history, documents, and legal precedents for accurate probability assessment."
              gradient="from-primary/20 to-secondary/20"
              textColor="text-primary"
              index={0}
            />

            <FlippableAICard 
              icon={Clock}
              title="Timeline & Cost Estimation"
              description="Predict processing time and total costs based on complexity, document availability, and current processing speeds."
              gradient="from-secondary/20 to-accent/20"
              textColor="text-secondary"
              index={1}
            />

            <FlippableAICard 
              icon={AlertTriangle}
              title="Risk Assessment"
              description="Identify potential obstacles, document gaps, and legal challenges before starting the process."
              gradient="from-accent/20 to-primary/20"
              textColor="text-accent"
              index={2}
            />
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse" 
              onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
              aria-label="Take the Polish Citizenship Test to check your eligibility"
            >
              <span className="relative z-10 font-bold drop-shadow-lg">
                Take Polish Citizenship Test
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIAnalysisSection;