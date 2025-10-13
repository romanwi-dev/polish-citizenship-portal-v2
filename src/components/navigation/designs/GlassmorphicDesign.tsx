import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const GlassmorphicDesign = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
      }}
    >
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%)',
            right: 0,
            bottom: 0,
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Glass Content Container */}
      <div className="relative h-full backdrop-blur-xl bg-background/40 border-l border-white/10">
        {children}
      </div>

      <style>{`
        .glassmorphic-link {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glassmorphic-link:hover {
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </motion.div>
  );
};
