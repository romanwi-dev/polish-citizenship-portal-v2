import { LucideIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface BenefitCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  details: string;
  id?: string;
  index: number;
  isFlipped: boolean;
  onToggleFlip: () => void;
}

export const BenefitCard = ({
  icon: Icon,
  label,
  value,
  details,
  id,
  index,
  isFlipped,
  onToggleFlip,
}: BenefitCardProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div 
      ref={ref}
      id={id}
      className={`w-full max-w-[280px] mx-auto md:max-w-none cursor-pointer transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        perspective: '1000px',
        transitionDelay: `${index * 100}ms`
      }}
      onClick={onToggleFlip}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front Side */}
        <div 
          className="glass-card p-6 rounded-lg hover-glow w-full h-[180px] md:h-[200px] flex flex-col"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="text-center flex-1 flex flex-col items-center justify-center gap-3">
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" strokeWidth={1.5} />
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              {value}
            </div>
            <div className="text-lg md:text-xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{label}</div>
          </div>
          <div className="text-xs text-primary/50 text-center mt-4">Click for details</div>
        </div>

        {/* Back Side */}
        <div 
          className="glass-card p-6 rounded-lg w-full absolute top-0 left-0 h-[180px] md:h-[200px] flex flex-col justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <p className="text-sm text-center leading-relaxed bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {details}
          </p>
          <div className="text-xs text-primary/50 text-center mt-4">Click to flip back</div>
        </div>
      </div>
    </div>
  );
};
