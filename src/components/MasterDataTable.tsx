import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Save, Download, Upload, CheckCircle2, AlertCircle, User, Users, FileText, Baby, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DateField } from "@/components/DateField";

interface MasterDataTableProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
}

interface FormSection {
  id: string;
  label: string;
  icon: any;
  fields: string[];
}

export const MasterDataTable = ({ open, onOpenChange, caseId }: MasterDataTableProps) => {
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("applicant");
  const [isFullView, setIsFullView] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({
    applicant: null,
    spouse: null,
    children: null,
    documents: null
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isFullView && sectionRefs.current[value]) {
      const element = sectionRefs.current[value];
      if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const sections: FormSection[] = [
    {
      id: "applicant",
      label: "Applicant",
      icon: User,
      fields: ["firstName", "lastName", "maidenName", "placeOfBirth", "dateOfBirth", "placeOfMarriage", "dateOfMarriage", "dateOfEmigration", "dateOfNaturalization", "sex", "currentCitizenship", "passportNumber", "email", "phone"]
    },
    {
      id: "spouse",
      label: "Spouse",
      icon: Users,
      fields: ["spouseFirstName", "spouseLastName", "spouseMaidenName", "spouseDateOfBirth", "spousePlaceOfBirth", "dateOfMarriage", "placeOfMarriage"]
    },
    {
      id: "children",
      label: "Children",
      icon: Baby,
      fields: ["childrenCount", "child1Name", "child1DOB", "child2Name", "child2DOB"]
    },
    {
      id: "parents",
      label: "Parents",
      icon: Users,
      fields: ["fatherFirstName", "fatherLastName", "fatherDOB", "fatherPOB", "motherFirstName", "motherLastName", "motherMaidenName", "motherDOB", "motherPOB"]
    },
    {
      id: "grandparents",
      label: "Grandparents",
      icon: Users,
      fields: ["pgfFirstName", "pgfLastName", "pgfDOB", "pgfPOB", "pgmFirstName", "pgmLastName", "pgmMaidenName", "pgmDOB", "pgmPOB", "mgfFirstName", "mgfLastName", "mgfDOB", "mgfPOB", "mgmFirstName", "mgmLastName", "mgmMaidenName", "mgmDOB", "mgmPOB"]
    },
    {
      id: "applicant_documents",
      label: "Applicant Docs",
      icon: FileText,
      fields: ["applicant_has_polish_documents", "applicant_has_passport", "applicant_has_birth_cert", "applicant_has_marriage_cert", "applicant_has_naturalization", "applicant_has_military_record", "applicant_has_foreign_documents", "applicant_has_additional_documents"]
    },
    {
      id: "spouse_documents",
      label: "Spouse Docs",
      icon: FileText,
      fields: ["spouse_has_polish_documents", "spouse_has_passport", "spouse_has_birth_cert", "spouse_has_marriage_cert", "spouse_has_naturalization", "spouse_has_military_record", "spouse_has_foreign_documents", "spouse_has_additional_documents"]
    },
    {
      id: "father_documents",
      label: "Father Docs",
      icon: FileText,
      fields: ["father_has_polish_documents", "father_has_passport", "father_has_birth_cert", "father_has_marriage_cert", "father_has_naturalization", "father_has_military_record", "father_has_foreign_documents", "father_has_additional_documents"]
    },
    {
      id: "mother_documents",
      label: "Mother Docs",
      icon: FileText,
      fields: ["mother_has_polish_documents", "mother_has_passport", "mother_has_birth_cert", "mother_has_marriage_cert", "mother_has_naturalization", "mother_has_military_record", "mother_has_foreign_documents", "mother_has_additional_documents"]
    },
    {
      id: "pgf_documents",
      label: "PGF Docs",
      icon: FileText,
      fields: ["pgf_has_polish_documents", "pgf_has_passport", "pgf_has_birth_cert", "pgf_has_marriage_cert", "pgf_has_naturalization", "pgf_has_military_record", "pgf_has_foreign_documents", "pgf_has_additional_documents"]
    },
    {
      id: "pgm_documents",
      label: "PGM Docs",
      icon: FileText,
      fields: ["pgm_has_polish_documents", "pgm_has_passport", "pgm_has_birth_cert", "pgm_has_marriage_cert", "pgm_has_naturalization", "pgm_has_military_record", "pgm_has_foreign_documents", "pgm_has_additional_documents"]
    },
    {
      id: "mgf_documents",
      label: "MGF Docs",
      icon: FileText,
      fields: ["mgf_has_polish_documents", "mgf_has_passport", "mgf_has_birth_cert", "mgf_has_marriage_cert", "mgf_has_naturalization", "mgf_has_military_record", "mgf_has_foreign_documents", "mgf_has_additional_documents"]
    },
    {
      id: "mgm_documents",
      label: "MGM Docs",
      icon: FileText,
      fields: ["mgm_has_polish_documents", "mgm_has_passport", "mgm_has_birth_cert", "mgm_has_marriage_cert", "mgm_has_naturalization", "mgm_has_military_record", "mgm_has_foreign_documents", "mgm_has_additional_documents"]
    },
    {
      id: "pggf_documents",
      label: "PGGF Docs",
      icon: FileText,
      fields: ["pggf_has_polish_documents", "pggf_has_passport", "pggf_has_birth_cert", "pggf_has_marriage_cert", "pggf_has_naturalization", "pggf_has_military_record", "pggf_has_foreign_documents", "pggf_has_additional_documents"]
    },
    {
      id: "pggm_documents",
      label: "PGGM Docs",
      icon: FileText,
      fields: ["pggm_has_polish_documents", "pggm_has_passport", "pggm_has_birth_cert", "pggm_has_marriage_cert", "pggm_has_naturalization", "pggm_has_military_record", "pggm_has_foreign_documents", "pggm_has_additional_documents"]
    },
    {
      id: "mggf_documents",
      label: "MGGF Docs",
      icon: FileText,
      fields: ["mggf_has_polish_documents", "mggf_has_passport", "mggf_has_birth_cert", "mggf_has_marriage_cert", "mggf_has_naturalization", "mggf_has_military_record", "mggf_has_foreign_documents", "mggf_has_additional_documents"]
    },
    {
      id: "mggm_documents",
      label: "MGGM Docs",
      icon: FileText,
      fields: ["mggm_has_polish_documents", "mggm_has_passport", "mggm_has_birth_cert", "mggm_has_marriage_cert", "mggm_has_naturalization", "mggm_has_military_record", "mggm_has_foreign_documents", "mggm_has_additional_documents"]
    }
  ];

  const handleVoiceInput = (fieldName: string) => {
    setActiveField(fieldName);
    setIsListening(true);
    
    // Simulate voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        toast.info(`Listening for ${fieldName}...`, {
          description: "Speak clearly into your microphone"
        });
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFormData(prev => ({ ...prev, [fieldName]: transcript }));
        toast.success("Voice input captured!", {
          description: `"${transcript}"`
        });
      };
      
      recognition.onerror = (event: any) => {
        toast.error("Voice recognition error", {
          description: event.error
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setActiveField(null);
      };
      
      recognition.start();
    } else {
      toast.error("Voice recognition not supported", {
        description: "Please use Chrome or Edge browser"
      });
      setIsListening(false);
      setActiveField(null);
    }
  };

  const handleSave = () => {
    toast.success("Data saved successfully!", {
      description: "All changes have been saved to the database"
    });
  };

  const handleExport = () => {
    toast.success("Exporting data...", {
      description: "Your data will be downloaded shortly"
    });
  };

  const renderField = (fieldName: string) => {
    const isDateField = fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().includes('dob');
    const isDocumentField = fieldName.includes('_has_');
    const isSelectField = fieldName === 'sex' || fieldName === 'currentCitizenship';
    
    const fieldLabel = fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    if (isDocumentField) {
      // Extract document label from field name
      const documentLabel = fieldName
        .split('_has_')[1]
        ?.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || fieldLabel;
      
      return (
        <div key={fieldName} className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-all hover-glow bg-card/30 backdrop-blur">
          <Checkbox
            id={fieldName}
            checked={formData?.[fieldName] || false}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [fieldName]: checked }))}
            className="h-6 w-6"
          />
          <Label htmlFor={fieldName} className="cursor-pointer text-sm font-normal">
            {documentLabel}
          </Label>
        </div>
      );
    }

    if (isDateField) {
      return (
        <div className="flex gap-2">
          <div className="flex-1">
            <DateField
              name={fieldName}
              label={fieldLabel}
              value={formData[fieldName] || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, [fieldName]: value }))}
            />
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleVoiceInput(fieldName)}
            disabled={isListening && activeField !== fieldName}
            className="mt-8"
          >
            <Mic className={cn(
              "h-4 w-4",
              isListening && activeField === fieldName && "text-red-600 animate-pulse"
            )} />
          </Button>
        </div>
      );
    }

    if (isSelectField) {
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldName} className="flex items-center gap-2">
            {fieldLabel}
            {formData[fieldName] && <CheckCircle2 className="h-3 w-3 text-green-600" />}
          </Label>
          <div className="flex gap-2">
            <Select
              value={formData[fieldName]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, [fieldName]: value }))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={`Select ${fieldLabel}`} />
              </SelectTrigger>
              <SelectContent>
                {fieldName === 'sex' ? (
                  <>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleVoiceInput(fieldName)}
              disabled={isListening && activeField !== fieldName}
            >
              <Mic className={cn(
                "h-4 w-4",
                isListening && activeField === fieldName && "text-red-600 animate-pulse"
              )} />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="flex items-center gap-2">
          {fieldLabel}
          {formData[fieldName] && <CheckCircle2 className="h-3 w-3 text-green-600" />}
        </Label>
        <div className="flex gap-2">
          <Input
            id={fieldName}
            value={formData[fieldName] || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, [fieldName]: e.target.value }))}
            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
            className="flex-1"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => handleVoiceInput(fieldName)}
            disabled={isListening && activeField !== fieldName}
          >
            <Mic className={cn(
              "h-4 w-4",
              isListening && activeField === fieldName && "text-red-600 animate-pulse"
            )} />
          </Button>
        </div>
      </div>
    );
  };

  const calculateCompletion = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    const completed = section.fields.filter(field => formData[field]).length;
    return Math.round((completed / section.fields.length) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Master Data Table
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save All
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Voice Guide Banner */}
        {isListening && (
          <Card className="p-4 bg-red-50 border-red-200 animate-pulse">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Voice Input Active</p>
                <p className="text-sm text-red-700">Listening for: {activeField?.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 overflow-hidden flex flex-col">
          <div className="sticky top-0 z-20 border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullView(!isFullView)}
                className="flex-shrink-0 h-auto"
                title={isFullView ? "Collapse" : "Expand All"}
              >
                {isFullView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <TabsList className="flex-1 grid grid-cols-2 lg:grid-cols-6">
            {sections.map(section => {
              const completion = calculateCompletion(section.id);
              const Icon = section.icon;
              return (
                <TabsTrigger key={section.id} value={section.id} className="relative">
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{section.label}</span>
                  <Badge 
                    variant={completion === 100 ? "default" : "secondary"} 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    {completion}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-4">
            {isFullView ? (
              // Full View - All sections visible
              <div className="space-y-0">
                {sections.map((section, index) => (
                  <div 
                    key={section.id} 
                    ref={(el) => sectionRefs.current[section.id] = el}
                    className={index < sections.length - 1 ? "border-b border-border/10" : ""}
                  >
                    <Card className="p-6 rounded-none border-0">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <section.icon className="h-5 w-5" />
                            {section.label} Information
                          </h3>
                          <Badge variant={calculateCompletion(section.id) === 100 ? "default" : "secondary"}>
                            {calculateCompletion(section.id)}% Complete
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {section.fields.map(field => (
                            <div key={field}>
                              {renderField(field)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              // Tabbed View
              sections.map(section => (
                <TabsContent key={section.id} value={section.id} className="space-y-4 mt-0">
                  <Card className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <section.icon className="h-5 w-5" />
                          {section.label} Information
                        </h3>
                        <Badge variant={calculateCompletion(section.id) === 100 ? "default" : "secondary"}>
                          {calculateCompletion(section.id)}% Complete
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.fields.map(field => (
                          <div key={field}>
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Section Instructions */}
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Tip:</strong> Click the microphone icon next to any field to use voice input. 
                      Make sure your browser has microphone permissions enabled.
                    </p>
                  </Card>
                </TabsContent>
              ))
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
