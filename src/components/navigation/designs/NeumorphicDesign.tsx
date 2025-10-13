import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const NeumorphicDesign = ({ children }: { children: ReactNode }) => {
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
        .neumorphic-link {
          background: linear-gradient(145deg, #e6e6e6, #ffffff);
          box-shadow: 8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff;
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        .dark .neumorphic-link {
          background: linear-gradient(145deg, #1e1e1e, #2a2a2a);
          box-shadow: 8px 8px 16px #161616, -8px -8px 16px #323232;
        }
        .neumorphic-link:hover {
          box-shadow: 4px 4px 8px #d1d1d1, -4px -4px 8px #ffffff;
        }
        .dark .neumorphic-link:hover {
          box-shadow: 4px 4px 8px #161616, -4px -4px 8px #323232;
        }
        .neumorphic-link:active {
          box-shadow: inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff;
        }
        .dark .neumorphic-link:active {
          box-shadow: inset 4px 4px 8px #161616, inset -4px -4px 8px #323232;
        }
      `}</style>
    </motion.div>
  );
};
