import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Safety check for motion components - fallback to regular div if motion is not available
const SafeMotionDiv = (motion && motion.div) ? motion.div : ((props: any) => {
  const { initial, animate, transition, ...restProps } = props;
  return <div {...restProps} />;
});

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  type: 'star' | 'sparkle' | 'firework';
}

export const CelebrationBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = [];
    
    // Stars
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        type: 'star'
      });
    }
    
    // Sparkles
    for (let i = 40; i < 80; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 1,
        type: 'sparkle'
      });
    }
    
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      
      {/* Animated particles */}
      {particles.map((particle) => {
        if (particle.type === 'star') {
          return (
            <SafeMotionDiv
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="url(#star-gradient)"
                  className="drop-shadow-lg"
                />
                <defs>
                  <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="50%" stopColor="hsl(var(--secondary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
            </SafeMotionDiv>
          );
        }
        
        if (particle.type === 'sparkle') {
          return (
            <SafeMotionDiv
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          );
        }
        
        return null;
      })}
      
      {/* Shooting stars */}
      {[1, 2, 3].map((i) => (
        <SafeMotionDiv
          key={`shooting-${i}`}
          className="absolute h-0.5 w-12 bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{
            left: '-10%',
            top: `${20 + i * 20}%`,
            transform: 'rotate(-45deg)',
          }}
          initial={{ x: 0, opacity: 0 }}
          animate={{
            x: ['0vw', '120vw'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 4,
            repeat: Infinity,
            repeatDelay: 8,
          }}
        />
      ))}
    </div>
  );
};
