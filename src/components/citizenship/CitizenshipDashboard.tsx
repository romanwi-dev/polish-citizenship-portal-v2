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
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <Award className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Polish Citizenship</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage citizenship applications, WSC letters, and push schemes
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                  <FileEdit className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Active</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    0
                  </p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg shrink-0">
                  <Mail className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">WSC Letters</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    0
                  </p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg shrink-0">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Push Schemes</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    0
                  </p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg shrink-0">
                  <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Decisions</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    0
                  </p>
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
          <TabsList className="inline-flex gap-2 h-auto p-2 w-max">
            <TabsTrigger value="cards" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Workflow className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Workflow Cards</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Workflow className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <UserCog className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Supervisor</span>
            </TabsTrigger>
            <TabsTrigger value="wsc" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Mail className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>WSC Letters</span>
            </TabsTrigger>
            <TabsTrigger value="push" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Zap className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Push Schemes</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Analytics</span>
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