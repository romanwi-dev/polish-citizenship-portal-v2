import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface DontKnowCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  fieldId: string;
}

export const DontKnowCheckbox = ({ checked, onChange, fieldId }: DontKnowCheckboxProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center space-x-2 mt-2 min-h-[44px]"> {/* ONBOARDING-UX-SAFE: Minimum touch target height */}
      <Checkbox
        id={`${fieldId}-dont-know`}
        checked={checked}
        onCheckedChange={onChange}
        className="h-5 w-5" /* ONBOARDING-UX-SAFE: Larger checkbox for better mobile interaction */
      />
      <Label
        htmlFor={`${fieldId}-dont-know`}
        className="text-xs sm:text-sm text-muted-foreground cursor-pointer truncate" /* ONBOARDING-UX-SAFE: Smaller text + truncate */
      >
        {t('dontKnow')}
      </Label>
    </div>
  );
};
