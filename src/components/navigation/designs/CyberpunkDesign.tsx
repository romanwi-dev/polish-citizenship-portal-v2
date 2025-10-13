import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const CyberpunkDesign = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full w-full relative overflow-hidden bg-black">
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)',
        }}
      />

      {/* Neon Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated Neon Borders */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ff41] to-transparent"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1,
        }}
      />

      {/* Content */}
      <div className="relative h-full bg-gradient-to-b from-black/90 to-black/95">
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
