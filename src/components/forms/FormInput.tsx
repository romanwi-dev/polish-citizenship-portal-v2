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
  error?: string;
  required?: boolean;
}

const colorSchemes = {
  children: {
    bg: '',
    border: 'border-cyan-300/30 dark:border-cyan-500/30',
    glow: 'rgba(103,232,249,0.25)',
    glowHover: 'rgba(103,232,249,0.4)',
    glowFocus: 'rgba(103,232,249,0.5)',
  },
  applicant: {
    bg: '',
    border: 'border-blue-200/30 dark:border-blue-800/30',
    glow: 'hsla(221, 83%, 53%, 0.15)',
    glowHover: 'hsla(221, 83%, 53%, 0.3)',
    glowFocus: 'hsla(221, 83%, 53%, 0.4)',
  },
  parents: {
    bg: '',
    border: 'border-teal-400/30 dark:border-teal-600/30',
    glow: 'rgba(20,184,166,0.25)',
    glowHover: 'rgba(20,184,166,0.4)',
    glowFocus: 'rgba(20,184,166,0.5)',
  },
  grandparents: {
    bg: '',
    border: 'border-red-400/30 dark:border-red-600/30',
    glow: 'rgba(239,68,68,0.25)',
    glowHover: 'rgba(239,68,68,0.4)',
    glowFocus: 'rgba(239,68,68,0.5)',
  },
  ggp: {
    bg: '',
    border: 'border-gray-200/30 dark:border-gray-600/30',
    glow: 'rgba(209,213,219,0.25)',
    glowHover: 'rgba(209,213,219,0.4)',
    glowFocus: 'rgba(209,213,219,0.5)',
  },
  poa: {
    bg: '',
    border: 'border-gray-300/30 dark:border-gray-500/30',
    glow: 'rgba(156,163,175,0.25)',
    glowHover: 'rgba(156,163,175,0.4)',
    glowFocus: 'rgba(156,163,175,0.5)',
  },
  citizenship: {
    bg: '',
    border: 'border-blue-300/30 dark:border-blue-500/30',
    glow: 'rgba(59,130,246,0.25)',
    glowHover: 'rgba(59,130,246,0.4)',
    glowFocus: 'rgba(59,130,246,0.5)',
  },
  'civil-reg': {
    bg: '',
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
  error,
  required = false,
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
    <div className="w-full">
      <Input 
        value={value || ""} 
        onChange={handleChange}
        aria-invalid={error ? "true" : "false"}
        aria-required={required}
        className={cn(
          "h-16 text-2xl border-2 hover:border-transparent focus:border-transparent transition-all duration-300 backdrop-blur font-normal font-input-work w-full max-w-full",
          scheme.bg,
          scheme.border,
          isNameField && "uppercase",
          isLargeFonts && "text-3xl",
          isChecked && "opacity-60",
          error && "border-destructive focus:border-destructive",
          className
        )}
        style={{
          boxShadow: isChecked ? "none" : error ? "0 0 30px rgba(239, 68, 68, 0.3)" : `0 0 30px ${scheme.glow}`,
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          if (!isChecked && !error) {
            e.currentTarget.style.boxShadow = `0 0 50px ${scheme.glowHover}`;
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isChecked && !error) {
            e.currentTarget.style.boxShadow = `0 0 30px ${scheme.glow}`;
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
        onFocus={(e) => {
          if (!isChecked && !error) {
            e.currentTarget.style.boxShadow = `0 0 60px ${scheme.glowFocus}`;
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onBlur={(e) => {
          if (!isChecked && !error) {
            e.currentTarget.style.boxShadow = `0 0 30px ${scheme.glow}`;
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive mt-2 flex items-center gap-1.5 animate-fade-in">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  );
};
