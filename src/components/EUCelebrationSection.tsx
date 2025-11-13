import { motion } from "framer-motion";
import celebration1 from "@/assets/eu-celebration/celebration-1.png";

const EUCelebrationSection = () => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative w-full h-full"
    >
      <div className="relative w-full h-full overflow-hidden">
        <img 
          src={celebration1} 
          alt="European celebration"
          className="w-full h-full object-cover block"
          style={{ objectPosition: 'center 35%' }}
        />
      </div>
    </motion.section>
  );
};

export default EUCelebrationSection;
