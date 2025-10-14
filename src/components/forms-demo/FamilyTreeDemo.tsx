import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { DateField } from "@/components/DateField";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyTreeInteractive } from "@/components/FamilyTreeInteractive";

const dummyData = {
  applicant_sex: "M",
  applicant_is_married: true,
  minor_children_count: 2,
  applicant_first_name: "Jan",
  applicant_last_name: "Kowalski",
  applicant_dob: "15.05.1985",
  applicant_pob: "Warsaw, Poland",
  spouse_first_name: "Maria",
  spouse_last_name: "Kowalska",
  spouse_maiden_name: "Nowak",
  spouse_dob: "20.07.1987",
  father_first_name: "Andrzej",
  father_last_name: "Kowalski",
  father_dob: "10.03.1960",
  mother_first_name: "Anna",
  mother_last_name: "Kowalska",
  mother_maiden_name: "Lewandowska",
  mother_dob: "15.01.1962",
  pgf_first_name: "Józef",
  pgf_last_name: "Kowalski",
  pgm_first_name: "Helena",
  pgm_last_name: "Kowalska",
  mgf_first_name: "Stefan",
  mgf_last_name: "Lewandowski",
  mgm_first_name: "Zofia",
  mgm_last_name: "Lewandowska",
};

interface FamilyTreeDemoProps {
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function FamilyTreeDemo({ onClose, isExpanded, onToggleExpand }: FamilyTreeDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [isLargeFonts, setIsLargeFonts] = useState(false);
  const [activeTab, setActiveTab] = useState("tree-view");

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const mapPersonData = (prefix: string) => ({
    firstName: formData[`${prefix}_first_name`] || "",
    lastName: formData[`${prefix}_last_name`] || "",
    maidenName: formData[`${prefix}_maiden_name`],
    dateOfBirth: formData[`${prefix}_dob`],
    placeOfBirth: formData[`${prefix}_pob`],
    isPolish: true,
  });

  return (
    <div className={`relative min-h-full ${isLargeFonts ? 'text-lg' : ''}`}>
      {/* Checkered grid background - matching footer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
            Polish Family Tree
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
...
        </Tabs>
      </div>
    </div>
  );
}
