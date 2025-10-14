import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { POAFormField } from "@/components/POAFormField";
import { DateField } from "@/components/DateField";

const dummyData = {
  applicant_given_names: "Jan",
  applicant_family_name: "Kowalski",
  applicant_passport_number: "AB1234567",
  poa_date_filed: "01.03.2024",
  child_1_full_name: "Anna Kowalska",
  spouse_full_name: "Maria Kowalska",
};

interface POAFormDemoProps {
  onClose: () => void;
}

export default function POAFormDemo({ onClose }: POAFormDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [poaType, setPOAType] = useState("adult");

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Power of Attorney
        </h2>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>POA Type</Label>
          <RadioGroup value={poaType} onValueChange={setPOAType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="adult" id="adult" />
              <Label htmlFor="adult">Adult POA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minor" id="minor" />
              <Label htmlFor="minor">Minor POA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spouse" id="spouse" />
              <Label htmlFor="spouse">Spouse POA</Label>
            </div>
          </RadioGroup>
        </div>

        <POAFormField
          name="applicant_given_names"
          label="Applicant Given Names"
          value={formData.applicant_given_names}
          onChange={(value) => handleInputChange('applicant_given_names', value)}
        />

        <POAFormField
          name="applicant_family_name"
          label="Applicant Family Name"
          value={formData.applicant_family_name}
          onChange={(value) => handleInputChange('applicant_family_name', value)}
        />

        <POAFormField
          name="applicant_passport_number"
          label="Passport Number"
          value={formData.applicant_passport_number}
          onChange={(value) => handleInputChange('applicant_passport_number', value)}
        />

        <DateField
          name="poa_date_filed"
          label="POA Date Filed"
          value={formData.poa_date_filed}
          onChange={(value) => handleInputChange('poa_date_filed', value)}
          colorScheme="poa"
        />

        {poaType === "minor" && (
          <POAFormField
            name="child_1_full_name"
            label="Child Full Name"
            value={formData.child_1_full_name}
            onChange={(value) => handleInputChange('child_1_full_name', value)}
          />
        )}

        {poaType === "spouse" && (
          <POAFormField
            name="spouse_full_name"
            label="Spouse Full Name"
            value={formData.spouse_full_name}
            onChange={(value) => handleInputChange('spouse_full_name', value)}
          />
        )}
      </div>
    </div>
  );
}
