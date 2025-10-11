import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface CaseFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  processingModeFilter: string;
  onProcessingModeChange: (value: string) => void;
  scoreFilter: [number, number];
  onScoreChange: (value: [number, number]) => void;
  ageFilter: string;
  onAgeChange: (value: string) => void;
  progressFilter: [number, number];
  onProgressChange: (value: [number, number]) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export const CaseFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  processingModeFilter,
  onProcessingModeChange,
  scoreFilter,
  onScoreChange,
  ageFilter,
  onAgeChange,
  progressFilter,
  onProgressChange,
  onClearFilters,
  activeFiltersCount,
}: CaseFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name or case code..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filters Sheet - Mobile Optimized */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative min-w-[44px] min-h-[44px]">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto bg-background border-border w-[90vw] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-foreground">Filter Cases</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Apply filters to narrow down your case list
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Processing Mode Filter */}
              <div className="space-y-2">
                <Label className="text-foreground">Processing Mode</Label>
                <Select value={processingModeFilter} onValueChange={onProcessingModeChange}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="expedited">Expedited</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="vip_plus">VIP+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Client Score Filter */}
              <div className="space-y-2">
                <Label className="text-foreground">Client Score: {scoreFilter[0]} - {scoreFilter[1]}</Label>
                <Slider
                  value={scoreFilter}
                  onValueChange={(value) => onScoreChange(value as [number, number])}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              {/* Case Age Filter */}
              <div className="space-y-2">
                <Label className="text-foreground">Case Age</Label>
                <Select value={ageFilter} onValueChange={onAgeChange}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="All ages" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="new">New (0-30 days)</SelectItem>
                    <SelectItem value="recent">Recent (31-90 days)</SelectItem>
                    <SelectItem value="medium">Medium (91-180 days)</SelectItem>
                    <SelectItem value="old">Old (180+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Filter */}
              <div className="space-y-2">
                <Label className="text-foreground">Progress: {progressFilter[0]}% - {progressFilter[1]}%</Label>
                <Slider
                  value={progressFilter}
                  onValueChange={(value) => onProgressChange(value as [number, number])}
                  min={0}
                  max={100}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={onClearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="capitalize">
              Status: {statusFilter.replace("_", " ")}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onStatusChange("all")}
              />
            </Badge>
          )}
          {processingModeFilter !== "all" && (
            <Badge variant="secondary" className="capitalize">
              Mode: {processingModeFilter.replace("_", " ")}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onProcessingModeChange("all")}
              />
            </Badge>
          )}
          {ageFilter !== "all" && (
            <Badge variant="secondary">
              Age: {ageFilter}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onAgeChange("all")}
              />
            </Badge>
          )}
          {(scoreFilter[0] !== 0 || scoreFilter[1] !== 100) && (
            <Badge variant="secondary">
              Score: {scoreFilter[0]}-{scoreFilter[1]}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onScoreChange([0, 100])}
              />
            </Badge>
          )}
          {(progressFilter[0] !== 0 || progressFilter[1] !== 100) && (
            <Badge variant="secondary">
              Progress: {progressFilter[0]}%-{progressFilter[1]}%
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onProgressChange([0, 100])}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
