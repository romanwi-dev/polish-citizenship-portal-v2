import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormInput } from "./FormInput";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { maskPassportByRole, canSeeFullPassport } from "@/utils/dataMasking";

type ColorScheme = 'children' | 'applicant' | 'spouse' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

interface MaskedPassportInputProps {
  value: string;
  onChange: (value: string) => void;
  isLargeFonts?: boolean;
  placeholder?: string;
  id?: string;
  colorScheme?: ColorScheme;
  error?: string;
  required?: boolean;
  forPDF?: boolean; // Force show for PDF generation
}

export const MaskedPassportInput = ({
  value,
  onChange,
  isLargeFonts = false,
  placeholder = "",
  id,
  colorScheme = 'applicant',
  error,
  required = false,
  forPDF = false,
}: MaskedPassportInputProps) => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole(user?.id);
  const [showFull, setShowFull] = useState(false);
  
  const canUnmask = canSeeFullPassport(userRole);
  const displayValue = (showFull || forPDF) ? value : maskPassportByRole(value, userRole, forPDF);
  
  return (
    <div className="relative">
      <FormInput
        id={id}
        type="text"
        value={displayValue}
        onChange={(e) => {
          // Only allow editing if showing full value
          if (showFull || canUnmask || forPDF) {
            onChange(e.target.value.toUpperCase());
          }
        }}
        isNameField
        isLargeFonts={isLargeFonts}
        placeholder={placeholder}
        colorScheme={colorScheme}
        error={error}
        required={required}
        readOnly={!showFull && !canUnmask && !forPDF}
      />
      
      {/* Unmask button - only for admin/assistant */}
      {canUnmask && value && !forPDF && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};
