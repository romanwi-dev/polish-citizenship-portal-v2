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
import { useState } from "react";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";

export const TranslationDashboard = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const { data: counts } = useQuery({
    queryKey: ["translation-workflow-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_translation_workflow_counts" as any);
      if (error) throw error;
      return data[0] as any;
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Translations
          </span>
        </h1>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 px-2 sm:px-0">
        {/* Prepared Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('prepared')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['prepared'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20 opacity-50"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-base sm:text-sm font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Prepared</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Total documents prepared for translation workflow</p>
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('pending')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['pending'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20 opacity-50"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-base sm:text-sm font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Pending</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Documents awaiting client upload to portal</p>
            </div>
          </div>
        </div>

        {/* Translator Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('translator')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['translator'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20 opacity-50"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-base sm:text-sm font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Translator</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Documents currently with sworn translator for certification</p>
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('completed')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['completed'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20 opacity-50"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-base sm:text-sm font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Completed</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Certified translations ready for submission to authorities</p>
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
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <TabsList className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-transparent border-0 h-auto p-0">
            <TabsTrigger value="cards" className="h-[140px] rounded-lg opacity-50 glass-card hover-glow data-[state=active]:opacity-100 transition-all duration-300 border-2 border-primary/20">
              <span className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Workflow Cards</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="h-[140px] rounded-lg opacity-50 glass-card hover-glow data-[state=active]:opacity-100 transition-all duration-300 border-2 border-primary/20">
              <span className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Translation Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="h-[140px] rounded-lg opacity-50 glass-card hover-glow data-[state=active]:opacity-100 transition-all duration-300 border-2 border-primary/20">
              <span className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Supervisor</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="h-[140px] rounded-lg opacity-50 glass-card hover-glow data-[state=active]:opacity-100 transition-all duration-300 border-2 border-primary/20">
              <span className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Requirements</span>
            </TabsTrigger>
            <TabsTrigger value="translators" className="h-[140px] rounded-lg opacity-50 glass-card hover-glow data-[state=active]:opacity-100 transition-all duration-300 border-2 border-primary/20">
              <span className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Sworn Translators</span>
            </TabsTrigger>
            <TabsTrigger value="agencies" className="h-[140px] rounded-lg opacity-50 glass-card hover-glow data-[state=active]:opacity-100 transition-all duration-300 border-2 border-primary/20">
              <span className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Agencies</span>
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