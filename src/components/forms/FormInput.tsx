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
        "h-16 text-lg bg-blue-50/45 dark:bg-blue-950/40 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300/70 dark:hover:border-blue-700/70 focus:border-blue-500 hover-glow focus:shadow-lg transition-all backdrop-blur font-normal",
        isNameField && "uppercase",
        isLargeFonts && "text-2xl",
        className
      )}
      {...props}
    />
  );
};
