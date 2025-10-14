import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { POAFormField } from "@/components/POAFormField";
import { DateField } from "@/components/DateField";
import { motion } from "framer-motion";

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

        <div className="space-y-12">
          {/* Select Section - Matching Intake Form */}
          <div className="space-y-6">
            <div className="border-b border-border/50 pb-6 pt-6">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Select POA Type
              </h2>
              <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
                First Questions
              </h3>
            </div>
            <div className="px-4 py-6 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Button
                    variant={poaType === "adult" ? "default" : "outline"}
                    className="w-full h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-base"
                    style={poaType === "adult" ? {} : {
                      boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                    }}
                    onMouseEnter={(e) => {
                      if (poaType !== "adult") {
                        e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (poaType !== "adult") {
                        e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                      }
                    }}
                    onClick={() => setPOAType("adult")}
                  >
                    POA Adult
                  </Button>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Button
                    variant={poaType === "minor" ? "default" : "outline"}
                    className="w-full h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-base"
                    style={poaType === "minor" ? {} : {
                      boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                    }}
                    onMouseEnter={(e) => {
                      if (poaType !== "minor") {
                        e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (poaType !== "minor") {
                        e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                      }
                    }}
                    onClick={() => setPOAType("minor")}
                  >
                    POA Minor
                  </Button>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button
                    variant={poaType === "spouses" ? "default" : "outline"}
                    className="w-full h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-base"
                    style={poaType === "spouses" ? {} : {
                      boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                    }}
                    onMouseEnter={(e) => {
                      if (poaType !== "spouses") {
                        e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (poaType !== "spouses") {
                        e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                      }
                    }}
                    onClick={() => setPOAType("spouses")}
                  >
                    POA Spouses
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* POA Adult Section */}
          {poaType === "adult" && (
            <div className="space-y-6">
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400">
                  POA Adult
                </h2>
              </div>
              <div className="space-y-4">
                <POAFormField
                  name="applicant_given_names"
                  label="Given Names"
                  value={formData.applicant_given_names}
                  onChange={(value) => handleInputChange("applicant_given_names", value)}
                  placeholder="Enter given names"
                />
                <POAFormField
                  name="applicant_family_name"
                  label="Family Name"
                  value={formData.applicant_family_name}
                  onChange={(value) => handleInputChange("applicant_family_name", value)}
                  placeholder="Enter family name"
                />
                <POAFormField
                  name="applicant_passport_number"
                  label="Passport Number"
                  value={formData.applicant_passport_number}
                  onChange={(value) => handleInputChange("applicant_passport_number", value)}
                  placeholder="Enter passport number"
                />
                <div className="space-y-2">
                  <Label className={isLargeFonts ? "text-2xl" : ""}>POA Date Filed</Label>
                  <DateField
                    name="poa_date_filed"
                    label=""
                    value={formData.poa_date_filed}
                    onChange={(value) => handleInputChange("poa_date_filed", value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* POA Minor Section */}
          {poaType === "minor" && (
            <div className="space-y-6">
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400">
                  POA Minor
                </h2>
              </div>
              <div className="space-y-4">
                <POAFormField
                  name="child_1_full_name"
                  label="Child Full Name"
                  value={formData.child_1_full_name}
                  onChange={(value) => handleInputChange("child_1_full_name", value)}
                  placeholder="Enter child's full name"
                />
                <POAFormField
                  name="applicant_given_names"
                  label="Parent/Guardian Given Names"
                  value={formData.applicant_given_names}
                  onChange={(value) => handleInputChange("applicant_given_names", value)}
                  placeholder="Enter parent/guardian given names"
                />
              </div>
            </div>
          )}

          {/* POA Spouses Section */}
          {poaType === "spouses" && (
            <div className="space-y-6">
              <div className="border-b border-border/50 pb-6">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-600 dark:text-gray-400">
                  POA Spouses
                </h2>
              </div>
              <div className="space-y-4">
                <POAFormField
                  name="spouse_full_name"
                  label="Spouse Full Name"
                  value={formData.spouse_full_name}
                  onChange={(value) => handleInputChange("spouse_full_name", value)}
                  placeholder="Enter spouse's full name"
                />
                <POAFormField
                  name="applicant_given_names"
                  label="Applicant Given Names"
                  value={formData.applicant_given_names}
                  onChange={(value) => handleInputChange("applicant_given_names", value)}
                  placeholder="Enter applicant given names"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
