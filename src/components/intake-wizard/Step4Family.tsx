import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DontKnowCheckbox } from "./DontKnowCheckbox";
import { useTranslation } from "react-i18next";

interface StepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  dontKnowFields: Set<string>;
  onDontKnowToggle: (field: string, checked: boolean) => void;
}

export const Step4Family = ({ formData, onChange, dontKnowFields, onDontKnowToggle }: StepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* Father's Name */}
      <div className="space-y-2">
        <Label htmlFor="father_name">
          {t('fatherName')} {t('optional')}
        </Label>
        <Input
          id="father_name"
          value={formData.father_full_name || ''}
          onChange={(e) => onChange('father_full_name', e.target.value)}
          placeholder=""
          disabled={dontKnowFields.has('father_full_name')}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('father_full_name')}
          onChange={(checked) => onDontKnowToggle('father_full_name', checked)}
          fieldId="father_name"
        />
      </div>

      {/* Mother's Name */}
      <div className="space-y-2">
        <Label htmlFor="mother_name">
          {t('motherName')} {t('optional')}
        </Label>
        <Input
          id="mother_name"
          value={formData.mother_full_name || ''}
          onChange={(e) => onChange('mother_full_name', e.target.value)}
          placeholder=""
          disabled={dontKnowFields.has('mother_full_name')}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('mother_full_name')}
          onChange={(checked) => onDontKnowToggle('mother_full_name', checked)}
          fieldId="mother_name"
        />
      </div>

      {/* Marital Status */}
      <div className="space-y-2">
        <Label htmlFor="marital_status">
          {t('maritalStatus')} {t('optional')}
        </Label>
        <Select
          value={formData.applicant_marital_status || ''}
          onValueChange={(value) => onChange('applicant_marital_status', value)}
          disabled={dontKnowFields.has('applicant_marital_status')}
        >
          <SelectTrigger id="marital_status">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">{t('single')}</SelectItem>
            <SelectItem value="married">{t('married')}</SelectItem>
            <SelectItem value="divorced">{t('divorced')}</SelectItem>
            <SelectItem value="widowed">{t('widowed')}</SelectItem>
          </SelectContent>
        </Select>
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_marital_status')}
          onChange={(checked) => onDontKnowToggle('applicant_marital_status', checked)}
          fieldId="marital_status"
        />
      </div>
    </div>
  );
};
