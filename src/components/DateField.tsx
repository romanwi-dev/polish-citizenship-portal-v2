import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { validateDateFormat } from "@/utils/validators";
import { useState } from "react";

type ColorScheme = 'children' | 'applicant' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

interface DateFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  delay?: number;
  required?: boolean;
  showNotApplicable?: boolean;
  notApplicableValue?: boolean;
  onNotApplicableChange?: (checked: boolean) => void;
  colorScheme?: ColorScheme;
  isLargeFonts?: boolean;
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

export function DateField({ 
  name, 
  label, 
  value, 
  onChange, 
  delay = 0, 
  required = false,
  showNotApplicable = false,
  notApplicableValue = false,
  onNotApplicableChange,
  colorScheme = 'applicant',
  isLargeFonts: customLargeFonts
}: DateFieldProps) {
  const { isLargeFonts: contextLargeFonts } = useAccessibility();
  const isLargeFonts = customLargeFonts ?? contextLargeFonts;
  const [error, setError] = useState<string>("");
  const scheme = colorSchemes[colorScheme];

  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Validate only if value is complete (10 characters: DD.MM.YYYY)
    if (newValue.length === 10) {
      const validation = validateDateFormat(newValue);
      setError(validation.valid ? "" : validation.error || "");
    } else if (newValue.length === 0) {
      setError("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="w-full"
    >
      <div>
        <Label htmlFor={name} className={isLargeFonts ? "text-2xl" : ""}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {showNotApplicable && (
          <Checkbox
            id={`${name}-na`}
            checked={notApplicableValue}
            onCheckedChange={(checked) => {
              onNotApplicableChange?.(checked as boolean);
              if (checked) {
                onChange("");
              }
            }}
            className="border-cyan-600"
          />
        )}
        <Input
          id={name}
          type="text"
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="DD.MM.YYYY"
          maxLength={10}
          disabled={notApplicableValue}
          className={cn(
            "h-16 text-2xl border-2 transition-all duration-300 backdrop-blur font-normal placeholder:opacity-40 font-input-work w-full max-w-full",
            scheme.bg,
            scheme.border,
            isLargeFonts && "text-3xl",
            error && "border-destructive",
            notApplicableValue && "bg-cyan-950/30 border-cyan-700 text-cyan-300 cursor-not-allowed"
          )}
          style={{
            boxShadow: notApplicableValue ? "none" : `0 0 30px ${scheme.glow}`,
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = `0 0 50px ${scheme.glowHover}`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = `0 0 30px ${scheme.glow}`;
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
          onFocus={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = `0 0 60px ${scheme.glowFocus}`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onBlur={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = `0 0 30px ${scheme.glow}`;
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
