import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/forms/FormInput";
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
        <Label htmlFor={name} className={isLargeFonts ? "text-2xl" : ""}>
          {label}
        </Label>
        <div
          className="w-full h-16 md:h-20 px-3 flex items-center border rounded-md hover-glow bg-gray-200/45 dark:bg-gray-700/45 border-gray-300/30 dark:border-gray-500/30 backdrop-blur transition-all text-lg font-normal font-input-work"
          style={{ 
            boxShadow: '0 0 30px rgba(156,163,175,0.25)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 50px rgba(156,163,175,0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px rgba(156,163,175,0.25)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
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
      <Label htmlFor={name} className={isLargeFonts ? "text-2xl" : ""}>
        {label}
      </Label>
      <FormInput
        id={name}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        isNameField={true}
        isLargeFonts={isLargeFonts}
        colorScheme="poa"
      />
    </motion.div>
  );
}
