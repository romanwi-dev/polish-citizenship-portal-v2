import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FileText, Loader2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AssemblyStep {
  order: number;
  title: string;
  description: string;
  documents: string[];
  tips: string[];
  critical: boolean;
}

interface DocumentAssemblyGuideProps {
  caseId: string;
  templateType: string;
}

/**
 * Phase 4.2: Document Assembly Guide
 * AI-generated step-by-step guide for document preparation
 */
export function DocumentAssemblyGuide({ caseId, templateType }: DocumentAssemblyGuideProps) {
  const [steps, setSteps] = useState<AssemblyStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    generateGuide();
  }, [caseId, templateType]);

  const generateGuide = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-document-guide', {
        body: { caseId, templateType },
      });

      if (error) throw error;
      setSteps(data.steps || []);
    } catch (error) {
      console.error('Failed to generate assembly guide:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (order: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">AI is generating your assembly guide...</span>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = steps.length > 0
    ? Math.round((completedSteps.size / steps.length) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Assembly Guide
          </CardTitle>
          <Badge variant={completionPercentage === 100 ? 'default' : 'secondary'}>
            {completionPercentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {steps.map((step) => (
            <AccordionItem key={step.order} value={`step-${step.order}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-1">
                  <Button
                    variant={completedSteps.has(step.order) ? 'default' : 'outline'}
                    size="sm"
                    className="h-6 w-6 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStep(step.order);
                    }}
                  >
                    {completedSteps.has(step.order) ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <span className="text-xs">{step.order}</span>
                    )}
                  </Button>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{step.title}</div>
                    {step.critical && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Critical
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-12 space-y-4">
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {step.documents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Required Documents:</h4>
                      <ul className="space-y-1">
                        {step.documents.map((doc, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <ChevronRight className="h-3 w-3" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.tips.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">💡 Tips:</h4>
                      <ul className="space-y-1">
                        {step.tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
