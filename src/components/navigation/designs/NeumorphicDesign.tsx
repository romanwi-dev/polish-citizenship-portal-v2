import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const NeumorphicDesign = ({ children }: { children: ReactNode }) => {
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
