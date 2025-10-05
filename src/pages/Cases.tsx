import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, User, Calendar, FileText, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

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
  }
];

const Cases = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const totalCards = mockCases.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
    setIsFlipped(false);
    setIsFullscreen(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setIsFlipped(false);
    setIsFullscreen(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFullscreen) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(true);
    setIsFlipped(false);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isFullscreen) return;
      
      e.preventDefault();
      
      // Debounce scroll events for slower navigation
      if (scrollTimeoutRef.current) return;
      
      scrollTimeoutRef.current = setTimeout(() => {
        scrollTimeoutRef.current = null;
      }, 500); // 500ms delay between scrolls
      
      if (e.deltaY > 0) {
        // Scroll down - next card
        setCurrentIndex((prev) => (prev + 1) % totalCards);
      } else if (e.deltaY < 0) {
        // Scroll up - previous card
        setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
      }
      
      setIsFlipped(false);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [totalCards, isFullscreen]);

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
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-20 left-20 w-72 h-72 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 md:w-96 md:h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />

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

          {/* Carousel Controls */}
          <div className="flex justify-between items-center mb-6 md:mb-8 max-w-6xl mx-auto">
            <Button
              onClick={prevSlide}
              size="icon"
              className="glass-card hover-glow h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0"
              variant="ghost"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
            
            <div className="text-xs md:text-sm text-muted-foreground">
              Case {currentIndex + 1} of {totalCards}
            </div>
            
            <Button
              onClick={nextSlide}
              size="icon"
              className="glass-card hover-glow h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0"
              variant="ghost"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </div>

          {/* 3D Circular Carousel */}
          <div 
            ref={scrollContainerRef}
            className="relative max-w-6xl mx-auto h-[600px] md:h-[800px] flex items-center justify-center" 
            style={{ perspective: '2500px' }}
          >
            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              {mockCases.map((clientCase, index) => {
                const offset = index - currentIndex;
                const angle = (360 / totalCards) * offset;
                const isFront = offset === 0;
                const radius = 400;
                
                // Calculate 3D position
                const rotateY = angle;
                const translateZ = -radius;
                const scale = isFront ? 1.5 : 0.7;
                const opacity = isFront ? 0.9 : 0.3;
                const zIndex = isFront ? 10 : 1;
                
                return (
                  <div
                    key={clientCase.id}
                    className="absolute top-1/2 left-1/2 w-full max-w-lg transition-all duration-700 ease-out"
                    style={{
                      transform: `translate(-50%, -50%) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
                      transformStyle: 'preserve-3d',
                      opacity,
                      zIndex,
                      pointerEvents: isFront ? 'auto' : 'none',
                    }}
                  >
                    {/* Flippable Card Container */}
                    <div
                      className="relative w-full transition-transform duration-700"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isFront && isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        cursor: isFront ? 'pointer' : 'default',
                      }}
                      onClick={isFront ? handleCardClick : undefined}
                      onDoubleClick={isFront ? handleCardDoubleClick : undefined}
                    >
                      {/* Front of Card */}
                      <div
                        className="w-full"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(0deg)',
                        }}
                      >
                        <div className={`glass-card rounded-2xl p-4 md:p-6 bg-gradient-to-br ${getStatusColor(clientCase.status)} border shadow-2xl backdrop-blur-xl`}>
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-base md:text-lg">{clientCase.name}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">{clientCase.country}</p>
                              </div>
                            </div>
                            <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize flex-shrink-0`}>
                              {clientCase.status}
                            </span>
                          </div>

                          {/* Ancestry Info */}
                          <div className="mb-3 md:mb-4 p-2 md:p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                            <p className="text-xs md:text-sm text-muted-foreground mb-1">Polish Ancestry</p>
                            <p className="text-xs md:text-sm font-medium">{clientCase.ancestry}</p>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Started</p>
                                <p className="text-xs md:text-sm font-medium">{new Date(clientCase.startDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                              <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">Documents</p>
                                <p className="text-xs md:text-sm font-medium">{clientCase.documents}</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs md:text-sm">
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
                            <div className="mt-3 md:mt-4 flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              <span className="text-xs md:text-sm font-medium text-green-400">Application Approved</span>
                            </div>
                          )}

                          {isFront && (
                            <div className="mt-3 text-center text-xs text-muted-foreground">
                              Click to flip • Double-click for fullscreen
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div
                        className="absolute top-0 left-0 w-full"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <div className={`glass-card rounded-2xl p-4 md:p-6 bg-gradient-to-br ${getStatusColor(clientCase.status)} border shadow-2xl backdrop-blur-xl min-h-[400px] flex flex-col justify-center`}>
                          <h3 className="text-xl md:text-2xl font-bold mb-4 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                          {isFront && (
                            <div className="mt-4 text-center text-xs text-muted-foreground">
                              Click to flip back • Double-click for fullscreen
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fullscreen Modal */}
          {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setIsFullscreen(false)}>
              <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => setIsFullscreen(false)}
                  size="icon"
                  variant="ghost"
                  className="absolute -top-12 right-0 h-10 w-10 rounded-full glass-card hover-glow"
                >
                  <span className="text-2xl">×</span>
                </Button>
                <div className={`glass-card rounded-2xl p-6 md:p-8 bg-gradient-to-br ${getStatusColor(mockCases[currentIndex].status)} border shadow-2xl`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-2xl md:text-3xl">{mockCases[currentIndex].name}</h2>
                        <p className="text-lg text-muted-foreground">{mockCases[currentIndex].country}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(mockCases[currentIndex].status)} capitalize`}>
                      {mockCases[currentIndex].status}
                    </span>
                  </div>

                  {/* Ancestry Info */}
                  <div className="mb-6 p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground mb-2">Polish Ancestry</p>
                    <p className="text-lg font-medium">{mockCases[currentIndex].ancestry}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-background/30">
                      <Calendar className="w-6 h-6 text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-lg font-medium">{new Date(mockCases[currentIndex].startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/30">
                      <FileText className="w-6 h-6 text-secondary mb-2" />
                      <p className="text-sm text-muted-foreground">Documents</p>
                      <p className="text-lg font-medium">{mockCases[currentIndex].documents}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-2xl">{mockCases[currentIndex].progress}%</span>
                    </div>
                    <div className="h-3 bg-background/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                        style={{ width: `${mockCases[currentIndex].progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Completion Badge */}
                  {mockCases[currentIndex].status === "completed" && (
                    <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <span className="text-lg font-medium text-green-400">Application Approved</span>
                    </div>
                  )}

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Click outside or press × to close
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {mockCases.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "w-6 md:w-8 bg-gradient-to-r from-primary to-accent" 
                    : "w-2 bg-muted hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cases;
