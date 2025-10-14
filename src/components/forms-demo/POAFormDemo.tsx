import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
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
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function POAFormDemo({ onClose, isExpanded, onToggleExpand }: POAFormDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [poaType, setPOAType] = useState("adult");
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`relative min-h-full ${isLargeFonts ? 'text-lg' : ''}`}>
      {/* Checkered grid background - matching footer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
            Power of Attorney Form
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={onToggleExpand} variant="ghost" size="icon" title="Toggle fullscreen">
              <Maximize2 className="h-6 w-6" />
            </Button>
            <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts">
              <Type className="h-6 w-6" />
            </Button>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
...
      </div>
      </div>
    </div>
  );
}
