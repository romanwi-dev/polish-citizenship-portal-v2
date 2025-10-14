import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { DateField } from "@/components/DateField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const dummyData = {
  "OBY-A-GN": "Jan",
  "OBY-A-FN": "Kowalski",
  "OBY-A-DOB": "15.05.1985",
  "OBY-A-POB-C": "Warsaw",
  "OBY-A-POB-CN": "Poland",
  "OBY-A-SEX": "M",
  "OBY-F-GN": "Andrzej",
  "OBY-F-FN": "Kowalski",
  "OBY-F-DOB": "10.03.1960",
  "OBY-M-GN": "Maria",
  "OBY-M-FN": "Kowalska",
  "OBY-M-DOB": "20.07.1962",
};

interface CitizenshipFormDemoProps {
  onClose: () => void;
}

export default function CitizenshipFormDemo({ onClose }: CitizenshipFormDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`p-6 ${isLargeFonts ? 'text-lg' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
          Citizenship Application
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts">
            <Type className="h-6 w-6" />
          </Button>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Applicant Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-heading font-bold">Applicant Information</h3>
          
          <FormInput
            id="OBY-A-GN"
            value={formData["OBY-A-GN"]}
            onChange={(e) => handleInputChange("OBY-A-GN", e.target.value)}
            placeholder="Given Names"
            colorScheme="applicant"
          />

          <FormInput
            id="OBY-A-FN"
            value={formData["OBY-A-FN"]}
            onChange={(e) => handleInputChange("OBY-A-FN", e.target.value)}
            placeholder="Family Name"
            colorScheme="applicant"
          />

          <DateField
            name="OBY-A-DOB"
            label="Date of Birth"
            value={formData["OBY-A-DOB"]}
            onChange={(value) => handleInputChange("OBY-A-DOB", value)}
            colorScheme="applicant"
          />

          <div className="space-y-3">
            <FormLabel>Sex</FormLabel>
            <Select value={formData["OBY-A-SEX"]} onValueChange={(value) => handleInputChange("OBY-A-SEX", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Parents Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-heading font-bold">Father Information</h3>
          
          <FormInput
            id="OBY-F-GN"
            value={formData["OBY-F-GN"]}
            onChange={(e) => handleInputChange("OBY-F-GN", e.target.value)}
            placeholder="Given Names"
            colorScheme="parents"
          />

          <FormInput
            id="OBY-F-FN"
            value={formData["OBY-F-FN"]}
            onChange={(e) => handleInputChange("OBY-F-FN", e.target.value)}
            placeholder="Family Name"
            colorScheme="parents"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-heading font-bold">Mother Information</h3>
          
          <FormInput
            id="OBY-M-GN"
            value={formData["OBY-M-GN"]}
            onChange={(e) => handleInputChange("OBY-M-GN", e.target.value)}
            placeholder="Given Names"
            colorScheme="parents"
          />

          <FormInput
            id="OBY-M-FN"
            value={formData["OBY-M-FN"]}
            onChange={(e) => handleInputChange("OBY-M-FN", e.target.value)}
            placeholder="Family Name"
            colorScheme="parents"
          />
        </div>
      </div>
    </div>
  );
}
