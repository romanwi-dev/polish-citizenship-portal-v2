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
  error?: string;
  required?: boolean;
  enforceUppercase?: boolean;
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
  error,
  required = false,
  enforceUppercase = false,
}: FormFieldGroupProps) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2 sm:space-y-3 w-full min-w-0 mb-4 sm:mb-0">
      <FormLabel isLargeFonts={isLargeFonts} htmlFor={id} required={required}>
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
        error={error}
        required={required}
        enforceUppercase={enforceUppercase}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive mt-1 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
          {error}
        </p>
      )}
    </div>
  );
};
