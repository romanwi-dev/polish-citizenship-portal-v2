import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, FileText, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MultiStepDemo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // Step 2 - Ancestry
    ancestorType: "",
    ancestorName: "",
    ancestorBirthYear: "",
    // Step 3 - Documents
    hasDocuments: "",
    documentNotes: "",
    // Step 4 - Contact Preferences
    preferredContact: "",
    timeZone: "",
    additionalInfo: ""
  });

  const totalSteps = 4;

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Ancestry", icon: FileText },
    { number: 3, title: "Documents", icon: MapPin },
    { number: 4, title: "Preferences", icon: Mail }
  ];

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Form Submitted!",
      description: "Your information has been received. We'll contact you soon.",
    });
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      ancestorType: "",
      ancestorName: "",
      ancestorBirthYear: "",
      hasDocuments: "",
      documentNotes: "",
      preferredContact: "",
      timeZone: "",
      additionalInfo: ""
    });
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Button variant="ghost" onClick={() => navigate('/demos')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Demos
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Multi-Step Form Wizard
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : isActive ? 'bg-primary' : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-6 w-6 text-white" />
                      ) : (
                        <StepIcon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 rounded-lg">
            {/* Step 1 - Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            )}

            {/* Step 2 - Ancestry */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Ancestry Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="ancestorType">Which ancestor was Polish? *</Label>
                  <Select value={formData.ancestorType} onValueChange={(value) => updateField('ancestorType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ancestor type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="great-grandparent">Great Grandparent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ancestorName">Ancestor's Full Name</Label>
                  <Input
                    id="ancestorName"
                    value={formData.ancestorName}
                    onChange={(e) => updateField('ancestorName', e.target.value)}
                    placeholder="Jan Kowalski"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ancestorBirthYear">Ancestor's Birth Year</Label>
                  <Input
                    id="ancestorBirthYear"
                    type="number"
                    value={formData.ancestorBirthYear}
                    onChange={(e) => updateField('ancestorBirthYear', e.target.value)}
                    placeholder="1920"
                  />
                </div>
              </div>
            )}

            {/* Step 3 - Documents */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Document Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="hasDocuments">Do you have Polish documents? *</Label>
                  <Select value={formData.hasDocuments} onValueChange={(value) => updateField('hasDocuments', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I have documents</SelectItem>
                      <SelectItem value="some">I have some documents</SelectItem>
                      <SelectItem value="no">No, I don't have any</SelectItem>
                      <SelectItem value="unknown">I'm not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNotes">Tell us about your documents</Label>
                  <Textarea
                    id="documentNotes"
                    value={formData.documentNotes}
                    onChange={(e) => updateField('documentNotes', e.target.value)}
                    placeholder="Describe what documents you have (birth certificates, marriage records, etc.)"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            )}

            {/* Step 4 - Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Contact Preferences</h2>
                <div className="space-y-2">
                  <Label htmlFor="preferredContact">Preferred Contact Method *</Label>
                  <Select value={formData.preferredContact} onValueChange={(value) => updateField('preferredContact', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How should we contact you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="video">Video Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Your Time Zone</Label>
                  <Select value={formData.timeZone} onValueChange={(value) => updateField('timeZone', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">EST (New York)</SelectItem>
                      <SelectItem value="cst">CST (Chicago)</SelectItem>
                      <SelectItem value="mst">MST (Denver)</SelectItem>
                      <SelectItem value="pst">PST (Los Angeles)</SelectItem>
                      <SelectItem value="cet">CET (Warsaw)</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => updateField('additionalInfo', e.target.value)}
                    placeholder="Any other details you'd like to share?"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-2 bg-green-500 hover:bg-green-600">
                  <Check className="h-4 w-4" />
                  Submit
                </Button>
              )}
            </div>
          </div>

          {/* Step indicator text */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepDemo;
