import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { POAFormField } from "@/components/POAFormField";
import { DateField } from "@/components/DateField";
import { motion } from "framer-motion";

const dummyData = {
  applicant_sex: "M",
  children_count: 2,
  minor_children_count: 1,
  applicant_is_married: true,
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
      
      <div className="relative z-10 pt-2 px-3 pb-3 md:p-6">
        <div className="flex items-center justify-between mb-1 md:mb-6">
          <h2 className="text-2xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
            Power of Attorney Form
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

        <div className="space-y-6 md:space-y-12">
          {/* Main Applicant - First Questions */}
          <div className="space-y-6">
            <div className="border-b border-border/50 pb-6 pt-6">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Main Applicant
              </h2>
              <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
                First Questions
              </h3>
            </div>
            <div className="px-4 py-6 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                  <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
                  <Select value={formData.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
                    <SelectTrigger 
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
                      style={{
                        boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                      }}
                    >
                      <SelectValue placeholder="Select" className="text-xs" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      <SelectItem value="M" className="text-xs cursor-pointer">Male</SelectItem>
                      <SelectItem value="F" className="text-xs cursor-pointer">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
                  <Label className={isLargeFonts ? "text-2xl" : ""}>Number of children</Label>
                  <Select value={formData.children_count?.toString() || ""} onValueChange={(value) => handleInputChange("children_count", parseInt(value))}>
                    <SelectTrigger 
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur z-50 text-xs"
                      style={{
                        boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                      }}
                    >
                      <SelectValue placeholder="Select" className="text-xs" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()} className="text-xs cursor-pointer">{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
                  <Label className={isLargeFonts ? "text-2xl" : ""}>Marital status</Label>
                  <Select value={formData.applicant_is_married === true ? "Married" : formData.applicant_is_married === false ? "Single" : ""} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
                    <SelectTrigger 
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
                      style={{
                        boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                      }}
                    >
                      <SelectValue placeholder="Select" className="text-xs" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-2 z-50">
                      <SelectItem value="Married" className="text-xs cursor-pointer">Married</SelectItem>
                      <SelectItem value="Single" className="text-xs cursor-pointer">Single</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Minor Children Count - only show if children_count > 0 */}
                {formData.children_count > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Number of minor children (under 18)</Label>
                    <Select value={formData.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
                      <SelectTrigger 
                        className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur z-50 text-xs"
                        style={{
                          boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                        }}
                      >
                        <SelectValue placeholder="Select" className="text-xs" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-2 z-50">
                        {Array.from({ length: (formData.children_count || 0) + 1 }, (_, i) => i).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-xs cursor-pointer">{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
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
              <div className="space-y-4 px-4 py-6 md:p-10">
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
