import { useParams } from "react-router-dom";
import { useIntakeData, useUpdateIntakeData } from "@/hooks/useIntakeData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Loader2, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { POAFormField } from "@/components/POAFormField";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function IntakeForm() {
  const { id: caseId } = useParams();
  const { data: intakeData, isLoading } = useIntakeData(caseId);
  const updateMutation = useUpdateIntakeData();
  
  const [formData, setFormData] = useState<any>({
    given_names: "",
    last_name: "",
    passport_number: "",
    phone: "",
    email: "",
    confirm_email: "",
    phone_verified: false,
    email_verified: false,
    civil_status: "",
    has_children: false,
    has_minor_children: false,
    children_count: 0,
    minor_children_count: 0,
  });

  useEffect(() => {
    if (intakeData) {
      setFormData(intakeData);
    }
  }, [intakeData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validatePassportNumber = (passport: string): boolean => {
    // Basic validation: alphanumeric, 6-9 characters
    const passportRegex = /^[A-Z0-9]{6,9}$/;
    return passportRegex.test(passport.toUpperCase());
  };

  const handleSave = () => {
    if (!caseId) return;

    // Validate passport
    if (formData.passport_number && !validatePassportNumber(formData.passport_number)) {
      toast.error("Invalid passport number format");
      return;
    }

    updateMutation.mutate({
      caseId,
      updates: formData,
    });
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
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
                    Client Intake Form
                  </CardTitle>
                </motion.div>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  size="default"
                  className="text-base md:text-xl font-bold px-6 md:px-8 h-12 md:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 md:h-5 w-4 md:w-5 animate-spin mr-2 opacity-50" />
                      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Saving...
                      </span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
                      <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Save data
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card border-primary/20">
            <CardContent className="p-6 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <POAFormField
                  name="given_names"
                  label="Given names (exactly like in your valid ID/ passport)"
                  value={formData.given_names}
                  onChange={(value) => handleInputChange("given_names", value)}
                  delay={0}
                />
                
                <POAFormField
                  name="last_name"
                  label="Full last name (exactly like in your valid ID/ passport)"
                  value={formData.last_name}
                  onChange={(value) => handleInputChange("last_name", value)}
                  delay={0.05}
                />

                {/* Passport */}
                <POAFormField
                  name="passport_number"
                  label="Passport number"
                  value={formData.passport_number}
                  onChange={(value) => handleInputChange("passport_number", value)}
                  delay={0.1}
                />

                {/* Mobile */}
                <POAFormField
                  name="phone"
                  label="Mobile number"
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  delay={0.15}
                />

                {/* Email */}
                <POAFormField
                  name="email"
                  label="Email address"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange("email", value.toLowerCase())}
                  delay={0.2}
                />

                {/* Confirm Email */}
                <POAFormField
                  name="confirm_email"
                  label="Confirm your email address"
                  type="email"
                  value={formData.confirm_email}
                  onChange={(value) => handleInputChange("confirm_email", value.toLowerCase())}
                  delay={0.25}
                />

                {/* Civil Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="space-y-4"
                >
                  <Label className="text-sm font-normal text-foreground/90">Civil status</Label>
                  <Select
                    value={formData.civil_status}
                    onValueChange={(value) => handleInputChange("civil_status", value)}
                  >
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="not_married">Not Married</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Children Count */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="space-y-4"
                >
                  <Label className="text-sm font-normal text-foreground/90">Number of children (including minors)</Label>
                  <Select
                    value={formData.children_count?.toString() || "0"}
                    onValueChange={(value) => {
                      const count = parseInt(value);
                      handleInputChange("children_count", count);
                      handleInputChange("has_children", count > 0);
                    }}
                  >
                    <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                {/* Minor Children if applicable */}
                {formData.children_count > 0 && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="space-y-4"
                    >
                      <Label className="text-sm font-normal text-foreground/90">Do you have minor children (under 18)?</Label>
                      <Select
                        value={formData.has_minor_children ? "yes" : "no"}
                        onValueChange={(value) => handleInputChange("has_minor_children", value === "yes")}
                      >
                        <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {formData.has_minor_children && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                        className="space-y-4"
                      >
                        <Label className="text-sm font-normal text-foreground/90">How many minor kids?</Label>
                        <Select
                          value={formData.minor_children_count?.toString() || "0"}
                          onValueChange={(value) => handleInputChange("minor_children_count", parseInt(value))}
                        >
                          <SelectTrigger className="h-16 border-2 hover-glow focus:shadow-lg transition-all bg-card/50 backdrop-blur">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: formData.children_count + 1 }, (_, i) => i).map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
