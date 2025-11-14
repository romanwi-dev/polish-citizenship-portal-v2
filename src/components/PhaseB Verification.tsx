import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { runTripleVerification } from '@/utils/tripleVerification';
import type { TripleVerificationResponse } from '@/utils/tripleVerification';

const phaseAAnalysis = `# PHASE A ANALYSIS - Language Selector Bug Fixes & Translation Completion

## User Requirement Clarified
- ✅ Keep Polish (PL) translations in i18n config
- ❌ Remove Polish from language selector UI (hide toggle option)

## Critical Findings

### CRITICAL BUG 1: Language Code Mismatch (Ukrainian)
- **UI LanguageSelector.tsx**: Uses code 'ua' for Ukrainian (line 19)
- **i18n config**: Uses code 'uk' for Ukrainian
- **Impact**: Ukrainian toggle BROKEN - code mismatch prevents language switching
- **Severity**: CRITICAL
- **Fix**: Change UI line 19 from 'ua' to 'uk'

### CRITICAL BUG 2: Portuguese in UI Without Config
- **UI LanguageSelector.tsx**: Shows Portuguese (PT) option (lines 13-14)
- **i18n config**: No Portuguese translations exist
- **Impact**: Clicking PT breaks app - throws runtime errors
- **Severity**: CRITICAL
- **Fix**: Remove PT from LANGUAGES array

### Issue 3: Polish Language Handling (User Request)
- **Status**: Polish NOT in UI selector ✅
- **Config**: Polish translations exist in i18n config ✅
- **Requirement Met**: Polish hidden from UI as requested
- **Severity**: NONE - Already working correctly

### LOW SEVERITY: Hardcoded CTA Button
- **Location**: TestimonialsSection.tsx line 101
- **Current**: "Take Polish Citizenship Test" (English hardcoded)
- **Impact**: Doesn't translate for 7 languages
- **Fix**: Add testimonials.cta key to all 8 languages + update component

## Architectural Solution

### Fix 1: Update LanguageSelector.tsx
Remove PT, fix Ukrainian code:
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'he', label: 'עברית', flag: '🇮🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
];

### Fix 2: Add testimonials.cta (8 languages in i18n/config.ts)
- EN: "Take Polish Citizenship Test"
- PL: "Polski Test Obywatelstwa"
- DE: "Polnischer Staatsbürgerschaftstest"
- FR: "Test de Citoyenneté Polonaise"
- HE: "מבחן אזרחות פולנית"
- RU: "Тест на польское гражданство"
- UK: "Тест на польське громадянство"
- ES: "Prueba de Ciudadanía Polaca"

### Fix 3: Update TestimonialsSection.tsx line 101
{t('testimonials.cta')}

## Risk Assessment
- **Critical Bugs**: 2 (PT removal, UA→UK code)
- **Low Priority**: 1 (CTA translation)
- **Breaking Changes**: NONE (fixes existing bugs)
- **Dependencies**: NONE
- **Testing**: Language switcher across 7 visible languages

## Zero-Fail Classification
- **Complexity**: SIMPLE (3 file edits)
- **Risk**: LOW (bug fixes + additive changes)
- **Time**: 5 minutes
- **Post-Fix Coverage**: 100%
`;

const context = `Polish Citizenship Portal - React/TypeScript/Supabase. 8 languages in i18n config (EN, PL, DE, FR, HE, RU, UK, ES). LanguageSelector.tsx has critical bugs: PT without translations, Ukrainian code mismatch (ua vs uk). Polish translations exist but hidden from UI per user request. One hardcoded CTA button remaining. Homepage 99% translated.`;

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
