import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PhaseBVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const phaseAAnalysis = `# POLISH CITIZENSHIP PORTAL - COMPREHENSIVE SYSTEM ANALYSIS (Phase A)

## EXECUTIVE SUMMARY
Full-stack client portal providing secure, passwordless access for citizenship application tracking.
Built on React + Supabase with 70-stage visualization, real-time messaging, document management.
Architecture Score: 95/100

## SYSTEM OVERVIEW
- **Tech Stack**: React 18.3, TypeScript, Supabase (auth/DB/storage/functions), Tailwind CSS
- **Authentication**: Passwordless magic link via client-magic-link Edge Function
- **Authorization**: client_portal_access table maps users to specific cases
- **Security**: Extensive RLS policies across 15+ tables, audit logging
- **Internationalization**: 8 languages (EN/ES/PT/DE/FR/HE/RU/UK), Hebrew RTL support
- **Real-time**: Supabase Realtime for messaging

## CORE COMPONENTS

### 1. CLIENT AUTHENTICATION FLOW
- **Entry**: ClientLogin.tsx (email + case ID)
- **Magic Link**: client-magic-link function generates secure token
- **Validation**: Token expires in 1 hour, stored in client_portal_access
- **Session**: Supabase Auth manages session, user_id linked to case

### 2. MAIN DASHBOARD (ClientDashboard.tsx)
- **Stage Visualization**: CaseStageVisualization.tsx (70 stages, 15 parts)
- **Document Upload**: FileUploadSection.tsx → dropbox-upload function
- **Messaging**: MessagingSection.tsx (real-time via Supabase channels)
- **POA Download**: DownloadPOAButton.tsx → pdf-generate-v2 function
- **Consulate Kit**: ConsulateKitGenerator.tsx (passport checklist)
- **Language Toggle**: LanguageSelector component (8 languages)

### 3. INTAKE WIZARD (ClientIntakeWizard.tsx)
- **Multi-step Form**: 6 steps (basic info, family, documents, etc.)
- **OCR Integration**: Passport upload → ocr-worker → auto-fill
- **Validation**: Zod schemas, field-level validation
- **Auto-save**: Real-time persistence to intake_form_data

### 4. BACKEND (Supabase)
- **Tables**: cases, documents, intake_form_data, client_portal_access, messages, ai_conversations
- **RLS Policies**: User can only access their own case data
- **Edge Functions**: 
  - client-magic-link (auth)
  - dropbox-upload (file storage)
  - pdf-generate-v2 (POA generation)
  - ocr-worker (document processing)
  - get-case-documents (secure document retrieval)

## IDENTIFIED GAPS & RISKS

### Critical Issues (Score Impact: -5)
1. **No Polish Language**: Intentional policy, but limits Polish-speaking clients
2. **Manual Magic Link Distribution**: Admin must copy/paste links to clients
3. **Incomplete Stage Tracking**: completedStages in CaseStageVisualization not synced with DB

### Medium Issues
4. **Partial Consulate Kit**: Only generates passport checklist, not full kit
5. **No Email Notifications**: Magic links sent manually, no auto-email
6. **Document Versioning**: Partial implementation, no full audit trail

## SECURITY ASSESSMENT
- **Strong**: Passwordless auth, RLS, rate limiting, audit logs
- **Good**: Token expiry, session management, input validation
- **Adequate**: CORS headers, error handling

## INTERNATIONALIZATION STATUS
- **Languages**: 8 supported (all except Polish)
- **RTL Support**: Hebrew implemented in App.tsx
- **Namespace**: 'portal' for client portal, 'landing' for homepage
- **Admin**: English only (intentional)

## RECOMMENDATIONS
1. Sync completedStages with database for accurate progress tracking
2. Implement automated email delivery for magic links
3. Complete Consulate Kit generation (full document checklist)
4. Add document version history UI
5. Consider notification system for case updates

## CONCLUSION
The Polish Citizenship Portal is a well-architected, secure system with robust authentication,
comprehensive stage tracking, and strong internationalization. Main gaps are operational
(manual processes) rather than architectural.`;

  const projectContext = `Polish Citizenship Portal - React/TypeScript/Supabase. 
70-stage citizenship tracking, passwordless auth, real-time messaging, document OCR pipeline,
8-language support (EN/ES/PT/DE/FR/HE/RU/UK), admin HAC tools, A→B→EX verification system.
149 active cases, ~1500 documents. Client portal separate from admin backend.`;

  const handleVerify = async () => {
    setIsVerifying(true);
    setResult(null);

    try {
      console.log('🚀 Starting Phase B Triple Verification...');
      
      const { data, error } = await supabase.functions.invoke('triple-verify-analysis', {
        body: { 
          analysis: phaseAAnalysis,
          context: projectContext
        }
      });

      if (error) {
        console.error('❌ Verification failed:', error);
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown verification error');
      }

      console.log('✅ Triple verification complete');
      console.log('📊 Results:', {
        gpt5_score: data.gpt5.overall_score,
        gemini_score: data.gemini.overall_score,
        claude_score: data.claude?.overall_score,
        verdict: data.verdict
      });

      setResult(data);

      toast({
        title: "Phase B Complete",
        description: `Verdict: ${data.verdict}`,
        variant: data.verdict === 'PROCEED_TO_EX' ? 'default' : 'destructive',
      });

    } catch (err) {
      console.error('Verification error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Phase B - Triple Verification</h1>
          <p className="text-muted-foreground text-lg">
            A→B→EX Protocol: All 3 models must score 100/100 to proceed
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Phase A Analysis Ready</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comprehensive analysis of Polish Citizenship Portal completed.
            Click below to verify with GPT-5, Gemini 2.5 Pro, and Claude Sonnet 4.5.
          </p>
          
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isVerifying ? 'Running Verification...' : 'Run Phase B Verification'}
          </Button>
        </Card>

        {result && (
          <div className="space-y-4">
            <Card className={`p-6 ${result.verdict === 'PROCEED_TO_EX' ? 'border-green-500' : 'border-red-500'}`}>
              <h3 className="font-bold text-xl mb-4">
                {result.verdict === 'PROCEED_TO_EX' ? '✅ PROCEED TO EX' : '❌ REVISE ANALYSIS'}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Average Score:</span>
                  <span className="ml-2 font-semibold">{result.consensus.average_score.toFixed(1)}/100</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Agreement:</span>
                  <span className="ml-2 font-semibold capitalize">{result.consensus.agreement_level}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Unanimous Approval:</span>
                  <span className="ml-2">{result.consensus.unanimous_approval ? '✅' : '❌'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">All at 100%:</span>
                  <span className="ml-2">{result.consensus.all_scores_at_100 ? '✅' : '❌'}</span>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {/* GPT-5 */}
              <Card className="p-4">
                <h4 className="font-semibold mb-2">🤖 GPT-5</h4>
                <div className="text-2xl font-bold mb-2">{result.gpt5.overall_score}/100</div>
                <div className="text-sm space-y-1">
                  <div>Confidence: <span className="capitalize">{result.gpt5.confidence_level}</span></div>
                  <div>Recommendation: <span className="capitalize">{result.gpt5.recommendation}</span></div>
                  {result.gpt5.missed_issues?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground">Missed Issues:</div>
                      <ul className="text-xs list-disc list-inside">
                        {result.gpt5.missed_issues.map((issue: string, i: number) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Gemini */}
              <Card className="p-4">
                <h4 className="font-semibold mb-2">🔮 Gemini 2.5 Pro</h4>
                <div className="text-2xl font-bold mb-2">{result.gemini.overall_score}/100</div>
                <div className="text-sm space-y-1">
                  <div>Confidence: <span className="capitalize">{result.gemini.confidence_level}</span></div>
                  <div>Recommendation: <span className="capitalize">{result.gemini.recommendation}</span></div>
                  {result.gemini.missed_issues?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground">Missed Issues:</div>
                      <ul className="text-xs list-disc list-inside">
                        {result.gemini.missed_issues.map((issue: string, i: number) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Claude */}
              {result.claude && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">🧠 Claude Sonnet 4.5</h4>
                  <div className="text-2xl font-bold mb-2">{result.claude.overall_score}/100</div>
                  <div className="text-sm space-y-1">
                    <div>Confidence: <span className="capitalize">{result.claude.confidence_level}</span></div>
                    <div>Recommendation: <span className="capitalize">{result.claude.recommendation}</span></div>
                    {result.claude.missed_issues?.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">Missed Issues:</div>
                        <ul className="text-xs list-disc list-inside">
                          {result.claude.missed_issues.map((issue: string, i: number) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {result.verdict === 'PROCEED_TO_EX' && (
              <Card className="p-6 bg-green-500/10 border-green-500">
                <h3 className="font-bold mb-2">✅ Ready for Phase EX</h3>
                <p className="text-sm text-muted-foreground">
                  All three models have approved the analysis at 100%. You may now proceed to implementation.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
