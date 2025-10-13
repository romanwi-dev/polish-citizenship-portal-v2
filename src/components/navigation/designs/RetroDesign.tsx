import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const RetroDesign = ({ children }: { children: ReactNode }) => {
  return (
    <div 
      className="h-full w-full relative overflow-hidden bg-gradient-to-t from-background via-primary/5 to-background transition-all duration-300"
      style={{
        backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 255, 0, 0.03) 0px, rgba(0, 255, 0, 0.03) 1px, transparent 1px, transparent 2px)',
        }}
      />

      {/* CRT Flicker */}
      <motion.div
        className="absolute inset-0 bg-[#00ff00] pointer-events-none z-10"
        animate={{
          opacity: [0, 0.03, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />

      <div className="relative h-full">
        {children}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        
        .retro-link {
          background: rgba(0, 255, 0, 0.05);
          color: #00ff00;
          font-family: 'VT323', 'Courier New', monospace;
          font-size: 18px;
          border: 1px solid #00ff00;
          text-shadow: 0 0 5px #00ff00;
          letter-spacing: 2px;
        }
        .retro-link:hover {
          background: rgba(0, 255, 0, 0.15);
          box-shadow: 0 0 10px #00ff00, inset 0 0 5px #00ff00;
          animation: blink 0.5s infinite;
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
