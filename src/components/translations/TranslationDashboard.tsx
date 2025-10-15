import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  ClipboardList,
  UserCog
} from "lucide-react";
import { TranslationWorkflowTimeline } from "./TranslationWorkflowTimeline";
import TranslationWorkflowCards from "./TranslationWorkflowCards";
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
    <div className="space-y-4 sm:space-y-6 bg-[hsl(221,83%,15%)] min-h-screen p-4 sm:p-6 -m-4 sm:-m-6">
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
        <div className="glass-card p-4 sm:p-6 rounded-lg hover-glow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">Total</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {counts?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6 rounded-lg hover-glow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg shrink-0">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">Upload Pending</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {counts?.upload_pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6 rounded-lg hover-glow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg shrink-0">
              <Languages className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">With Translator</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {counts?.with_translator || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6 rounded-lg hover-glow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg shrink-0">
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">Completed</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {counts?.completed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Alert */}
      {counts && (counts.hac_review > 0 || counts.ready_for_submission > 0) && (
        <div className="glass-card p-4 sm:p-6 border-orange-500/50 bg-orange-500/5 rounded-lg hover-glow">
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
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="cards" className="space-y-4">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex gap-2 h-auto p-2 w-max">
            <TabsTrigger value="cards" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Workflow className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Workflow Cards</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Workflow className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Translation Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <UserCog className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Supervisor</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <ClipboardList className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="translators" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Users className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Sworn Translators</span>
            </TabsTrigger>
            <TabsTrigger value="agencies" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Building2 className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Agencies</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards" className="space-y-4">
          <TranslationWorkflowCards />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <TranslationWorkflowTimeline />
        </TabsContent>

        <TabsContent value="supervisor">
          <div className="text-center py-12">
            <UserCog className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Supervisor Dashboard</h3>
            <p className="text-muted-foreground">Supervisor features coming soon</p>
          </div>
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

      {/* Professional Service Info */}
      <div className="mt-12 text-center space-y-4 max-w-4xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Professional Translation Service
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Every document is handled with precision. Our AI-powered translation system uses official Polish templates, followed by expert HAC verification and sworn translator certification. This ensures your documents meet all legal requirements for WSC and USC submissions.
        </p>
      </div>
    </div>
  );
};