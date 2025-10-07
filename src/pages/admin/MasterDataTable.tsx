import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Loader2, Save, FileText, Users, Baby, Heart, Calendar as CalendarIcon, Sparkles, Download, GitBranch } from "lucide-react";
import { PDFGenerationButtons } from "@/components/PDFGenerationButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function MasterDataTable() {
  const { id: caseId } = useParams();
  
  // Debug logging
  console.log('MasterDataTable - caseId from URL:', caseId);
  
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("applicant");
  
  // Show error if no valid caseId
  if (!caseId || caseId === ':id') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Case ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please navigate to this page from a valid case detail page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (masterData) {
      const address = masterData.applicant_address as { street?: string; city?: string; state?: string; postal?: string; country?: string } || {};
      setFormData({
        ...masterData,
        applicant_address_street: address.street || '',
        applicant_address_city: address.city || '',
        applicant_address_state: address.state || '',
        applicant_address_postal: address.postal || '',
        applicant_address_country: address.country || '',
      });
    }
  }, [masterData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      // Handle address fields specially
      if (field.startsWith('applicant_address_')) {
        const addressField = field.replace('applicant_address_', '');
        return {
          ...prev,
          [field]: value,
          applicant_address: {
            ...(typeof prev.applicant_address === 'object' ? prev.applicant_address : {}),
            [addressField]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({ caseId, updates: formData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  const renderDateField = (name: string, label: string) => {
    const dateValue = formData[name] ? new Date(formData[name]) : undefined;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Label htmlFor={name} className="text-sm font-normal text-foreground/90">
          {label}
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-16 justify-start text-left border-2 hover-glow bg-card/50 backdrop-blur",
                !dateValue && "text-muted-foreground"
              )}
              style={{ fontSize: '1.125rem', fontWeight: '400' }}
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              {dateValue ? format(dateValue, "dd/MM/yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => handleInputChange(name, date ? format(date, "yyyy-MM-dd") : "")}
              disabled={(date) => date > new Date("2030-12-31") || date < new Date("1900-01-01")}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </motion.div>
    );
  };

  const renderFieldGroup = (fields: Array<{ name: string; label: string; type?: string; placeholder?: string }>) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field, idx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="space-y-4"
          >
            {field.type === "date" ? (
              renderDateField(field.name, field.label)
            ) : (
              <>
                <Label htmlFor={field.name} className="text-sm font-normal text-foreground/90">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, field.type === "email" || field.type === "text" && !field.name.includes("sex") ? e.target.value : e.target.value.toUpperCase())}
                  placeholder=""
                  className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur uppercase"
                  style={{ fontSize: '1.125rem', fontWeight: '400' }}
                />
              </>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderCheckboxGroup = (fields: Array<{ name: string; label: string }>) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field, idx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur"
          >
            <Checkbox
              id={field.name}
              checked={formData[field.name] || false}
              onCheckedChange={(checked) => handleInputChange(field.name, checked)}
              className="h-6 w-6"
            />
            <Label htmlFor={field.name} className="cursor-pointer text-sm font-normal">
              {field.label}
            </Label>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTextarea = (name: string, label: string, rows = 4) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <Label htmlFor={name} className="text-base font-medium text-foreground">
          {label}
        </Label>
        <Textarea
          id={name}
          value={formData[name] || ""}
          onChange={(e) => handleInputChange(name, e.target.value)}
          rows={rows}
          className="border-2 text-base hover-glow focus:shadow-lg transition-all resize-none bg-card/50 backdrop-blur"
        />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Footer-style Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Premium Header with 3D Effect */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Card className="glass-card border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-8 pt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
                    Master Data Center
                  </CardTitle>
                  <CardDescription className="text-xl md:text-2xl mt-4 text-muted-foreground leading-relaxed">
                    Comprehensive family information & documentation portal
                  </CardDescription>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 ml-auto"
                >
                  <Button 
                    onClick={handleSave} 
                    disabled={updateMutation.isPending}
                    size="lg" 
                    className="text-xl font-bold px-12 h-16 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          Saving...
                        </span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          Save
                        </span>
                      </>
                    )}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  <PDFGenerationButtons caseId={caseId || ''} />
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Premium Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-10 p-2 glass-card h-auto gap-2">
              {[
                { value: "applicant", label: "Applicant" },
                ...(formData.applicant_is_married ? [{ value: "spouse", label: "Spouse" }] : []),
                { value: "children", label: "Children" },
                { value: "parents", label: "Parents" },
                { value: "grandparents", label: "Grandparents" },
                { value: "great-grandparents", label: "Great-Grandparents" },
                { value: "additional-data", label: "Additional Data" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary transition-all duration-300 py-4 text-base font-heading font-bold"
                >
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent data-[state=active]:from-white data-[state=active]:to-white">
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {/* APPLICANT TAB */}
          <TabsContent value="applicant">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
               <Card className="glass-card border-primary/20">
                <CardHeader className="border-b border-border/50 pb-6">
                  <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  {/* Ancestry Line Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="ancestry_line" className="text-base font-medium text-foreground flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      Polish Ancestry Line
                    </Label>
                    <Select
                      value={formData.ancestry_line || ""}
                      onValueChange={(value) => handleInputChange("ancestry_line", value)}
                    >
                      <SelectTrigger className="h-14 border-2 text-base hover-glow bg-card/50 backdrop-blur">
                        <SelectValue placeholder="Select bloodline path" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father's Line (Paternal)</SelectItem>
                        <SelectItem value="mother">Mother's Line (Maternal)</SelectItem>
                        <SelectItem value="pgf">Paternal Grandfather's Line</SelectItem>
                        <SelectItem value="pgm">Paternal Grandmother's Line</SelectItem>
                        <SelectItem value="mgf">Maternal Grandfather's Line</SelectItem>
                        <SelectItem value="mgm">Maternal Grandmother's Line</SelectItem>
                        <SelectItem value="pggf">Paternal Great-Grandfather (Father's Side)</SelectItem>
                        <SelectItem value="pggm">Paternal Great-Grandmother (Father's Side)</SelectItem>
                        <SelectItem value="mggf">Maternal Great-Grandfather (Mother's Side)</SelectItem>
                        <SelectItem value="mggm">Maternal Great-Grandmother (Mother's Side)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the ancestral line through which Polish citizenship is claimed
                    </p>
                  </motion.div>

                  {/* Marital Status & Children - Side by side on desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border-2 border-primary/20 rounded-xl bg-primary/5"
                    >
                      {renderCheckboxGroup([
                        { name: "applicant_is_married", label: "Married?" },
                      ])}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border-2 border-primary/20 rounded-xl bg-primary/5"
                    >
                      <div className="whitespace-nowrap">
                        {renderCheckboxGroup([
                          { name: "applicant_has_minor_children", label: "Minor Children?" },
                        ])}
                      </div>
                    </motion.div>
                  </div>

                  {renderFieldGroup([
                    { name: "applicant_first_name", label: "Given Names" },
                    { name: "applicant_last_name", label: "Full Last Name" },
                    { name: "applicant_maiden_name", label: "Maiden Name" },
                    { name: "applicant_sex", label: "Sex" },
                    { name: "applicant_dob", label: "Date of Birth", type: "date" },
                    { name: "applicant_pob", label: "Place of Birth" },
                    { name: "applicant_email", label: "Email", type: "email" },
                    { name: "applicant_phone", label: "Phone" },
                    { name: "applicant_passport_number", label: "Passport Number" },
                  ])}

                  {/* Address Section */}
                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Address</h3>
                    {renderFieldGroup([
                      { name: "applicant_address_street", label: "Street Address" },
                      { name: "applicant_address_city", label: "City" },
                      { name: "applicant_address_state", label: "State/Province" },
                      { name: "applicant_address_postal", label: "Postal Code" },
                      { name: "applicant_address_country", label: "Country" },
                    ])}
                  </div>

                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Documents Required</h3>
                    {renderCheckboxGroup([
                      { name: "applicant_has_birth_cert", label: "Birth Certificate" },
                      { name: "applicant_has_marriage_cert", label: "Marriage Certificate" },
                      { name: "applicant_has_passport", label: "Passport" },
                      { name: "applicant_has_naturalization", label: "Naturalization Certificate" },
                    ])}
                  </div>

                  <div className="pt-8">
                    {renderTextarea("applicant_notes", "Additional Notes")}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* SPOUSE TAB - Only show if married */}
          {formData.applicant_is_married && (
          <TabsContent value="spouse">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader className="border-b border-border/50 pb-6">
                  <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Spouse Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  {renderFieldGroup([
                    { name: "spouse_first_name", label: "Given Names" },
                    { name: "spouse_last_name", label: "Full Last Name" },
                    { name: "spouse_maiden_name", label: "Maiden Name" },
                    { name: "spouse_sex", label: "Sex" },
                    { name: "spouse_dob", label: "Date of Birth", type: "date" },
                    { name: "spouse_pob", label: "Place of Birth" },
                    { name: "date_of_marriage", label: "Date of Marriage", type: "date" },
                    { name: "place_of_marriage", label: "Place of Marriage" },
                  ])}

                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Documents Required</h3>
                    {renderCheckboxGroup([
                      { name: "spouse_has_birth_cert", label: "Birth Certificate" },
                      { name: "spouse_has_marriage_cert", label: "Marriage Certificate" },
                      { name: "spouse_has_passport", label: "Passport" },
                    ])}
                  </div>

                  <div className="pt-8">
                    {renderTextarea("spouse_notes", "Additional Notes")}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          )}

          {/* CHILDREN TAB */}
          <TabsContent value="children">
            <ScrollArea className="h-[800px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Minor Children
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 max-w-xs"
                    >
                      <Label htmlFor="children_count" className="text-base font-medium">
                        Number of Children
                      </Label>
                      <Input
                        id="children_count"
                        type="number"
                        value={formData.children_count || 0}
                        onChange={(e) => handleInputChange("children_count", parseInt(e.target.value) || 0)}
                        min={0}
                        max={10}
                        className="h-14 border-2 text-base hover-glow bg-card/50 backdrop-blur"
                      />
                    </motion.div>
                  </CardContent>
                </Card>

                {Array.from({ length: formData.children_count || 0 }, (_, i) => i + 1).map((num) => (
                  <Card key={num} className="glass-card border-primary/20">
                    <CardHeader className="border-b border-border/50">
                      <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Child {num}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10 space-y-8">
                      {renderFieldGroup([
                        { name: `child_${num}_first_name`, label: "Given Names" },
                        { name: `child_${num}_last_name`, label: "Full Last Name" },
                        { name: `child_${num}_dob`, label: "Date of Birth", type: "date" },
                        { name: `child_${num}_pob`, label: "Place of Birth" },
                      ])}
                      <div className="pt-4">
                        {renderCheckboxGroup([
                          { name: `child_${num}_has_passport`, label: "Passport Copy" },
                          { name: `child_${num}_has_birth_cert`, label: "Birth Certificate" },
                          { name: `child_${num}_has_poa_minor`, label: "POA Minor" },
                        ])}
                      </div>
                      <div>
                        {renderTextarea(`child_${num}_notes`, "Notes", 2)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </ScrollArea>
          </TabsContent>

          {/* PARENTS TAB */}
          <TabsContent value="parents">
            <ScrollArea className="h-[800px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Father */}
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Father Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-10">
                    {renderFieldGroup([
                      { name: "father_first_name", label: "Given Names" },
                      { name: "father_last_name", label: "Full Last Name" },
                      { name: "father_pob", label: "Place of Birth" },
                      { name: "father_dob", label: "Date of Birth", type: "date" },
                      { name: "father_date_of_emigration", label: "Date of Emigration", type: "date" },
                      { name: "father_date_of_naturalization", label: "Date of Naturalization", type: "date" },
                    ])}
                    <div className="pt-4">
                      {renderCheckboxGroup([
                        { name: "father_has_polish_documents", label: "Polish Documents" },
                        { name: "father_has_birth_cert", label: "Birth Certificate" },
                        { name: "father_has_marriage_cert", label: "Marriage Certificate" },
                        { name: "father_has_naturalization_papers", label: "Naturalization Papers" },
                        { name: "father_has_foreign_documents", label: "Foreign Documents" },
                        { name: "father_has_military_records", label: "Military Records" },
                      ])}
                    </div>
                    <div>{renderTextarea("father_notes", "Notes")}</div>
                  </CardContent>
                </Card>

                {/* Mother */}
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      Mother Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-10">
                    {renderFieldGroup([
                      { name: "mother_first_name", label: "Given Names" },
                      { name: "mother_last_name", label: "Full Last Name" },
                      { name: "mother_maiden_name", label: "Maiden Name" },
                      { name: "mother_pob", label: "Place of Birth" },
                      { name: "mother_dob", label: "Date of Birth", type: "date" },
                      { name: "mother_date_of_emigration", label: "Date of Emigration", type: "date" },
                    ])}
                    <div className="pt-4">
                      {renderCheckboxGroup([
                        { name: "mother_has_polish_documents", label: "Polish Documents" },
                        { name: "mother_has_birth_cert", label: "Birth Certificate" },
                        { name: "mother_has_marriage_cert", label: "Marriage Certificate" },
                        { name: "mother_has_naturalization_papers", label: "Naturalization Papers" },
                        { name: "mother_has_foreign_documents", label: "Foreign Documents" },
                        { name: "mother_has_military_records", label: "Military Records" },
                      ])}
                    </div>
                    <div>{renderTextarea("mother_notes", "Notes")}</div>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollArea>
          </TabsContent>

          {/* GRANDPARENTS TAB */}
          <TabsContent value="grandparents">
            <ScrollArea className="h-[800px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {["pgf", "pgm", "mgf", "mgm"].map((prefix, idx) => {
                  const labels = {
                    pgf: "Paternal Grandfather",
                    pgm: "Paternal Grandmother",
                    mgf: "Maternal Grandfather",
                    mgm: "Maternal Grandmother",
                  };
                  return (
                    <Card key={prefix} className="glass-card border-primary/20">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-10 space-y-10">
                        <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                          {renderCheckboxGroup([
                            { name: `${prefix}_is_polish`, label: "Polish Ancestor" },
                          ])}
                        </div>
                        {renderFieldGroup([
                          { name: `${prefix}_first_name`, label: "Given Names" },
                          { name: `${prefix}_last_name`, label: "Full Last Name" },
                          ...(prefix.includes("gm") ? [{ name: `${prefix}_maiden_name`, label: "Maiden Name" }] : []),
                          { name: `${prefix}_pob`, label: "Place of Birth" },
                          { name: `${prefix}_dob`, label: "Date of Birth", type: "date" },
                        ])}
                        <div className="pt-4">
                          {renderCheckboxGroup([
                            { name: `${prefix}_has_polish_documents`, label: "Polish Documents" },
                            { name: `${prefix}_has_birth_cert`, label: "Birth Certificate" },
                            { name: `${prefix}_has_marriage_cert`, label: "Marriage Certificate" },
                            { name: `${prefix}_has_naturalization_papers`, label: "Naturalization Papers" },
                            { name: `${prefix}_has_foreign_documents`, label: "Foreign Documents" },
                            { name: `${prefix}_has_military_records`, label: "Military Records" },
                          ])}
                        </div>
                        <div>{renderTextarea(`${prefix}_notes`, "Notes")}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            </ScrollArea>
          </TabsContent>

          {/* GREAT-GRANDPARENTS TAB */}
          <TabsContent value="great-grandparents">
            <ScrollArea className="h-[800px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {["pggf", "pggm", "mggf", "mggm"].map((prefix) => {
                  const labels = {
                    pggf: "Pat. Great-Grandfather (Father's Side)",
                    pggm: "Pat. Great-Grandmother (Father's Side)",
                    mggf: "Mat. Great-Grandfather (Mother's Side)",
                    mggm: "Mat. Great-Grandmother (Mother's Side)",
                  };
                  return (
                    <Card key={prefix} className="glass-card border-primary/20">
                      <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-10 space-y-10">
                        {renderFieldGroup([
                          { name: `${prefix}_first_name`, label: "Given Names" },
                          { name: `${prefix}_last_name`, label: "Full Last Name" },
                          ...(prefix.includes("ggm") ? [{ name: `${prefix}_maiden_name`, label: "Maiden Name" }] : []),
                          { name: `${prefix}_pob`, label: "Place of Birth" },
                          { name: `${prefix}_dob`, label: "Date of Birth", type: "date" },
                        ])}
                        <div className="pt-4">
                          {renderCheckboxGroup([
                            ...(prefix === "pggf" || prefix === "mggf" ? [{ name: `${prefix}_has_polish_documents`, label: "Polish Documents" }] : []),
                            { name: `${prefix}_has_birth_cert`, label: "Birth Certificate" },
                            { name: `${prefix}_has_marriage_cert`, label: "Marriage Certificate" },
                            { name: `${prefix}_has_naturalization_papers`, label: "Naturalization Papers" },
                            { name: `${prefix}_has_foreign_documents`, label: "Foreign Documents" },
                            { name: `${prefix}_has_military_records`, label: "Military Records" },
                          ])}
                        </div>
                        <div>{renderTextarea(`${prefix}_notes`, "Notes")}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            </ScrollArea>
          </TabsContent>

          {/* ADDITIONAL DATA TAB */}
          <TabsContent value="additional-data">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader className="border-b border-border/50 pb-6">
                  <CardTitle className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Additional Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  <div className="text-center py-20">
                    <p className="text-xl text-muted-foreground">
                      Additional fields will be added here...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
