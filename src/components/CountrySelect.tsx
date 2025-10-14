import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const COUNTRIES = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "South Africa",
  "Brazil",
  "Argentina",
  "Mexico",
  "Venezuela",
  "Israel",
  "Germany",
  "France",
  "Other"
];

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  isLargeFonts?: boolean;
  delay?: number;
}

export function CountrySelect({ 
  value = "", 
  onChange, 
  label = "Country",
  placeholder = "Select...",
  className,
  isLargeFonts = false,
  delay = 0
}: CountrySelectProps) {
  const [showOtherInput, setShowOtherInput] = useState(
    value && value.length > 0 && !COUNTRIES.slice(0, -1).includes(value)
  );

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "Other") {
      setShowOtherInput(true);
      onChange("");
    } else {
      setShowOtherInput(false);
      onChange(selectedValue);
    }
  };

  const handleOtherInputChange = (inputValue: string) => {
    onChange(inputValue.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn("space-y-2 w-full", className)}
    >
      {label && (
        <Label>
          {label}
        </Label>
      )}
      
      {!showOtherInput ? (
        <Select 
          value={COUNTRIES.slice(0, -1).includes(value) ? value : ""} 
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="h-20 border-2 border-border/50 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-2xl [&>span]:text-2xl">
            <SelectValue placeholder="Select..." className="text-2xl" />
          </SelectTrigger>
          <SelectContent className="bg-background border-2 z-[100]">
            {COUNTRIES.map((country) => (
              <SelectItem 
                key={country} 
                value={country} 
                className="text-base cursor-pointer hover:bg-primary/10"
              >
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => handleOtherInputChange(e.target.value)}
            placeholder=""
            className="h-20 border-2 border-border/50 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur uppercase text-2xl"
          />
          <button
            type="button"
            onClick={() => {
              setShowOtherInput(false);
              onChange("");
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Select from list instead
          </button>
        </div>
      )}
    </motion.div>
  );
}
