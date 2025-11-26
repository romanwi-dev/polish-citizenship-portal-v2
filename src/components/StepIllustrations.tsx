import { useEffect, useState } from 'react';

interface StepIllustrationProps {
  step: number;
  className?: string;
}

export const StepIllustration = ({ step, className = '' }: StepIllustrationProps) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Theme colors
  const primaryColor = isDark ? '#3b82f6' : '#2563eb'; // Blue
  const secondaryColor = isDark ? '#60a5fa' : '#3b82f6'; // Lighter blue
  const accentColor = isDark ? '#ef4444' : '#dc2626'; // Red
  const glowColor = isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.3)';
  const darkGlow = isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(220, 38, 38, 0.3)';

  const renderStep = () => {
    switch (step) {
      case 1:
        // First Contact - Avatar + Speech Bubble
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="avatarGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={accentColor} />
                <stop offset="100%" stopColor={primaryColor} />
              </linearGradient>
              <filter id="glow1">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Avatar head */}
            <circle cx="140" cy="120" r="45" fill="url(#avatarGrad1)" filter="url(#glow1)" opacity="0.9" />
            {/* Avatar shoulders */}
            <ellipse cx="140" cy="200" rx="60" ry="40" fill="url(#avatarGrad1)" filter="url(#glow1)" opacity="0.8" />
            {/* Speech bubble */}
            <path d="M 200 80 Q 220 60 240 80 L 240 100 Q 240 120 220 120 L 200 120 L 190 130 L 200 120 Z" 
                  fill={secondaryColor} filter="url(#glow1)" opacity="0.85" />
            <circle cx="230" cy="90" r="8" fill={primaryColor} opacity="0.6" />
          </svg>
        );

      case 2:
        // Eligibility Check - Document + Magnifying Glass with Checkmark
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="docGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="100%" stopColor={secondaryColor} />
              </linearGradient>
              <filter id="glow2">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Document */}
            <rect x="100" y="100" width="120" height="140" rx="8" fill="url(#docGrad2)" filter="url(#glow2)" opacity="0.85" />
            <line x1="120" y1="130" x2="200" y2="130" stroke={isDark ? '#1e40af' : '#1e3a8a'} strokeWidth="2" opacity="0.6" />
            <line x1="120" y1="150" x2="180" y2="150" stroke={isDark ? '#1e40af' : '#1e3a8a'} strokeWidth="2" opacity="0.5" />
            <line x1="120" y1="170" x2="190" y2="170" stroke={isDark ? '#1e40af' : '#1e3a8a'} strokeWidth="2" opacity="0.5" />
            {/* Magnifying glass */}
            <circle cx="200" cy="180" r="35" fill="none" stroke={accentColor} strokeWidth="4" filter="url(#glow2)" opacity="0.9" />
            <line x1="225" y1="205" x2="245" y2="225" stroke={accentColor} strokeWidth="4" strokeLinecap="round" filter="url(#glow2)" />
            {/* Checkmark inside glass */}
            <path d="M 190 180 L 200 190 L 210 175" fill="none" stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow2)" />
          </svg>
        );

      case 3:
        // Documents & POAs - Stack of Folders
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="folderGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="50%" stopColor={secondaryColor} />
                <stop offset="100%" stopColor={primaryColor} />
              </linearGradient>
              <filter id="glow3">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Back folder */}
            <path d="M 90 140 L 90 220 L 230 220 L 230 180 L 200 150 L 90 150 Z" 
                  fill="url(#folderGrad3)" filter="url(#glow3)" opacity="0.7" />
            {/* Middle folder */}
            <path d="M 110 120 L 110 200 L 240 200 L 240 160 L 210 130 L 110 130 Z" 
                  fill="url(#folderGrad3)" filter="url(#glow3)" opacity="0.8" />
            {/* Front folder */}
            <path d="M 130 100 L 130 180 L 250 180 L 250 140 L 220 110 L 130 110 Z" 
                  fill="url(#folderGrad3)" filter="url(#glow3)" opacity="0.9" />
            {/* Folder tabs */}
            <rect x="130" y="100" width="30" height="20" rx="2" fill={secondaryColor} opacity="0.6" />
            <rect x="110" y="120" width="30" height="20" rx="2" fill={secondaryColor} opacity="0.5" />
            <rect x="90" y="140" width="30" height="20" rx="2" fill={secondaryColor} opacity="0.4" />
          </svg>
        );

      case 4:
        // Case Assessment - Checklist with 3 checks + Circular Bar Chart
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="checkGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={accentColor} />
                <stop offset="100%" stopColor={primaryColor} />
              </linearGradient>
              <filter id="glow4">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Checklist */}
            <rect x="100" y="100" width="120" height="100" rx="8" fill="none" stroke={primaryColor} strokeWidth="3" filter="url(#glow4)" opacity="0.8" />
            {/* Check 1 */}
            <circle cx="120" cy="130" r="8" fill="none" stroke={accentColor} strokeWidth="2" />
            <path d="M 117 130 L 120 133 L 123 127" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
            <text x="140" y="135" fill={isDark ? '#e5e7eb' : '#1f2937'} fontSize="14" fontFamily="system-ui">Chances</text>
            {/* Check 2 */}
            <circle cx="120" cy="155" r="8" fill="none" stroke={accentColor} strokeWidth="2" />
            <path d="M 117 155 L 120 158 L 123 152" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
            <text x="140" y="160" fill={isDark ? '#e5e7eb' : '#1f2937'} fontSize="14" fontFamily="system-ui">Timeline</text>
            {/* Check 3 */}
            <circle cx="120" cy="180" r="8" fill="none" stroke={accentColor} strokeWidth="2" />
            <path d="M 117 180 L 120 183 L 123 177" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" />
            <text x="140" y="185" fill={isDark ? '#e5e7eb' : '#1f2937'} fontSize="14" fontFamily="system-ui">Costs</text>
            {/* Circular chart */}
            <circle cx="240" cy="150" r="40" fill="none" stroke={isDark ? '#374151' : '#d1d5db'} strokeWidth="8" opacity="0.3" />
            <circle cx="240" cy="150" r="40" fill="none" stroke={primaryColor} strokeWidth="8" 
                    strokeDasharray={`${2 * Math.PI * 40 * 0.75} ${2 * Math.PI * 40}`} 
                    strokeDashoffset={-2 * Math.PI * 40 * 0.25} 
                    transform="rotate(-90 240 150)" 
                    filter="url(#glow4)" opacity="0.9" />
          </svg>
        );

      case 5:
        // Send Documents - FedEx-style Envelope + Location Pin
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="envelopeGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={accentColor} />
                <stop offset="100%" stopColor={primaryColor} />
              </linearGradient>
              <filter id="glow5">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Envelope */}
            <path d="M 100 120 L 100 220 L 220 220 L 220 120 L 160 150 Z" 
                  fill="url(#envelopeGrad5)" filter="url(#glow5)" opacity="0.9" />
            <path d="M 100 120 L 160 150 L 220 120" 
                  fill="none" stroke={isDark ? '#1e40af' : '#1e3a8a'} strokeWidth="2" opacity="0.6" />
            {/* FedEx-style arrow */}
            <path d="M 130 180 L 190 180 L 185 170 L 200 175 L 185 180 L 200 185 L 185 190 L 190 180 L 130 180 Z" 
                  fill={secondaryColor} filter="url(#glow5)" opacity="0.8" />
            {/* Location pin */}
            <circle cx="240" cy="200" r="25" fill={accentColor} filter="url(#glow5)" opacity="0.9" />
            <path d="M 240 200 L 240 220 L 250 230 L 230 230 Z" fill={accentColor} filter="url(#glow5)" opacity="0.9" />
            <circle cx="240" cy="200" r="8" fill={isDark ? '#ffffff' : '#f3f4f6'} />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-72 lg:w-80 h-auto pointer-events-none select-none ${className}`}>
      {renderStep()}
    </div>
  );
};

