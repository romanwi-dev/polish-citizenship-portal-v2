import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { validateDateFormat } from "@/utils/validators";
import { useState } from "react";

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
}

export function DateField({ 
  name, 
  label, 
  value, 
  onChange, 
  delay = 0, 
  required = false,
  showNotApplicable = false,
  notApplicableValue = false,
  onNotApplicableChange
}: DateFieldProps) {
  const { isLargeFonts } = useAccessibility();
  const [error, setError] = useState<string>("");

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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
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
        </div>
        <Input
          id={name}
          type="text"
          value={value || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="DD.MM.YYYY"
          maxLength={10}
          disabled={notApplicableValue}
          className={cn(
            "h-16 md:h-20 text-lg border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300/70 dark:hover:border-blue-700/70 focus:border-blue-500 transition-all duration-300 bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur font-normal placeholder:opacity-40 font-input-work w-full max-w-full",
            isLargeFonts && "text-2xl",
            error && "border-destructive",
            notApplicableValue && "bg-cyan-950/30 border-cyan-700 text-cyan-300 cursor-not-allowed"
          )}
          style={{
            boxShadow: notApplicableValue ? "none" : "0 0 30px hsla(221, 83%, 53%, 0.15)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
          onFocus={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = "0 0 60px hsla(221, 83%, 53%, 0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onBlur={(e) => {
            if (!notApplicableValue) {
              e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
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
