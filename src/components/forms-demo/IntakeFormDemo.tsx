import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectSection, ApplicantSection, ContactSection, AddressSection, PassportSection, NotesSection } from "@/components/IntakeFormContent";

const dummyData = {
  applicant_given_names: "Jan Kowalski",
  applicant_family_name: "Nowak",
  applicant_sex: "M",
  applicant_dob: "15.05.1985",
  applicant_pob_city: "Warsaw",
  applicant_pob_country: "Poland",
  applicant_email: "jan.nowak@example.com",
  applicant_phone: "+48 123 456 789",
  applicant_current_country: "United States",
  applicant_current_address: "123 Main Street, New York, NY 10001",
  applicant_passport_number: "AB1234567",
  applicant_passport_issue: "01.01.2020",
  applicant_passport_expiry: "01.01.2030",
  notes: "This is dummy data for testing purposes.",
};

interface IntakeFormDemoProps {
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function IntakeFormDemo({ onClose, isExpanded, onToggleExpand }: IntakeFormDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [activeTab, setActiveTab] = useState("select");
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearField = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: "" }));
  };

  const contentProps = {
    formData,
    handleInputChange,
    clearField,
    isLargeFonts,
  };

  return (
    <div className={`relative min-h-full ${isLargeFonts ? 'text-lg' : ''}`}>
      
      <div className="relative z-10 pt-2 px-3 pb-3 md:p-6">
        <div className="flex items-center justify-between mb-1 md:mb-6">
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text text-center md:text-left flex-1">
            Client Intake
          </h2>
          <div className="flex items-center gap-0.5 md:gap-2">
            <Button onClick={onToggleExpand} variant="ghost" size="icon" title="Toggle fullscreen" className="h-7 w-7 md:h-10 md:w-10">
              <Maximize2 className="h-3.5 w-3.5 md:h-6 md:w-6" />
            </Button>
            <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts" className="h-7 w-7 md:h-10 md:w-10">
              <Type className="h-3.5 w-3.5 md:h-6 md:w-6" />
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon" className="h-7 w-7 md:h-10 md:w-10">
              <X className="h-3.5 w-3.5 md:h-6 md:w-6" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-1 md:mb-6 flex-wrap h-auto">
            <TabsTrigger value="select">Select</TabsTrigger>
            <TabsTrigger value="applicant">Applicant</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="passport">Passport</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="select"><SelectSection {...contentProps} /></TabsContent>
          <TabsContent value="applicant"><ApplicantSection {...contentProps} /></TabsContent>
          <TabsContent value="contact"><ContactSection {...contentProps} /></TabsContent>
          <TabsContent value="address"><AddressSection {...contentProps} /></TabsContent>
          <TabsContent value="passport"><PassportSection {...contentProps} /></TabsContent>
          <TabsContent value="notes"><NotesSection {...contentProps} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
