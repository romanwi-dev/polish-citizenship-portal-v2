import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ConsulateKitGeneratorProps {
  caseId: string;
  clientName: string;
  decisionReceived?: boolean;
}

const PASSPORT_CHECKLIST = [
  {
    id: 'decision_letter',
    category: 'Official Documents',
    item: 'Polish Citizenship Confirmation Decision',
    description: 'Original or certified copy of citizenship confirmation',
    required: true,
  },
  {
    id: 'passport_photos',
    category: 'Photos',
    item: 'Passport Photos (2 copies)',
    description: '35mm x 45mm, white background, recent (within 6 months)',
    required: true,
  },
  {
    id: 'birth_certificate',
    category: 'Civil Documents',
    item: 'Birth Certificate',
    description: 'Original or certified copy with apostille/legalization',
    required: true,
  },
  {
    id: 'current_passport',
    category: 'Identification',
    item: 'Current Passport',
    description: 'Valid passport for identity verification',
    required: true,
  },
  {
    id: 'application_form',
    category: 'Forms',
    item: 'Passport Application Form (Wniosek o Paszport)',
    description: 'Completed and signed',
    required: true,
  },
  {
    id: 'payment_receipt',
    category: 'Financial',
    item: 'Application Fee Payment Receipt',
    description: 'Proof of passport application fee payment',
    required: true,
  },
  {
    id: 'marriage_cert',
    category: 'Civil Documents',
    item: 'Marriage Certificate (if applicable)',
    description: 'If name changed due to marriage',
    required: false,
  },
  {
    id: 'previous_polish_passport',
    category: 'Identification',
    item: 'Previous Polish Passport (if applicable)',
    description: 'If renewing Polish passport',
    required: false,
  },
];

const POLISH_CONSULATES = [
  { country: 'United States', city: 'New York', address: '233 Madison Avenue, New York, NY 10016' },
  { country: 'United States', city: 'Chicago', address: '1530 North Lake Shore Drive, Chicago, IL 60610' },
  { country: 'United States', city: 'Los Angeles', address: '12400 Wilshire Blvd, Suite 555, Los Angeles, CA 90025' },
  { country: 'United Kingdom', city: 'London', address: '47 Portland Place, London W1B 1JH' },
  { country: 'Canada', city: 'Toronto', address: '2603 Lakeshore Blvd West, Toronto, ON M8V 1G5' },
  { country: 'Germany', city: 'Berlin', address: 'Lassenstraße 19-21, 14193 Berlin' },
  { country: 'Australia', city: 'Canberra', address: '7 Turrana Street, Yarralumla ACT 2600' },
];

export const ConsulateKitGenerator = ({ 
  caseId, 
  clientName,
  decisionReceived = false 
}: ConsulateKitGeneratorProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);

  const handleToggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleGenerateKit = async () => {
    setGenerating(true);
    try {
      // Generate PDF with checklist
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: {
          templateType: 'consulate_kit',
          caseId,
          data: {
            clientName,
            checklist: PASSPORT_CHECKLIST,
            checkedItems: Array.from(checkedItems),
            generatedDate: new Date().toISOString(),
          }
        }
      });

      if (error) throw error;

      // Create blob and download
      const blob = new Blob([Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0))], {
        type: 'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Consulate_Kit_${clientName.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Consulate Kit downloaded successfully');
    } catch (error: any) {
      console.error('Kit generation error:', error);
      toast.error('Failed to generate kit: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const requiredItems = PASSPORT_CHECKLIST.filter(item => item.required);
  const optionalItems = PASSPORT_CHECKLIST.filter(item => !item.required);
  const requiredChecked = requiredItems.filter(item => checkedItems.has(item.id)).length;
  const completionPercentage = Math.round((requiredChecked / requiredItems.length) * 100);

  if (!decisionReceived) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Consulate Kit Not Available Yet
          </CardTitle>
          <CardDescription>
            The Consulate Kit will be available after you receive your Polish citizenship decision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once your citizenship is confirmed, this section will provide:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Complete passport application checklist
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Required documents list with specifications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Polish consulate directory
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Downloadable preparation guide
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Passport Application Preparation
            </span>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {completionPercentage}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Check off items as you gather them for your consulate visit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {requiredChecked} of {requiredItems.length} required items ready
          </p>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Required Documents
          </CardTitle>
          <CardDescription>
            All of these items are mandatory for passport application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requiredItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => handleToggleItem(item.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label 
                  htmlFor={item.id}
                  className="text-sm font-medium cursor-pointer"
                >
                  {item.item}
                </label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optional Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Optional Documents
          </CardTitle>
          <CardDescription>
            May be required depending on your situation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {optionalItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => handleToggleItem(item.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <label 
                  htmlFor={item.id}
                  className="text-sm font-medium cursor-pointer"
                >
                  {item.item}
                </label>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consulate Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-500" />
            Polish Consulates
          </CardTitle>
          <CardDescription>
            Find your nearest consulate for passport application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {POLISH_CONSULATES.map((consulate, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border border-border"
            >
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{consulate.city}, {consulate.country}</p>
                <p className="text-sm text-muted-foreground">{consulate.address}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generate Kit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleGenerateKit}
            disabled={generating || completionPercentage < 100}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Kit...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Consulate Kit PDF
              </>
            )}
          </Button>
          {completionPercentage < 100 && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Complete all required items to download kit
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
