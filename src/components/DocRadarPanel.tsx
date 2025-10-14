import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileCheck, 
  FileX, 
  AlertTriangle, 
  CheckCircle2, 
  Languages,
  User,
  Users,
  UserCheck
} from "lucide-react";
import { PersonDocuments, analyzeDocumentRadar, getOverallDocumentCompletion, getCriticalMissingDocs } from "@/utils/documentRadar";

interface DocRadarPanelProps {
  documents: Array<{
    type: string;
    person_type: string | null;
    is_translated: boolean;
    file_extension: string | null;
  }>;
  familyData: any;
}

export const DocRadarPanel = ({ documents, familyData }: DocRadarPanelProps) => {
  const radar = analyzeDocumentRadar(documents, familyData);
  const overallCompletion = getOverallDocumentCompletion(radar);
  const criticalMissing = getCriticalMissingDocs(radar);
  
  const getPersonIcon = (personType: string) => {
    if (personType === 'AP') return <User className="w-4 h-4" />;
    if (personType === 'F' || personType === 'M') return <Users className="w-4 h-4" />;
    return <UserCheck className="w-4 h-4" />;
  };
  
  const getPersonLabel = (personType: string) => {
    const labels: Record<string, string> = {
      AP: 'Applicant',
      F: 'Father',
      M: 'Mother',
      PGF: 'Paternal Grandfather',
      PGM: 'Paternal Grandmother',
      MGF: 'Maternal Grandfather',
      MGM: 'Maternal Grandmother',
    };
    return labels[personType] || personType;
  };
  
  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Document Radar - Overall Status
          </CardTitle>
          <CardDescription>
            Track document collection progress for all family members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-2xl font-bold">{overallCompletion}%</span>
          </div>
          <Progress value={overallCompletion} className="h-3" />
          
          {criticalMissing.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Missing:</strong> {criticalMissing.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Per-Person Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Document Collection by Person</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {radar.map((person) => (
                <Card key={person.personType} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPersonIcon(person.personType)}
                        <CardTitle className="text-base">
                          {getPersonLabel(person.personType)}
                        </CardTitle>
                        <Badge variant="outline" className="font-mono">
                          {person.personType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {person.completionPercentage === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : person.missingDocs.length > 0 ? (
                          <FileX className="w-5 h-5 text-destructive" />
                        ) : null}
                        <span className="text-sm font-bold">
                          {person.completionPercentage}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{person.personName}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={person.completionPercentage} />
                    
                    {/* Document Checklist */}
                    <div className="space-y-2">
                      {person.requiredDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-2 rounded border ${
                            doc.collected 
                              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                              : doc.required 
                                ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                                : 'border-border'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {doc.collected ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <FileX className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">{doc.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.required && !doc.collected && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            {doc.needsTranslation && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Languages className="w-3 h-3" />
                                Translate
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Translation Alerts */}
                    {person.needsTranslation.length > 0 && (
                      <Alert>
                        <Languages className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Needs Translation:</strong> {person.needsTranslation.join(', ')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
