import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Languages, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Users,
  Building2,
  Workflow,
  ClipboardList
} from "lucide-react";
import { TranslationWorkflowBoard } from "./TranslationWorkflowBoard";
import { DocumentRequirementsList } from "./DocumentRequirementsList";
import { SwornTranslatorsList } from "./SwornTranslatorsList";
import { TranslationAgenciesList } from "./TranslationAgenciesList";

export const TranslationDashboard = () => {

  const { data: counts } = useQuery({
    queryKey: ["translation-workflow-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_translation_workflow_counts" as any);
      if (error) throw error;
      return data[0] as any;
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Languages className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Translation Management</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Document-based AI translation with sworn translator certification
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Total</p>
              <p className="text-lg sm:text-xl font-bold">{counts?.total || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Upload Pending</p>
              <p className="text-lg sm:text-xl font-bold">{counts?.upload_pending || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
              <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">With Translator</p>
              <p className="text-lg sm:text-xl font-bold">{counts?.with_translator || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Completed</p>
              <p className="text-lg sm:text-xl font-bold">{counts?.completed || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Urgent Alert */}
      {counts && (counts.hac_review > 0 || counts.ready_for_submission > 0) && (
        <Card className="p-3 sm:p-4 border-orange-500/50 bg-orange-500/5">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold">Action Required</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {counts.hac_review > 0 && `${counts.hac_review} awaiting HAC review`}
                {counts.hac_review > 0 && counts.ready_for_submission > 0 && " • "}
                {counts.ready_for_submission > 0 && `${counts.ready_for_submission} ready for submission`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="workflow" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="workflow" className="gap-2">
            <Workflow className="h-4 w-4" />
            <span className="hidden sm:inline">Workflow Board</span>
            <span className="sm:hidden">Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="requirements" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Requirements</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="translators" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Sworn Translators</span>
            <span className="sm:hidden">Translators</span>
          </TabsTrigger>
          <TabsTrigger value="agencies" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Agencies</span>
            <span className="sm:hidden">Agencies</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-4">
          <TranslationWorkflowBoard />
        </TabsContent>

        <TabsContent value="requirements">
          <DocumentRequirementsList />
        </TabsContent>

        <TabsContent value="translators">
          <SwornTranslatorsList />
        </TabsContent>

        <TabsContent value="agencies">
          <TranslationAgenciesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};