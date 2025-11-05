import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Loader2, XCircle, Wrench } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VerificationResults {
  total: number;
  valid: number;
  invalid: Array<{
    id: string;
    name: string;
    path: string;
    reason: string;
  }>;
  missing: Array<{
    id: string;
    name: string;
    path: string;
    error: string;
  }>;
  verified: Array<{
    id: string;
    name: string;
    path: string;
  }>;
}

export function DropboxPathVerifier() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<VerificationResults | null>(null);
  const { toast } = useToast();

  const verifyPaths = async () => {
    setIsVerifying(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('verify-dropbox-paths', {
        body: {}
      });

      if (error) throw error;

      if (data?.success && data?.results) {
        setResults(data.results);
        
        const summary = data.summary;
        toast({
          title: "Verification Complete",
          description: `${summary.valid}/${summary.total} paths verified (${summary.verificationRate})`,
        });
      } else {
        throw new Error(data?.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify paths",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const fixInvalidPaths = async () => {
    if (!results) return;
    
    const invalidDocIds = [...results.invalid, ...results.missing].map(doc => doc.id);
    
    if (invalidDocIds.length === 0) {
      toast({
        title: "No Paths to Fix",
        description: "All paths are already valid",
      });
      return;
    }

    setIsFixing(true);

    try {
      const { data, error } = await supabase.functions.invoke('fix-dropbox-paths', {
        body: { documentIds: invalidDocIds }
      });

      if (error) throw error;

      if (data?.success && data?.summary) {
        const summary = data.summary;
        toast({
          title: "Path Fixing Complete",
          description: `${summary.fixed}/${summary.total} paths fixed (${summary.fixRate})`,
        });
        
        // Re-run verification to get updated results
        await verifyPaths();
      } else {
        throw new Error(data?.error || 'Path fixing failed');
      }
    } catch (error) {
      console.error('Path fixing error:', error);
      toast({
        title: "Path Fixing Failed",
        description: error instanceof Error ? error.message : "Failed to fix paths",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Dropbox Path Verifier
        </CardTitle>
        <CardDescription>
          Verify that document paths in the database match actual files in Dropbox
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={verifyPaths} 
            disabled={isVerifying || isFixing}
            className="flex-1"
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isVerifying ? "Verifying Paths..." : "Run Path Verification"}
          </Button>
          
          {results && (results.invalid.length > 0 || results.missing.length > 0) && (
            <Button 
              onClick={fixInvalidPaths} 
              disabled={isVerifying || isFixing}
              variant="secondary"
              className="flex-1"
            >
              {isFixing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Wrench className="mr-2 h-4 w-4" />
              {isFixing ? "Fixing Paths..." : `Fix ${results.invalid.length + results.missing.length} Paths`}
            </Button>
          )}
        </div>

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">{results.valid}</div>
                  <div className="text-xs">Valid Paths</div>
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">{results.invalid.length}</div>
                  <div className="text-xs">Invalid Paths</div>
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">{results.missing.length}</div>
                  <div className="text-xs">Missing Files</div>
                </AlertDescription>
              </Alert>
            </div>

            {results.invalid.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-destructive" />
                  Invalid Paths
                </h4>
                <ScrollArea className="h-48 border rounded-md p-2">
                  {results.invalid.map((item) => (
                    <div key={item.id} className="text-xs mb-2 p-2 bg-muted rounded">
                      <div className="font-mono text-destructive">{item.path}</div>
                      <div className="text-muted-foreground">{item.name}</div>
                      <div className="text-xs text-destructive">{item.reason}</div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            {results.missing.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  Missing Files
                </h4>
                <ScrollArea className="h-48 border rounded-md p-2">
                  {results.missing.map((item) => (
                    <div key={item.id} className="text-xs mb-2 p-2 bg-muted rounded">
                      <div className="font-mono">{item.path}</div>
                      <div className="text-muted-foreground">{item.name}</div>
                      <div className="text-xs text-destructive">{item.error}</div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
