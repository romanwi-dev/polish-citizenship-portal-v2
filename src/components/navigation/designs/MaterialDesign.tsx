import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const MaterialDesign = ({ children }: { children: ReactNode }) => {
  return (
    <div 
      className="h-full w-full bg-gradient-to-t from-background via-primary/5 to-background transition-all duration-300"
      style={{
        backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {children}

      <style>{`
        .material-link {
          background: hsl(var(--card));
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .material-link:hover {
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
          background: hsl(var(--accent));
        }
        .material-link:active {
          transform: translateY(0);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
};
