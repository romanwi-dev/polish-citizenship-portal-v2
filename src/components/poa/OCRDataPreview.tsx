import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface OCRDataPreviewProps {
  data: any;
  confidence?: number;
  warnings?: string[];
}

export function OCRDataPreview({ data, confidence, warnings }: OCRDataPreviewProps) {
  if (!data) return null;

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return "text-green-600 dark:text-green-400";
    if (conf >= 0.7) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const renderField = (label: string, value: any) => {
    if (!value) return null;
    
    return (
      <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        <span className="text-sm font-semibold">{value}</span>
      </div>
    );
  };

  return (
    <Card className="bg-blue-50/45 dark:bg-blue-950/40 backdrop-blur border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            OCR Data Preview
          </CardTitle>
          {confidence !== undefined && (
            <Badge variant="outline" className={cn("font-mono", getConfidenceColor(confidence))}>
              {(confidence * 100).toFixed(0)}% confidence
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {warnings && warnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warnings:</p>
                {warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-yellow-700 dark:text-yellow-300">{warning}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {renderField("Full Name", data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim())}
          {renderField("Date of Birth", data.dateOfBirth)}
          {renderField("Sex", data.sex)}
          {renderField("Passport Number", data.passportNumber)}
          {renderField("Issue Date", data.issueDate)}
          {renderField("Expiry Date", data.expiryDate)}
          {renderField("Place of Birth", data.placeOfBirth)}
          {renderField("Nationality", data.nationality)}
          {renderField("Father's Name", data.fatherName)}
          {renderField("Mother's Name", data.motherName)}
        </div>

        <div className="mt-4 pt-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            <User className="inline h-3 w-3 mr-1" />
            Review the extracted data carefully before proceeding
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
