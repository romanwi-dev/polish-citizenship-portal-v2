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
    <div className="flex items-center space-x-2 mt-2">
      <Checkbox
        id={`${fieldId}-dont-know`}
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label
        htmlFor={`${fieldId}-dont-know`}
        className="text-sm text-muted-foreground cursor-pointer"
      >
        {t('dontKnow')}
      </Label>
    </div>
  );
};
