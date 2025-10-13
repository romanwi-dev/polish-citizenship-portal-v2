import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const NeumorphicDesign = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800"
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
