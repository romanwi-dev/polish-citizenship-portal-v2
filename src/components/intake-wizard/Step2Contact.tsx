import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CountrySelect } from "@/components/CountrySelect";
import { DontKnowCheckbox } from "./DontKnowCheckbox";
import { useTranslation } from "react-i18next";

interface StepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  dontKnowFields: Set<string>;
  onDontKnowToggle: (field: string, checked: boolean) => void;
}

export const Step2Contact = ({ formData, onChange, dontKnowFields, onDontKnowToggle }: StepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          {t('email')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.applicant_email || ''}
          onChange={(e) => onChange('applicant_email', e.target.value)}
          placeholder=""
          disabled={dontKnowFields.has('applicant_email')}
          required
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_email')}
          onChange={(checked) => onDontKnowToggle('applicant_email', checked)}
          fieldId="email"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">
          {t('phone')} {t('optional')}
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.applicant_phone || ''}
          onChange={(e) => onChange('applicant_phone', e.target.value)}
          placeholder=""
          disabled={dontKnowFields.has('applicant_phone')}
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_phone')}
          onChange={(checked) => onDontKnowToggle('applicant_phone', checked)}
          fieldId="phone"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">
          {t('address')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          value={formData.applicant_address || ''}
          onChange={(e) => onChange('applicant_address', e.target.value)}
          placeholder=""
          disabled={dontKnowFields.has('applicant_address')}
          required
        />
        <DontKnowCheckbox
          checked={dontKnowFields.has('applicant_address')}
          onChange={(checked) => onDontKnowToggle('applicant_address', checked)}
          fieldId="address"
        />
      </div>

      {/* City + State Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            {t('city')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            value={formData.applicant_city || ''}
            onChange={(e) => onChange('applicant_city', e.target.value)}
            placeholder=""
            disabled={dontKnowFields.has('applicant_city')}
            required
          />
          <DontKnowCheckbox
            checked={dontKnowFields.has('applicant_city')}
            onChange={(checked) => onDontKnowToggle('applicant_city', checked)}
            fieldId="city"
          />
        </div>

        {/* State/Province */}
        <div className="space-y-2">
          <Label htmlFor="state">
            {t('state')} {t('optional')}
          </Label>
          <Input
            id="state"
            value={formData.applicant_state || ''}
            onChange={(e) => onChange('applicant_state', e.target.value)}
            placeholder=""
            disabled={dontKnowFields.has('applicant_state')}
          />
          <DontKnowCheckbox
            checked={dontKnowFields.has('applicant_state')}
            onChange={(checked) => onDontKnowToggle('applicant_state', checked)}
            fieldId="state"
          />
        </div>
      </div>

      {/* Postal Code + Country Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ZIP Code */}
        <div className="space-y-2">
          <Label htmlFor="zip">
            {t('zipCode')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="zip"
            value={formData.applicant_zip_code || ''}
            onChange={(e) => onChange('applicant_zip_code', e.target.value)}
            placeholder=""
            disabled={dontKnowFields.has('applicant_zip_code')}
            required
          />
          <DontKnowCheckbox
            checked={dontKnowFields.has('applicant_zip_code')}
            onChange={(checked) => onDontKnowToggle('applicant_zip_code', checked)}
            fieldId="zip"
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">
            {t('country')} <span className="text-destructive">*</span>
          </Label>
          <CountrySelect
            value={formData.applicant_country || ''}
            onChange={(value) => onChange('applicant_country', value)}
            colorScheme="applicant"
          />
          <DontKnowCheckbox
            checked={dontKnowFields.has('applicant_country')}
            onChange={(checked) => onDontKnowToggle('applicant_country', checked)}
            fieldId="country"
          />
        </div>
      </div>
    </div>
  );
};
