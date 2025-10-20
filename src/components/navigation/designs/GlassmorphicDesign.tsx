import { ReactNode } from 'react';
import { useMotion } from '@/hooks/useMotion';

export const GlassmorphicDesign = ({ children }: { children: ReactNode }) => {
  const motion = useMotion();
  const MotionDiv = motion.div;
  
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full relative overflow-hidden animate-fade-in"
    >
      {/* Footer-matching background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative h-full">
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
    </MotionDiv>
  );
};
