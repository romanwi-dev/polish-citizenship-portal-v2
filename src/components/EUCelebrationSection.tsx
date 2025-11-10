import { motion } from "framer-motion";
import celebrationImage from "@/assets/eu-celebration-dark.png";

const EUCelebrationSection = () => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative w-full"
    >
      <img 
        src={celebrationImage} 
        alt="European celebration with flags and fireworks" 
        className="w-full h-auto block"
      />
    </motion.section>
  );
};

export default EUCelebrationSection;
