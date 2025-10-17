import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users,
  FileText, 
  Globe, 
  Heart, 
  Briefcase,
  Workflow,
  ClipboardList,
  UserCog,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { WorkflowNavigation } from "@/components/workflows/WorkflowNavigation";

export const ExtendedServicesDashboard = () => {
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
            Extended Services
          </span>
        </h1>
      </div>

      {/* Workflow Navigation */}
      <WorkflowNavigation />

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {/* Family Legal Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('family')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['family'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg shrink-0">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Family Legal</p>
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
              <p className="text-sm text-muted-foreground text-center">Extended family members being assisted with citizenship</p>
            </div>
          </div>
        </div>

        {/* Document Procurement Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('documents')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['documents'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg shrink-0">
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Documents</p>
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
              <p className="text-sm text-muted-foreground text-center">Special document procurement projects active</p>
            </div>
          </div>
        </div>

        {/* International Coordination Card */}
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
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg shrink-0">
                  <Globe className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">International</p>
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
              <p className="text-sm text-muted-foreground text-center">International coordination cases with foreign authorities</p>
            </div>
          </div>
        </div>

        {/* Heritage Research Card */}
        <div 
          className="relative h-[140px] cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={() => toggleFlip('heritage')}
        >
          <div
            className="absolute inset-0 transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: flippedCards['heritage'] ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div 
              className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-3 bg-pink-500/10 rounded-lg shrink-0">
                  <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-pink-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">Heritage</p>
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
              <p className="text-sm text-muted-foreground text-center">Deep genealogical research projects in progress</p>
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
              <span>Service Cards</span>
            </TabsTrigger>
            <TabsTrigger value="family" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Users className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Family Legal</span>
            </TabsTrigger>
            <TabsTrigger value="procurement" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <FileText className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Document Procurement</span>
            </TabsTrigger>
            <TabsTrigger value="heritage" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Heart className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Heritage Research</span>
            </TabsTrigger>
            <TabsTrigger value="relocation" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <Briefcase className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Relocation</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 px-8 py-3 text-base sm:text-sm whitespace-nowrap">
              <TrendingUp className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards">
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Service Overview</h3>
            <p className="text-muted-foreground">Extended service features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="family">
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Extended Family Legal Services</h3>
            <p className="text-muted-foreground">Family legal assistance dashboard coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="procurement">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Document Procurement</h3>
            <p className="text-muted-foreground">Special document procurement tracking coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="heritage">
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Heritage Research</h3>
            <p className="text-muted-foreground">Genealogical research dashboard coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="relocation">
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Relocation Support</h3>
            <p className="text-muted-foreground">Relocation assistance features coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Service Analytics</h3>
            <p className="text-muted-foreground">Extended service analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Professional Service Info */}
      <div className="mt-12 text-center space-y-4 max-w-4xl mx-auto px-4">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Premium Extended Services
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Our extended services provide comprehensive support beyond standard citizenship processing. From assisting multiple family members to conducting deep heritage research and coordinating with international authorities, we offer personalized solutions for complex cases requiring expert attention and specialized services.
        </p>
      </div>
    </div>
  );
};
