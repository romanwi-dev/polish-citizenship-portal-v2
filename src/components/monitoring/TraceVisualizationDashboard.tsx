/**
 * Trace Visualization Dashboard
 * PHASE C - TASK 9: End-to-end request flow monitoring
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, GitBranch, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface TraceSpan {
  correlationId: string;
  functionName: string;
  startTime: number;
  duration?: number;
  parentId?: string;
  metadata?: Record<string, any>;
}

export function TraceVisualizationDashboard() {
  const [correlationId, setCorrelationId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data: trace, isLoading, error } = useQuery({
    queryKey: ['trace', searchId],
    queryFn: async () => {
      if (!searchId) return null;

      // Mock data - in production would call edge function
      const mockTrace: TraceSpan[] = [
        {
          correlationId: searchId,
          functionName: 'fill-pdf',
          startTime: Date.now() - 5000,
          duration: 1200,
          metadata: { templateType: 'poa-adult', caseId: 'CASE001' },
        },
        {
          correlationId: searchId,
          functionName: 'template_download',
          startTime: Date.now() - 4800,
          duration: 150,
          parentId: 'fill-pdf',
          metadata: { cacheHit: false },
        },
        {
          correlationId: searchId,
          functionName: 'field_filling',
          startTime: Date.now() - 4500,
          duration: 850,
          parentId: 'fill-pdf',
          metadata: { fieldsCount: 45, parallel: true },
        },
        {
          correlationId: searchId,
          functionName: 'storage_upload',
          startTime: Date.now() - 3600,
          duration: 200,
          parentId: 'fill-pdf',
          metadata: { size: 245000 },
        },
      ];

      return mockTrace;
    },
    enabled: !!searchId,
  });

  const handleSearch = () => {
    setSearchId(correlationId);
  };

  const getIndentation = (span: TraceSpan, allSpans: TraceSpan[]): number => {
    if (!span.parentId) return 0;
    const parent = allSpans.find(s => s.functionName === span.parentId);
    return parent ? 1 + getIndentation(parent, allSpans) : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Distributed Trace Viewer
          </CardTitle>
          <CardDescription>
            Track requests across edge functions with correlation IDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter correlation ID (e.g., trace_1234567890_abcd)"
              value={correlationId}
              onChange={(e) => setCorrelationId(e.target.value)}
              className="font-mono text-sm"
            />
            <Button onClick={handleSearch} disabled={!correlationId}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading trace...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-8 flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load trace</span>
          </CardContent>
        </Card>
      )}

      {trace && trace.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Trace Timeline
            </CardTitle>
            <CardDescription>
              Correlation ID: <code className="text-xs font-mono">{searchId}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trace
                .sort((a, b) => a.startTime - b.startTime)
                .map((span, index) => {
                  const indent = getIndentation(span, trace);
                  const offset = span.startTime - trace[0].startTime;
                  const hasError = span.metadata?.success === false;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        hasError ? 'border-destructive bg-destructive/5' : 'border-border'
                      }`}
                      style={{ marginLeft: `${indent * 24}px` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {hasError ? (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            <span className="font-mono text-sm font-medium">
                              {span.functionName}
                            </span>
                            {span.duration && (
                              <Badge variant="outline" className="text-xs">
                                {span.duration}ms
                              </Badge>
                            )}
                          </div>

                          {span.metadata && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {Object.entries(span.metadata).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="font-mono">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>+{offset}ms</span>
                        </div>
                      </div>

                      {span.parentId && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Called by: <code className="font-mono">{span.parentId}</code>
                        </div>
                      )}
                    </div>
                  );
                })}
              
              {/* Summary */}
              <div className="pt-4 border-t mt-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Spans</div>
                    <div className="font-semibold">{trace.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Duration</div>
                    <div className="font-semibold">
                      {Math.max(...trace.map(s => (s.duration || 0)))}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Functions Called</div>
                    <div className="font-semibold">
                      {new Set(trace.map(s => s.functionName)).size}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchId && !trace && !isLoading && !error && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No trace found for this correlation ID
          </CardContent>
        </Card>
      )}
    </div>
  );
}
