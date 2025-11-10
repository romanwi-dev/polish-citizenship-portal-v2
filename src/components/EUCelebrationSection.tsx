import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import celebration1 from "@/assets/eu-celebration/celebration-1.png";
import celebration2 from "@/assets/eu-celebration/celebration-2.png";
import celebration3 from "@/assets/eu-celebration/celebration-3.png";
import celebration4 from "@/assets/eu-celebration/celebration-4.png";
import celebration5 from "@/assets/eu-celebration/celebration-5.png";
import celebration6 from "@/assets/eu-celebration/celebration-6.png";
import celebration7 from "@/assets/eu-celebration/celebration-7.png";
import celebration8 from "@/assets/eu-celebration/celebration-8.png";
import celebration9 from "@/assets/eu-celebration/celebration-9.png";
import celebration10 from "@/assets/eu-celebration/celebration-10.png";
import celebration11 from "@/assets/eu-celebration/celebration-11.png";
import celebration12 from "@/assets/eu-celebration/celebration-12.png";
import celebration13 from "@/assets/eu-celebration/celebration-13.png";
import celebration14 from "@/assets/eu-celebration/celebration-14.png";
import celebration15 from "@/assets/eu-celebration/celebration-15.png";

const EUCelebrationSection = () => {
  const images = [
    celebration1, celebration2, celebration3, celebration4, celebration5,
    celebration6, celebration7, celebration8, celebration9, celebration10,
    celebration11, celebration12, celebration13, celebration14, celebration15
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative w-full group"
    >
      <div className="relative overflow-hidden">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <img 
            src={images[currentIndex]} 
            alt={`European celebration ${currentIndex + 1}`}
            className="w-full h-auto block"
          />
        </motion.div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-8' 
                  : 'bg-background/60 hover:bg-background/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default EUCelebrationSection;
