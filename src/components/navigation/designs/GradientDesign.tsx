import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const GradientDesign = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Footer-matching background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      {/* Animated Mesh Gradient Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 100% 0%, rgba(236, 72, 153, 0.4) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative h-full bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl">
        {children}
      </div>

      <style>{`
        .gradient-link {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
          border: 1px solid transparent;
          background-clip: padding-box;
          position: relative;
          transition: all 0.3s ease;
        }
        .gradient-link::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(236, 72, 153, 0.5));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gradient-link:hover::before {
          opacity: 1;
        }
        .gradient-link:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};
