import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateField } from "@/components/DateField";
import { CountrySelect } from "@/components/CountrySelect";
import { DontKnowCheckbox } from "./DontKnowCheckbox";
import { useTranslation } from "react-i18next";

interface StepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  dontKnowFields: Set<string>;
  onDontKnowToggle: (field: string, checked: boolean) => void;
}

export const Step3Passport = ({ formData, onChange, dontKnowFields, onDontKnowToggle }: StepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* Passport Number */}
      <div className="space-y-2">
        <Label htmlFor="passport_number">
          {t('passportNumber')} {t('optional')}
        </Label>
        <Input
          id="passport_number"
          value={formData.applicant_passport_number || ''}
          onChange={(e) => onChange('applicant_passport_number', e.target.value.toUpperCase())}
          placeholder=""
          disabled={dontKnowFields.has('applicant_passport_number')}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_passport_number')}
          onChange={(checked) => onDontKnowToggle('applicant_passport_number', checked)}
          fieldId="passport_number"
        />
      </div>

      {/* Issue Date */}
      <div className="space-y-2">
        <Label htmlFor="passport_issue">
          {t('passportIssueDate')} {t('optional')}
        </Label>
        <DateField
          name="passport_issue"
          label=""
          value={formData.applicant_passport_issue_date || ''}
          onChange={(value) => onChange('applicant_passport_issue_date', value)}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_passport_issue_date')}
          onChange={(checked) => onDontKnowToggle('applicant_passport_issue_date', checked)}
          fieldId="passport_issue"
        />
      </div>

      {/* Expiry Date */}
      <div className="space-y-2">
        <Label htmlFor="passport_expiry">
          {t('passportExpiryDate')} {t('optional')}
        </Label>
        <DateField
          name="passport_expiry"
          label=""
          value={formData.applicant_passport_expiry_date || ''}
          onChange={(value) => onChange('applicant_passport_expiry_date', value)}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_passport_expiry_date')}
          onChange={(checked) => onDontKnowToggle('applicant_passport_expiry_date', checked)}
          fieldId="passport_expiry"
        />
      </div>

      {/* Issuing Country */}
      <div className="space-y-2">
        <Label htmlFor="passport_country">
          {t('passportCountry')} {t('optional')}
        </Label>
        <CountrySelect
          value={formData.applicant_passport_issuing_country || ''}
          onChange={(value) => onChange('applicant_passport_issuing_country', value)}
          colorScheme="applicant"
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_passport_issuing_country')}
          onChange={(checked) => onDontKnowToggle('applicant_passport_issuing_country', checked)}
          fieldId="passport_country"
        />
      </div>
    </div>
  );
};
