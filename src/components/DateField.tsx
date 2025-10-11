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
      className="space-y-2 w-full"
    >
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
          "h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur font-normal placeholder:opacity-40 text-lg font-input-work w-full max-w-full",
          isLargeFonts && "text-2xl",
          error && "border-destructive",
          notApplicableValue && "bg-cyan-950/30 border-cyan-700 text-cyan-300 cursor-not-allowed"
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </motion.div>
  );
}
