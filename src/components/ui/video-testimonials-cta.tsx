import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useState } from 'react';

export function VideoTestimonialsCTA() {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex justify-center mt-40 mb-20 animate-fade-in">
      <button
        onClick={scrollToContact}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Request video testimonials - scroll to contact form"
        className="group relative overflow-hidden rounded-2xl px-12 py-6 md:px-20 md:py-6 text-lg md:text-xl font-bold text-primary-foreground transition-all duration-500 ease-out focus:outline-none focus:ring-4 focus:ring-primary/50 bg-gradient-to-br from-primary via-primary/90 to-secondary hover:shadow-2xl hover:shadow-primary/40 dark:hover:shadow-primary/60"
        style={{
          transform: prefersReducedMotion 
            ? 'none' 
            : isHovered 
              ? 'perspective(1000px) rotateX(-8deg) rotateY(8deg) translateZ(30px) scale(1.1)' 
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
          transition: prefersReducedMotion 
            ? 'box-shadow 0.5s ease-out, background 0.3s ease' 
            : 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: isHovered 
            ? '0 25px 50px -12px hsl(var(--primary) / 0.5), 0 0 80px hsl(var(--primary) / 0.4), inset 0 2px 20px hsl(var(--primary-foreground) / 0.2)' 
            : '0 10px 30px -10px hsl(var(--primary) / 0.3), 0 0 40px hsl(var(--primary) / 0.2)',
        }}
      >
        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-secondary/40 via-accent/30 to-primary/40"
          style={{
            animation: prefersReducedMotion ? 'none' : 'gradient-shift 3s ease infinite',
          }}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
          style={{
            background: 'linear-gradient(110deg, transparent 25%, hsl(var(--primary-foreground) / 0.4) 50%, transparent 75%)',
            animation: prefersReducedMotion ? 'none' : 'shimmer-slide 2.5s ease-in-out infinite',
          }}
        />

        {/* Glow particles effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary-foreground/60 animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulse delay-75" />
          <div className="absolute bottom-1/3 left-2/3 w-1 h-1 rounded-full bg-secondary/60 animate-pulse delay-150" />
        </div>

        {/* Border glow */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(45deg, hsl(var(--accent) / 0.3), hsl(var(--secondary) / 0.3), hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3))',
            backgroundSize: '300% 300%',
            animation: prefersReducedMotion ? 'none' : 'border-glow 4s ease infinite',
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Button Text with icon */}
        <span className="relative z-10 flex items-center gap-3 drop-shadow-lg">
          <svg 
            className="w-6 h-6 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{
              filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.5))'
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Request Video Testimonials
          <svg 
            className="w-5 h-5 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </button>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { 
            background-position: 0% 50%;
            opacity: 0.6;
          }
          50% { 
            background-position: 100% 50%;
            opacity: 1;
          }
        }

        @keyframes shimmer-slide {
          0% {
            transform: translateX(-150%) translateY(-150%) rotate(110deg);
          }
          100% {
            transform: translateX(150%) translateY(150%) rotate(110deg);
          }
        }

        @keyframes border-glow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .delay-75 {
          animation-delay: 75ms;
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
