import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslationNotifications } from '@/hooks/useTranslationNotifications';
import { Badge } from '@/components/ui/badge';

export default function TranslationWorkflowTest() {
  const [isCreating, setIsCreating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [testJobId, setTestJobId] = useState<string | null>(null);
  const { pendingReviewCount } = useTranslationNotifications();
  
  const [formData, setFormData] = useState({
    documentName: 'Test Birth Certificate',
    sourceLanguage: 'EN',
    targetLanguage: 'PL',
    sourceText: 'This is a test birth certificate document. Name: John Smith. Date of Birth: January 15, 1980. Place of Birth: New York, USA. Father: Robert Smith. Mother: Mary Johnson.',
  });

  const createTestJob = async () => {
    setIsCreating(true);
    try {
      // First, get a test case or create one
      const { data: cases, error: casesError } = await supabase
        .from('cases' as any)
        .select('id')
        .limit(1);

      if (casesError) throw casesError;
      if (!cases || cases.length === 0) {
        toast.error('No cases found. Please create a case first.');
        return;
      }

      const caseId = (cases[0] as any).id;

      // Create a test document
      const { data: document, error: docError } = await supabase
        .from('documents' as any)
        .insert({
          case_id: caseId,
          name: formData.documentName,
          dropbox_path: `/test/${formData.documentName}`,
          type: 'birth_certificate',
          category: 'LOCAL',
          language: formData.sourceLanguage,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create translation job
      const { data: job, error: jobError } = await supabase
        .from('translation_jobs' as any)
        .insert({
          case_id: caseId,
          document_id: (document as any).id,
          document_name: formData.documentName,
          source_language: formData.sourceLanguage,
          target_language: formData.targetLanguage,
          workflow_stage: 'pending',
          priority: 'high',
          metadata: {
            test: true,
            source_text: formData.sourceText,
          },
        })
        .select()
        .single();

      if (jobError) throw jobError;

      setTestJobId((job as any).id);
      toast.success('Test translation job created!', {
        description: `Job ID: ${(job as any).id}`,
      });
    } catch (error: any) {
      console.error('Error creating test job:', error);
      toast.error('Failed to create test job', {
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const triggerAITranslation = async () => {
    if (!testJobId) {
      toast.error('Please create a test job first');
      return;
    }

    setIsTranslating(true);
    try {
      // Call the translation workflow edge function to start AI translation
      const { data, error } = await supabase.functions.invoke('translation-workflow', {
        body: {
          action: 'start_ai',
          job_id: testJobId,
        },
      });

      if (error) throw error;

      toast.success('AI Translation Started!', {
        description: 'The AI is now translating the document. You should receive a notification when complete.',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error triggering AI translation:', error);
      toast.error('Failed to start AI translation', {
        description: error.message,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const checkJobStatus = async () => {
    if (!testJobId) {
      toast.error('Please create a test job first');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('translation_jobs' as any)
        .select('*')
        .eq('id', testJobId)
        .single();

      if (error) throw error;

      const jobData = data as any;
      toast.info('Job Status', {
        description: `Stage: ${jobData.workflow_stage}\nConfidence: ${jobData.ai_confidence_score || 'N/A'}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error checking job status:', error);
      toast.error('Failed to check job status', {
        description: error.message,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TestTube className="h-8 w-8 text-primary" />
              Translation Workflow Test
            </h1>
            <p className="text-muted-foreground mt-2">
              Test the complete AI translation workflow with real-time notifications
            </p>
          </div>
          {pendingReviewCount > 0 && (
            <Badge variant="destructive" className="h-12 w-12 text-lg animate-pulse">
              {pendingReviewCount}
            </Badge>
          )}
        </div>

        {/* Instructions Card */}
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Test Instructions
            </CardTitle>
            <CardDescription>
              Follow these steps to test the translation workflow:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-1">1</Badge>
              <p className="text-sm">Configure the test document details below</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-1">2</Badge>
              <p className="text-sm">Click "Create Test Job" to create a translation job</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-1">3</Badge>
              <p className="text-sm">Click "Start AI Translation" to trigger the translation</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-1">4</Badge>
              <p className="text-sm">Watch for the toast notification when translation completes</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-1">5</Badge>
              <p className="text-sm">Check the badge counter in the top right to see pending reviews</p>
            </div>
          </CardContent>
        </Card>

        {/* Test Job Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Configure Test Document</CardTitle>
            <CardDescription>
              Set up the test document details for translation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentName">Document Name</Label>
              <Input
                id="documentName"
                value={formData.documentName}
                onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                placeholder="Test Birth Certificate"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceLanguage">Source Language</Label>
                <Select
                  value={formData.sourceLanguage}
                  onValueChange={(value) => setFormData({ ...formData, sourceLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="DE">German</SelectItem>
                    <SelectItem value="FR">French</SelectItem>
                    <SelectItem value="ES">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetLanguage">Target Language</Label>
                <Select
                  value={formData.targetLanguage}
                  onValueChange={(value) => setFormData({ ...formData, targetLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PL">Polish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceText">Source Text (for AI translation)</Label>
              <Textarea
                id="sourceText"
                value={formData.sourceText}
                onChange={(e) => setFormData({ ...formData, sourceText: e.target.value })}
                placeholder="Enter the text to be translated..."
                rows={6}
              />
            </div>

            <Button
              onClick={createTestJob}
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Test Job...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Test Job
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Translation Actions */}
        {testJobId && (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle>Step 2: Trigger AI Translation</CardTitle>
              <CardDescription>
                Job ID: {testJobId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={triggerAITranslation}
                  disabled={isTranslating}
                  variant="default"
                  size="lg"
                  className="w-full"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Start AI Translation'
                  )}
                </Button>

                <Button
                  onClick={checkJobStatus}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Check Job Status
                </Button>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold mb-2">What happens next:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>AI translation will start automatically</li>
                  <li>The job will transition through workflow stages</li>
                  <li>When it reaches "ai_complete", you'll see a toast notification</li>
                  <li>The badge counter will update to show pending reviews</li>
                  <li>Navigate to Translations Workflow to see the job in the dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Monitor */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Monitor Notifications</CardTitle>
            <CardDescription>
              Watch for real-time notifications when translation completes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <Badge variant="destructive" className="text-2xl h-12 w-12 flex items-center justify-center">
                  {pendingReviewCount}
                </Badge>
              </div>
              <p className="text-lg font-semibold">Pending HAC Reviews</p>
              <p className="text-sm text-muted-foreground mt-2">
                This counter updates in real-time when translations are ready for review
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
