import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const MinimalDesign = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full relative overflow-hidden"
    >
      {/* Footer-matching background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
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
