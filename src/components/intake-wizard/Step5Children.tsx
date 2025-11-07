import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateField } from "@/components/DateField";
import { DontKnowCheckbox } from "./DontKnowCheckbox";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface StepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  dontKnowFields: Set<string>;
  onDontKnowToggle: (field: string, checked: boolean) => void;
}

export const Step5Children = ({ formData, onChange, dontKnowFields, onDontKnowToggle }: StepProps) => {
  const { t } = useTranslation();
  
  // Auto-detect how many children have data
  const getChildrenWithData = () => {
    let count = 0;
    for (let i = 1; i <= 10; i++) {
      if (formData[`child_${i}_first_name`] || formData[`child_${i}_last_name`] || formData[`child_${i}_dob`]) {
        count = i;
      }
    }
    return count;
  };
  
  const [visibleChildren, setVisibleChildren] = useState(Math.max(getChildrenWithData(), 1));
  
  const addChild = () => {
    if (visibleChildren < 10) {
      setVisibleChildren(visibleChildren + 1);
    }
  };
  
  const removeChild = () => {
    if (visibleChildren > 1) {
      // Clear data for the child being removed
      const childNum = visibleChildren;
      onChange(`child_${childNum}_first_name`, '');
      onChange(`child_${childNum}_last_name`, '');
      onChange(`child_${childNum}_dob`, '');
      onChange(`child_${childNum}_pob`, '');
      setVisibleChildren(visibleChildren - 1);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Children Information</h3>
        <p className="text-sm text-muted-foreground">
          Please provide information about your children (if any). This helps us determine eligibility and POA requirements.
        </p>
      </div>
      
      {Array.from({ length: visibleChildren }, (_, i) => {
        const childNum = i + 1;
        return (
          <div key={childNum} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Child {childNum}</h4>
              {childNum === visibleChildren && visibleChildren > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={removeChild}
                  className="h-8"
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
            
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor={`child_${childNum}_first_name`}>
                First Name {t('optional')}
              </Label>
              <Input
                id={`child_${childNum}_first_name`}
                value={formData[`child_${childNum}_first_name`] || ''}
                onChange={(e) => onChange(`child_${childNum}_first_name`, e.target.value)}
                placeholder=""
                disabled={dontKnowFields.has(`child_${childNum}_first_name`)}
              />
              <DontKnowCheckbox
                checked={dontKnowFields.has(`child_${childNum}_first_name`)}
                onChange={(checked) => onDontKnowToggle(`child_${childNum}_first_name`, checked)}
                fieldId={`child_${childNum}_first_name`}
              />
            </div>
            
            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor={`child_${childNum}_last_name`}>
                Last Name {t('optional')}
              </Label>
              <Input
                id={`child_${childNum}_last_name`}
                value={formData[`child_${childNum}_last_name`] || ''}
                onChange={(e) => onChange(`child_${childNum}_last_name`, e.target.value)}
                placeholder=""
                disabled={dontKnowFields.has(`child_${childNum}_last_name`)}
              />
              <DontKnowCheckbox
                checked={dontKnowFields.has(`child_${childNum}_last_name`)}
                onChange={(checked) => onDontKnowToggle(`child_${childNum}_last_name`, checked)}
                fieldId={`child_${childNum}_last_name`}
              />
            </div>
            
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor={`child_${childNum}_dob`}>
                Date of Birth {t('optional')}
              </Label>
              <DateField
                name={`child_${childNum}_dob`}
                label=""
                value={formData[`child_${childNum}_dob`] || ''}
                onChange={(value) => onChange(`child_${childNum}_dob`, value)}
              />
              <DontKnowCheckbox
                checked={dontKnowFields.has(`child_${childNum}_dob`)}
                onChange={(checked) => onDontKnowToggle(`child_${childNum}_dob`, checked)}
                fieldId={`child_${childNum}_dob`}
              />
            </div>
            
            {/* Place of Birth */}
            <div className="space-y-2">
              <Label htmlFor={`child_${childNum}_pob`}>
                Place of Birth {t('optional')}
              </Label>
              <Input
                id={`child_${childNum}_pob`}
                value={formData[`child_${childNum}_pob`] || ''}
                onChange={(e) => onChange(`child_${childNum}_pob`, e.target.value)}
                placeholder=""
                disabled={dontKnowFields.has(`child_${childNum}_pob`)}
              />
              <DontKnowCheckbox
                checked={dontKnowFields.has(`child_${childNum}_pob`)}
                onChange={(checked) => onDontKnowToggle(`child_${childNum}_pob`, checked)}
                fieldId={`child_${childNum}_pob`}
              />
            </div>
          </div>
        );
      })}
      
      {visibleChildren < 10 && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={addChild}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Child
        </Button>
      )}
      
      {visibleChildren === 0 && (
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            No children? Click "Next" to continue.
          </p>
        </div>
      )}
    </div>
  );
};
