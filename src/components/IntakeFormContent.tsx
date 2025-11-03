import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/forms/FormInput";
import { MaskedPassportInput } from "@/components/forms/MaskedPassportInput";
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
  <div className="px-4 py-6 md:p-10">
    <div className="border-b border-border/50 pb-6 pt-6">
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Main Applicant
      </h2>
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        First Questions
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_sex")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
          <Select value={formData?.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
            <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              <SelectItem value="M" className="cursor-pointer">Male</SelectItem>
              <SelectItem value="F" className="cursor-pointer">Female</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("children_count")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Children</Label>
          <Select value={formData?.children_count?.toString() || ""} onValueChange={(value) => handleInputChange("children_count", parseInt(value))}>
            <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()} className="cursor-pointer">{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.175 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("minor_children_count")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Minor children</Label>
          <Select value={formData?.minor_children_count?.toString() || ""} onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}>
            <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <SelectItem key={num} value={num.toString()} className="cursor-pointer">{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_is_married")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Marital status</Label>
          <Select value={formData?.applicant_is_married === true ? "Married" : "Single"} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
            <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              <SelectItem value="Married" className="cursor-pointer">Married</SelectItem>
              <SelectItem value="Single" className="cursor-pointer">Single</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <div className="border-b border-border/50 pb-6 pt-6 mb-6">
        <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
          I don't know answers
        </h3>
      </div>

      <div className="space-y-4">
        {[
          { field: "idk_ancestor_polish_passport", label: "I don't know if my Ancestor held Polish passport" },
          { field: "idk_ancestor_lost_citizenship", label: "I don't know if my Ancestor lost Polish citizenship" },
          { field: "idk_ancestor_applied_citizenship", label: "I don't know if my Ancestor applied for citizenship of a foreign country" },
          { field: "idk_renounced", label: "I don't know if anyone in the lineage renounced Polish citizenship" },
        ].map((item, index) => (
          <motion.div
            key={item.field}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="flex items-center space-x-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
          >
            <Checkbox
              id={item.field}
              checked={formData?.[item.field] || false}
              onCheckedChange={(checked) => handleInputChange(item.field, checked)}
              className="border-2"
            />
            <Label
              htmlFor={item.field}
              className={cn("cursor-pointer flex-1", isLargeFonts && "text-2xl")}
            >
              {item.label}
            </Label>
          </motion.div>
        ))}
      </div>
  </div>
);

export const ApplicantSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <div className="px-4 py-6 md:p-10">
    <div className="border-b border-border/50 pb-6 pt-6">
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Main Applicant
      </h2>
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Personal Details
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_first_name")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>First name</Label>
        <FormInput
          value={formData?.applicant_first_name || ""}
          onChange={(e) => handleInputChange("applicant_first_name", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_last_name")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Last name</Label>
        <FormInput
          value={formData?.applicant_last_name || ""}
          onChange={(e) => handleInputChange("applicant_last_name", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="form-field-container space-y-2">
        <DateField
          name="applicant_dob"
          label="Date of birth"
          value={formData?.applicant_dob || ""}
          onChange={(value) => handleInputChange("applicant_dob", value)}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_pob_city")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>City of birth</Label>
        <FormInput
          value={formData?.applicant_pob_city || ""}
          onChange={(e) => handleInputChange("applicant_pob_city", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_pob_country")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Country of birth</Label>
        <CountrySelect
          value={formData?.applicant_pob_country || ""}
          onChange={(value) => handleInputChange("applicant_pob_country", value)}
        />
      </motion.div>
    </div>
  </div>
);

export const SpouseSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <div className="px-4 py-6 md:p-10">
    <div className="border-b border-border/50 pb-6 pt-6">
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Spouse Information
      </h2>
      <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
        Partner Details
      </h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("spouse_first_name")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Spouse first name</Label>
        <FormInput
          value={formData?.spouse_first_name || ""}
          onChange={(e) => handleInputChange("spouse_first_name", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("spouse_last_name")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Spouse last name</Label>
        <FormInput
          value={formData?.spouse_last_name || ""}
          onChange={(e) => handleInputChange("spouse_last_name", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="form-field-container space-y-2">
        <DateField
          name="spouse_dob"
          label="Spouse date of birth"
          value={formData?.spouse_dob || ""}
          onChange={(value) => handleInputChange("spouse_dob", value)}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("spouse_pob_city")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Spouse city of birth</Label>
        <FormInput
          value={formData?.spouse_pob_city || ""}
          onChange={(e) => handleInputChange("spouse_pob_city", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("spouse_pob_country")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Spouse country of birth</Label>
        <CountrySelect
          value={formData?.spouse_pob_country || ""}
          onChange={(value) => handleInputChange("spouse_pob_country", value)}
        />
      </motion.div>
    </div>
  </div>
);

export const ChildrenSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => {
  const minorChildrenCount = parseInt(formData?.minor_children_count?.toString() || "0");
  
  return (
    <div className="px-4 py-6 md:p-10">
      <div className="border-b border-border/50 pb-6 pt-6">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Minor Children POA Information
        </h2>
        <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
          Power of Attorney details for minor children only
        </h3>
      </div>
      
      {minorChildrenCount === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No minor children selected. Please select the number of minor children in the "Select" section.
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from({ length: minorChildrenCount }, (_, index) => {
            const childNum = index + 1;
            return (
              <div key={childNum} className="border-t border-border/30 pt-6">
                <h4 className="text-lg font-semibold mb-4 text-primary">Minor Child {childNum} - POA</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }} 
                    className="form-field-container space-y-2" 
                    onDoubleClick={() => clearField(`child_${childNum}_first_name`)}
                  >
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Given names</Label>
                    <FormInput
                      value={formData?.[`child_${childNum}_first_name`] || ""}
                      onChange={(e) => handleInputChange(`child_${childNum}_first_name`, e.target.value)}
                      placeholder=""
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.15 }} 
                    className="form-field-container space-y-2" 
                    onDoubleClick={() => clearField(`child_${childNum}_last_name`)}
                  >
                    <Label className={isLargeFonts ? "text-2xl" : ""}>Full family name</Label>
                    <FormInput
                      value={formData?.[`child_${childNum}_last_name`] || ""}
                      onChange={(e) => handleInputChange(`child_${childNum}_last_name`, e.target.value)}
                      placeholder=""
                      className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }} 
                    className="form-field-container space-y-2"
                  >
                    <DateField
                      name={`child_${childNum}_dob`}
                      label="Date of birth"
                      value={formData?.[`child_${childNum}_dob`] || ""}
                      onChange={(value) => handleInputChange(`child_${childNum}_dob`, value)}
                    />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ContactSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <div className="px-4 py-6 md:p-10">
    <div className="border-b border-border/50 pb-6 pt-6">
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Contact Information
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_email")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Email</Label>
        <FormInput
          type="email"
          value={formData?.applicant_email || ""}
          onChange={(e) => handleInputChange("applicant_email", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_phone")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Phone</Label>
        <FormInput
          value={formData?.applicant_phone || ""}
          onChange={(e) => handleInputChange("applicant_phone", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>
    </div>
  </div>
);

export const AddressSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <div className="px-4 py-6 md:p-10">
    <div className="border-b border-border/50 pb-6 pt-6">
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Address
      </h2>
    </div>
    <div className="grid grid-cols-1 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_address_line1")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Address line 1</Label>
        <FormInput
          value={formData?.applicant_address_line1 || ""}
          onChange={(e) => handleInputChange("applicant_address_line1", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_address_line2")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Address line 2</Label>
        <FormInput
          value={formData?.applicant_address_line2 || ""}
          onChange={(e) => handleInputChange("applicant_address_line2", e.target.value)}
          placeholder=""
          className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_city")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>City</Label>
          <FormInput
            value={formData?.applicant_city || ""}
            onChange={(e) => handleInputChange("applicant_city", e.target.value)}
            placeholder=""
            className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_state")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>State/Province</Label>
          <FormInput
            value={formData?.applicant_state || ""}
            onChange={(e) => handleInputChange("applicant_state", e.target.value)}
            placeholder=""
            className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_postal_code")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Postal code</Label>
          <FormInput
            value={formData?.applicant_postal_code || ""}
            onChange={(e) => handleInputChange("applicant_postal_code", e.target.value)}
            placeholder=""
            className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
          />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("applicant_country")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Country</Label>
        <CountrySelect
          value={formData?.applicant_country || ""}
          onChange={(value) => handleInputChange("applicant_country", value)}
        />
      </motion.div>
    </div>
  </div>
);

export const PassportSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <div className="px-4 py-6 md:p-10">
    <div className="border-b border-border/50 pb-6 pt-6">
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Passport
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("passport_number")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Passport number</Label>
        <MaskedPassportInput
          value={formData?.passport_number || ""}
          onChange={(value) => handleInputChange("passport_number", value)}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="form-field-container space-y-2">
        <DateField
          name="passport_expiry"
          label="Passport expiry date"
          value={formData?.passport_expiry || ""}
          onChange={(value) => handleInputChange("passport_expiry", value)}
        />
      </motion.div>
    </div>
  </div>
);

export const NotesSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <div className="px-4 py-6 md:p-10">
    <div className="border-b border-border/50 pb-6 pt-6">
      <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Notes
      </h2>
    </div>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="form-field-container space-y-2" onDoubleClick={() => clearField("notes")}>
        <Label className={isLargeFonts ? "text-2xl" : ""}>Additional information</Label>
        <Textarea
          value={formData?.notes || ""}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Add any additional notes or information..."
          className="min-h-[200px] border-2 hover-glow focus:shadow-lg transition-all bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur text-xs"
        />
      </motion.div>
    </div>
  </div>
);
