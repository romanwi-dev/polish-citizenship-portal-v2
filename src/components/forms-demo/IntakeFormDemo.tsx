import { useState } from "react";
import { X } from "lucide-react";
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
}

export default function IntakeFormDemo({ onClose }: IntakeFormDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [activeTab, setActiveTab] = useState("select");

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
    isLargeFonts: false,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Client Intake
        </h2>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto">
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
  );
}
