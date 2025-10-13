import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const MinimalDesign = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full bg-gradient-to-t from-background via-primary/5 to-background"
      style={{
        backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
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
