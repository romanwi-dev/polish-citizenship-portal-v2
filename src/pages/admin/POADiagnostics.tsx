import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileSearch, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { inspectAllPOATemplates, compareFieldMappings } from '@/utils/poaTemplateInspector';
import { POA_ADULT_PDF_MAP, POA_MINOR_PDF_MAP, POA_SPOUSES_PDF_MAP } from '@/config/pdfMappings';

export default function POADiagnostics() {
  const [isInspecting, setIsInspecting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsInspecting(true);
    setError(null);
    setResults(null);

    try {
      console.log('[POA Diagnostics] Starting inspection...');
      const inspection = await inspectAllPOATemplates();
      
      // Compare with current mappings
      const adultComparison = compareFieldMappings(
        inspection.adult.fields.map(f => f.name),
        POA_ADULT_PDF_MAP
      );
      
      const minorComparison = compareFieldMappings(
        inspection.minor.fields.map(f => f.name),
        POA_MINOR_PDF_MAP
      );
      
      const spousesComparison = compareFieldMappings(
        inspection.spouses.fields.map(f => f.name),
        POA_SPOUSES_PDF_MAP
      );
      
      setResults({
        inspection,
        comparisons: {
          adult: adultComparison,
          minor: minorComparison,
          spouses: spousesComparison,
        }
      });
      
      console.log('[POA Diagnostics] Inspection complete:', { inspection, comparisons: { adult: adultComparison, minor: minorComparison, spouses: spousesComparison }});
    } catch (err: any) {
      console.error('[POA Diagnostics] Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">POA Template Diagnostics</h1>
        <Button
          onClick={runDiagnostics}
          disabled={isInspecting}
          size="lg"
        >
          {isInspecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inspecting Templates...
            </>
          ) : (
            <>
              <FileSearch className="mr-2 h-4 w-4" />
              Run Diagnostics
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-6">
          {/* POA Adult */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>POA Adult Template</span>
                <Badge variant="outline">{results.inspection.adult.totalFields} fields</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">Mapped</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{results.comparisons.adult.mapped.length}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">Unmapped</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{results.comparisons.adult.unmapped.length}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">Extra</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{results.comparisons.adult.extraMappings.length}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">All Fields in Template:</h4>
                <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                  <code className="text-sm">
                    {results.inspection.adult.fields.map((f: any) => f.name).join(', ')}
                  </code>
                </div>
              </div>
              
              {results.comparisons.adult.unmapped.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-600">Unmapped Fields:</h4>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
                    <code className="text-sm text-yellow-700 dark:text-yellow-300">
                      {results.comparisons.adult.unmapped.join(', ')}
                    </code>
                  </div>
                </div>
              )}
              
              {results.comparisons.adult.extraMappings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Extra Mappings (Not in PDF):</h4>
                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md">
                    <code className="text-sm text-red-700 dark:text-red-300">
                      {results.comparisons.adult.extraMappings.join(', ')}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* POA Minor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>POA Minor Template</span>
                <Badge variant="outline">{results.inspection.minor.totalFields} fields</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">Mapped</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{results.comparisons.minor.mapped.length}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">Unmapped</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{results.comparisons.minor.unmapped.length}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">Extra</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{results.comparisons.minor.extraMappings.length}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">All Fields in Template:</h4>
                <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                  <code className="text-sm">
                    {results.inspection.minor.fields.map((f: any) => f.name).join(', ')}
                  </code>
                </div>
              </div>
              
              {results.comparisons.minor.unmapped.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-600">Unmapped Fields:</h4>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
                    <code className="text-sm text-yellow-700 dark:text-yellow-300">
                      {results.comparisons.minor.unmapped.join(', ')}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* POA Spouses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>POA Spouses Template</span>
                <Badge variant="outline">{results.inspection.spouses.totalFields} fields</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">Mapped</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{results.comparisons.spouses.mapped.length}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">Unmapped</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{results.comparisons.spouses.unmapped.length}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">Extra</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{results.comparisons.spouses.extraMappings.length}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">All Fields in Template:</h4>
                <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                  <code className="text-sm">
                    {results.inspection.spouses.fields.map((f: any) => f.name).join(', ')}
                  </code>
                </div>
              </div>
              
              {results.comparisons.spouses.unmapped.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-600">Unmapped Fields:</h4>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-md">
                    <code className="text-sm text-yellow-700 dark:text-yellow-300">
                      {results.comparisons.spouses.unmapped.join(', ')}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Raw Data */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Inspection Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
