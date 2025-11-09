import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle2, XCircle, Info, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Suggestion {
  value: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

interface AISuggestionsPanelProps {
  familyData: any[];
  targetPerson: string;
  targetPersonLabel: string;
  missingFields: string[];
  onAcceptSuggestion: (field: string, value: string) => void;
  className?: string;
}

export function AISuggestionsPanel({
  familyData,
  targetPerson,
  targetPersonLabel,
  missingFields,
  onAcceptSuggestion,
  className
}: AISuggestionsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, Suggestion>>({});
  const [acceptedFields, setAcceptedFields] = useState<Set<string>>(new Set());
  const [rejectedFields, setRejectedFields] = useState<Set<string>>(new Set());

  const generateSuggestions = async () => {
    setLoading(true);
    setSuggestions({});
    setAcceptedFields(new Set());
    setRejectedFields(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('suggest-family-data', {
        body: {
          familyData,
          targetPerson,
          missingFields
        }
      });

      if (error) throw error;

      if (data?.success && data?.suggestions) {
        setSuggestions(data.suggestions);
        toast.success('AI suggestions generated!');
      } else {
        throw new Error('No suggestions returned');
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      toast.error('Failed to generate AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (field: string, value: string) => {
    onAcceptSuggestion(field, value);
    setAcceptedFields(prev => new Set([...prev, field]));
    toast.success(`Applied suggestion for ${formatFieldName(field)}`);
  };

  const handleReject = (field: string) => {
    setRejectedFields(prev => new Set([...prev, field]));
    toast.info(`Rejected suggestion for ${formatFieldName(field)}`);
  };

  const formatFieldName = (field: string): string => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const suggestionCount = Object.keys(suggestions).length;
  const acceptedCount = acceptedFields.size;
  const rejectedCount = rejectedFields.size;

  return (
    <Card className={cn("p-6 border-2 border-primary/20", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Smart Suggestions
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by advanced AI analyzing family patterns
          </p>
        </div>
        <Button
          onClick={generateSuggestions}
          disabled={loading || missingFields.length === 0}
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Suggestions
            </>
          )}
        </Button>
      </div>

      {/* Target Info */}
      <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
        <p className="text-sm font-medium">Target: {targetPersonLabel}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {missingFields.length} missing field{missingFields.length !== 1 ? 's' : ''} detected
        </p>
      </div>

      {/* Stats */}
      {suggestionCount > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-xl font-bold text-primary">{suggestionCount}</div>
            <div className="text-xs text-muted-foreground">Generated</div>
          </div>
          <div className="text-center p-2 bg-green-500/10 rounded">
            <div className="text-xl font-bold text-green-600">{acceptedCount}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
          <div className="text-center p-2 bg-orange-500/10 rounded">
            <div className="text-xl font-bold text-orange-600">{rejectedCount}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {Object.entries(suggestions).map(([field, suggestion]) => {
            const isAccepted = acceptedFields.has(field);
            const isRejected = rejectedFields.has(field);
            const isProcessed = isAccepted || isRejected;

            return (
              <motion.div
                key={field}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  isAccepted && "bg-green-500/5 border-green-500/20",
                  isRejected && "bg-orange-500/5 border-orange-500/20 opacity-50",
                  !isProcessed && "bg-card border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{formatFieldName(field)}</p>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getConfidenceColor(suggestion.confidence))}
                      >
                        {suggestion.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-primary">{suggestion.value}</p>
                  </div>

                  {!isProcessed && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAccept(field, suggestion.value)}
                        className="gap-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-500/20"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(field)}
                        className="gap-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-orange-500/20"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {isAccepted && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Applied
                    </Badge>
                  )}

                  {isRejected && (
                    <Badge variant="outline" className="text-orange-600 border-orange-500/20">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </div>

                <div className="flex items-start gap-2 mt-3 p-2 bg-muted/30 rounded text-xs">
                  <Info className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{suggestion.reasoning}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!loading && suggestionCount === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Click "Generate Suggestions" to get AI-powered recommendations</p>
          </div>
        )}
      </div>
    </Card>
  );
}
