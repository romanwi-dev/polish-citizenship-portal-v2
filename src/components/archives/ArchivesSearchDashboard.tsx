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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow opacity-50"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Polish</p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow opacity-50"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">International</p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow opacity-50"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Found</p>
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
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow opacity-50"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <div className="min-w-0 text-center">
                  <p className="text-base font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Success</p>
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
          <TabsList className="inline-flex h-auto p-0 w-max bg-transparent border-0 gap-1">
            <TabsTrigger value="cards" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500 hover:bg-red-600 border-red-500">
              Workflow Cards
            </TabsTrigger>
            <TabsTrigger value="timeline" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500 hover:bg-red-600 border-red-500">
              Search Timeline
            </TabsTrigger>
            <TabsTrigger value="supervisor" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500 hover:bg-red-600 border-red-500">
              Supervisor
            </TabsTrigger>
            <TabsTrigger value="partners" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500 hover:bg-red-600 border-red-500">
              Partners
            </TabsTrigger>
            <TabsTrigger value="directory" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500 hover:bg-red-600 border-red-500">
              Archive Directory
            </TabsTrigger>
            <TabsTrigger value="templates" className="px-8 py-3 text-base whitespace-nowrap h-14 font-medium w-[200px] rounded-none first:rounded-l-lg last:rounded-r-lg bg-red-500 hover:bg-red-600 border-red-500">
              Templates
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