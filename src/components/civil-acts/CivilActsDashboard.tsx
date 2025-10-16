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

export const CivilActsDashboard = () => {
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
          <FileCheck className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Polish Civil Acts</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage Polish civil registry documents (birth and marriage certificates)
        </p>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                  <FileCheck className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Preparing</p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg shrink-0">
                  <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Submitted</p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg shrink-0">
                  <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Awaiting</p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg shrink-0">
                  <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Received</p>
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
              <p className="text-sm text-muted-foreground text-center">Polish civil acts received and ready for use in citizenship case</p>
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
            <TabsTrigger value="directory" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Building2 className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>USC Directory</span>
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Users className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Civil Acts Agent</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <CreditCard className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Payment Tracker</span>
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