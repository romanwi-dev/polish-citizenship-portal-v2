import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import thankYou1 from "@/assets/thank-you/thank-you-1.jpg";
import secretary16 from "@/assets/secretaries/secretary-16.png";
import secretary17 from "@/assets/secretaries/secretary-17.png";
import secretary18 from "@/assets/secretaries/secretary-18.png";
import secretary19 from "@/assets/secretaries/secretary-19.png";
import secretary20 from "@/assets/secretaries/secretary-20.png";
import secretary21 from "@/assets/secretaries/secretary-21.png";
import secretary22 from "@/assets/secretaries/secretary-22.png";
import secretary23 from "@/assets/secretaries/secretary-23.png";
import secretary24 from "@/assets/secretaries/secretary-24.png";
import secretary25 from "@/assets/secretaries/secretary-25.png";
import secretary26 from "@/assets/secretaries/secretary-26.png";

const ThankYouImagesDemo = () => {
  const navigate = useNavigate();

  const images = [
    { src: thankYou1, title: "Professional Welcome", description: "Warm professional holding passport" },
    { src: secretary16, title: "Desk Professional", description: "Secretary at desk with pen" },
    { src: secretary17, title: "Office Assistant", description: "Professional typing at keyboard" },
    { src: secretary18, title: "Document Handler", description: "Receptionist with folder" },
    { src: secretary19, title: "Confident Professional", description: "Administrative assistant at desk" },
    { src: secretary20, title: "Phone Professional", description: "Office worker with phone" },
    { src: secretary21, title: "Executive Assistant", description: "Professional at office" },
    { src: secretary22, title: "Coffee Break", description: "Professional with coffee" },
    { src: secretary23, title: "Relaxed Professional", description: "Secretary in modern office" },
    { src: secretary24, title: "Tech Professional", description: "Office administrator with tablet" },
    { src: secretary25, title: "Reception Desk", description: "Receptionist at desk" },
    { src: secretary26, title: "Passport Professional", description: "Professional with passport document" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Button
              variant="ghost"
              onClick={() => navigate('/demos')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Demos
            </Button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Thank You Images
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Thank You Image Gallery
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional images perfect for thank you pages and confirmation screens
            </p>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl mb-2">{image.title}</h3>
                  <p className="text-white/80 text-sm">{image.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouImagesDemo;
