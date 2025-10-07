import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Loader2, Save, FileText, Users, Baby, Heart, Calendar, Sparkles, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

export default function MasterDataTable() {
  const { id: caseId } = useParams();
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("applicant");

  useEffect(() => {
    if (masterData) {
      setFormData(masterData);
    }
  }, [masterData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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

  const renderFieldGroup = (fields: Array<{ name: string; label: string; type?: string; placeholder?: string }>) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map((field, idx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="space-y-3"
          >
            <Label htmlFor={field.name} className="text-base font-medium text-foreground">
              {field.label}
            </Label>
            <Input
              id={field.name}
              type={field.type || "text"}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              className="h-14 border-2 text-base hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur"
            />
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
            <Label htmlFor={field.name} className="cursor-pointer text-base font-medium">
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
                  <CardTitle className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold flex items-center gap-4 glow-text">
                    <motion.div
                      animate={{
                        rotateY: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Users className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                    </motion.div>
                    Master Data Center
                  </CardTitle>
                  <CardDescription className="text-lg md:text-xl mt-4 text-muted-foreground">
                    Comprehensive family information & documentation portal
                  </CardDescription>
                </motion.div>
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 flex-wrap"
                >
                  <Button 
                    onClick={handleSave} 
                    disabled={updateMutation.isPending}
                    size="lg" 
                    className="gap-2 hover-glow min-w-[160px] h-14 text-base"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2 border-primary/30 min-w-[140px] h-14 text-base"
                  >
                    <Download className="h-5 w-5" />
                    Export
                  </Button>
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
                { value: "applicant", icon: FileText, label: "Applicant" },
                { value: "spouse", icon: Heart, label: "Spouse" },
                { value: "children", icon: Baby, label: "Children" },
                { value: "parents", icon: Users, label: "Parents" },
                { value: "grandparents", icon: Users, label: "Grandparents" },
                { value: "great-grandparents", icon: Calendar, label: "Great-GP" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground transition-all duration-300 py-4 text-base"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon className="h-5 w-5" />
                  </motion.div>
                  <span className="font-medium hidden sm:inline">{tab.label}</span>
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
                  <CardTitle className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-3">
                    <FileText className="h-8 w-8 md:h-10 md:w-10" />
                    Applicant Information
                  </CardTitle>
                  <CardDescription className="text-base md:text-lg">
                    Main applicant personal data - maps to OBY-A-* fields
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  {renderFieldGroup([
                    { name: "applicant_first_name", label: "First Name(s)", placeholder: "OBY-A-GN" },
                    { name: "applicant_last_name", label: "Last Name", placeholder: "OBY-A-SN" },
                    { name: "applicant_maiden_name", label: "Maiden Name", placeholder: "OBY-A-MAIDEN-NAME" },
                    { name: "applicant_sex", label: "Sex", placeholder: "OBY-A-GENDER" },
                    { name: "applicant_dob", label: "Date of Birth", type: "date" },
                    { name: "applicant_pob", label: "Place of Birth", placeholder: "OBY-A-BP" },
                    { name: "applicant_email", label: "Email", type: "email", placeholder: "OBY-A-EMAIL" },
                    { name: "applicant_phone", label: "Phone", placeholder: "OBY-A-PHONE" },
                    { name: "applicant_passport_number", label: "Passport Number", placeholder: "OBY-A-PASSPORT" },
                  ])}

                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Document Availability</h3>
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

          {/* SPOUSE TAB */}
          <TabsContent value="spouse">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader className="border-b border-border/50 pb-6">
                  <CardTitle className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-3">
                    <Heart className="h-8 w-8 md:h-10 md:w-10" />
                    Spouse Information
                  </CardTitle>
                  <CardDescription className="text-base md:text-lg">
                    Spouse data - maps to OBY-SPOUSE-* fields
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-10">
                  {renderFieldGroup([
                    { name: "spouse_first_name", label: "First Name(s)", placeholder: "OBY-SPOUSE-GN" },
                    { name: "spouse_last_name", label: "Last Name", placeholder: "OBY-SPOUSE-SN" },
                    { name: "spouse_maiden_name", label: "Maiden Name" },
                    { name: "spouse_sex", label: "Sex" },
                    { name: "spouse_dob", label: "Date of Birth", type: "date" },
                    { name: "spouse_pob", label: "Place of Birth" },
                    { name: "date_of_marriage", label: "Date of Marriage", type: "date", placeholder: "OBY-MARRIAGE-DATE" },
                    { name: "place_of_marriage", label: "Place of Marriage", placeholder: "OBY-MARRIAGE-PLACE" },
                  ])}

                  <div className="pt-8">
                    <h3 className="text-xl font-semibold mb-6 text-foreground">Document Availability</h3>
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
                    <CardTitle className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-3">
                      <Baby className="h-8 w-8 md:h-10 md:w-10" />
                      Children Information
                    </CardTitle>
                    <CardDescription className="text-base md:text-lg">
                      Up to 10 children - maps to OBY-CHILD* fields
                    </CardDescription>
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

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Card key={num} className="glass-card border-primary/20">
                    <CardHeader className="border-b border-border/50">
                      <CardTitle className="text-2xl font-heading text-primary">Child {num}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-10 space-y-8">
                      {renderFieldGroup([
                        { name: `child_${num}_first_name`, label: "First Name" },
                        { name: `child_${num}_last_name`, label: "Last Name" },
                        { name: `child_${num}_sex`, label: "Sex" },
                        { name: `child_${num}_dob`, label: "Date of Birth", type: "date" },
                        { name: `child_${num}_pob`, label: "Place of Birth" },
                      ])}
                      <div>
                        {renderCheckboxGroup([
                          { name: `child_${num}_is_alive`, label: "Is Alive" },
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
                    <CardTitle className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-3">
                      <Users className="h-8 w-8 md:h-10 md:w-10" />
                      Father Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-10">
                    {renderFieldGroup([
                      { name: "father_first_name", label: "First Name(s)" },
                      { name: "father_last_name", label: "Last Name" },
                      { name: "father_pob", label: "Place of Birth" },
                      { name: "father_dob", label: "Date of Birth", type: "date" },
                      { name: "father_date_of_emigration", label: "Date of Emigration", type: "date" },
                      { name: "father_date_of_naturalization", label: "Date of Naturalization", type: "date" },
                    ])}
                    <div className="pt-4">
                      {renderCheckboxGroup([
                        { name: "father_is_alive", label: "Is Alive" },
                        { name: "father_has_birth_cert", label: "Birth Certificate" },
                        { name: "father_has_marriage_cert", label: "Marriage Certificate" },
                      ])}
                    </div>
                    <div>{renderTextarea("father_notes", "Notes")}</div>
                  </CardContent>
                </Card>

                {/* Mother */}
                <Card className="glass-card border-primary/20">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-3xl md:text-4xl font-heading text-primary flex items-center gap-3">
                      <Users className="h-8 w-8 md:h-10 md:w-10" />
                      Mother Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-10">
                    {renderFieldGroup([
                      { name: "mother_first_name", label: "First Name(s)" },
                      { name: "mother_last_name", label: "Last Name" },
                      { name: "mother_maiden_name", label: "Maiden Name" },
                      { name: "mother_pob", label: "Place of Birth" },
                      { name: "mother_dob", label: "Date of Birth", type: "date" },
                      { name: "mother_date_of_emigration", label: "Date of Emigration", type: "date" },
                    ])}
                    <div className="pt-4">
                      {renderCheckboxGroup([
                        { name: "mother_is_alive", label: "Is Alive" },
                        { name: "mother_has_birth_cert", label: "Birth Certificate" },
                        { name: "mother_has_marriage_cert", label: "Marriage Certificate" },
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
                        <CardTitle className="text-2xl md:text-3xl font-heading text-primary">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-10 space-y-10">
                        {renderFieldGroup([
                          { name: `${prefix}_first_name`, label: "First Name" },
                          { name: `${prefix}_last_name`, label: "Last Name" },
                          ...(prefix.includes("gm") ? [{ name: `${prefix}_maiden_name`, label: "Maiden Name" }] : []),
                          { name: `${prefix}_pob`, label: "Place of Birth" },
                          { name: `${prefix}_dob`, label: "Date of Birth", type: "date" },
                        ])}
                        <div className="pt-4">
                          {renderCheckboxGroup([
                            { name: `${prefix}_is_alive`, label: "Is Alive" },
                            { name: `${prefix}_has_birth_cert`, label: "Birth Certificate" },
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
                        <CardTitle className="text-2xl md:text-3xl font-heading text-primary">
                          {labels[prefix as keyof typeof labels]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-10 space-y-10">
                        {renderFieldGroup([
                          { name: `${prefix}_first_name`, label: "First Name" },
                          { name: `${prefix}_last_name`, label: "Last Name" },
                          ...(prefix.includes("ggm") ? [{ name: `${prefix}_maiden_name`, label: "Maiden Name" }] : []),
                          { name: `${prefix}_pob`, label: "Place of Birth" },
                          { name: `${prefix}_dob`, label: "Date of Birth", type: "date" },
                        ])}
                        <div className="pt-4">
                          {renderCheckboxGroup([
                            { name: `${prefix}_is_alive`, label: "Is Alive" },
                            { name: `${prefix}_has_birth_cert`, label: "Birth Certificate" },
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
        </Tabs>
      </div>
    </div>
  );
}
