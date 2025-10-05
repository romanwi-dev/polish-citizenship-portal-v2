import { useState } from "react";
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
  const cardsPerView = 3;
  const maxIndex = Math.max(0, mockCases.length - cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

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
      
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-700" />

        <div className="container px-4 mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Client Portfolio
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Cases Management
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track and manage all client citizenship applications in one place
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
            <Button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              size="icon"
              className="glass-card hover-glow h-12 w-12 rounded-full"
              variant="ghost"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} - {Math.min(currentIndex + cardsPerView, mockCases.length)} of {mockCases.length}
            </div>
            
            <Button
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              size="icon"
              className="glass-card hover-glow h-12 w-12 rounded-full"
              variant="ghost"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Carousel */}
          <div className="relative max-w-7xl mx-auto overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-700 ease-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
              }}
            >
              {mockCases.map((clientCase) => (
                <div
                  key={clientCase.id}
                  className="min-w-[calc(33.333%-1rem)] flex-shrink-0"
                  style={{ flexBasis: `calc(${100 / cardsPerView}% - 1rem)` }}
                >
                  <div className={`glass-card rounded-2xl p-6 h-full bg-gradient-to-br ${getStatusColor(clientCase.status)} border hover-glow transition-all duration-300 hover:scale-105`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{clientCase.name}</h3>
                          <p className="text-sm text-muted-foreground">{clientCase.country}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize`}>
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
                        <Calendar className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Started</p>
                          <p className="text-sm font-medium">{new Date(clientCase.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                        <FileText className="w-4 h-4 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Documents</p>
                          <p className="text-sm font-medium">{clientCase.documents}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "w-8 bg-gradient-to-r from-primary to-accent" 
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
