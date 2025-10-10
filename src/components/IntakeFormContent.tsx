import { motion } from "framer-motion";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateField } from "@/components/DateField";
import { CountrySelect } from "@/components/CountrySelect";
import { cn } from "@/lib/utils";

interface IntakeFormContentProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  clearField: (field: string) => void;
  isLargeFonts: boolean;
}

export const SelectSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Select Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2" onDoubleClick={() => clearField("applicant_sex")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Gender</Label>
          <Select value={formData?.applicant_sex || ""} onValueChange={(value) => handleInputChange("applicant_sex", value)}>
            <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-background border-2 z-50">
              <SelectItem value="Male" className="text-base cursor-pointer">Male</SelectItem>
              <SelectItem value="Female" className="text-base cursor-pointer">Female</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-2" onDoubleClick={() => clearField("applicant_is_married")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Civil status</Label>
          <Select value={formData?.applicant_is_married === true ? "Married" : "Single"} onValueChange={(value) => handleInputChange("applicant_is_married", value === "Married")}>
            <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
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
            <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur z-50">
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
              <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
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
    </CardContent>
  </>
);

export const ApplicantSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Applicant Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-2" onDoubleClick={() => clearField("applicant_first_name")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Given names</Label>
          <Input value={formData?.applicant_first_name || ""} onChange={(e) => handleInputChange("applicant_first_name", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2" onDoubleClick={() => clearField("applicant_last_name")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Full last name</Label>
          <Input value={formData?.applicant_last_name || ""} onChange={(e) => handleInputChange("applicant_last_name", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2" onDoubleClick={() => clearField("applicant_maiden_name")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Maiden name</Label>
          <Input value={formData?.applicant_maiden_name || ""} onChange={(e) => handleInputChange("applicant_maiden_name", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-2" onDoubleClick={() => clearField("applicant_pob")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Place of birth</Label>
          <Input value={formData?.applicant_pob || ""} onChange={(e) => handleInputChange("applicant_pob", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" />
        </motion.div>
        <DateField name="applicant_dob" label="Date of birth" value={formData?.applicant_dob} onChange={(value) => handleInputChange("applicant_dob", value)} />
      </div>

      {formData?.applicant_is_married && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("place_of_marriage")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>Place of marriage</Label>
            <Input value={formData?.place_of_marriage || ""} onChange={(e) => handleInputChange("place_of_marriage", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
          </motion.div>
          <DateField name="date_of_marriage" label="Date of marriage" value={formData?.date_of_marriage} onChange={(value) => handleInputChange("date_of_marriage", value)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DateField name="applicant_date_of_emigration" label="Date of emigration" value={formData?.applicant_date_of_emigration} onChange={(value) => handleInputChange("applicant_date_of_emigration", value)} />
        <DateField name="applicant_date_of_naturalization" label="Date of naturalization" value={formData?.applicant_date_of_naturalization} onChange={(value) => handleInputChange("applicant_date_of_naturalization", value)} />
      </div>
    </CardContent>
  </>
);

export const ContactSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Contact Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_email")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Email</Label>
          <Input value={formData?.applicant_email || ""} onChange={(e) => handleInputChange("applicant_email", e.target.value)} type="email" className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_phone")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Phone</Label>
          <Input value={formData?.applicant_phone || ""} onChange={(e) => handleInputChange("applicant_phone", e.target.value)} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
        </motion.div>
      </div>
    </CardContent>
  </>
);

export const AddressSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Address Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <div className="grid grid-cols-1 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_street")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Street address</Label>
          <Input value={formData?.applicant_street || ""} onChange={(e) => handleInputChange("applicant_street", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_city")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>City</Label>
            <Input value={formData?.applicant_city || ""} onChange={(e) => handleInputChange("applicant_city", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_state")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>State / Province</Label>
            <Input value={formData?.applicant_state || ""} onChange={(e) => handleInputChange("applicant_state", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_postal_code")}>
            <Label className={isLargeFonts ? "text-2xl" : ""}>Postal / ZIP code</Label>
            <Input value={formData?.applicant_postal_code || ""} onChange={(e) => handleInputChange("applicant_postal_code", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
          </motion.div>
          <CountrySelect value={formData?.applicant_country || ""} onChange={(value) => handleInputChange("applicant_country", value)} label="Country" isLargeFonts={isLargeFonts} delay={0} />
        </div>
      </div>
    </CardContent>
  </>
);

export const PassportSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Passport Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2" onDoubleClick={() => clearField("applicant_passport_number")}>
          <Label className={isLargeFonts ? "text-2xl" : ""}>Passport number</Label>
          <Input value={formData?.applicant_passport_number || ""} onChange={(e) => handleInputChange("applicant_passport_number", e.target.value.toUpperCase())} className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
        </motion.div>
        <DateField name="applicant_passport_expiry_date" label="Passport expiry date" value={formData?.applicant_passport_expiry_date} onChange={(value) => handleInputChange("applicant_passport_expiry_date", value)} />
      </div>
    </CardContent>
  </>
);

export const ImmigrationSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Emigration Information
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateField name="applicant_date_of_naturalization" label="Date of naturalization" value={formData?.applicant_date_of_naturalization} onChange={(value) => handleInputChange("applicant_date_of_naturalization", value)} />
        <DateField name="applicant_date_of_emigration" label="Date of emigration" value={formData?.applicant_date_of_emigration} onChange={(value) => handleInputChange("applicant_date_of_emigration", value)} />
      </div>
    </CardContent>
  </>
);

export const DocumentsSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Documents Required
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox id="applicant_has_polish_documents" checked={formData?.applicant_has_polish_documents || false} onCheckedChange={(checked) => handleInputChange("applicant_has_polish_documents", checked)} className="h-6 w-6" />
          <Label htmlFor="applicant_has_polish_documents" className="cursor-pointer text-sm font-normal">Polish documents</Label>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox id="applicant_has_passport" checked={formData?.applicant_has_passport || false} onCheckedChange={(checked) => handleInputChange("applicant_has_passport", checked)} className="h-6 w-6" />
          <Label htmlFor="applicant_has_passport" className="cursor-pointer text-sm font-normal">Passport copy</Label>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox id="applicant_has_birth_cert" checked={formData?.applicant_has_birth_cert || false} onCheckedChange={(checked) => handleInputChange("applicant_has_birth_cert", checked)} className="h-6 w-6" />
          <Label htmlFor="applicant_has_birth_cert" className="cursor-pointer text-sm font-normal">Birth certificate</Label>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox id="applicant_has_marriage_cert" checked={formData?.applicant_has_marriage_cert || false} onCheckedChange={(checked) => handleInputChange("applicant_has_marriage_cert", checked)} className="h-6 w-6" />
          <Label htmlFor="applicant_has_marriage_cert" className="cursor-pointer text-sm font-normal">Marriage certificate</Label>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox id="applicant_has_naturalization" checked={formData?.applicant_has_naturalization || false} onCheckedChange={(checked) => handleInputChange("applicant_has_naturalization", checked)} className="h-6 w-6" />
          <Label htmlFor="applicant_has_naturalization" className="cursor-pointer text-sm font-normal">Naturalization certificate</Label>
        </div>
        {(formData?.applicant_sex?.includes('Male') || formData?.applicant_sex?.includes('Mężczyzna')) && (
          <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
            <Checkbox id="applicant_has_military_record" checked={formData?.applicant_has_military_record || false} onCheckedChange={(checked) => handleInputChange("applicant_has_military_record", checked)} className="h-6 w-6" />
            <Label htmlFor="applicant_has_military_record" className="cursor-pointer text-sm font-normal">Military service record</Label>
          </div>
        )}
        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox id="applicant_has_foreign_documents" checked={formData?.applicant_has_foreign_documents || false} onCheckedChange={(checked) => handleInputChange("applicant_has_foreign_documents", checked)} className="h-6 w-6" />
          <Label htmlFor="applicant_has_foreign_documents" className="cursor-pointer text-sm font-normal">Foreign documents</Label>
        </div>
        <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox id="applicant_has_additional_documents" checked={formData?.applicant_has_additional_documents || false} onCheckedChange={(checked) => handleInputChange("applicant_has_additional_documents", checked)} className="h-6 w-6" />
          <Label htmlFor="applicant_has_additional_documents" className="cursor-pointer text-sm font-normal">Additional documents</Label>
        </div>
      </div>
    </CardContent>
  </>
);

export const NotesSection = ({ formData, handleInputChange, clearField, isLargeFonts }: IntakeFormContentProps) => (
  <>
    <CardHeader className="border-b border-border/50 pb-6">
      <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Additional Notes
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6 md:p-10">
      <Label className={isLargeFonts ? "text-2xl" : ""}>
        Additional notes
      </Label>
      <Textarea value={formData?.applicant_notes || ""} onChange={(e) => handleInputChange("applicant_notes", e.target.value.toUpperCase())} className="mt-2 min-h-[150px] border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase" style={{ fontSize: '1.125rem', fontWeight: '400' }} />
    </CardContent>
  </>
);
