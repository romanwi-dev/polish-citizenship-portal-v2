import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateField } from "@/components/DateField";
import { DontKnowCheckbox } from "./DontKnowCheckbox";
import { useTranslation } from "react-i18next";

interface StepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  dontKnowFields: Set<string>;
  onDontKnowToggle: (field: string, checked: boolean) => void;
}

export const Step1BasicInfo = ({ formData, onChange, dontKnowFields, onDontKnowToggle }: StepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* First Name */}
      <div className="space-y-2">
        <Label htmlFor="first_name">
          {t('firstName')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="first_name"
          value={formData.applicant_first_name || ''}
          onChange={(e) => onChange('applicant_first_name', e.target.value)}
          placeholder=""
          disabled={dontKnowFields.has('applicant_first_name')}
          required
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_first_name')}
          onChange={(checked) => onDontKnowToggle('applicant_first_name', checked)}
          fieldId="first_name"
        />
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label htmlFor="last_name">
          {t('lastName')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="last_name"
          value={formData.applicant_last_name || ''}
          onChange={(e) => onChange('applicant_last_name', e.target.value)}
          placeholder=""
          disabled={dontKnowFields.has('applicant_last_name')}
          required
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_last_name')}
          onChange={(checked) => onDontKnowToggle('applicant_last_name', checked)}
          fieldId="last_name"
        />
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor="dob">
          {t('dateOfBirth')} <span className="text-destructive">*</span>
        </Label>
        <DateField
          name="dob"
          label=""
          value={formData.applicant_dob || ''}
          onChange={(value) => onChange('applicant_dob', value)}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_dob')}
          onChange={(checked) => onDontKnowToggle('applicant_dob', checked)}
          fieldId="dob"
        />
      </div>

      {/* Sex */}
      <div className="space-y-2">
        <Label htmlFor="sex">
          {t('sex')} <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.applicant_sex || ''}
          onValueChange={(value) => onChange('applicant_sex', value)}
          disabled={dontKnowFields.has('applicant_sex')}
        >
          <SelectTrigger id="sex">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M">{t('male')}</SelectItem>
            <SelectItem value="F">{t('female')}</SelectItem>
          </SelectContent>
        </Select>
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_sex')}
          onChange={(checked) => onDontKnowToggle('applicant_sex', checked)}
          fieldId="sex"
        />
      </div>
    </div>
  );
};
