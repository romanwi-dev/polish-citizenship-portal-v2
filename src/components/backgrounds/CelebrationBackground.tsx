import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    for (let i = 0; i < 30; i++) {
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
    for (let i = 30; i < 60; i++) {
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
    
    // Fireworks
    for (let i = 60; i < 70; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 3,
        delay: Math.random() * 6,
        duration: Math.random() * 4 + 3,
        type: 'firework'
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
            <motion.div
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
            </motion.div>
          );
        }
        
        if (particle.type === 'sparkle') {
          return (
            <motion.div
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
        
        if (particle.type === 'firework') {
          return (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Firework burst */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--accent)))`,
                    boxShadow: '0 0 4px hsl(var(--primary))',
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.cos(angle * Math.PI / 180) * 30,
                    y: Math.sin(angle * Math.PI / 180) * 30,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              ))}
            </motion.div>
          );
        }
        
        return null;
      })}
      
      {/* Shooting stars */}
      {[1, 2, 3].map((i) => (
        <motion.div
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
