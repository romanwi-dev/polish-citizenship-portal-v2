import { motion } from "framer-motion";
import celebrationImage from "@/assets/eu-celebration-night.png";

const EUCelebrationSection = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Image with overlay */}
          <div className="relative h-[400px] md:h-[600px]">
            <img 
              src={celebrationImage} 
              alt="European celebration with flags and fireworks" 
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center max-w-3xl"
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Your European Journey Starts Here
                </h2>
                <p className="text-lg md:text-xl text-foreground/90 mb-6">
                  Join thousands who have already claimed their Polish citizenship and unlocked the freedom of the European Union
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-lg text-primary-foreground font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Your Application Today
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EUCelebrationSection;
