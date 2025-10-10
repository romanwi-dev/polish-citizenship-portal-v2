import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormLabelProps {
  children: React.ReactNode;
  isLargeFonts?: boolean;
  htmlFor?: string;
  className?: string;
}

export const FormLabel = ({ 
  children, 
  isLargeFonts = false, 
  htmlFor,
  className 
}: FormLabelProps) => (
  <Label 
    htmlFor={htmlFor}
    className={cn(
      "font-light text-foreground/90 opacity-70",
      isLargeFonts ? "text-xl" : "text-sm",
      className
    )}
  >
    {children}
  </Label>
);
