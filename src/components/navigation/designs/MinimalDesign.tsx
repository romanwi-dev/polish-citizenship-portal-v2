import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const MinimalDesign = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full w-full bg-background"
    >
      {children}

      <style>{`
        .minimal-link {
          position: relative;
          font-weight: 300;
          letter-spacing: 0.5px;
        }
        .minimal-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: hsl(var(--primary));
          transition: width 0.3s ease;
        }
        .minimal-link:hover::after {
          width: 100%;
        }
        .minimal-link:hover {
          color: hsl(var(--primary));
        }
      `}</style>
    </motion.div>
  );
};
