import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableCardBack } from "@/components/workflows/EditableCardBack";
import CivilActsWorkflowCards from "./CivilActsWorkflowCards";
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.pending || ''}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Documents</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <EditableCardBack 
              workflowName="civil-acts"
              cardId="documents"
            />
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.in_progress || ''}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Applications</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <EditableCardBack 
              workflowName="civil-acts"
              cardId="applications"
            />
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.awaiting || ''}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Awaiting</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <EditableCardBack 
              workflowName="civil-acts"
              cardId="awaiting"
            />
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
                  <p className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{counts?.completed || ''}</p>
                  <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Certificates</p>
                </div>
              </div>
            </div>
            {/* Back */}
            <EditableCardBack 
              workflowName="civil-acts"
              cardId="certificates"
            />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="cards" className="space-y-4">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="flex gap-1 w-full justify-between h-auto p-0 bg-transparent border-0">
            <TabsTrigger value="cards" className="flex-1 h-11 md:h-12 lg:h-14 py-0 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-700/40 data-[state=active]:border-red-700/50 data-[state=active]:shadow-[0_0_40px_rgba(185,28,28,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Workflow
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex-1 h-11 md:h-12 lg:h-14 py-0 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-700/40 data-[state=active]:border-red-700/50 data-[state=active]:shadow-[0_0_40px_rgba(185,28,28,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="flex-1 h-11 md:h-12 lg:h-14 py-0 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-700/40 data-[state=active]:border-red-700/50 data-[state=active]:shadow-[0_0_40px_rgba(185,28,28,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Supervisor
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex-1 h-11 md:h-12 lg:h-14 py-0 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-700/40 data-[state=active]:border-red-700/50 data-[state=active]:shadow-[0_0_40px_rgba(185,28,28,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Directory
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex-1 h-11 md:h-12 lg:h-14 py-0 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-700/40 data-[state=active]:border-red-700/50 data-[state=active]:shadow-[0_0_40px_rgba(185,28,28,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Agent
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex-1 h-11 md:h-12 lg:h-14 py-0 bg-red-500/20 border-2 border-red-500/30 hover:bg-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all data-[state=active]:bg-red-700/40 data-[state=active]:border-red-700/50 data-[state=active]:shadow-[0_0_40px_rgba(185,28,28,0.5)] text-white/100 data-[state=active]:text-white/50 font-bold text-lg">
              Certificates
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards">
          <CivilActsWorkflowCards />
        </TabsContent>

        <TabsContent value="timeline">
        </TabsContent>

        <TabsContent value="supervisor">
        </TabsContent>

        <TabsContent value="directory">
        </TabsContent>

        <TabsContent value="agent">
        </TabsContent>

        <TabsContent value="payment">
        </TabsContent>
      </Tabs>
    </div>
  );
};