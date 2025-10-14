import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DontKnowCheckbox } from "./DontKnowCheckbox";
import { useTranslation } from "react-i18next";

interface StepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  dontKnowFields: Set<string>;
  onDontKnowToggle: (field: string, checked: boolean) => void;
}

export const Step5PolishConnection = ({ formData, onChange, dontKnowFields, onDontKnowToggle }: StepProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* Polish Ancestors */}
      <div className="space-y-3">
        <Label>{t('polishAncestor')} {t('optional')}</Label>
        <RadioGroup
          value={formData.has_polish_ancestors || ''}
          onValueChange={(value) => onChange('has_polish_ancestors', value)}
          disabled={dontKnowFields.has('has_polish_ancestors')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="ancestor-yes" />
            <Label htmlFor="ancestor-yes" className="font-normal cursor-pointer">
              {t('yes')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="ancestor-no" />
            <Label htmlFor="ancestor-no" className="font-normal cursor-pointer">
              {t('no')}
            </Label>
          </div>
        </RadioGroup>
        <DontKnowCheckbox
          checked={dontKnowFields.has('has_polish_ancestors')}
          onChange={(checked) => onDontKnowToggle('has_polish_ancestors', checked)}
          fieldId="ancestor"
        />
      </div>

      {/* Ancestor Details - Show if yes */}
      {formData.has_polish_ancestors === 'yes' && (
        <div className="space-y-2">
          <Label htmlFor="ancestor_details">
            {t('ancestorDetails')} {t('optional')}
          </Label>
          <Textarea
            id="ancestor_details"
            value={formData.polish_ancestor_details || ''}
            onChange={(e) => onChange('polish_ancestor_details', e.target.value)}
            placeholder=""
            rows={4}
            disabled={dontKnowFields.has('polish_ancestor_details')}
          />
          <DontKnowCheckbox
            checked={dontKnowFields.has('polish_ancestor_details')}
            onChange={(checked) => onDontKnowToggle('polish_ancestor_details', checked)}
            fieldId="ancestor_details"
          />
        </div>
      )}

      {/* Polish Documents */}
      <div className="space-y-3">
        <Label>{t('polishDocuments')} {t('optional')}</Label>
        <RadioGroup
          value={formData.has_polish_documents || ''}
          onValueChange={(value) => onChange('has_polish_documents', value)}
          disabled={dontKnowFields.has('has_polish_documents')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="docs-yes" />
            <Label htmlFor="docs-yes" className="font-normal cursor-pointer">
              {t('yes')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="docs-no" />
            <Label htmlFor="docs-no" className="font-normal cursor-pointer">
              {t('no')}
            </Label>
          </div>
        </RadioGroup>
        <DontKnowCheckbox
          checked={dontKnowFields.has('has_polish_documents')}
          onChange={(checked) => onDontKnowToggle('has_polish_documents', checked)}
          fieldId="docs"
        />
      </div>
    </div>
  );
};
