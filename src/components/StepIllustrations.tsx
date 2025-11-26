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

  // Theme colors - matching original 3D neon aesthetic
  const neonBlue = isDark ? '#3b82f6' : '#2563eb';
  const neonBlueLight = isDark ? '#60a5fa' : '#3b82f6';
  const neonRed = isDark ? '#ef4444' : '#dc2626';
  const neonPink = isDark ? '#f472b6' : '#ec4899';
  const darkBlue = isDark ? '#1e3a8a' : '#1e40af';
  const darkPurple = isDark ? '#4c1d95' : '#5b21b6';

  const renderStep = () => {
    switch (step) {
      case 1:
        // First Contact - Use actual PNG with background removal CSS
        const encodedSrc1 = '/steps/step1-contact.png – avatar + speech bubble.png'.split('/').map((part, index) => 
          index === 0 ? part : encodeURIComponent(part)
        ).join('/');
        return (
          <div className="relative w-full h-full">
            <img
              src={encodedSrc1}
              alt="First Contact - 3D avatar with speech bubble"
              width={320}
              height={320}
              className="w-full h-auto"
              loading="lazy"
              style={{
                mixBlendMode: isDark ? 'screen' : 'multiply',
                filter: isDark 
                  ? 'brightness(1.5) contrast(1.3) saturate(1.2)' 
                  : 'brightness(0.9) contrast(1.4) saturate(1.3)',
                opacity: isDark ? 0.95 : 0.9
              }}
            />
            {/* Overlay to help blend dark backgrounds */}
            {isDark && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at center, transparent 30%, hsl(222 47% 11% / 0.4) 100%)',
                  mixBlendMode: 'multiply'
                }}
              />
            )}
          </div>
        );

      case 2:
        // Eligibility Check - 3D Document + Magnifying Glass with glowing checkmark
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="docGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={darkPurple} />
                <stop offset="100%" stopColor={darkBlue} />
              </linearGradient>
              <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glowRed2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* 3D Document with perspective */}
            <path d="M 90 100 L 90 240 L 210 240 L 210 200 L 200 190 L 90 190 Z" 
                  fill="url(#docGrad2)" filter="url(#glow2)" opacity="0.9" />
            <path d="M 90 100 L 200 190 L 210 200 L 210 100 Z" 
                  fill={darkBlue} opacity="0.4" />
            {/* Glowing text lines on document */}
            <line x1="110" y1="130" x2="190" y2="130" stroke={neonBlueLight} strokeWidth="3" filter="url(#glow2)" opacity="0.8" />
            <line x1="110" y1="150" x2="175" y2="150" stroke={neonBlueLight} strokeWidth="3" filter="url(#glow2)" opacity="0.7" />
            <line x1="110" y1="170" x2="185" y2="170" stroke={neonBlueLight} strokeWidth="3" filter="url(#glow2)" opacity="0.7" />
            <line x1="110" y1="190" x2="170" y2="190" stroke={neonBlueLight} strokeWidth="3" filter="url(#glow2)" opacity="0.6" />
            <line x1="110" y1="210" x2="180" y2="210" stroke={neonBlueLight} strokeWidth="3" filter="url(#glow2)" opacity="0.6" />
            {/* 3D Magnifying glass frame */}
            <circle cx="200" cy="180" r="40" fill="none" stroke={darkPurple} strokeWidth="6" opacity="0.8" />
            <circle cx="200" cy="180" r="40" fill="none" stroke={neonBlueLight} strokeWidth="4" filter="url(#glow2)" />
            {/* Magnifying glass handle */}
            <rect x="230" y="210" width="8" height="30" rx="4" fill={darkPurple} opacity="0.6" />
            <rect x="230" y="210" width="8" height="30" rx="4" fill={neonRed} opacity="0.4" filter="url(#glow2)" />
            {/* Glowing red checkmark inside glass */}
            <path d="M 185 175 L 195 185 L 215 165" fill="none" stroke={neonRed} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowRed2)" />
            <circle cx="200" cy="180" r="38" fill="none" stroke={neonRed} strokeWidth="2" opacity="0.3" filter="url(#glowRed2)" />
          </svg>
        );

      case 3:
        // Documents & POAs - 3D Stack of Folders with neon pink/blue glow
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="folderGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={darkPurple} />
                <stop offset="100%" stopColor={darkBlue} />
              </linearGradient>
              <linearGradient id="folderGlow3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={neonPink} />
                <stop offset="50%" stopColor={neonBlue} />
                <stop offset="100%" stopColor={neonPink} />
              </linearGradient>
              <filter id="glow3" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Back folder - 3D with neon edges */}
            <path d="M 85 150 L 85 230 L 225 230 L 225 190 L 195 160 L 85 160 Z" 
                  fill="url(#folderGrad3)" filter="url(#glow3)" opacity="0.8" />
            <path d="M 85 150 L 195 160 L 225 190 L 225 150 Z" 
                  fill={darkBlue} opacity="0.3" />
            {/* Neon glow on edges */}
            <line x1="85" y1="150" x2="85" y2="230" stroke={neonPink} strokeWidth="4" filter="url(#glow3)" opacity="0.9" />
            <line x1="85" y1="230" x2="225" y2="230" stroke={neonBlue} strokeWidth="4" filter="url(#glow3)" opacity="0.9" />
            
            {/* Middle folder */}
            <path d="M 105 130 L 105 210 L 245 210 L 245 170 L 215 140 L 105 140 Z" 
                  fill="url(#folderGrad3)" filter="url(#glow3)" opacity="0.85" />
            <path d="M 105 130 L 215 140 L 245 170 L 245 130 Z" 
                  fill={darkBlue} opacity="0.35" />
            <line x1="105" y1="130" x2="105" y2="210" stroke={neonPink} strokeWidth="4" filter="url(#glow3)" opacity="0.9" />
            <line x1="105" y1="210" x2="245" y2="210" stroke={neonBlue} strokeWidth="4" filter="url(#glow3)" opacity="0.9" />
            
            {/* Front folder */}
            <path d="M 125 110 L 125 190 L 265 190 L 265 150 L 235 120 L 125 120 Z" 
                  fill="url(#folderGrad3)" filter="url(#glow3)" opacity="0.9" />
            <path d="M 125 110 L 235 120 L 265 150 L 265 110 Z" 
                  fill={darkBlue} opacity="0.4" />
            <line x1="125" y1="110" x2="125" y2="190" stroke={neonPink} strokeWidth="5" filter="url(#glow3)" opacity="1" />
            <line x1="125" y1="190" x2="265" y2="190" stroke={neonBlue} strokeWidth="5" filter="url(#glow3)" opacity="1" />
            
            {/* Folder tabs with glow */}
            <rect x="125" y="110" width="35" height="22" rx="3" fill={neonBlueLight} opacity="0.6" filter="url(#glow3)" />
            <rect x="105" y="130" width="35" height="22" rx="3" fill={neonBlueLight} opacity="0.5" filter="url(#glow3)" />
            <rect x="85" y="150" width="35" height="22" rx="3" fill={neonBlueLight} opacity="0.4" filter="url(#glow3)" />
          </svg>
        );

      case 4:
        // Case Assessment - 3D Checklist with glowing checkmarks + Circular Bar Chart
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="checklistGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={darkBlue} />
                <stop offset="100%" stopColor={darkPurple} />
              </linearGradient>
              <filter id="glow4" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glowRed4" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* 3D Checklist board */}
            <path d="M 90 100 L 90 210 L 190 210 L 190 180 L 180 170 L 90 170 Z" 
                  fill="url(#checklistGrad4)" filter="url(#glow4)" opacity="0.9" />
            <path d="M 90 100 L 180 170 L 190 180 L 190 100 Z" 
                  fill={darkBlue} opacity="0.3" />
            {/* Glowing red checkmarks */}
            <circle cx="115" cy="135" r="12" fill="none" stroke={neonRed} strokeWidth="3" filter="url(#glowRed4)" opacity="0.9" />
            <path d="M 110 135 L 115 140 L 120 130" fill="none" stroke={neonRed} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowRed4)" />
            
            <circle cx="115" cy="160" r="12" fill="none" stroke={neonRed} strokeWidth="3" filter="url(#glowRed4)" opacity="0.9" />
            <path d="M 110 160 L 115 165 L 120 155" fill="none" stroke={neonRed} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowRed4)" />
            
            <circle cx="115" cy="185" r="12" fill="none" stroke={neonRed} strokeWidth="3" filter="url(#glowRed4)" opacity="0.9" />
            <path d="M 110 185 L 115 190 L 120 180" fill="none" stroke={neonRed} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowRed4)" />
            
            {/* Circular bar chart icon */}
            <circle cx="240" cy="155" r="50" fill="none" stroke={darkPurple} strokeWidth="6" opacity="0.4" />
            <circle cx="240" cy="155" r="50" fill="none" stroke={neonPink} strokeWidth="4" filter="url(#glow4)" opacity="0.6" />
            <circle cx="240" cy="155" r="50" fill="none" stroke={neonBlue} strokeWidth="4" filter="url(#glow4)" opacity="0.6" 
                    strokeDasharray={`${2 * Math.PI * 50 * 0.75} ${2 * Math.PI * 50}`} 
                    strokeDashoffset={-2 * Math.PI * 50 * 0.25} 
                    transform="rotate(-90 240 155)" />
            {/* Bar chart inside circle */}
            <rect x="220" y="170" width="8" height="20" rx="2" fill={neonRed} filter="url(#glow4)" opacity="0.8" />
            <rect x="232" y="160" width="8" height="30" rx="2" fill={neonBlue} filter="url(#glow4)" opacity="0.8" />
            <rect x="244" y="150" width="8" height="40" rx="2" fill={neonBlue} filter="url(#glow4)" opacity="0.8" />
            <rect x="256" y="145" width="8" height="45" rx="2" fill={neonBlue} filter="url(#glow4)" opacity="0.8" />
            <line x1="215" y1="195" x2="265" y2="195" stroke={darkPurple} strokeWidth="2" opacity="0.5" />
          </svg>
        );

      case 5:
        // Send Documents - 3D FedEx-style Envelope + Location Pin with neon glow
        return (
          <svg viewBox="0 0 320 320" className={className} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="envelopeGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={neonBlue} stopOpacity="0.8" />
                <stop offset="50%" stopColor={neonPink} stopOpacity="0.7" />
                <stop offset="100%" stopColor={neonRed} stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="envelopeGlow5" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={neonBlue} />
                <stop offset="100%" stopColor={neonRed} />
              </linearGradient>
              <filter id="glow5" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glowRed5" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* 3D Envelope with perspective */}
            <path d="M 90 110 L 90 230 L 230 230 L 230 190 L 160 160 L 90 190 Z" 
                  fill="url(#envelopeGrad5)" filter="url(#glow5)" opacity="0.9" />
            <path d="M 90 110 L 160 160 L 230 190 L 230 110 Z" 
                  fill={darkBlue} opacity="0.3" />
            {/* Envelope flap with neon glow */}
            <path d="M 90 110 L 160 160 L 230 110" 
                  fill="none" stroke="url(#envelopeGlow5)" strokeWidth="3" filter="url(#glow5)" opacity="0.8" />
            {/* FedEx-style arrow/logo */}
            <path d="M 120 180 L 200 180 L 195 170 L 210 175 L 195 180 L 210 185 L 195 190 L 200 180 L 120 180 Z" 
                  fill={neonBlueLight} filter="url(#glow5)" opacity="0.9" />
            {/* Address label icon */}
            <rect x="100" y="200" width="40" height="25" rx="2" fill={darkBlue} opacity="0.4" />
            <line x1="105" y1="207" x2="135" y2="207" stroke={neonBlueLight} strokeWidth="2" filter="url(#glow5)" opacity="0.7" />
            <line x1="105" y1="212" x2="130" y2="212" stroke={neonBlueLight} strokeWidth="2" filter="url(#glow5)" opacity="0.6" />
            <line x1="105" y1="217" x2="125" y2="217" stroke={neonBlueLight} strokeWidth="2" filter="url(#glow5)" opacity="0.6" />
            
            {/* 3D Location pin with neon red glow */}
            <circle cx="250" cy="200" r="30" fill={neonRed} filter="url(#glowRed5)" opacity="0.95" />
            <circle cx="250" cy="200" r="28" fill={darkPurple} opacity="0.3" />
            <path d="M 250 200 L 250 230 L 265 245 L 235 245 Z" fill={neonRed} filter="url(#glowRed5)" opacity="0.95" />
            <path d="M 250 200 L 250 230 L 265 245 L 235 245 Z" fill={darkPurple} opacity="0.2" />
            <circle cx="250" cy="200" r="10" fill={isDark ? '#ffffff' : '#f3f4f6'} opacity="0.9" />
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

