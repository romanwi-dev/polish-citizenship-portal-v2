import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award,
  FileEdit, 
  Mail, 
  Zap, 
  CheckCircle,
  Workflow,
  ClipboardList,
  UserCog,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";

export const CitizenshipDashboard = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

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
            Polish Citizenship
          </span>
        </h1>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 px-2 sm:px-0">
        {/* Active Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('active')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['active'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base sm:text-sm font-semibold text-foreground/90">Preparing</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Active citizenship applications in process</p>
            </div>
          </div>
        </div>

        {/* WSC Letters Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('wsc')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['wsc'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base sm:text-sm font-semibold text-foreground/90">Submitted</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Letters received from Masovian Voivoda requiring response</p>
            </div>
          </div>
        </div>

        {/* Push Schemes Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('push')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['push'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base sm:text-sm font-semibold text-foreground/90">Schemes</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Cases with active PUSH/NUDGE/SITDOWN strategies</p>
            </div>
          </div>
        </div>

        {/* Decisions Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('decisions')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['decisions'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow transition-all duration-300 border-2 border-primary/20"
              style={{ 
                backfaceVisibility: 'hidden',
                boxShadow: '0 0 30px hsla(221, 83%, 53%, 0.25), 0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base sm:text-sm font-semibold text-foreground/90">Decision</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Total citizenship confirmation decisions received</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="cards" className="space-y-4">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex h-auto p-0 w-max bg-transparent border-0 gap-1">
            <TabsTrigger value="cards" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30">
              Workflow Cards
            </TabsTrigger>
            <TabsTrigger value="timeline" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30">
              Supervisor
            </TabsTrigger>
            <TabsTrigger value="wsc" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30">
              WSC Letters
            </TabsTrigger>
            <TabsTrigger value="push" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30">
              Push Schemes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500/10 hover:bg-red-500/20 border-red-500/30">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards">
          <div className="text-center py-12">
            <Workflow className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Workflow Cards</h3>
            <p className="text-muted-foreground">Workflow features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="text-center py-12">
            <Workflow className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">13-Stage Timeline</h3>
            <p className="text-muted-foreground">Timeline visualization coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="supervisor">
          <div className="text-center py-12">
            <UserCog className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Supervisor Dashboard</h3>
            <p className="text-muted-foreground">Supervisor features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="wsc">
          <div className="text-center py-12">
            <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">WSC Letter Management</h3>
            <p className="text-muted-foreground">WSC letter tracking coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="push">
          <div className="text-center py-12">
            <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Push Schemes</h3>
            <p className="text-muted-foreground">PUSH/NUDGE/SITDOWN strategies coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">Success rates and analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Professional Service Info */}
      <div className="mt-12 text-center space-y-4 max-w-4xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Professional Citizenship Application Service
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Our expert team manages the entire citizenship confirmation process, from application drafting to WSC correspondence. With strategic push schemes and HAC supervision, we maximize your success rate and minimize waiting times.
        </p>
      </div>
    </div>
  );
};