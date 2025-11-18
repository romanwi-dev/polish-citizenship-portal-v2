import Navigation from "@/components/Navigation";
import { GlobalBackground } from "@/components/GlobalBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RomeDemo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Same background as homepage */}
      <GlobalBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-24 pb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/demos')}
            className="flex items-center gap-2 hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Demos
          </Button>
        </div>

        {/* Title Section */}
        <div className="container mx-auto px-4 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Rome Future City
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Witness the Eternal City reimagined with futuristic architecture and AI-generated visuals
            </p>
          </motion.div>

          {/* Coming Soon */}
          <div className="glass-card p-12 rounded-lg text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🏛️</div>
            <h2 className="text-2xl font-bold mb-4">Generating Rome Future Cityscapes</h2>
            <p className="text-muted-foreground">
              AI-powered futuristic vision of Rome is being created. Stay tuned for holographic Colosseum, 
              smart ancient ruins integration, and breathtaking future-meets-history imagery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RomeDemo;
