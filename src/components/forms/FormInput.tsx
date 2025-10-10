import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isNameField?: boolean;
  isLargeFonts?: boolean;
}

export const FormInput = ({ 
  value, 
  onChange, 
  isNameField = false,
  isLargeFonts = false,
  className,
  ...props 
}: FormInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isNameField) {
      const uppercasedValue = e.target.value.toUpperCase();
      onChange({
        ...e,
        target: { ...e.target, value: uppercasedValue }
      } as React.ChangeEvent<HTMLInputElement>);
    } else {
      onChange(e);
    }
  };

  return (
    <Input 
      value={value || ""} 
      onChange={handleChange}
      className={cn(
        "h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur font-normal",
        isNameField && "uppercase",
        isLargeFonts && "text-2xl",
        className
      )}
      {...props}
    />
  );
};
