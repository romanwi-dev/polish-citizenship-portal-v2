import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isNameField?: boolean;
  isLargeFonts?: boolean;
  isChecked?: boolean;
}

export const FormInput = ({ 
  value, 
  onChange, 
  isNameField = false,
  isLargeFonts = false,
  isChecked = false,
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
        "h-16 md:h-20 text-lg bg-blue-50/45 dark:bg-blue-950/40 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300/70 dark:hover:border-blue-700/70 focus:border-blue-500 transition-all duration-300 backdrop-blur font-normal font-input-work w-full max-w-full",
        isNameField && "uppercase",
        isLargeFonts && "text-2xl",
        isChecked && "opacity-60",
        className
      )}
      style={{
        boxShadow: isChecked ? "none" : "0 0 30px hsla(221, 83%, 53%, 0.15)",
        transition: "all 0.3s ease"
      }}
      onMouseEnter={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
        }
      }}
      onFocus={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = "0 0 60px hsla(221, 83%, 53%, 0.4)";
        }
      }}
      onBlur={(e) => {
        if (!isChecked) {
          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
        }
      }}
      {...props}
    />
  );
};
