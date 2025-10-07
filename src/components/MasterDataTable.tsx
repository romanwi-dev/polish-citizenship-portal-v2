import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Save, Download, Upload, Calendar as CalendarIcon, CheckCircle2, AlertCircle, User, Users, FileText, Baby } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  const sections: FormSection[] = [
    {
      id: "applicant",
      label: "Applicant",
      icon: User,
      fields: ["firstName", "lastName", "maidenName", "dateOfBirth", "placeOfBirth", "sex", "currentCitizenship", "passportNumber", "email", "phone"]
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
      id: "documents",
      label: "Documents",
      icon: FileText,
      fields: ["birthCertificate", "marriageCertificate", "passportCopy", "naturalizationDocs"]
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
    const isDocumentField = sections.find(s => s.id === 'documents')?.fields.includes(fieldName);
    const isSelectField = fieldName === 'sex' || fieldName === 'currentCitizenship';
    
    const fieldLabel = fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();

    if (isDocumentField) {
      return (
        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <Checkbox 
            id={fieldName}
            checked={formData[fieldName] || false}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, [fieldName]: checked }))}
          />
          <label
            htmlFor={fieldName}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
          >
            {fieldLabel}
          </label>
          {formData[fieldName] && <CheckCircle2 className="h-4 w-4 text-green-600" />}
        </div>
      );
    }

    if (isDateField) {
      return (
        <div className="space-y-2">
          <Label htmlFor={fieldName} className="flex items-center gap-2">
            {fieldLabel}
            {formData[fieldName] && <CheckCircle2 className="h-3 w-3 text-green-600" />}
          </Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !formData[fieldName] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData[fieldName] ? format(formData[fieldName], "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData[fieldName]}
                  onSelect={(date) => setFormData(prev => ({ ...prev, [fieldName]: date }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-6 w-full">
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

          <div className="flex-1 overflow-y-auto mt-4">
            {sections.map(section => (
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
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
