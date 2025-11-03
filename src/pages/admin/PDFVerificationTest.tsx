import { useState } from "react";
import { useParams } from "react-router-dom";
import { PDFVerificationPanel } from "@/components/admin/PDFVerificationPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PDFVerificationTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCaseId, setTestCaseId] = useState(id || '6d06e5f9-d1e1-49b3-b33f-bb32c404e2f0');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">PDF Verification Test Suite</h1>
          <p className="text-muted-foreground">
            Comprehensive testing with AI verification (Gemini + OpenAI)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Select a case ID to test PDF generation and verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="caseId">Case ID</Label>
              <Input
                id="caseId"
                value={testCaseId}
                onChange={(e) => setTestCaseId(e.target.value)}
                placeholder="Enter case ID"
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Default test case: 6d06e5f9-d1e1-49b3-b33f-bb32c404e2f0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {testCaseId && (
        <PDFVerificationPanel caseId={testCaseId} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>About This Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">What This Test Does:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Runs PDF generation 3 times to ensure consistency</li>
              <li>Verifies fields are actually filled (not just generated)</li>
              <li>Uses Gemini AI to analyze PDF content</li>
              <li>Uses OpenAI GPT-5 to double-verify results</li>
              <li>Provides detailed logs of each step</li>
              <li>Reports success rate and identifies any failures</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Success Criteria:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>✓ PDF generation completes without errors</li>
              <li>✓ Field filling count &gt; 0 (not all fields blank)</li>
              <li>✓ AI verification confirms data is present</li>
              <li>✓ All 3 runs produce consistent results</li>
              <li>✓ No critical errors in any step</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">AI Verification:</h3>
            <p className="text-sm text-muted-foreground">
              Both Gemini and OpenAI will analyze the generated PDF to verify that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Form fields contain actual data (names, dates, addresses)</li>
              <li>Fields are not blank or empty</li>
              <li>The PDF is a properly filled form, not a blank template</li>
              <li>Data quality meets expected standards</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
