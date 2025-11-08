import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, TrendingUp, Clock, CheckCircle2, Search } from "lucide-react";

interface ProvenPattern {
  id: string;
  agent_name: string;
  domain: string;
  problem_description: string;
  solution_approach: string;
  effectiveness_score: number;
  usage_count: number;
  tags: string[];
  created_at: string;
  last_used_at: string;
  success_metrics: any;
  relevance_score?: number;
}

export function ProvenPatternsLibrary() {
  const [patterns, setPatterns] = useState<ProvenPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPatterns();
  }, [selectedDomain]);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const result = await (supabase as any)
        .from('proven_patterns')
        .select('*')
        .order('effectiveness_score', { ascending: false })
        .order('usage_count', { ascending: false });
      
      if (result.error) throw result.error;
      
      let filteredData = result.data || [];
      if (selectedDomain) {
        filteredData = filteredData.filter((p: any) => p.domain === selectedDomain);
      }
      
      setPatterns(filteredData);
    } catch (error: any) {
      console.error('Error loading patterns:', error);
      toast({
        title: "Error Loading Patterns",
        description: error?.message || 'Unknown error',
        variant: "destructive",
      });
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPatterns = async () => {
    if (!searchQuery.trim()) {
      loadPatterns();
      return;
    }

    try {
      const keywords = searchQuery.toLowerCase().split(' ').filter(k => k.length > 2);
      
      const { data, error } = await supabase.functions.invoke('find-relevant-patterns', {
        body: {
          domain: selectedDomain,
          problem_keywords: keywords,
          limit: 20
        }
      });

      if (error) throw error;

      setPatterns((data.patterns || []) as any);
    } catch (error: any) {
      console.error('Error searching patterns:', error);
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const domains = Array.from(new Set(patterns.map(p => p.domain)));

  const filteredPatterns = searchQuery
    ? patterns.filter(p => 
        p.problem_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.solution_approach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : patterns;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Proven Patterns Library
              </CardTitle>
              <CardDescription>
                Successful A→B→EX executions stored for reuse and learning
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
              {filteredPatterns.length} patterns
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search patterns by problem, solution, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPatterns()}
              />
              <Button onClick={searchPatterns} variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Domain Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={selectedDomain === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDomain(null)}
            >
              All Domains
            </Button>
            {domains.map(domain => (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDomain(domain)}
              >
                {domain}
              </Button>
            ))}
          </div>

          <Separator className="mb-4" />

          {/* Patterns List */}
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading patterns...
              </div>
            ) : filteredPatterns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No patterns found. Complete successful A→B→EX executions to build the library.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatterns.map((pattern) => (
                  <Card key={pattern.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {pattern.domain}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {pattern.problem_description.substring(0, 150)}...
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-green-500/10">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {Math.round(pattern.effectiveness_score * 100)}%
                          </Badge>
                          <Badge variant="outline">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {pattern.usage_count} uses
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-1">Solution Approach:</div>
                          <div className="text-sm text-muted-foreground">
                            {pattern.solution_approach.substring(0, 200)}...
                          </div>
                        </div>

                        {pattern.tags && pattern.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {pattern.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Created {new Date(pattern.created_at).toLocaleDateString()}
                          </div>
                          {pattern.last_used_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Last used {new Date(pattern.last_used_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
