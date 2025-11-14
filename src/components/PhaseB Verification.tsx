import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { runTripleVerification } from '@/utils/tripleVerification';
import type { TripleVerificationResponse } from '@/utils/tripleVerification';

const phaseAAnalysis = `# PHASE A ANALYSIS - HOMEPAGE TRANSLATION IMPLEMENTATION

## Status: ✅ 99% COMPLETE (Timeline Fixed)

## Recent Changes
- ✅ Added timelineProcess translations for German, French, Hebrew, Russian, Ukrainian (430 keys)
- ✅ All 8 languages now have complete Timeline section (86 keys each)
- ✅ testimonials.reviews implemented for all 8 languages (36 keys each)

## Remaining Issue

### Issue #1: Hardcoded CTA Button (LOW Severity)
**Location**: TestimonialsSection.tsx lines 96-102
**Problem**: CTA button text and ariaLabel hardcoded in English
**Impact**: Non-English users see English button text "Take Polish Citizenship Test"
**Fix**: Replace with t('testimonials.cta')`;

const context = `Polish Citizenship Portal - React/TypeScript/Supabase. Homepage translation for 8 languages in src/i18n/config.ts (3,987 lines). All 12 homepage sections use i18next. TimelineProcessEnhanced verified working with all 8 languages. TestimonialsSection renders testimonials.reviews correctly. Only 1 hardcoded element remaining. NO runtime errors. System stable.`;

export function PhaseBVerification() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TripleVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const data = await runTripleVerification(phaseAAnalysis, context);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>A→B→EX Protocol - Phase B Verification</CardTitle>
          <CardDescription>
            Triple-model verification using GPT-5, Gemini 2.5 Pro, and Claude Sonnet 4.5
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runVerification} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Phase B Verification...
              </>
            ) : (
              'Run Triple Verification'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-6">
          {/* Verdict */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.verdict === 'PROCEED_TO_EX' ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    PROCEED TO PHASE EX
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-red-500" />
                    REVISE ANALYSIS
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                  <div className="text-2xl font-bold">{results.consensus.average_score}/100</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Agreement</div>
                  <Badge variant={
                    results.consensus.agreement_level === 'high' ? 'default' :
                    results.consensus.agreement_level === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {results.consensus.agreement_level.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">All 100%</div>
                  <div className="text-2xl">
                    {results.consensus.all_scores_at_100 ? '✅' : '❌'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Unanimous</div>
                  <div className="text-2xl">
                    {results.consensus.unanimous_approval ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GPT-5 Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 GPT-5 Results
                <Badge>{results.gpt5.overall_score}/100</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">Recommendation</div>
                <Badge variant={results.gpt5.recommendation === 'approve' ? 'default' : 'destructive'}>
                  {results.gpt5.recommendation.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Reasoning</div>
                <p className="text-sm text-muted-foreground">{results.gpt5.reasoning}</p>
              </div>
              {results.gpt5.missed_issues.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Missed Issues ({results.gpt5.missed_issues.length})
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {results.gpt5.missed_issues.map((issue, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gemini Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔮 Gemini 2.5 Pro Results
                <Badge>{results.gemini.overall_score}/100</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium">Recommendation</div>
                <Badge variant={results.gemini.recommendation === 'approve' ? 'default' : 'destructive'}>
                  {results.gemini.recommendation.toUpperCase()}
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Reasoning</div>
                <p className="text-sm text-muted-foreground">{results.gemini.reasoning}</p>
              </div>
              {results.gemini.missed_issues.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Missed Issues ({results.gemini.missed_issues.length})
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {results.gemini.missed_issues.map((issue, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claude Results */}
          {results.claude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧠 Claude Sonnet 4.5 Results
                  <Badge>{results.claude.overall_score}/100</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Recommendation</div>
                  <Badge variant={results.claude.recommendation === 'approve' ? 'default' : 'destructive'}>
                    {results.claude.recommendation.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Reasoning</div>
                  <p className="text-sm text-muted-foreground">{results.claude.reasoning}</p>
                </div>
                {results.claude.missed_issues.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Missed Issues ({results.claude.missed_issues.length})
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {results.claude.missed_issues.map((issue, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamp */}
          <div className="text-sm text-muted-foreground text-center">
            Verified at: {new Date(results.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
