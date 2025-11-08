import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { inspectPDFFields } from '@/utils/pdfInspector';
import { POA_ADULT_PDF_MAP, POA_MINOR_PDF_MAP, POA_SPOUSES_PDF_MAP } from '@/config/pdfMappings';

const TEMPLATES = [
  { id: 'poa-adult', name: 'POA Adult', mapping: POA_ADULT_PDF_MAP || {} },
  { id: 'poa-minor', name: 'POA Minor', mapping: POA_MINOR_PDF_MAP || {} },
  { id: 'poa-spouses', name: 'POA Spouses', mapping: POA_SPOUSES_PDF_MAP || {} },
  { id: 'citizenship', name: 'Citizenship Application', mapping: {} },
  { id: 'family-tree', name: 'Family Tree', mapping: {} },
  { id: 'umiejscowienie', name: 'Civil Registry Entry', mapping: {} },
  { id: 'uzupelnienie', name: 'Civil Registry Supplement', mapping: {} },
];

interface FieldInfo {
  name: string;
  type: string;
}

interface InspectionResult {
  templateType: string;
  totalFields: number;
  fields: FieldInfo[];
  mappedFields: string[];
  unmappedFields: string[];
  missingFromPDF: string[];
}

export default function PDFFieldInspector() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InspectionResult[]>([]);

  const inspectAllTemplates = async () => {
    setLoading(true);
    setResults([]);
    const inspectionResults: InspectionResult[] = [];

    for (const template of TEMPLATES) {
      try {
        toast.loading(`Inspecting ${template.name}...`, { id: template.id });

        // CLIENT-SIDE inspection - no edge functions!
        const data = await inspectPDFFields(template.id);

        const pdfFieldNames = data.fields.map((f: FieldInfo) => f.name);
        const mappedFieldNames = Object.keys(template.mapping);
        
        const unmappedFields = pdfFieldNames.filter(
          (field: string) => !mappedFieldNames.includes(field)
        );
        
        const missingFromPDF = mappedFieldNames.filter(
          (field: string) => !pdfFieldNames.includes(field)
        );

        inspectionResults.push({
          templateType: template.id,
          totalFields: data.totalFields,
          fields: data.fields,
          mappedFields: mappedFieldNames,
          unmappedFields,
          missingFromPDF,
        });

        toast.success(`${template.name}: ${data.totalFields} fields found`, { id: template.id });
      } catch (error) {
        console.error(`Error inspecting ${template.id}:`, error);
        toast.error(`Failed to inspect ${template.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: template.id });
      }
    }

    setResults(inspectionResults);
    setLoading(false);
  };

  const getTotalMismatches = () => {
    return results.reduce((sum, r) => sum + r.unmappedFields.length + r.missingFromPDF.length, 0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PDF Field Inspector</h1>
          <p className="text-muted-foreground mt-1">
            Verify PDF template fields match our database mappings
          </p>
        </div>
        <Button onClick={inspectAllTemplates} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inspecting...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Inspect All Templates
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <Card className={getTotalMismatches() === 0 ? 'border-green-500' : 'border-yellow-500'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTotalMismatches() === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  All Templates Valid ✅
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  {getTotalMismatches()} Mismatches Found
                </>
              )}
            </CardTitle>
            <CardDescription>
              {results.reduce((sum, r) => sum + r.totalFields, 0)} total PDF fields across {results.length} templates
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6">
        {results.map((result) => {
          const template = TEMPLATES.find((t) => t.id === result.templateType);
          const hasIssues = result.unmappedFields.length > 0 || result.missingFromPDF.length > 0;
          const coveragePercent = Math.round(
            (result.mappedFields.filter((f) => result.fields.some((pf) => pf.name === f)).length /
              result.totalFields) *
              100
          );

          return (
            <Card key={result.templateType} className={hasIssues ? 'border-yellow-500' : 'border-green-500'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {hasIssues ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {template?.name}
                  </CardTitle>
                  <Badge variant={hasIssues ? 'destructive' : 'default'}>
                    {coveragePercent}% Coverage
                  </Badge>
                </div>
                <CardDescription>
                  {result.totalFields} fields in PDF | {result.mappedFields.length} in mapping
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.unmappedFields.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-yellow-600 mb-2">
                      ⚠️ PDF Fields Not in Mapping ({result.unmappedFields.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.unmappedFields.map((field) => (
                        <Badge key={field} variant="outline" className="font-mono text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.missingFromPDF.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">
                      ❌ Mapping Fields Not in PDF ({result.missingFromPDF.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingFromPDF.map((field) => (
                        <Badge key={field} variant="destructive" className="font-mono text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!hasIssues && (
                  <div className="text-green-600 font-semibold">
                    ✅ All fields perfectly mapped!
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer font-semibold text-sm">
                    View All PDF Fields ({result.fields.length})
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.fields.map((field) => (
                      <Badge
                        key={field.name}
                        variant={result.mappedFields.includes(field.name) ? 'default' : 'secondary'}
                        className="font-mono text-xs"
                      >
                        {field.name}
                      </Badge>
                    ))}
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
