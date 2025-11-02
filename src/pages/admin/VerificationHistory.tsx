/**
 * Verification History Dashboard
 * Displays all AI verification reviews with filtering and export
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertTriangle, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Verification {
  id: string;
  created_at: string;
  proposal_type: string;
  description: string;
  files_affected: string[];
  openai_score: number;
  recommendation: string;
  critical_issues: string[];
  warnings: string[];
  suggestions: string[];
  user_decision: string | null;
  implemented_at: string | null;
  case_id: string | null;
}

export default function VerificationHistory() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");

  const { data: verifications, isLoading } = useQuery({
    queryKey: ['ai-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Verification[];
    }
  });

  const filteredVerifications = verifications?.filter(v => {
    if (typeFilter !== "all" && v.proposal_type !== typeFilter) return false;
    if (scoreFilter === "high" && v.openai_score < 8) return false;
    if (scoreFilter === "medium" && (v.openai_score < 5 || v.openai_score >= 8)) return false;
    if (scoreFilter === "low" && v.openai_score >= 5) return false;
    return true;
  });

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 8) return "default";
    if (score >= 5) return "secondary";
    return "destructive";
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "approve":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "approve_with_changes":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "reject":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    if (!filteredVerifications) return;

    const headers = [
      "Date",
      "Type",
      "Description",
      "Score",
      "Recommendation",
      "Decision",
      "Files Affected",
      "Critical Issues",
      "Warnings"
    ];

    const rows = filteredVerifications.map(v => [
      format(new Date(v.created_at), 'yyyy-MM-dd HH:mm'),
      v.proposal_type,
      v.description,
      v.openai_score.toFixed(1),
      v.recommendation,
      v.user_decision || 'Pending',
      v.files_affected.join('; '),
      v.critical_issues.length.toString(),
      v.warnings.length.toString()
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              🤖 AI Verification History
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="edge_function">Edge Function</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Score Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="high">High (8-10)</SelectItem>
                <SelectItem value="medium">Medium (5-7)</SelectItem>
                <SelectItem value="low">Low (0-4)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground ml-auto">
              Showing {filteredVerifications?.length || 0} of {verifications?.length || 0} verifications
            </div>
          </div>

          {/* Table */}
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading verifications...
                    </TableCell>
                  </TableRow>
                ) : filteredVerifications?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No verifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVerifications?.map((verification) => (
                    <TableRow key={verification.id}>
                      <TableCell className="text-xs">
                        {format(new Date(verification.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{verification.proposal_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={verification.description}>
                          {verification.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {verification.files_affected.length} file(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getScoreBadgeVariant(verification.openai_score)}>
                          {verification.openai_score.toFixed(1)}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRecommendationIcon(verification.recommendation)}
                          <span className="text-xs capitalize">
                            {verification.recommendation.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {verification.user_decision ? (
                          <Badge variant={
                            verification.user_decision === 'approved' ? 'default' :
                            verification.user_decision === 'modified' ? 'secondary' :
                            'destructive'
                          }>
                            {verification.user_decision}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 text-xs">
                          {verification.critical_issues.length > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {verification.critical_issues.length} critical
                            </Badge>
                          )}
                          {verification.warnings.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {verification.warnings.length} warnings
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
