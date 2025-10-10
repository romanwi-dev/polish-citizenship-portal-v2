import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface POAFormFieldProps {
  name: string;
  label: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  delay?: number;
}

export function POAFormField({ name, label, type = "text", value, onChange, placeholder, delay = 0 }: POAFormFieldProps) {
  const { isLargeFonts } = useAccessibility();
  
  const handleDoubleClick = () => {
    // Don't clear date fields
    if (type === "date") return;
    onChange("");
  };

  if (type === "date") {
    // Use the current date in the user's timezone if no value provided
    const dateValue = value ? new Date(value) : new Date();
    const displayDate = format(dateValue, "dd.MM.yyyy");
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="space-y-4"
        onDoubleClick={handleDoubleClick}
      >
        <Label htmlFor={name} className={cn(
          "font-normal text-foreground/90",
          isLargeFonts ? "text-2xl" : "text-base"
        )}>
          {label}
        </Label>
        <div
          className="w-full h-16 px-3 flex items-center border-2 rounded-md hover-glow bg-card/50 backdrop-blur"
          style={{ fontSize: '1.125rem', fontWeight: '400' }}
        >
          {displayDate}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-4"
      onDoubleClick={handleDoubleClick}
    >
      <Label htmlFor={name} className={cn(
        "font-normal text-foreground/90",
        isLargeFonts ? "text-2xl" : "text-base"
      )}>
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder=""
        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase font-normal"
      />
    </motion.div>
  );
}
