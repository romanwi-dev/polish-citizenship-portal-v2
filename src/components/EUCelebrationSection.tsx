import { motion } from "framer-motion";
import celebrationImage from "@/assets/eu-celebration-aerial.png";

const EUCelebrationSection = () => {
  return (
    <section className="relative py-8 md:py-12 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-xl overflow-hidden"
        >
          <img 
            src={celebrationImage} 
            alt="European celebration with flags and fireworks" 
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default EUCelebrationSection;
