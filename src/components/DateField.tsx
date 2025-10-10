import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
}

export function DateField({ name, label, value, onChange, delay = 0, required = false }: DateFieldProps) {
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
      className="space-y-2"
    >
      <Label htmlFor={name} className={isLargeFonts ? "text-2xl" : ""}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        type="text"
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="DD.MM.YYYY"
        maxLength={10}
        className={cn(
          "h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur font-normal placeholder:opacity-40 text-lg",
          isLargeFonts && "text-2xl",
          error && "border-destructive"
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </motion.div>
  );
}
