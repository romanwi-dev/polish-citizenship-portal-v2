import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ColorScheme = 'children' | 'applicant' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isNameField?: boolean;
  isLargeFonts?: boolean;
  isChecked?: boolean;
  colorScheme?: ColorScheme;
}

const colorSchemes = {
  children: {
    bg: 'bg-cyan-100/45 dark:bg-cyan-900/45',
    border: 'border-cyan-300/30 dark:border-cyan-500/30',
    glow: 'rgba(103,232,249,0.25)',
    glowHover: 'rgba(103,232,249,0.4)',
    glowFocus: 'rgba(103,232,249,0.5)',
  },
  applicant: {
    bg: 'bg-blue-50/45 dark:bg-blue-950/40',
    border: 'border-blue-200/30 dark:border-blue-800/30',
    glow: 'hsla(221, 83%, 53%, 0.15)',
    glowHover: 'hsla(221, 83%, 53%, 0.3)',
    glowFocus: 'hsla(221, 83%, 53%, 0.4)',
  },
  parents: {
    bg: 'bg-teal-50/45 dark:bg-teal-950/45',
    border: 'border-teal-400/30 dark:border-teal-600/30',
    glow: 'rgba(20,184,166,0.25)',
    glowHover: 'rgba(20,184,166,0.4)',
    glowFocus: 'rgba(20,184,166,0.5)',
  },
  grandparents: {
    bg: 'bg-red-50/45 dark:bg-red-950/45',
    border: 'border-red-400/30 dark:border-red-600/30',
    glow: 'rgba(239,68,68,0.25)',
    glowHover: 'rgba(239,68,68,0.4)',
    glowFocus: 'rgba(239,68,68,0.5)',
  },
  ggp: {
    bg: 'bg-gray-100/45 dark:bg-gray-800/45',
    border: 'border-gray-200/30 dark:border-gray-600/30',
    glow: 'rgba(209,213,219,0.25)',
    glowHover: 'rgba(209,213,219,0.4)',
    glowFocus: 'rgba(209,213,219,0.5)',
  },
  poa: {
    bg: 'bg-gray-200/45 dark:bg-gray-700/45',
    border: 'border-gray-300/30 dark:border-gray-500/30',
    glow: 'rgba(156,163,175,0.25)',
    glowHover: 'rgba(156,163,175,0.4)',
    glowFocus: 'rgba(156,163,175,0.5)',
  },
  citizenship: {
    bg: 'bg-blue-100/45 dark:bg-blue-900/45',
    border: 'border-blue-300/30 dark:border-blue-500/30',
    glow: 'rgba(59,130,246,0.25)',
    glowHover: 'rgba(59,130,246,0.4)',
    glowFocus: 'rgba(59,130,246,0.5)',
  },
  'civil-reg': {
    bg: 'bg-emerald-50/45 dark:bg-emerald-900/45',
    border: 'border-emerald-300/30 dark:border-emerald-500/30',
    glow: 'rgba(110,231,183,0.25)',
    glowHover: 'rgba(110,231,183,0.4)',
    glowFocus: 'rgba(110,231,183,0.5)',
  },
};

export const FormInput = ({ 
  value, 
  onChange, 
  isNameField = false,
  isLargeFonts = false,
  isChecked = false,
  colorScheme = 'applicant',
  className,
  ...props 
}: FormInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNameField) {
      const uppercasedValue = e.target.value.toUpperCase();
      onChange({
        ...e,
        target: { ...e.target, value: uppercasedValue }
      } as React.ChangeEvent<HTMLInputElement>);
    } else {
      onChange(e);
    }
  };

  const scheme = colorSchemes[colorScheme];

  return (
    <Input 
      value={value || ""} 
      onChange={handleChange}
      className={cn(
        "h-16 md:h-20 text-2xl border-2 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work w-full max-w-full",
        scheme.bg,
        scheme.border,
        isNameField && "uppercase",
        isLargeFonts && "text-3xl",
        isChecked && "opacity-60",
        className
      )}
      style={{
        boxShadow: isChecked ? "none" : `0 0 30px ${scheme.glow}`,
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = `0 0 50px ${scheme.glowHover}`;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = `0 0 30px ${scheme.glow}`;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
      onFocus={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = `0 0 60px ${scheme.glowFocus}`;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onBlur={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = `0 0 30px ${scheme.glow}`;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
      {...props}
    />
  );
};
