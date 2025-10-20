import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type ColorScheme = 'children' | 'applicant' | 'spouse' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  isLargeFonts?: boolean;
  delay?: number;
  colorScheme?: ColorScheme;
}

export function CountrySelect({ 
  value = "", 
  onChange, 
  label = "Country",
  placeholder = "Select",
  className,
  isLargeFonts = false,
  delay = 0,
  colorScheme = 'applicant'
}: CountrySelectProps) {
  const [showOtherInput, setShowOtherInput] = useState(
    value && value.length > 0 && !COUNTRIES.slice(0, -1).includes(value)
  );

  const colorSchemes = {
    children: { bg: 'bg-cyan-100/45 dark:bg-cyan-900/45', border: 'border-cyan-300/30 dark:border-cyan-500/30' },
    applicant: { bg: 'bg-blue-50/45 dark:bg-blue-950/40', border: 'border-blue-200/30 dark:border-blue-800/30' },
    spouse: { bg: 'bg-blue-50/35 dark:bg-blue-900/30', border: 'border-blue-200/20 dark:border-blue-700/20' },
    parents: { bg: 'bg-teal-50/45 dark:bg-teal-950/45', border: 'border-teal-400/30 dark:border-teal-600/30' },
    grandparents: { bg: 'bg-red-50/45 dark:bg-red-950/45', border: 'border-red-400/30 dark:border-red-600/30' },
    ggp: { bg: 'bg-gray-100/45 dark:bg-gray-800/45', border: 'border-gray-200/30 dark:border-gray-600/30' },
    poa: { bg: 'bg-gray-200/45 dark:bg-gray-700/45', border: 'border-gray-300/30 dark:border-gray-500/30' },
    citizenship: { bg: 'bg-blue-100/45 dark:bg-blue-900/45', border: 'border-blue-300/30 dark:border-blue-500/30' },
    'civil-reg': { bg: 'bg-emerald-50/45 dark:bg-emerald-900/45', border: 'border-emerald-300/30 dark:border-emerald-500/30' },
  };

  const scheme = colorSchemes[colorScheme];

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
    <div
      className={cn("space-y-2 w-full animate-fade-in", className)}
      style={{ animationDelay: `${delay * 100}ms` }}
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
          <SelectTrigger className={cn("h-16 md:h-20 border-2 hover-glow focus:shadow-lg transition-all backdrop-blur text-xs [&>span]:text-xs", scheme.bg, scheme.border)}>
            <SelectValue placeholder="Select" className="text-xs" />
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
            className={cn("h-16 md:h-20 border-2 hover-glow focus:shadow-lg transition-all backdrop-blur uppercase text-xs", scheme.bg, scheme.border)}
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
    </div>
  );
}
