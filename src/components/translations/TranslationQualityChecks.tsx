import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Sparkles,
  FileText,
  Languages
} from "lucide-react";
import { TranslationJob } from "@/hooks/useTranslationWorkflow";

interface TranslationQualityChecksProps {
  job: TranslationJob;
  aiTranslation?: string;
  humanTranslation?: string;
}

export function TranslationQualityChecks({ 
  job, 
  aiTranslation, 
  humanTranslation 
}: TranslationQualityChecksProps) {
  // Calculate quality metrics
  const checks = calculateQualityChecks(job, aiTranslation, humanTranslation);
  
  const passedChecks = checks.filter(c => c.status === 'pass').length;
  const warningChecks = checks.filter(c => c.status === 'warning').length;
  const failedChecks = checks.filter(c => c.status === 'fail').length;
  const overallScore = (passedChecks / checks.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Quality Checks
          <Badge 
            variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}
          >
            {overallScore.toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Quality</span>
            <span className="font-medium">
              {passedChecks}/{checks.length} passed
            </span>
          </div>
          <Progress value={overallScore} />
        </div>

        {/* Quality Metrics Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
            <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-xs font-medium">{passedChecks} Passed</p>
          </div>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-center">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
            <p className="text-xs font-medium">{warningChecks} Warnings</p>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-center">
            <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <p className="text-xs font-medium">{failedChecks} Failed</p>
          </div>
        </div>

        {/* Detailed Checks */}
        <div className="space-y-2">
          {checks.map((check, index) => (
            <div 
              key={index}
              className={`
                p-3 rounded-lg border-l-4
                ${check.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}
                ${check.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' : ''}
                ${check.status === 'fail' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : ''}
              `}
            >
              <div className="flex items-start gap-2">
                {check.status === 'pass' && <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />}
                {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                {check.status === 'fail' && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{check.title}</p>
                  <p className="text-xs text-muted-foreground">{check.description}</p>
                  {check.value !== undefined && (
                    <p className="text-xs font-mono mt-1">{check.value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface QualityCheck {
  title: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  value?: string;
}

function calculateQualityChecks(
  job: TranslationJob, 
  aiTranslation?: string, 
  humanTranslation?: string
): QualityCheck[] {
  const checks: QualityCheck[] = [];
  
  const translation = humanTranslation || aiTranslation || job.ai_translation || '';
  const sourceText = job.source_text;

  // Check 1: AI Confidence
  if (job.ai_confidence !== undefined) {
    checks.push({
      title: 'AI Confidence Score',
      description: 'Confidence level of AI translation',
      status: job.ai_confidence >= 0.85 ? 'pass' : job.ai_confidence >= 0.7 ? 'warning' : 'fail',
      value: `${(job.ai_confidence * 100).toFixed(0)}%`
    });
  }

  // Check 2: Translation Length
  const lengthRatio = translation.length / sourceText.length;
  checks.push({
    title: 'Translation Length',
    description: 'Length ratio compared to source (should be 0.8-1.5x)',
    status: lengthRatio >= 0.8 && lengthRatio <= 1.5 ? 'pass' : lengthRatio >= 0.6 && lengthRatio <= 2 ? 'warning' : 'fail',
    value: `${lengthRatio.toFixed(2)}x source length`
  });

  // Check 3: Special Characters Preserved
  const sourceSpecialChars = (sourceText.match(/[0-9.,;:!?()]/g) || []).length;
  const translationSpecialChars = (translation.match(/[0-9.,;:!?()]/g) || []).length;
  const charRatio = sourceSpecialChars > 0 ? translationSpecialChars / sourceSpecialChars : 1;
  checks.push({
    title: 'Special Characters',
    description: 'Numbers and punctuation preserved',
    status: charRatio >= 0.8 ? 'pass' : charRatio >= 0.6 ? 'warning' : 'fail',
    value: `${translationSpecialChars}/${sourceSpecialChars} preserved`
  });

  // Check 4: Human Review Status
  if (job.workflow_stage !== 'pending' && job.workflow_stage !== 'ai_translating') {
    checks.push({
      title: 'Human Review',
      description: 'Translation reviewed by human expert',
      status: job.human_reviewed_at ? 'pass' : 'warning',
      value: job.human_reviewed_at ? 'Reviewed' : 'Pending review'
    });
  }

  // Check 5: Quality Score (if human reviewed)
  if (job.quality_score) {
    checks.push({
      title: 'Human Quality Score',
      description: 'Expert rating of translation quality',
      status: job.quality_score >= 4 ? 'pass' : job.quality_score >= 3 ? 'warning' : 'fail',
      value: `${job.quality_score}/5`
    });
  }

  // Check 6: Translator Assignment (if needed)
  if (['approved_for_translator', 'assigned_to_translator', 'translator_in_progress', 'translator_complete'].includes(job.workflow_stage)) {
    checks.push({
      title: 'Sworn Translator',
      description: 'Certified translator assigned',
      status: job.assigned_translator_id ? 'pass' : 'fail',
      value: job.assigned_translator_id ? 'Assigned' : 'Not assigned'
    });
  }

  // Check 7: Final Document
  if (['document_uploaded', 'completed'].includes(job.workflow_stage)) {
    checks.push({
      title: 'Final Document',
      description: 'Certified translation document uploaded',
      status: job.final_document_id ? 'pass' : 'fail',
      value: job.final_document_id ? 'Uploaded' : 'Missing'
    });
  }

  return checks;
}
