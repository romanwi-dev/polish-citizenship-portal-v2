import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AIConfidence {
  documentId: string;
  documentName: string;
  classification: {
    documentType: string;
    personType: string;
    confidence: number;
    alternatives?: Array<{ type: string; confidence: number }>;
  };
  aiProvider: 'gemini' | 'gpt-5';
  reasoning?: string;
  timestamp: string;
  humanVerified?: boolean;
  humanFeedback?: 'correct' | 'incorrect';
}

interface AIConfidencePanelProps {
  confidenceData: AIConfidence[];
  onVerify?: (documentId: string, feedback: 'correct' | 'incorrect') => void;
  showLowConfidenceOnly?: boolean;
}

export function AIConfidencePanel({ 
  confidenceData, 
  onVerify,
  showLowConfidenceOnly = false 
}: AIConfidencePanelProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 75) return 'text-blue-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return { label: 'High', variant: 'default' as const };
    if (confidence >= 75) return { label: 'Medium', variant: 'secondary' as const };
    if (confidence >= 60) return { label: 'Low', variant: 'outline' as const };
    return { label: 'Very Low', variant: 'destructive' as const };
  };

  const filteredData = showLowConfidenceOnly 
    ? confidenceData.filter(d => d.classification.confidence < 75)
    : confidenceData;

  const avgConfidence = filteredData.length > 0
    ? filteredData.reduce((sum, d) => sum + d.classification.confidence, 0) / filteredData.length
    : 0;

  const highConfidenceCount = filteredData.filter(d => d.classification.confidence >= 90).length;
  const lowConfidenceCount = filteredData.filter(d => d.classification.confidence < 75).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">AI Confidence Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {filteredData.length} documents analyzed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getConfidenceColor(avgConfidence)}`}>
              {Math.round(avgConfidence)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Confidence</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">{highConfidenceCount}</div>
            <div className="text-xs text-muted-foreground">High Confidence</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">{lowConfidenceCount}</div>
            <div className="text-xs text-muted-foreground">Need Review</div>
          </div>
        </div>
      </Card>

      {/* Confidence Items */}
      <div className="space-y-3">
        {filteredData.map((item, index) => {
          const badge = getConfidenceBadge(item.classification.confidence);
          const isExpanded = expandedItems.has(item.documentId);
          
          return (
            <motion.div
              key={item.documentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`overflow-hidden ${
                item.classification.confidence < 60 ? 'border-yellow-300' : ''
              }`}>
                <Collapsible open={isExpanded}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{item.documentName}</span>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          {item.humanVerified && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {item.classification.confidence < 75 && (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>{item.classification.documentType}</span>
                          <span>•</span>
                          <span>{item.classification.personType}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {item.aiProvider}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Progress 
                            value={item.classification.confidence} 
                            className="h-2 flex-1"
                          />
                          <span className={`text-sm font-semibold ${getConfidenceColor(item.classification.confidence)}`}>
                            {Math.round(item.classification.confidence)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {!item.humanVerified && onVerify && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onVerify(item.documentId, 'correct')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onVerify(item.documentId, 'incorrect')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        
                        <CollapsibleTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleExpand(item.documentId)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </div>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-2 border-t bg-muted/30">
                      {/* AI Reasoning */}
                      {item.reasoning && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            AI Reasoning
                          </h5>
                          <p className="text-sm text-muted-foreground">{item.reasoning}</p>
                        </div>
                      )}

                      {/* Alternative Classifications */}
                      {item.classification.alternatives && item.classification.alternatives.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2">Alternative Classifications</h5>
                          <div className="space-y-2">
                            {item.classification.alternatives.map((alt, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-sm flex-1">{alt.type}</span>
                                <Progress value={alt.confidence} className="h-1 w-24" />
                                <span className="text-xs text-muted-foreground w-12 text-right">
                                  {Math.round(alt.confidence)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="mt-4 text-xs text-muted-foreground">
                        Analyzed: {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <Card className="p-8 text-center">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {showLowConfidenceOnly 
              ? 'No low-confidence classifications found'
              : 'No AI confidence data available'}
          </p>
        </Card>
      )}
    </motion.div>
  );
}
