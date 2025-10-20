import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/forms/FormInput";
import { MaskedPassportInput } from "@/components/forms/MaskedPassportInput";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
      <div
        className="space-y-2 animate-fade-in"
        style={{ animationDelay: `${delay * 100}ms` }}
        onDoubleClick={handleDoubleClick}
      >
        <Label htmlFor={name} className={cn(
          "font-light text-foreground/90",
          isLargeFonts ? "text-2xl" : "text-xl"
        )}>
          {label}
        </Label>
        <div
          className={cn(
            "w-full h-16 md:h-20 px-3 flex items-center border rounded-md hover-glow border-gray-300/30 dark:border-gray-500/30 transition-all text-2xl font-normal font-input-work",
            isLargeFonts && "text-3xl"
          )}
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
      </div>
    );
  }

  // Check if this is a passport field
  const isPassportField = name.toLowerCase().includes('passport');

  return (
    <div
      className="space-y-2 animate-fade-in"
      style={{ animationDelay: `${delay * 100}ms` }}
      onDoubleClick={handleDoubleClick}
    >
      <Label htmlFor={name} className={cn(
        "font-light text-foreground/90",
        isLargeFonts ? "text-2xl" : "text-xl"
      )}>
        {label}
      </Label>
      {isPassportField ? (
        <MaskedPassportInput
          id={name}
          value={value || ""}
          onChange={onChange}
          isLargeFonts={isLargeFonts}
          colorScheme="poa"
        />
      ) : (
        <FormInput
          id={name}
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          isNameField={true}
          isLargeFonts={isLargeFonts}
          colorScheme="poa"
        />
      )}
    </div>
  );
}
