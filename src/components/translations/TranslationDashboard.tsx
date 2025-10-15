import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Languages, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Plus,
  Users,
  Building2
} from "lucide-react";
import { CreateTranslationJobDialog } from "./CreateTranslationJobDialog";
import { TranslationJobsList } from "./TranslationJobsList";
import { SwornTranslatorsList } from "./SwornTranslatorsList";
import { TranslationAgenciesList } from "./TranslationAgenciesList";

export const TranslationDashboard = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch translation job counts
  const { data: counts } = useQuery({
    queryKey: ["translation-job-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_translation_job_counts' as any);
      if (error) throw error;
      return data[0] as any;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <Languages className="h-6 w-6 sm:h-8 sm:w-8" />
            Translation Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            AI-powered translations + Polish Sworn Translator certification
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Translation Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Jobs</p>
              <p className="text-xl sm:text-2xl font-bold">{counts?.total_jobs || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Pending</p>
              <p className="text-xl sm:text-2xl font-bold">{counts?.pending_jobs || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg shrink-0">
              <Languages className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">In Progress</p>
              <p className="text-xl sm:text-2xl font-bold">{counts?.in_progress_jobs || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg shrink-0">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Completed</p>
              <p className="text-xl sm:text-2xl font-bold">{counts?.completed_jobs || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Urgent Jobs Alert */}
      {counts?.urgent_jobs > 0 && (
        <Card className="p-4 border-orange-500 bg-orange-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-semibold">Urgent Translation Jobs</p>
              <p className="text-sm text-muted-foreground">
                {counts.urgent_jobs} job{counts.urgent_jobs > 1 ? 's' : ''} require immediate attention
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">
            <FileText className="mr-2 h-4 w-4" />
            Translation Jobs
          </TabsTrigger>
          <TabsTrigger value="translators">
            <Users className="mr-2 h-4 w-4" />
            Sworn Translators
          </TabsTrigger>
          <TabsTrigger value="agencies">
            <Building2 className="mr-2 h-4 w-4" />
            Translation Agencies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <TranslationJobsList />
        </TabsContent>

        <TabsContent value="translators">
          <SwornTranslatorsList />
        </TabsContent>

        <TabsContent value="agencies">
          <TranslationAgenciesList />
        </TabsContent>
      </Tabs>

      {/* Create Job Dialog */}
      <CreateTranslationJobDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};