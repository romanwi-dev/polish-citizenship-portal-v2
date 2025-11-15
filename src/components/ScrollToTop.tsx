import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
        
        // Clear existing timer
        clearTimeout(hideTimer);
        
        // Hide button 2 seconds after scrolling stops
        hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      clearTimeout(hideTimer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30, rotate: -180 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            rotate: 0,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20
            }
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.5, 
            y: 30, 
            rotate: 180,
            transition: {
              duration: 0.2
            }
          }}
          whileHover={{ 
            scale: 1.15,
            rotate: 5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              "bg-gradient-to-r from-primary to-secondary",
              "hover:shadow-xl hover:scale-110",
              "transition-all duration-300",
              "dark:opacity-100 opacity-30 hover:opacity-60"
            )}
            style={{
              boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.3)'
            }}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { ScrollToTop };
export default ScrollToTop;
