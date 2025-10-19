import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle, CheckCircle2, Upload, Languages } from 'lucide-react';
import { 
  calculateDocumentStatus, 
  getOverallDocumentCompletion,
  getCriticalDocumentsStatus,
  DocumentStatus 
} from '@/utils/documentRadar';
import { PersonType, PERSON_TYPE_LABELS, DOCUMENT_REQUIREMENTS } from '@/utils/docRadarConfig';
import { cn } from '@/lib/utils';

interface DocRadarPanelProps {
  documents: any[];
}

export function DocRadarPanel({ documents }: DocRadarPanelProps) {
  // Calculate document status for each person
  const personTypes: PersonType[] = ['AP', 'SPOUSE', 'F', 'M', 'PGF', 'PGM', 'MGF', 'MGM'];
  const statuses: DocumentStatus[] = personTypes.map(type => 
    calculateDocumentStatus(documents, type, PERSON_TYPE_LABELS[type])
  );

  const overallCompletion = getOverallDocumentCompletion(statuses);
  const { totalCritical, missingCritical, hasCriticalGaps } = getCriticalDocumentsStatus(statuses);

  // Calculate translation needs using language detection
  const translationNeeded = documents.filter(doc => 
    doc.language && doc.language !== 'PL' && doc.language !== 'UNKNOWN' && !doc.is_translated
  ).length;
  
  const unknownLanguage = documents.filter(doc => 
    doc.language === 'UNKNOWN'
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Radar
          </CardTitle>
          <div className="flex items-center gap-2">
            {unknownLanguage > 0 && (
              <Badge variant="outline" className="text-sm">
                <AlertCircle className="h-3 w-3 mr-1" />
                {unknownLanguage} Unknown
              </Badge>
            )}
            {translationNeeded > 0 && (
              <Badge variant="destructive" className="text-sm">
                <Languages className="h-3 w-3 mr-1" />
                {translationNeeded} Need Translation
              </Badge>
            )}
            <Badge 
              variant={overallCompletion === 100 ? 'default' : 'secondary'}
              className="text-sm"
            >
              {overallCompletion}% Complete
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasCriticalGaps && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {missingCritical} critical document{missingCritical !== 1 ? 's' : ''} missing out of {totalCritical}
            </AlertDescription>
          </Alert>
        )}

        {statuses.map((status) => (
          <div key={status.personType} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{status.personName}</span>
                <Badge 
                  variant={
                    status.percentage === 100 
                      ? 'default' 
                      : status.criticalMissing > 0 
                      ? 'destructive' 
                      : 'secondary'
                  }
                >
                  {status.uploaded}/{status.required}
                </Badge>
                {status.criticalMissing > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {status.criticalMissing} critical
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                status.percentage === 100 && "text-green-600 dark:text-green-400",
                status.criticalMissing > 0 && "text-destructive"
              )}>
                {status.percentage}%
              </span>
            </div>
            <Progress 
              value={status.percentage} 
              className={cn(
                "h-2",
                status.criticalMissing > 0 && "[&>div]:bg-destructive"
              )}
            />
            {status.missing.length > 0 && (
              <div className="ml-4 space-y-1">
                {status.missing.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {doc.isCritical ? (
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-destructive" />
                    ) : (
                      <Upload className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <span className={cn(
                        "font-medium",
                        doc.isCritical && "text-destructive"
                      )}>
                        {doc.label}
                      </span>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {overallCompletion === 100 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              All required documents have been collected!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
