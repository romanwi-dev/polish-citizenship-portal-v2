import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  if (type === "date") {
    const dateValue = value ? new Date(value) : undefined;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="space-y-3"
      >
        <Label htmlFor={name} className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-14 justify-start text-left font-normal border-2 hover-glow bg-card/50 backdrop-blur",
                !dateValue && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => date > new Date("2030-12-31") || date < new Date("1900-01-01")}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-3"
    >
      <Label htmlFor={name} className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={value ? "" : (placeholder || `Enter ${label.toLowerCase()}`)}
        className="h-14 border-2 text-base hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
      />
    </motion.div>
  );
}
