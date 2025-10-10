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
      "font-normal text-foreground/95",
      isLargeFonts ? "text-2xl" : "text-xl",
      className
    )}
  >
    {children}
  </Label>
);
