import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  critical?: boolean;
}

interface TemplateChecklist {
  id: string;
  name: string;
  steps: ChecklistItem[];
}

const STORAGE_KEY = 'zero-errors-checklist';

export default function ZeroErrorsChecklist() {
  const navigate = useNavigate();
  
  const [verification, setVerification] = useState<ChecklistItem[]>([
    { id: 'inspector', label: 'Run PDF Field Inspector on all templates', completed: false, critical: true },
    { id: 'review', label: 'Review and fix all field name mismatches', completed: false, critical: true },
    { id: 'confirm', label: 'Confirm 100% field coverage for all templates', completed: false, critical: true },
  ]);

  const [templates, setTemplates] = useState<TemplateChecklist[]>([
    {
      id: 'poa-adult',
      name: 'POA Adult',
      steps: [
        { id: 'fill', label: 'Fill form with complete data', completed: false },
        { id: 'generate', label: 'Generate PDF successfully', completed: false },
        { id: 'preview', label: 'Preview shows all fields populated', completed: false },
        { id: 'download', label: 'Download/Print works correctly', completed: false },
      ],
    },
    {
      id: 'poa-minor',
      name: 'POA Minor',
      steps: [
        { id: 'fill', label: 'Fill form with complete data', completed: false },
        { id: 'generate', label: 'Generate PDF successfully', completed: false },
        { id: 'preview', label: 'Preview shows all fields populated', completed: false },
        { id: 'download', label: 'Download/Print works correctly', completed: false },
      ],
    },
    {
      id: 'poa-spouses',
      name: 'POA Spouses',
      steps: [
        { id: 'fill', label: 'Fill form with complete data', completed: false },
        { id: 'generate', label: 'Generate PDF successfully', completed: false },
        { id: 'preview', label: 'Preview shows all fields populated', completed: false },
        { id: 'download', label: 'Download/Print works correctly', completed: false },
      ],
    },
    {
      id: 'citizenship',
      name: 'Citizenship Application',
      steps: [
        { id: 'fill', label: 'Fill form with complete data', completed: false },
        { id: 'generate', label: 'Generate PDF successfully', completed: false },
        { id: 'preview', label: 'Preview shows all fields populated', completed: false },
        { id: 'download', label: 'Download/Print works correctly', completed: false },
      ],
    },
    {
      id: 'family-tree',
      name: 'Family Tree',
      steps: [
        { id: 'fill', label: 'Fill form with complete data', completed: false },
        { id: 'generate', label: 'Generate PDF successfully', completed: false },
        { id: 'preview', label: 'Preview shows all fields populated', completed: false },
        { id: 'download', label: 'Download/Print works correctly', completed: false },
      ],
    },
    {
      id: 'umiejscowienie',
      name: 'Civil Registry Entry',
      steps: [
        { id: 'fill', label: 'Fill form with complete data', completed: false },
        { id: 'generate', label: 'Generate PDF successfully', completed: false },
        { id: 'preview', label: 'Preview shows all fields populated', completed: false },
        { id: 'download', label: 'Download/Print works correctly', completed: false },
      ],
    },
    {
      id: 'uzupelnienie',
      name: 'Civil Registry Supplement',
      steps: [
        { id: 'fill', label: 'Fill form with complete data', completed: false },
        { id: 'generate', label: 'Generate PDF successfully', completed: false },
        { id: 'preview', label: 'Preview shows all fields populated', completed: false },
        { id: 'download', label: 'Download/Print works correctly', completed: false },
      ],
    },
  ]);

  const [edgeCases, setEdgeCases] = useState<ChecklistItem[]>([
    { id: 'partial', label: 'Test with partial data (some fields empty)', completed: false },
    { id: 'special', label: 'Test special characters in names (ł, ń, ą, etc.)', completed: false },
    { id: 'long', label: 'Test long text values (addresses, names)', completed: false },
    { id: 'children', label: 'Test with 5+ children', completed: false },
    { id: 'dates', label: 'Test edge case dates (1800s, 2030)', completed: false },
    { id: 'combined', label: 'Test name concatenation (first + last)', completed: false },
    { id: 'nested', label: 'Test nested JSONB fields (addresses)', completed: false },
    { id: 'boolean', label: 'Test checkbox/boolean fields', completed: false },
  ]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setVerification(data.verification || verification);
        setTemplates(data.templates || templates);
        setEdgeCases(data.edgeCases || edgeCases);
      } catch (e) {
        console.error('Failed to load checklist state');
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      verification,
      templates,
      edgeCases,
    }));
  }, [verification, templates, edgeCases]);

  const toggleVerification = (id: string) => {
    setVerification(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const toggleTemplateStep = (templateId: string, stepId: string) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? {
              ...template,
              steps: template.steps.map(step =>
                step.id === stepId ? { ...step, completed: !step.completed } : step
              ),
            }
          : template
      )
    );
  };

  const toggleEdgeCase = (id: string) => {
    setEdgeCases(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const verificationProgress = (verification.filter(v => v.completed).length / verification.length) * 100;
  const templatesProgress =
    (templates.reduce((sum, t) => sum + t.steps.filter(s => s.completed).length, 0) /
      templates.reduce((sum, t) => sum + t.steps.length, 0)) *
    100;
  const edgeCasesProgress = (edgeCases.filter(e => e.completed).length / edgeCases.length) * 100;
  const totalProgress = (verificationProgress + templatesProgress + edgeCasesProgress) / 3;

  const allVerificationComplete = verification.every(v => v.completed);
  const allTemplatesComplete = templates.every(t => t.steps.every(s => s.completed));
  const allEdgeCasesComplete = edgeCases.every(e => e.completed);
  const isZeroErrors = allVerificationComplete && allTemplatesComplete && allEdgeCasesComplete;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ZERO ERRORS Checklist</h1>
          <p className="text-muted-foreground mt-1">
            Complete all steps to achieve 3-click zero-errors PDF generation
          </p>
        </div>
        {isZeroErrors && (
          <Badge className="h-10 px-6 text-lg bg-green-500">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            ZERO ERRORS ACHIEVED ✓
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>{Math.round(totalProgress)}% Complete</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={totalProgress} className="h-3" />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(verificationProgress)}%</div>
              <div className="text-sm text-muted-foreground">Verification</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(templatesProgress)}%</div>
              <div className="text-sm text-muted-foreground">Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(edgeCasesProgress)}%</div>
              <div className="text-sm text-muted-foreground">Edge Cases</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 1: Verification */}
      <Card className={allVerificationComplete ? 'border-green-500' : 'border-yellow-500'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {allVerificationComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                Phase 1: Field Verification (CRITICAL)
              </CardTitle>
              <CardDescription>Ensure PDF field mappings are 100% accurate</CardDescription>
            </div>
            <Button onClick={() => navigate('/admin/pdf-field-inspector')}>
              <Play className="mr-2 h-4 w-4" />
              Open Inspector
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {verification.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleVerification(item.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <label className={`cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {item.label}
                </label>
                {item.critical && <Badge variant="destructive" className="ml-2">CRITICAL</Badge>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Phase 2: Template Testing */}
      <Card className={allTemplatesComplete ? 'border-green-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allTemplatesComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
            Phase 2: Template Testing (3-Click Workflow)
          </CardTitle>
          <CardDescription>Test FILL → GENERATE → PREVIEW/PRINT for each template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.map((template) => {
            const templateProgress = (template.steps.filter(s => s.completed).length / template.steps.length) * 100;
            const isComplete = template.steps.every(s => s.completed);

            return (
              <Card key={template.id} className={isComplete ? 'border-green-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      {template.name}
                    </CardTitle>
                    <Badge variant={isComplete ? 'default' : 'secondary'}>
                      {template.steps.filter(s => s.completed).length}/{template.steps.length}
                    </Badge>
                  </div>
                  <Progress value={templateProgress} className="h-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {template.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => toggleTemplateStep(template.id, step.id)}
                      />
                      <label className={`cursor-pointer text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {step.label}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Phase 3: Edge Cases */}
      <Card className={allEdgeCasesComplete ? 'border-green-500' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {allEdgeCasesComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
            Phase 3: Edge Case Testing
          </CardTitle>
          <CardDescription>Verify robust handling of edge cases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {edgeCases.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleEdgeCase(item.id)}
              />
              <label className={`cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                {item.label}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {isZeroErrors && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-6 w-6" />
              ZERO ERRORS Policy Achieved! 🎉
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              All verification, template testing, and edge case validation complete.
              The 3-click workflow (FILL → GENERATE → PREVIEW/PRINT) is ready for production.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
