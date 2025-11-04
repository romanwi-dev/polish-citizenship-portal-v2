import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { AIDocumentWorkflow } from "@/components/workflows/AIDocumentWorkflow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Workflow } from "lucide-react";

const AIWorkflow = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  const { data: cases } = useQuery({
    queryKey: ['cases-for-workflow'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, client_name, client_code')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI Document Workflow
          </h1>
          <p className="text-muted-foreground mt-2">
            Automated workflow: Documents → AI Classification → Forms → AI Verification → PDFs
          </p>
        </div>

        {/* Case Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Case</CardTitle>
            <CardDescription>
              Choose a case to run the AI workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case..." />
              </SelectTrigger>
              <SelectContent>
                {cases?.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.client_code} - {c.client_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Workflow Component */}
        {selectedCaseId && (
          <AIDocumentWorkflow caseId={selectedCaseId} />
        )}

        {/* Workflow Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflow Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Document Upload</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload scanned documents or photos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">AI Classification (Gemini)</h4>
                  <p className="text-sm text-muted-foreground">
                    AI automatically names and describes each document
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-yellow-500/10 p-2">
                  <span className="text-yellow-600 font-bold text-sm">HAC</span>
                </div>
                <div>
                  <h4 className="font-semibold">HAC Review - Classification</h4>
                  <p className="text-sm text-muted-foreground">
                    Human authorization required to approve AI classification
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Form Population</h4>
                  <p className="text-sm text-muted-foreground">
                    OCR data automatically populates forms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-yellow-500/10 p-2">
                  <span className="text-yellow-600 font-bold text-sm">HAC</span>
                </div>
                <div>
                  <h4 className="font-semibold">HAC Review - Forms</h4>
                  <p className="text-sm text-muted-foreground">
                    Human authorization required to approve form data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-primary font-bold text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-semibold">Dual AI Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Both Gemini and OpenAI verify data quality and completeness
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-yellow-500/10 p-2">
                  <span className="text-yellow-600 font-bold text-sm">HAC</span>
                </div>
                <div>
                  <h4 className="font-semibold">HAC Review - Verification</h4>
                  <p className="text-sm text-muted-foreground">
                    Human authorization required to approve AI verification results
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <span className="text-primary font-bold text-sm">5</span>
                </div>
                <div>
                  <h4 className="font-semibold">PDF Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Final PDFs generated and ready for submission
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AIWorkflow;
