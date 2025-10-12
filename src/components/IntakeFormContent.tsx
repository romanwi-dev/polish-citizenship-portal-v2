import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/forms/FormInput";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/DateField";
import { CountrySelect } from "@/components/CountrySelect";
import { FlippableCardsDarkGlow } from "@/components/docs/FlippableCardsDarkGlow";
import { cn } from "@/lib/utils";

interface IntakeFormContentProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  clearField: (field: string) => void;
  isLargeFonts: boolean;
}

export const SelectSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2" onDoubleClick={() => clearField("applicant_sex")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
          <Select value={formData?.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
            <SelectTrigger 
              className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
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
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              <SelectItem value="M" className="text-base cursor-pointer">Male</SelectItem>
              <SelectItem value="F" className="text-base cursor-pointer">Female</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2" onDoubleClick={() => clearField("applicant_is_married")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Marital status</Label>
          <Select value={formData?.applicant_is_married === true ? "Married" : "Single"} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
            <SelectTrigger 
              className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
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
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              <SelectItem value="Married" className="text-base cursor-pointer">Married</SelectItem>
              <SelectItem value="Single" className="text-base cursor-pointer">Single</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2" onDoubleClick={() => clearField("children_count")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Number of children</Label>
          <Select value={formData?.children_count?.toString() || ""} onValueChange={(value) => handleInputChange("children_count", parseInt(value))}>
            <SelectTrigger 
              className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur z-50"
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
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {(formData?.children_count > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-2" onDoubleClick={() => clearField("minor_children_count")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>Number of minor children</Label>
            <Select value={formData?.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
              <SelectTrigger 
                className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
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
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent className="bg-background border-2 z-50">
                {Array.from({ length: (formData?.children_count || 0) + 1 }, (_, i) => i).map((num) => (
                  <SelectItem key={num} value={num.toString()} className="text-base cursor-pointer">{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>
    </div>
  </>
);

export const ApplicantSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <div className="border-b border-border/50 pb-6 pt-6">
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Applicant Information
      </h3>
    </div>
    <div className="px-4 py-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2" onDoubleClick={() => clearField("applicant_first_name")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>First name</Label>
          <FormInput value={formData?.applicant_first_name || ""} onChange={(e) => handleInputChange("applicant_first_name", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2" onDoubleClick={() => clearField("applicant_last_name")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Last name</Label>
          <FormInput value={formData?.applicant_last_name || ""} onChange={(e) => handleInputChange("applicant_last_name", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2" onDoubleClick={() => clearField("applicant_maiden_name")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Maiden name</Label>
          <FormInput value={formData?.applicant_maiden_name || ""} onChange={(e) => handleInputChange("applicant_maiden_name", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 md:items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-4" onDoubleClick={() => clearField("applicant_pob")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Place of birth</Label>
          <FormInput value={formData?.applicant_pob || ""} onChange={(e) => handleInputChange("applicant_pob", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
        </motion.div>
        <DateField name="applicant_dob" label="Date of birth" value={formData?.applicant_dob} onChange={(value) => handleInputChange("applicant_dob", value)} delay={0.45} colorScheme="applicant" />
      </div>

      {formData?.applicant_is_married && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 md:items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("place_of_marriage")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>Place of marriage</Label>
            <FormInput value={formData?.place_of_marriage || ""} onChange={(e) => handleInputChange("place_of_marriage", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
          </motion.div>
          <div>
            <DateField name="date_of_marriage" label="Date of marriage" value={formData?.date_of_marriage} onChange={(value) => handleInputChange("date_of_marriage", value)} delay={0.5} colorScheme="applicant" />
          </div>
        </div>
      )}
    </div>
  </>
);

export const ContactSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <div className="border-b border-border/50 pb-6 pt-6">
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Contact Information
      </h3>
    </div>
    <div className="px-4 py-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_email")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Email</Label>
          <FormInput value={formData?.applicant_email || ""} onChange={(e) => handleInputChange("applicant_email", e.target.value)} type="email" colorScheme="applicant" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_phone")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Phone</Label>
          <FormInput value={formData?.applicant_phone || ""} onChange={(e) => handleInputChange("applicant_phone", e.target.value)} colorScheme="applicant" />
        </motion.div>
      </div>
    </div>
  </>
);

export const AddressSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <div className="border-b border-border/50 pb-6 pt-6">
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Address Information
      </h3>
    </div>
    <div className="px-4 py-6 md:p-10">
      <div className="grid grid-cols-1 gap-6 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_street")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Street address</Label>
          <FormInput value={formData?.applicant_street || ""} onChange={(e) => handleInputChange("applicant_street", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_city")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>City</Label>
            <FormInput value={formData?.applicant_city || ""} onChange={(e) => handleInputChange("applicant_city", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_state")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>State / Province</Label>
            <FormInput value={formData?.applicant_state || ""} onChange={(e) => handleInputChange("applicant_state", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_postal_code")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>Postal / ZIP code</Label>
            <FormInput value={formData?.applicant_postal_code || ""} onChange={(e) => handleInputChange("applicant_postal_code", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
          </motion.div>
          <CountrySelect value={formData?.applicant_country || ""} onChange={(value) => handleInputChange("applicant_country", value)} label="Country" isLargeFonts={isLargeFonts} delay={0} />
        </div>
      </div>
    </div>
  </>
);

export const PassportSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <div className="border-b border-border/50 pb-6 pt-6">
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Passport Information
      </h3>
    </div>
    <div className="px-4 py-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_passport_number")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Passport number</Label>
          <FormInput value={formData?.applicant_passport_number || ""} onChange={(e) => handleInputChange("applicant_passport_number", e.target.value.toUpperCase())} isNameField colorScheme="applicant" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <DateField name="applicant_passport_expiry_date" label="Passport expiry date" value={formData?.applicant_passport_expiry_date} onChange={(value) => handleInputChange("applicant_passport_expiry_date", value)} colorScheme="applicant" isLargeFonts={isLargeFonts} />
        </motion.div>
      </div>
    </div>
  </>
);

export const ImmigrationSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <div className="border-b border-border/50 pb-6 pt-6">
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Emigration Information
      </h3>
    </div>
    <div className="px-4 py-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <DateField name="applicant_date_of_naturalization" label="Date of naturalization" value={formData?.applicant_date_of_naturalization} onChange={(value) => handleInputChange("applicant_date_of_naturalization", value)} colorScheme="applicant" />
        <DateField name="applicant_date_of_emigration" label="Date of emigration" value={formData?.applicant_date_of_emigration} onChange={(value) => handleInputChange("applicant_date_of_emigration", value)} colorScheme="applicant" />
      </div>
    </div>
  </>
);

export const DocumentsSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => {
  const documents = [
    {
      id: 'applicant_has_polish_documents',
      label: 'Polish Documents',
      checked: formData?.applicant_has_polish_documents || false,
      importance: 'high' as const,
      difficulty: 'hard' as const,
    },
    {
      id: 'applicant_has_passport',
      label: 'Passport Copy',
      checked: formData?.applicant_has_passport || false,
      importance: 'critical' as const,
      difficulty: 'easy' as const,
    },
    {
      id: 'applicant_has_birth_cert',
      label: 'Birth Certificate',
      checked: formData?.applicant_has_birth_cert || false,
      importance: 'critical' as const,
      difficulty: 'medium' as const,
    },
    {
      id: 'applicant_has_marriage_cert',
      label: 'Marriage Certificate',
      checked: formData?.applicant_has_marriage_cert || false,
      importance: 'high' as const,
      difficulty: 'medium' as const,
    },
    {
      id: 'applicant_has_naturalization',
      label: 'Naturalization Certificate',
      checked: formData?.applicant_has_naturalization || false,
      importance: 'critical' as const,
      difficulty: 'hard' as const,
    },
    ...(formData?.applicant_sex === 'M' ? [{
      id: 'applicant_has_military_record',
      label: 'Military Service Record',
      checked: formData?.applicant_has_military_record || false,
      importance: 'medium' as const,
      difficulty: 'hard' as const,
    }] : []),
    {
      id: 'applicant_has_foreign_docs',
      label: 'Foreign Documents',
      checked: formData?.applicant_has_foreign_docs || false,
      importance: 'medium' as const,
      difficulty: 'medium' as const,
    },
    {
      id: 'applicant_has_additional_docs',
      label: 'Additional Documents',
      checked: formData?.applicant_has_additional_docs || false,
      importance: 'low' as const,
      difficulty: 'easy' as const,
    },
  ];

  const handleDocumentsChange = (updatedDocuments: typeof documents) => {
    updatedDocuments.forEach(doc => {
      handleInputChange(doc.id, doc.checked);
    });
  };

  return (
    <>
      <div className="border-b border-border/50 pb-6 pt-6">
        <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
          Required Documents
        </h3>
      </div>
      <div className="px-2 md:px-4 py-8">
        <FlippableCardsDarkGlow
          title=""
          documents={documents}
          onChange={handleDocumentsChange}
        />
      </div>
    </>
  );
};

export const NotesSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <div className="border-b border-border/50 pb-6 pt-6">
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Additional Notes
      </h3>
    </div>
    <div className="px-4 py-6 md:p-10">
      <Label className={isLargeFonts ? "text-2xl" : ""}>
        Additional notes
      </Label>
      <Textarea value={formData?.applicant_notes || ""} onChange={(e) => handleInputChange("applicant_notes", e.target.value.toUpperCase())} className="mt-2 min-h-[150px] uppercase" />
    </div>
  </>
);
