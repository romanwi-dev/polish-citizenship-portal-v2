import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const CyberpunkDesign = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Footer-matching background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative h-full">
        {children}
      </div>

      <style>{`
        .cyberpunk-link {
          background: rgba(0, 255, 65, 0.05);
          border: 1px solid #00ff41;
          box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
          font-family: 'Courier New', monospace;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cyberpunk-link:hover {
          background: rgba(0, 255, 65, 0.15);
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.6), inset 0 0 10px rgba(0, 255, 65, 0.2);
          color: #00ff41;
        }
      `}</style>
    </div>
  );
};
