import { useState, useEffect } from "react";
import { User, Calendar, FileText, CheckCircle2, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ClientCase {
  id: number;
  name: string;
  country: string;
  status: "active" | "completed" | "pending";
  startDate: string;
  documents: number;
  progress: number;
  ancestry: string;
}

const mockCases: ClientCase[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    country: "USA",
    status: "active",
    startDate: "2024-01-15",
    documents: 12,
    progress: 75,
    ancestry: "Grandmother from Warsaw"
  },
  {
    id: 2,
    name: "Michael Cohen",
    country: "Israel",
    status: "completed",
    startDate: "2023-08-20",
    documents: 18,
    progress: 100,
    ancestry: "Great-grandfather from Krakow"
  },
  {
    id: 3,
    name: "Emma Williams",
    country: "UK",
    status: "active",
    startDate: "2024-03-10",
    documents: 8,
    progress: 45,
    ancestry: "Grandfather from Gdańsk"
  },
  {
    id: 4,
    name: "David Kowalski",
    country: "Canada",
    status: "pending",
    startDate: "2024-06-01",
    documents: 5,
    progress: 20,
    ancestry: "Mother from Poznań"
  },
  {
    id: 5,
    name: "Anna Schmidt",
    country: "Germany",
    status: "active",
    startDate: "2024-02-28",
    documents: 15,
    progress: 60,
    ancestry: "Father from Wrocław"
  },
  {
    id: 6,
    name: "James O'Brien",
    country: "Ireland",
    status: "completed",
    startDate: "2023-11-05",
    documents: 20,
    progress: 100,
    ancestry: "Great-grandmother from Lublin"
  },
  {
    id: 7,
    name: "Maria Rodriguez",
    country: "Spain",
    status: "active",
    startDate: "2024-04-12",
    documents: 10,
    progress: 55,
    ancestry: "Grandfather from Szczecin"
  },
  {
    id: 8,
    name: "John Smith",
    country: "Australia",
    status: "pending",
    startDate: "2024-07-08",
    documents: 6,
    progress: 30,
    ancestry: "Great-grandfather from Łódź"
  },
  {
    id: 9,
    name: "Sophie Dubois",
    country: "France",
    status: "active",
    startDate: "2024-02-20",
    documents: 14,
    progress: 70,
    ancestry: "Grandmother from Białystok"
  },
  {
    id: 10,
    name: "Lars Anderson",
    country: "Sweden",
    status: "completed",
    startDate: "2023-09-15",
    documents: 22,
    progress: 100,
    ancestry: "Mother from Katowice"
  },
  {
    id: 11,
    name: "Chen Wei",
    country: "Singapore",
    status: "active",
    startDate: "2024-05-03",
    documents: 9,
    progress: 40,
    ancestry: "Great-grandmother from Toruń"
  },
  {
    id: 12,
    name: "Isabella Costa",
    country: "Brazil",
    status: "pending",
    startDate: "2024-08-01",
    documents: 7,
    progress: 25,
    ancestry: "Grandfather from Opole"
  }
];

const Cases = () => {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [fullscreenCase, setFullscreenCase] = useState<ClientCase | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreenCase) {
        setFullscreenCase(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenCase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "from-green-500/20 to-green-600/20 border-green-500/30";
      case "active":
        return "from-primary/20 to-secondary/20 border-primary/30";
      case "pending":
        return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
      default:
        return "from-muted/20 to-muted/30 border-muted/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "active":
        return "bg-primary/20 text-primary border-primary/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />
        <div className="absolute top-20 left-20 w-72 h-72 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-72 h-72 md:w-96 md:h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse delay-700 pointer-events-none" />

        <div className="container px-4 mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-block px-4 py-2 rounded-full glass-card mb-4 md:mb-6">
              <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Client Portfolio
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Cases Management
              </span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Track and manage all client citizenship applications in one place
            </p>
          </div>

          {/* Carousel */}
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: false,
              skipSnaps: false,
            }}
            setApi={setApi}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {mockCases.map((clientCase, index) => {
                const isFlipped = flippedCard === clientCase.id;
                const isCenterCard = index === currentIndex;
                
                return (
                  <CarouselItem key={clientCase.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div 
                      className="transition-all duration-500 ease-out relative"
                      style={{
                        transform: isCenterCard ? 'scale(1.05)' : 'scale(1)',
                        zIndex: isCenterCard ? 30 : 10,
                      }}
                    >
                      {/* Flippable Card */}
                      <div
                        className="relative w-full h-[500px] transition-all duration-700 ease-out"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Front of Card */}
                        <div
                          className="absolute inset-0 w-full h-full cursor-pointer hover:scale-105 transition-transform duration-300"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlippedCard(isFlipped ? null : clientCase.id);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setFullscreenCase(clientCase);
                            setFlippedCard(null);
                          }}
                        >
                          <div className={`h-full glass-card rounded-2xl p-6 bg-gradient-to-br ${getStatusColor(clientCase.status)} border shadow-2xl backdrop-blur-xl flex flex-col transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)]`}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-lg">{clientCase.name}</h3>
                                  <p className="text-sm text-muted-foreground">{clientCase.country}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize flex-shrink-0`}>
                                {clientCase.status}
                              </span>
                            </div>

                            {/* Ancestry Info */}
                            <div className="mb-4 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                              <p className="text-sm text-muted-foreground mb-1">Polish Ancestry</p>
                              <p className="text-sm font-medium">{clientCase.ancestry}</p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Started</p>
                                  <p className="text-sm font-medium">{new Date(clientCase.startDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                                <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Documents</p>
                                  <p className="text-sm font-medium">{clientCase.documents}</p>
                                </div>
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="space-y-2 mt-auto">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-bold">{clientCase.progress}%</span>
                              </div>
                              <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                                  style={{ width: `${clientCase.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* Completion Badge */}
                            {clientCase.status === "completed" && (
                              <div className="mt-4 flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-green-400">Application Approved</span>
                              </div>
                            )}

                            <div className="mt-4 text-center text-xs text-muted-foreground">
                              Click to flip • Double-click for fullscreen
                            </div>
                          </div>
                        </div>

                        {/* Back of Card */}
                        <div
                          className="absolute inset-0 w-full h-full cursor-pointer"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFlippedCard(null);
                          }}
                        >
                          <div className={`h-full glass-card rounded-2xl p-6 bg-gradient-to-br ${getStatusColor(clientCase.status)} border shadow-2xl backdrop-blur-xl flex flex-col justify-center transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)]`}>
                            <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              Case Details
                            </h3>
                            <div className="space-y-3">
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground">Client ID</p>
                                <p className="font-medium">#{clientCase.id.toString().padStart(6, '0')}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground">Total Documents</p>
                                <p className="font-medium">{clientCase.documents} files uploaded</p>
                              </div>
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground">Application Status</p>
                                <p className="font-medium capitalize">{clientCase.status}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-background/50">
                                <p className="text-xs text-muted-foreground">Origin Country</p>
                                <p className="font-medium">{clientCase.country}</p>
                              </div>
                            </div>
                            <div className="mt-4 text-center text-xs text-muted-foreground">
                              Click to flip back
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="glass-card hover-glow -left-4 md:-left-12" />
            <CarouselNext className="glass-card hover-glow -right-4 md:-right-12" />
          </Carousel>
        </div>
      </section>

      {/* Fullscreen Modal */}
      {fullscreenCase && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreenCase(null)}
        >
          <div 
            className="relative w-full max-w-4xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={() => setFullscreenCase(null)}
              size="icon"
              variant="ghost"
              className="absolute -top-12 right-0 glass-card hover-glow hover:rotate-90 transition-transform duration-300"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <div className={`glass-card rounded-2xl p-8 bg-gradient-to-br ${getStatusColor(fullscreenCase.status)} border shadow-2xl backdrop-blur-xl`}>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{fullscreenCase.name}</h2>
                      <p className="text-lg text-muted-foreground">{fullscreenCase.country}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background/50">
                      <p className="text-sm text-muted-foreground mb-2">Polish Ancestry</p>
                      <p className="text-lg font-medium">{fullscreenCase.ancestry}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground mb-2">Started</p>
                        <p className="font-medium">{new Date(fullscreenCase.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-background/50">
                        <p className="text-sm text-muted-foreground mb-2">Documents</p>
                        <p className="font-medium">{fullscreenCase.documents} files</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(fullscreenCase.status)} capitalize`}>
                      {fullscreenCase.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-muted-foreground">Progress</span>
                      <span className="text-2xl font-bold">{fullscreenCase.progress}%</span>
                    </div>
                    <div className="h-4 bg-background/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                        style={{ width: `${fullscreenCase.progress}%` }}
                      />
                    </div>
                  </div>

                  {fullscreenCase.status === "completed" && (
                    <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <span className="text-lg font-medium text-green-400">Application Approved</span>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-sm text-muted-foreground mb-2">Client ID</p>
                    <p className="text-xl font-mono">#{fullscreenCase.id.toString().padStart(6, '0')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                Press ESC or click outside to close
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
