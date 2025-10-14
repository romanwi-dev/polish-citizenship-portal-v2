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
    <div className={`p-6 ${isLargeFonts ? 'text-lg' : ''}`}>
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
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="tree-view">Tree View</TabsTrigger>
          <TabsTrigger value="select">Select...</TabsTrigger>
          <TabsTrigger value="applicant">Applicant</TabsTrigger>
          {formData.applicant_is_married && <TabsTrigger value="spouse">Spouse</TabsTrigger>}
          {formData.minor_children_count > 0 && <TabsTrigger value="children">Children</TabsTrigger>}
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="grandparents">Grandparents</TabsTrigger>
        </TabsList>

        <TabsContent value="tree-view">
          <FamilyTreeInteractive
            clientData={{
              ...mapPersonData('applicant'),
              sex: formData.applicant_sex
            }}
            spouse={mapPersonData('spouse')}
            father={mapPersonData('father')}
            mother={mapPersonData('mother')}
            paternalGrandfather={mapPersonData('pgf')}
            paternalGrandmother={mapPersonData('pgm')}
            maternalGrandfather={mapPersonData('mgf')}
            maternalGrandmother={mapPersonData('mgm')}
            onEdit={() => {}}
            onOpenMasterTable={() => {}}
          />
        </TabsContent>

        <TabsContent value="select">
          <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold">Basic Information</h3>
            
            <div className="space-y-3">
              <Label>Gender</Label>
              <Select value={formData.applicant_sex} onValueChange={(value) => handleInputChange('applicant_sex', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Male</SelectItem>
                  <SelectItem value="F">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_married" 
                checked={formData.applicant_is_married} 
                onCheckedChange={(checked) => handleInputChange('applicant_is_married', checked)}
              />
              <Label htmlFor="is_married">Applicant is married</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applicant">
          <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold">Applicant Information</h3>
            
            <FormInput
              id="applicant_first_name"
              value={formData.applicant_first_name}
              onChange={(e) => handleInputChange('applicant_first_name', e.target.value)}
              placeholder="First Name"
              colorScheme="applicant"
              isLargeFonts={isLargeFonts}
            />

            <FormInput
              id="applicant_last_name"
              value={formData.applicant_last_name}
              onChange={(e) => handleInputChange('applicant_last_name', e.target.value)}
              placeholder="Last Name"
              colorScheme="applicant"
              isLargeFonts={isLargeFonts}
            />

            <DateField
              name="applicant_dob"
              label="Date of Birth"
              value={formData.applicant_dob}
              onChange={(value) => handleInputChange('applicant_dob', value)}
              colorScheme="applicant"
            />
          </div>
        </TabsContent>

        <TabsContent value="spouse">
          <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold">Spouse Information</h3>
            
            <FormInput
              id="spouse_first_name"
              value={formData.spouse_first_name}
              onChange={(e) => handleInputChange('spouse_first_name', e.target.value)}
              placeholder="First Name"
              colorScheme="applicant"
              isLargeFonts={isLargeFonts}
            />

            <FormInput
              id="spouse_last_name"
              value={formData.spouse_last_name}
              onChange={(e) => handleInputChange('spouse_last_name', e.target.value)}
              placeholder="Last Name"
              colorScheme="applicant"
              isLargeFonts={isLargeFonts}
            />
          </div>
        </TabsContent>

        <TabsContent value="children">
          <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold">Children Information</h3>
            <p className="text-muted-foreground">Children data form coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="parents">
          <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold">Father</h3>
            
            <FormInput
              id="father_first_name"
              value={formData.father_first_name}
              onChange={(e) => handleInputChange('father_first_name', e.target.value)}
              placeholder="First Name"
              colorScheme="parents"
              isLargeFonts={isLargeFonts}
            />

            <FormInput
              id="father_last_name"
              value={formData.father_last_name}
              onChange={(e) => handleInputChange('father_last_name', e.target.value)}
              placeholder="Last Name"
              colorScheme="parents"
              isLargeFonts={isLargeFonts}
            />

            <h3 className="text-2xl font-heading font-bold mt-8">Mother</h3>
            
            <FormInput
              id="mother_first_name"
              value={formData.mother_first_name}
              onChange={(e) => handleInputChange('mother_first_name', e.target.value)}
              placeholder="First Name"
              colorScheme="parents"
              isLargeFonts={isLargeFonts}
            />

            <FormInput
              id="mother_last_name"
              value={formData.mother_last_name}
              onChange={(e) => handleInputChange('mother_last_name', e.target.value)}
              placeholder="Last Name"
              colorScheme="parents"
              isLargeFonts={isLargeFonts}
            />
          </div>
        </TabsContent>

        <TabsContent value="grandparents">
          <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold">Paternal Grandparents</h3>
            
            <FormInput
              id="pgf_first_name"
              value={formData.pgf_first_name}
              onChange={(e) => handleInputChange('pgf_first_name', e.target.value)}
              placeholder="Grandfather First Name"
              colorScheme="grandparents"
              isLargeFonts={isLargeFonts}
            />

            <FormInput
              id="pgm_first_name"
              value={formData.pgm_first_name}
              onChange={(e) => handleInputChange('pgm_first_name', e.target.value)}
              placeholder="Grandmother First Name"
              colorScheme="grandparents"
              isLargeFonts={isLargeFonts}
            />

            <h3 className="text-2xl font-heading font-bold mt-8">Maternal Grandparents</h3>
            
            <FormInput
              id="mgf_first_name"
              value={formData.mgf_first_name}
              onChange={(e) => handleInputChange('mgf_first_name', e.target.value)}
              placeholder="Grandfather First Name"
              colorScheme="grandparents"
              isLargeFonts={isLargeFonts}
            />

            <FormInput
              id="mgm_first_name"
              value={formData.mgm_first_name}
              onChange={(e) => handleInputChange('mgm_first_name', e.target.value)}
              placeholder="Grandmother First Name"
              colorScheme="grandparents"
              isLargeFonts={isLargeFonts}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
