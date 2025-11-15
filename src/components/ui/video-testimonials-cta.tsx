import { useTheme } from 'next-themes';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useState } from 'react';

export function VideoTestimonialsCTA() {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Detect if using red theme variant
  const isRedTheme = theme?.includes('red');

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Theme-based colors
  const blueGradient = 'linear-gradient(135deg, hsl(221, 83%, 53%), hsl(221, 83%, 35%), hsl(221, 83%, 45%))';
  const redGradient = 'linear-gradient(135deg, hsl(343, 79%, 53%), hsl(343, 79%, 35%), hsl(343, 79%, 45%))';
  
  const blueGlow = '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)';
  const redGlow = '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.1)';
  
  const blueGlowHover = '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4), 0 0 120px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(59, 130, 246, 0.2)';
  const redGlowHover = '0 0 40px rgba(239, 68, 68, 0.6), 0 0 80px rgba(239, 68, 68, 0.4), 0 0 120px rgba(239, 68, 68, 0.3), inset 0 0 30px rgba(239, 68, 68, 0.2)';

  const gradient = isRedTheme ? redGradient : blueGradient;
  const glow = isRedTheme ? redGlow : blueGlow;
  const glowHover = isRedTheme ? redGlowHover : blueGlowHover;

  return (
    <div className="flex justify-center mt-40 mb-20 animate-fade-in">
      <button
        onClick={scrollToContact}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Request video testimonials - scroll to contact form"
        className="group relative overflow-hidden rounded-2xl px-12 py-6 md:px-20 md:py-6 text-lg md:text-xl font-bold text-white transition-all duration-500 ease-out focus:outline-none focus:ring-4 focus:ring-primary/50"
        style={{
          background: gradient,
          boxShadow: isHovered ? glowHover : glow,
          transform: prefersReducedMotion 
            ? 'none' 
            : isHovered 
              ? 'perspective(1000px) rotateX(-5deg) rotateY(5deg) translateZ(20px) scale(1.08)' 
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
          transition: prefersReducedMotion 
            ? 'box-shadow 0.4s ease-out' 
            : 'all 0.4s ease-out',
          animation: prefersReducedMotion ? 'none' : 'glow-pulse 2s ease-in-out infinite',
        }}
      >
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isRedTheme 
              ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.3), transparent 70%)'
              : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3), transparent 70%)',
          }}
        />
        
        {/* Shimmer Effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
            animation: prefersReducedMotion ? 'none' : 'shimmer 2s infinite',
          }}
        />

        {/* Button Text */}
        <span className="relative z-10 flex items-center gap-3">
          Request Video Testimonials
          <svg 
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{
              transform: prefersReducedMotion ? 'none' : undefined
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { 
            filter: brightness(1);
          }
          50% { 
            filter: brightness(1.15);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
