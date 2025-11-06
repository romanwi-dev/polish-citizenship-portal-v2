import { useState } from "react";
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
import { TranslationDashboardWorkflow } from "./TranslationDashboardWorkflow";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";
import { useTranslationNotifications } from "@/hooks/useTranslationNotifications";
import { Badge } from "@/components/ui/badge";
import { useTranslationCounts } from "@/hooks/useWorkflowCounts";

export const TranslationDashboard = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const { data: counts } = useTranslationCounts();
  const { pendingReviewCount } = useTranslationNotifications();

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.in_progress || 0}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">In Progress</p>
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.pending || 0}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Pending</p>
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.quality_check || 0}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Quality Check</p>
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.completed || 0}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Completed</p>
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
      {pendingReviewCount > 0 ? (
        <div className="glass-card p-4 sm:p-6 border-orange-500/50 bg-orange-500/5 rounded-lg hover-glow">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm sm:text-base font-semibold">Action Required</p>
                <Badge variant="destructive" className="animate-pulse">
                  {pendingReviewCount} new
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {pendingReviewCount} translation{pendingReviewCount > 1 ? 's' : ''} awaiting review
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Content Tabs */}
      <Tabs defaultValue="cards" className="space-y-4">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="flex gap-1 w-full justify-between h-auto p-0 bg-transparent border-0">
            <TabsTrigger value="cards" className="flex-1 h-14 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-950/80 data-[state=active]:border-red-900 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg relative">
              Workflow Cards
              {pendingReviewCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full animate-pulse"
                >
                  {pendingReviewCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex-1 h-14 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-950/80 data-[state=active]:border-red-900 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Translation Timeline
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="flex-1 h-14 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-950/80 data-[state=active]:border-red-900 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Supervisor
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex-1 h-14 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-950/80 data-[state=active]:border-red-900 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Requirements
            </TabsTrigger>
            <TabsTrigger value="translators" className="flex-1 h-14 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-950/80 data-[state=active]:border-red-900 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Sworn Translators
            </TabsTrigger>
            <TabsTrigger value="agencies" className="flex-1 h-14 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-950/80 data-[state=active]:border-red-900 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Agencies
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards" className="space-y-4">
          <TranslationWorkflowCards />
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <div className="text-center py-12">
            <Workflow className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Translation Workflow Timeline</h3>
            <p className="text-muted-foreground">Select a translation job from the Workflow Cards tab to view its detailed timeline</p>
          </div>
        </TabsContent>

        <TabsContent value="supervisor">
          <div className="text-center py-12">
            <UserCog className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Supervisor Dashboard</h3>
            <p className="text-muted-foreground">Supervisor features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="requirements">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Translation Requirements</h3>
            <p className="text-muted-foreground">Translation requirements and specifications coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="translators">
          {/* Content removed temporarily */}
        </TabsContent>

        <TabsContent value="agencies">
          {/* Content removed temporarily */}
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