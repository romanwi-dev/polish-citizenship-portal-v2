import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DontKnowCheckbox } from "./DontKnowCheckbox";
import { useTranslation } from "react-i18next";

interface StepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  dontKnowFields: Set<string>;
  onDontKnowToggle: (field: string, checked: boolean) => void;
}

export const Step6Additional = ({ formData, onChange, dontKnowFields, onDontKnowToggle }: StepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="notes">
          Additional Notes / Questions {t('optional')}
        </Label>
        <Textarea
          id="notes"
          value={formData.client_notes || ''}
          onChange={(e) => onChange('client_notes', e.target.value)}
          placeholder="Please share any additional information that might be helpful for your citizenship application..."
          rows={6}
          disabled={dontKnowFields.has('client_notes')}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('client_notes')}
          onChange={(checked) => onDontKnowToggle('client_notes', checked)}
          fieldId="notes"
        />
      </div>

      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <h3 className="font-semibold text-sm">What happens next?</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Review all information on the next page</li>
          <li>Submit your application</li>
          <li>Our team will review within 24-48 hours</li>
          <li>You'll receive next steps via email</li>
        </ul>
      </div>
    </div>
  );
};
