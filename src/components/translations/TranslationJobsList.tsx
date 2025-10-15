import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Languages, 
  Calendar,
  User,
  FileText,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { TranslationJobDetail } from "./TranslationJobDetail";

const statusColors: Record<string, string> = {
  pending: "bg-gray-500",
  ai_translating: "bg-blue-500",
  ai_complete: "bg-green-500",
  human_review: "bg-yellow-500",
  assigned: "bg-purple-500",
  in_progress: "bg-blue-600",
  certified: "bg-indigo-500",
  submitted_wsc: "bg-teal-500",
  submitted_civil: "bg-cyan-500",
  completed: "bg-green-600",
  rejected: "bg-red-500"
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500"
};

export const TranslationJobsList = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["translation-jobs", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('translation_jobs' as any)
        .select(`
          *,
          cases!inner(client_name, client_code),
          documents(name, type),
          sworn_translators(full_name, certification_number)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    }
  });

  const filteredJobs = jobs?.filter(job => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      job.cases?.client_name?.toLowerCase().includes(search) ||
      job.cases?.client_code?.toLowerCase().includes(search) ||
      job.source_language?.toLowerCase().includes(search) ||
      job.status?.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return <div>Loading translation jobs...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ai_translating">AI Translating</SelectItem>
            <SelectItem value="ai_complete">AI Complete</SelectItem>
            <SelectItem value="human_review">Needs Review</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {filteredJobs?.map((job) => (
          <Card 
            key={job.id} 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedJobId(job.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold text-lg">
                    {job.cases?.client_name} ({job.cases?.client_code})
                  </h3>
                  <Badge className={statusColors[job.status]}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                  {job.priority && (
                    <Badge className={priorityColors[job.priority]} variant="outline">
                      {job.priority}
                    </Badge>
                  )}
                </div>

                {/* Details */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    {job.source_language} → {job.target_language}
                  </div>
                  {job.documents && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {job.documents.name}
                    </div>
                  )}
                  {job.sworn_translators && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {job.sworn_translators.full_name}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(job.created_at), 'MMM d, yyyy')}
                  </div>
                </div>

                {/* AI Confidence */}
                {job.ai_confidence && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">AI Confidence:</span>
                    <div className="flex-1 max-w-xs bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${job.ai_confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(job.ai_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Submission Status */}
                {(job.submitted_to_wsc || job.submitted_to_civil_registry) && (
                  <div className="flex gap-2">
                    {job.submitted_to_wsc && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Submitted to WSC
                      </Badge>
                    )}
                    {job.submitted_to_civil_registry && (
                      <Badge variant="outline" className="text-xs">
                        ✓ Submitted to Civil Registry
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {filteredJobs?.length === 0 && (
          <Card className="p-12 text-center">
            <Languages className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No translation jobs found</p>
          </Card>
        )}
      </div>

      {/* Job Detail Dialog */}
      {selectedJobId && (
        <TranslationJobDetail
          jobId={selectedJobId}
          open={!!selectedJobId}
          onOpenChange={(open) => !open && setSelectedJobId(null)}
        />
      )}
    </div>
  );
};