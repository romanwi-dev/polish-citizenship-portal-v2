import { FormLabel } from "./FormLabel";
import { FormInput } from "./FormInput";

type ColorScheme = 'children' | 'applicant' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

interface FormFieldGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isNameField?: boolean;
  isLargeFonts?: boolean;
  placeholder?: string;
  type?: string;
  id?: string;
  colorScheme?: ColorScheme;
}

export const FormFieldGroup = ({
  label,
  value,
  onChange,
  isNameField = false,
  isLargeFonts = false,
  placeholder,
  type = "text",
  id,
  colorScheme = 'applicant',
}: FormFieldGroupProps) => {
  return (
    <div className="space-y-3 w-full">
      <FormLabel isLargeFonts={isLargeFonts} htmlFor={id}>
        {label}
      </FormLabel>
      <FormInput
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        isNameField={isNameField}
        isLargeFonts={isLargeFonts}
        placeholder={placeholder}
        colorScheme={colorScheme}
      />
    </div>
  );
};
