import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const LuxuryDesign = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Footer-matching background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative h-full">
        {children}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        
        .luxury-link {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 215, 0, 0.1) 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
          color: #FFD700;
          font-family: 'Playfair Display', serif;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
        }
        .luxury-link:hover {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.2) 100%);
          border-color: rgba(255, 215, 0, 0.6);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};
