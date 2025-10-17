import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Archive, 
  FileSearch, 
  Users, 
  FileText, 
  TrendingUp,
  Workflow,
  ClipboardList,
  UserCog,
  Building2
} from "lucide-react";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";

export const ArchivesSearchDashboard = () => {
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
            Archives Search
          </span>
        </h1>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {/* Polish Archives Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('polish')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['polish'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-sm font-medium text-muted-foreground truncate">Polish</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    12
                  </p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Active searches in Polish archives</p>
            </div>
          </div>
        </div>

        {/* International Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('international')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['international'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-sm font-medium text-muted-foreground truncate">International</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    8
                  </p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Ongoing international archive searches</p>
            </div>
          </div>
        </div>

        {/* Documents Found Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('found')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['found'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-sm font-medium text-muted-foreground truncate">Found</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    47
                  </p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Total documents recovered from archives</p>
            </div>
          </div>
        </div>

        {/* Success Rate Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('success')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['success'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-sm font-medium text-muted-foreground truncate">Success</p>
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    73%
                  </p>
                </div>
              </div>
            </div>
            {/* Back */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-sm text-muted-foreground text-center">Documents located success rate across all searches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="cards" className="space-y-4">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex gap-2 h-auto p-2 w-max">
            <TabsTrigger value="cards" className="px-10 py-3 text-base sm:text-sm whitespace-nowrap w-[180px]">
              <span>Workflow Cards</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="px-10 py-3 text-base sm:text-sm whitespace-nowrap w-[180px]">
              <span>Search Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="px-10 py-3 text-base sm:text-sm whitespace-nowrap w-[180px]">
              <span>Supervisor</span>
            </TabsTrigger>
            <TabsTrigger value="partners" className="px-10 py-3 text-base sm:text-sm whitespace-nowrap w-[180px]">
              <span>Partners</span>
            </TabsTrigger>
            <TabsTrigger value="directory" className="px-10 py-3 text-base sm:text-sm whitespace-nowrap w-[180px]">
              <span>Archive Directory</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="px-10 py-3 text-base sm:text-sm whitespace-nowrap w-[180px]">
              <span>Templates</span>
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
            <h3 className="text-xl font-semibold mb-2">Search Timeline</h3>
            <p className="text-muted-foreground">Timeline features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="supervisor">
          <div className="text-center py-12">
            <UserCog className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Supervisor Dashboard</h3>
            <p className="text-muted-foreground">Supervisor features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="partners">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Genealogy Partners</h3>
            <p className="text-muted-foreground">Partner management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="directory">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Archive Directory</h3>
            <p className="text-muted-foreground">Archive database coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Request Templates</h3>
            <p className="text-muted-foreground">Archive request generator coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Professional Service Info */}
      <div className="mt-12 text-center space-y-4 max-w-4xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Professional Archives Research Service
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Our network of genealogy partners and direct archive contacts ensures comprehensive document recovery. We handle Polish and international archives with expert precision, providing authenticated historical documents for your citizenship case.
        </p>
      </div>
    </div>
  );
};