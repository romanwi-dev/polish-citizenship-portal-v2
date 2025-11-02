import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CASE_STAGES, 
  PART_NAMES, 
  getTotalStages, 
  getClientVisibleStages, 
  getMilestones,
  getPartStageCount 
} from "@/lib/caseStages";
import { Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaseStageVisualizationProps {
  completedStages: string[];
  currentStage: string;
  onStageActivate?: (stageId: string) => void;
}

export function CaseStageVisualization({ 
  completedStages, 
  currentStage,
  onStageActivate 
}: CaseStageVisualizationProps) {
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [highlightedStage, setHighlightedStage] = useState<string | null>(null);
  const stageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const pipelineScrollRef = useRef<HTMLDivElement | null>(null);
  const totalStages = getTotalStages();
  const completedCount = completedStages.length;
  const clientVisibleCount = getClientVisibleStages();
  const milestonesCount = getMilestones();
  const overallProgress = Math.round((completedCount / totalStages) * 100);

  const pendingStages = CASE_STAGES.filter(
    stage => !completedStages.includes(stage.id) && stage.id !== currentStage
  );

  const getStageStatus = (stageId: string) => {
    if (completedStages.includes(stageId)) return 'completed';
    if (stageId === currentStage) return 'active';
    return 'pending';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-cyan-400';
      case 'medium': return 'text-blue-400';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStageCardColor = (status: string, priority: string, isMilestone: boolean) => {
    if (isMilestone && status === 'completed') return 'bg-yellow-500/30 border-yellow-500/70 hover:bg-yellow-500/40';
    if (isMilestone && status === 'active') return 'bg-yellow-500/25 border-yellow-500/60 hover:bg-yellow-500/35';
    if (isMilestone) return 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30';
    
    if (status === 'completed') return 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30';
    if (status === 'active') return 'bg-primary/20 border-primary/50 hover:bg-primary/30';
    // Pending stages colored by priority
    if (priority === 'critical') return 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30';
    if (priority === 'high') return 'bg-secondary/20 border-secondary/50 hover:bg-secondary/30';
    if (priority === 'medium') return 'bg-accent/20 border-accent/50 hover:bg-accent/30';
    if (priority === 'low') return 'bg-muted/20 border-muted/50 hover:bg-muted/30';
    return 'bg-card/50 border-border/30 hover:bg-card/70';
  };

  const handlePartClick = (partNum: number) => {
    const newSelectedPart = partNum === selectedPart ? null : partNum;
    setSelectedPart(newSelectedPart);
    setHighlightedStage(null);
    
    if (newSelectedPart) {
      const firstStageOfPart = CASE_STAGES.find(s => s.part === newSelectedPart);
      if (firstStageOfPart && stageRefs.current[firstStageOfPart.id]) {
        setTimeout(() => {
          stageRefs.current[firstStageOfPart.id]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
          });
        }, 100);
      }
    }
  };

  const handleStageClick = (stageId: string) => {
    setHighlightedStage(stageId);
    const stage = CASE_STAGES.find(s => s.id === stageId);
    if (stage) {
      setSelectedPart(stage.part);
    }
    onStageActivate?.(stageId);
  };

  const handlePendingStageClick = (stageId: string) => {
    setHighlightedStage(stageId);
    const stage = CASE_STAGES.find(s => s.id === stageId);
    if (stage) {
      setSelectedPart(stage.part);
      setTimeout(() => {
        stageRefs.current[stageId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest', 
          inline: 'center' 
        });
      }, 100);
    }
    onStageActivate?.(stageId);
  };

  const filteredStages = selectedPart 
    ? CASE_STAGES.filter(s => s.part === selectedPart)
    : CASE_STAGES;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Cases Pipeline</h2>
          <div className="hidden md:flex items-center gap-4 lg:gap-6 text-xs sm:text-sm flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
              <span className="text-red-500">Critical</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-400" />
              <span className="text-cyan-400">High</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-400" />
              <span className="text-blue-400">Medium</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">Low</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Progress Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-4 bg-card/50">
            <div className="text-2xl sm:text-3xl font-bold text-center mb-1 sm:mb-2">{totalStages}</div>
            <div className="text-xs sm:text-sm text-center text-muted-foreground">Total Stages</div>
          </Card>
          <Card className="p-3 sm:p-4 bg-green-500/10">
            <div className="text-2xl sm:text-3xl font-bold text-center text-green-500 mb-1 sm:mb-2">{completedCount}</div>
            <div className="text-xs sm:text-sm text-center text-green-500">Completed</div>
          </Card>
          <Card className="p-3 sm:p-4 bg-blue-500/10">
            <div className="text-2xl sm:text-3xl font-bold text-center text-blue-400 mb-1 sm:mb-2">{clientVisibleCount}</div>
            <div className="text-xs sm:text-sm text-center text-blue-400">Client Visible</div>
          </Card>
          <Card className="p-3 sm:p-4 bg-yellow-500/10">
            <div className="text-2xl sm:text-3xl font-bold text-center text-yellow-400 mb-1 sm:mb-2">{milestonesCount}</div>
            <div className="text-xs sm:text-sm text-center text-yellow-400">Milestones</div>
          </Card>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-medium">Overall Progress</span>
            <span className="text-xl sm:text-2xl font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 sm:h-3" />
        </div>
      </Card>

      {/* Part Progression */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Part Progression</h3>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Click to jump • Double-click to complete</p>
        </div>
        <div className="w-full overflow-x-auto scrollbar-hide max-w-full">
          <div className="flex gap-4 pb-4 min-w-max">
            {PART_NAMES.map((partName, index) => {
              const partNum = index + 1;
              const partStages = CASE_STAGES.filter(s => s.part === partNum);
              const partCompleted = partStages.filter(s => completedStages.includes(s.id)).length;
              const partTotal = partStages.length;
              const isActive = partStages.some(s => s.id === currentStage);
              
              return (
                <button
                  key={partNum}
                  className={cn(
                    "flex flex-col items-center min-w-[70px] sm:min-w-[80px] cursor-pointer transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1.5 sm:p-2",
                    selectedPart === partNum && "ring-2 ring-primary bg-primary/5"
                  )}
                  onClick={() => handlePartClick(partNum)}
                  type="button"
                >
                  <div 
                    className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 transition-all",
                      partCompleted === partTotal 
                        ? "bg-green-500/20 text-green-500 border-2 border-green-500/50"
                        : isActive 
                        ? "bg-secondary/20 text-secondary border-2 border-secondary/50"
                        : partCompleted > 0
                        ? "bg-accent/20 text-accent border-2 border-accent/50"
                        : "bg-muted/20 text-muted-foreground border border-muted/30",
                      selectedPart === partNum && "scale-105 shadow-lg"
                    )}
                  >
                    {partNum}
                  </div>
                  <Progress 
                    value={(partCompleted / partTotal) * 100} 
                    className="w-12 sm:w-16 h-1 mb-0.5 sm:mb-1" 
                  />
                  <span className="text-xs font-medium">
                    {partCompleted}/{partTotal}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Stage Pipeline */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Stage Pipeline</h3>
          <div className="flex items-center gap-2 sm:gap-4">
            {selectedPart && (
              <Button variant="outline" size="sm" onClick={() => setSelectedPart(null)} className="text-xs sm:text-sm">
                Show All
              </Button>
            )}
            <span className="text-xs sm:text-sm text-muted-foreground">
              {selectedPart ? `Part ${selectedPart}` : `${filteredStages.length} stages`}
            </span>
          </div>
        </div>
        <div className="w-full overflow-x-auto scrollbar-hide max-w-full" ref={pipelineScrollRef}>
          <div className="flex gap-4 pb-4 min-w-max">
            {filteredStages.map((stage) => {
              const status = getStageStatus(stage.id);
              const isVisible = stage.isClientVisible;
              const isHighlighted = highlightedStage === stage.id;
              
              return (
                <Card
                  key={stage.id}
                  ref={(el) => { stageRefs.current[stage.id] = el; }}
                  className={cn(
                    "min-w-[200px] p-4 transition-all cursor-pointer hover:shadow-lg relative",
                    getStageCardColor(status, stage.priority, stage.isMilestone),
                    isHighlighted && "ring-2 ring-primary shadow-2xl scale-105"
                  )}
                  onClick={() => handleStageClick(stage.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {stage.order}
                    </Badge>
                    {status === 'completed' && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {status === 'active' && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <h4 className="font-semibold mb-1 text-sm">{stage.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {stage.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Part {stage.part}</span>
                    <div className="flex gap-1">
                      {isVisible && (
                        <Badge variant="secondary" className="text-xs">Client</Badge>
                      )}
                      {stage.isMilestone && (
                        <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Milestone
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Stage Management - Pending Stages */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Stage Management</h3>
          <span className="text-xs sm:text-sm text-muted-foreground">
            Current: {CASE_STAGES.find(s => s.id === currentStage)?.name || 'None'}
          </span>
        </div>

        <h4 className="flex items-center gap-2 text-md font-medium mb-4">
          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
          Pending Stages
        </h4>

        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {pendingStages.map((stage) => (
              <Card 
                key={stage.id} 
                className={cn(
                  "p-4 bg-card/50 transition-all cursor-pointer hover:bg-card/70",
                  highlightedStage === stage.id && "ring-2 ring-primary bg-card"
                )}
                onClick={() => handlePendingStageClick(stage.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold">{stage.name}</h5>
                      {stage.isClientVisible && (
                        <Badge variant="secondary" className="text-xs">Client</Badge>
                      )}
                      {stage.isMilestone && (
                        <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Client Milestone
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {stage.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Part {stage.part}</span>
                      <span className={getPriorityColor(stage.priority)}>
                        {stage.priority.toUpperCase()} priority
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePendingStageClick(stage.id);
                    }}
                    className="ml-4"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Activate
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
