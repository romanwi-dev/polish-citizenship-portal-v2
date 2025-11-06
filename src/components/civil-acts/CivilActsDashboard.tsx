import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileCheck,
  Building2, 
  Users, 
  CheckCircle,
  Clock,
  Workflow,
  ClipboardList,
  UserCog,
  CreditCard
} from "lucide-react";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";
import { useCivilActsCounts } from "@/hooks/useWorkflowCounts";

export const CivilActsDashboard = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const { data: counts } = useCivilActsCounts();

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
            Polish Civil Acts
          </span>
        </h1>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 px-2 sm:px-0">
        {/* Preparing Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('preparing')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['preparing'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Pending Requests</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Applications being prepared for submission to USC</p>
            </div>
          </div>
        </div>

        {/* Submitted Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('submitted')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['submitted'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
              <p className="text-sm text-muted-foreground text-center">Applications submitted to Polish Civil Registry offices</p>
            </div>
          </div>
        </div>

        {/* Awaiting Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('awaiting')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['awaiting'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.awaiting || 0}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Awaiting Documents</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Awaiting response from USC offices (4-12 weeks typical)</p>
            </div>
          </div>
        </div>

        {/* Received Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('received')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['received'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
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
              <p className="text-sm text-muted-foreground text-center">Polish civil acts received and ready for use in citizenship case</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="cards" className="space-y-4">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="flex gap-1 w-full justify-between h-auto p-0 bg-transparent border-0">
            <TabsTrigger value="cards" className="flex-1 h-14 bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-500/40 data-[state=active]:border-red-500 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              Workflow Cards
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 h-14 bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-500/40 data-[state=active]:border-red-500 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="flex-1 h-14 bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-500/40 data-[state=active]:border-red-500 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              Supervisor
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex-1 h-14 bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-500/40 data-[state=active]:border-red-500 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              USC Directory
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex-1 h-14 bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-500/40 data-[state=active]:border-red-500 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              Civil Acts Agent
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex-1 h-14 bg-red-500/20 text-white font-bold text-lg border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-500/40 data-[state=active]:border-red-500 data-[state=active]:shadow-[0_0_40px_rgba(239,68,68,0.5)]">
              Payment Tracker
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
            <h3 className="text-xl font-semibold mb-2">8-Stage Timeline</h3>
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

        <TabsContent value="directory">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">USC Directory</h3>
            <p className="text-muted-foreground">Polish Civil Registry offices database coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="agent">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Civil Acts Agent</h3>
            <p className="text-muted-foreground">Civil Acts Agent supervision dashboard coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Payment Tracker</h3>
            <p className="text-muted-foreground">Payment tracking coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Professional Service Info */}
      <div className="mt-12 text-center space-y-4 max-w-4xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Professional Civil Acts Service
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Our dedicated Civil Acts Agent handles all Polish civil registry applications with precision. From preparing applications to tracking submissions and ensuring timely receipt, we manage every detail to provide you with certified Polish birth and marriage certificates for your citizenship case.
        </p>
      </div>
    </div>
  );
};