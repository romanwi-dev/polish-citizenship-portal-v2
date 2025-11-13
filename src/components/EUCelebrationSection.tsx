import { motion } from "framer-motion";
import celebration29 from "@/assets/eu-celebration/celebration-29.png";
import celebration17 from "@/assets/eu-celebration/celebration-17.png";

const EUCelebrationSection = () => {
  return (
    <>
      {/* Hero Section - Old Town Future */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative w-full h-[60vh] md:h-[80vh]"
      >
        <div className="relative w-full h-full overflow-hidden">
          <img 
            src={celebration29} 
            alt="Old Town Future - Historic buildings with holographic facades"
            className="w-full h-full object-cover block"
            style={{ objectPosition: 'center 35%' }}
          />
        </div>
      </motion.section>

      {/* Bottom Section - Brussels Unity */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative w-full h-[60vh] md:h-[80vh]"
      >
        <div className="relative w-full h-full overflow-hidden">
          <img 
            src={celebration17} 
            alt="Brussels Unity - City square celebration at golden hour"
            className="w-full h-full object-cover block"
            style={{ objectPosition: 'center 35%' }}
          />
        </div>
      </motion.section>
    </>
  );
};

export default EUCelebrationSection;
