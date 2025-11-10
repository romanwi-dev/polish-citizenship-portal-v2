import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users, FileText, CheckCircle2, AlertCircle, Edit, Download, Plus, Eye, EyeOff, Sparkles, Map, Clock, Maximize2, Boxes, Split, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FamilyTree3D } from "./family-tree/FamilyTree3D";
import { PDFPreviewPanel } from "./family-tree/PDFPreviewPanel";
import { AISuggestionsPanel } from "./family-tree/AISuggestionsPanel";

interface Person {
  firstName: string;
  lastName: string;
  maidenName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  dateOfMarriage?: string;
  placeOfMarriage?: string;
  dateOfEmigration?: string;
  dateOfNaturalization?: string;
  isAlive?: boolean;
  notes?: string; // Biographical notes
  documents?: {
    birthCertificate?: boolean;
    marriageCertificate?: boolean;
    deathCertificate?: boolean;
    passport?: boolean;
    naturalizationDocs?: boolean;
  };
}

interface FamilyTreeInteractiveProps {
  clientData: Person & { sex?: string };
  spouse?: Person;
  father?: Person;
  mother?: Person;
  paternalGrandfather?: Person;
  paternalGrandmother?: Person;
  maternalGrandfather?: Person;
  maternalGrandmother?: Person;
  paternalGreatGrandfather?: Person;
  paternalGreatGrandmother?: Person;
  maternalGreatGrandfather?: Person;
  maternalGreatGrandmother?: Person;
  onEdit?: (personType: string) => void;
  onOpenMasterTable?: () => void;
}

const PersonCardInteractive = ({ 
  person, 
  title, 
  personType,
  variant = "default",
  onEdit 
}: { 
  person?: Person; 
  title: string;
  personType: string;
  icon?: any;
  variant?: "default" | "grandparent" | "greatgrandparent" | "parent" | "client" | "spouse";
  onEdit?: (personType: string) => void;
}) => {
  if (!person?.firstName && !person?.lastName) {
    return (
      <Card className={cn(
        "p-3 border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group relative",
        variant === "greatgrandparent" && "min-w-[160px]",
        variant === "grandparent" && "min-w-[180px]",
        variant === "parent" && "min-w-[200px]",
        variant === "client" && "min-w-[240px]",
        variant === "spouse" && "min-w-[200px]"
      )}>
        <div className="flex flex-col items-center justify-center gap-2 opacity-50" onClick={() => onEdit?.(personType)}>
          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          <p className="text-xs text-muted-foreground text-center">{title}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="absolute bottom-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            // This would trigger AI suggestions
            toast.info('Add some family data first to get AI suggestions');
          }}
        >
          <Brain className="h-3 w-3 text-primary" />
        </Button>
      </Card>
    );
  }

  const docs = person.documents || {};
  const requiredDocs = ['birthCertificate', 'marriageCertificate', 'passport'];
  const completedDocs = requiredDocs.filter(doc => docs[doc as keyof typeof docs]).length;
  const totalDocs = requiredDocs.length;
  const completionRate = (completedDocs / totalDocs) * 100;

  const fullName = `${person.firstName} ${person.lastName}`;
  const displayName = person.maidenName 
    ? `${person.firstName} ${person.maidenName} (${person.lastName})`
    : fullName;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "p-3 relative overflow-hidden group hover:shadow-2xl transition-all border-border/50 cursor-pointer",
        variant === "greatgrandparent" && "bg-gradient-to-br from-accent/5 to-accent/10 border-accent/30 min-w-[160px]",
        variant === "grandparent" && "bg-gradient-to-br from-accent/10 to-accent/15 border-accent/40 min-w-[180px]",
        variant === "parent" && "bg-gradient-to-br from-secondary/10 to-secondary/15 border-secondary/40 min-w-[200px]",
        variant === "spouse" && "bg-gradient-to-br from-secondary/10 to-secondary/15 border-secondary/40 min-w-[200px]",
        variant === "client" && "bg-gradient-to-br from-primary/10 to-primary/15 border-primary/50 min-w-[240px]"
      )}
      onClick={() => onEdit?.(personType)}>
      {/* Status bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        completionRate === 100 ? "from-green-500 to-green-600" : 
        completionRate >= 50 ? "from-yellow-500 to-orange-500" : 
        "from-red-500 to-red-600"
      )} style={{ width: `${completionRate}%` }} />
      
      <div className="mt-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-light opacity-70 mb-1">{title}</p>
            <h4 className="font-light text-xs leading-tight mb-1 opacity-90">{displayName}</h4>
          </div>
          <Badge variant={completionRate === 100 ? "default" : "destructive"} className="text-[9px] px-1 py-0">
            {completedDocs}/{totalDocs}
          </Badge>
        </div>
        
        <div className="space-y-1 text-xs text-muted-foreground font-light opacity-70">
          {person.dateOfBirth && (
            <div className="flex items-center gap-1">
              <span className="font-medium">DOB:</span>
              <span>{new Date(person.dateOfBirth).toLocaleDateString()}</span>
            </div>
          )}
          
          {person.placeOfBirth && (
            <div className="flex items-center gap-1">
              <span className="font-medium">POB:</span>
              <span className="truncate">{person.placeOfBirth}</span>
            </div>
          )}

          {person.dateOfMarriage && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Marriage:</span>
              <span>{new Date(person.dateOfMarriage).toLocaleDateString()}</span>
            </div>
          )}

          {person.dateOfEmigration && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Emigrated:</span>
              <span>{new Date(person.dateOfEmigration).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Document status icons */}
        <div className="flex gap-1 mt-2 flex-wrap items-center justify-between">
          <div className="flex gap-1">
            {completionRate === 100 ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <AlertCircle className="h-3 w-3 text-orange-600" />
            )}
          </div>
          
          {/* AI Suggestions Button */}
          {completionRate < 100 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // @ts-ignore - onEdit will handle this
                window.handleOpenAISuggestions?.(personType);
              }}
              title="Get AI suggestions"
            >
              <Brain className="h-3 w-3 text-primary" />
            </Button>
          )}
        </div>
        
        {/* Biographical Notes Preview */}
        {person.notes && (
          <div className="text-[9px] text-muted-foreground mt-2 p-1 bg-muted/50 rounded">
            <strong>Notes:</strong> {person.notes.substring(0, 50)}{person.notes.length > 50 ? '...' : ''}
          </div>
        )}
      </div>
    </Card>
    </motion.div>
  );
};

export const FamilyTreeInteractive = ({
  clientData,
  spouse,
  father,
  mother,
  paternalGrandfather,
  paternalGrandmother,
  maternalGrandfather,
  maternalGrandmother,
  paternalGreatGrandfather,
  paternalGreatGrandmother,
  maternalGreatGrandfather,
  maternalGreatGrandmother,
  onEdit,
  onOpenMasterTable
}: FamilyTreeInteractiveProps) => {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'standard' | 'full'>('standard');
  const [showBloodline, setShowBloodline] = useState(false);
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const [showPDFComparison, setShowPDFComparison] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiTargetPerson, setAiTargetPerson] = useState<string | null>(null);

  // Determine Polish bloodline
  const isPolish = (person?: Person) => {
    // You can enhance this by adding an isPolish flag to Person interface
    return person?.placeOfBirth?.toLowerCase().includes('poland') || 
           person?.placeOfBirth?.toLowerCase().includes('polska');
  };

  // Handle AI suggestion acceptance
  const handleAcceptSuggestion = (field: string, value: string) => {
    // This would update the master data table
    toast.success(`Updated ${field} with AI suggestion`);
    // In a real implementation, call the update function here
  };

  // Get missing fields for a person
  const getMissingFields = (person?: Person): string[] => {
    if (!person) return [];
    const fields = [];
    if (!person.firstName) fields.push('firstName');
    if (!person.lastName) fields.push('lastName');
    if (!person.dateOfBirth) fields.push('dateOfBirth');
    if (!person.placeOfBirth) fields.push('placeOfBirth');
    return fields;
  };

  // Open AI suggestions for a specific person
  const handleOpenAISuggestions = (personType: string) => {
    setAiTargetPerson(personType);
    setShowAISuggestions(true);
  };

  // Expose handler globally for PersonCard
  if (typeof window !== 'undefined') {
    (window as any).handleOpenAISuggestions = handleOpenAISuggestions;
  }

  const allPeople = [
    { person: clientData, type: 'client', title: 'Client' },
    { person: spouse, type: 'spouse', title: 'Spouse' },
    { person: father, type: 'father', title: 'Father' },
    { person: mother, type: 'mother', title: 'Mother' },
    { person: paternalGrandfather, type: 'paternalGrandfather', title: 'Paternal Grandfather' },
    { person: paternalGrandmother, type: 'paternalGrandmother', title: 'Paternal Grandmother' },
    { person: maternalGrandfather, type: 'maternalGrandfather', title: 'Maternal Grandfather' },
    { person: maternalGrandmother, type: 'maternalGrandmother', title: 'Maternal Grandmother' },
    { person: paternalGreatGrandfather, type: 'paternalGreatGrandfather', title: 'Paternal Great Grandfather' },
    { person: paternalGreatGrandmother, type: 'paternalGreatGrandmother', title: 'Paternal Great Grandmother' },
    { person: maternalGreatGrandfather, type: 'maternalGreatGrandfather', title: 'Maternal Great Grandfather' },
    { person: maternalGreatGrandmother, type: 'maternalGreatGrandmother', title: 'Maternal Great Grandmother' },
  ];

  const totalPeople = allPeople.filter(p => p.person?.firstName).length;
  const totalDocs = totalPeople * 3;
  const completedDocs = allPeople.reduce((sum, p) => {
    if (!p.person?.documents) return sum;
    return sum + Object.values(p.person.documents).filter(Boolean).length;
  }, 0);
  const completionRate = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog");
  };

  const handleExport = () => {
    toast.success("Exporting family tree data");
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 flex-wrap justify-center mb-8"
      >
        <Button 
          onClick={() => setShowAISuggestions(!showAISuggestions)}
          variant={showAISuggestions ? "default" : "outline"}
          className="transition-all hover:scale-105"
        >
          <Brain className="mr-2 h-4 w-4" />
          {showAISuggestions ? 'Hide' : 'Show'} AI Suggestions
        </Button>
        <Button 
          onClick={() => setShowPDFComparison(!showPDFComparison)}
          variant={showPDFComparison ? "default" : "outline"}
          className="transition-all hover:scale-105"
        >
          <Split className="mr-2 h-4 w-4" />
          {showPDFComparison ? 'Hide' : 'Show'} PDF Preview
        </Button>
        <Button 
          onClick={() => setActiveView(activeView === '2d' ? '3d' : '2d')}
          variant={activeView === '3d' ? "default" : "outline"}
          className="transition-all hover:scale-105"
          disabled={showPDFComparison}
        >
          <Boxes className="mr-2 h-4 w-4" />
          {activeView === '2d' ? 'Switch to 3D' : 'Switch to 2D'}
        </Button>
        {activeView === '2d' && !showPDFComparison && (
          <>
            <Button 
              onClick={() => setShowBloodline(!showBloodline)}
              variant={showBloodline ? "default" : "outline"}
              className="transition-all hover:scale-105"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Polish Bloodline
            </Button>
            <Button 
              onClick={() => setShowOnlyMissing(!showOnlyMissing)}
              variant={showOnlyMissing ? "default" : "outline"}
              className="transition-all hover:scale-105"
            >
              {showOnlyMissing ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
              Show Missing
            </Button>
            <Button 
              onClick={() => {
                const modes: Array<'compact' | 'standard' | 'full'> = ['compact', 'standard', 'full'];
                const currentIndex = modes.indexOf(viewMode);
                setViewMode(modes[(currentIndex + 1) % modes.length]);
                toast.success(`View mode: ${modes[(currentIndex + 1) % modes.length]}`);
              }}
              variant="outline"
              className="transition-all hover:scale-105"
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              {viewMode === 'compact' ? 'Compact' : viewMode === 'standard' ? 'Standard' : 'Full'}
            </Button>
          </>
        )}
        <Button 
          onClick={onOpenMasterTable}
          variant="outline"
          className="transition-all hover:scale-105"
        >
          <Edit className="mr-2 h-4 w-4" />
          Master Data
        </Button>
        <Button 
          onClick={handlePrint}
          variant="outline"
          className="transition-all hover:scale-105"
        >
          <Download className="mr-2 h-4 w-4" />
          Print
        </Button>
      </motion.div>

      {/* Overall progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Case Completion Status</h3>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Badge 
                variant={completionRate === 100 ? "default" : "secondary"} 
                className={cn(
                  "text-lg px-4 py-1.5 font-bold",
                  completionRate === 100 && "bg-green-600 animate-pulse"
                )}
              >
                {completionRate}%
              </Badge>
            </motion.div>
          </div>
          
          <div className="w-full bg-muted/50 rounded-full h-6 overflow-hidden border border-border/50 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn(
                "h-full transition-all duration-500 rounded-full relative overflow-hidden",
                completionRate === 100 ? "bg-gradient-to-r from-green-500 to-green-600" :
                completionRate >= 70 ? "bg-gradient-to-r from-blue-500 to-blue-600" :
                completionRate >= 40 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : 
                "bg-gradient-to-r from-red-500 to-red-600"
              )}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <motion.div 
              className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-primary mb-1">{totalPeople}</div>
              <p className="text-xs text-muted-foreground">Family Members</p>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-lg bg-secondary/5 border border-secondary/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-secondary mb-1">{completedDocs}/{totalDocs}</div>
              <p className="text-xs text-muted-foreground">Documents</p>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-accent mb-1">{12 - totalPeople}</div>
              <p className="text-xs text-muted-foreground">Missing Profiles</p>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* AI Suggestions Sidebar */}
      <AnimatePresence>
        {showAISuggestions && aiTargetPerson && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[450px] bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <AISuggestionsPanel
              familyData={allPeople.filter(p => p.person?.firstName).map(p => ({
                type: p.type,
                ...p.person
              }))}
              targetPerson={aiTargetPerson}
              targetPersonLabel={allPeople.find(p => p.type === aiTargetPerson)?.title || aiTargetPerson}
              missingFields={getMissingFields(allPeople.find(p => p.type === aiTargetPerson)?.person)}
              onAcceptSuggestion={handleAcceptSuggestion}
            />
            <Button
              onClick={() => setShowAISuggestions(false)}
              variant="ghost"
              className="absolute top-4 right-4"
              size="sm"
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D / 2D / PDF Comparison View Toggle */}
      <AnimatePresence mode="wait">
        {showPDFComparison ? (
          <motion.div
            key="pdf-comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left: Interactive Tree */}
            <div className="space-y-6">
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Interactive Family Tree
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Edit data on the left, see changes reflected in PDF on the right
                </p>
              </Card>
              
              {/* Tree Visualization */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative space-y-8"
              >
                {/* Polish Great Grandfathers Only */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                        Polish Great Grandfathers (4th Generation)
                      </span>
                    </h3>
                    {showBloodline && (
                      <Badge variant="outline" className="bg-red-950/30 border-red-900/50 text-red-400">
                        🇵🇱 Polish Bloodline Origin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Only the 2 Polish great-grandfathers are relevant. Great-grandmothers excluded per process requirements.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                    <PersonCardInteractive 
                      person={paternalGreatGrandfather}
                      title="Paternal Great Grandfather"
                      personType="paternalGreatGrandfather"
                      variant="greatgrandparent"
                      onEdit={onEdit}
                    />
                    <PersonCardInteractive 
                      person={maternalGreatGrandfather}
                      title="Maternal Great Grandfather"
                      personType="maternalGreatGrandfather"
                      variant="greatgrandparent"
                      onEdit={onEdit}
                    />
                  </div>
                </motion.div>

                {/* Grandparents Layer */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Grandparents (3rd Generation)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-3 font-medium">Paternal</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <PersonCardInteractive 
                          person={paternalGrandfather}
                          title="Paternal Grandfather"
                          personType="paternalGrandfather"
                          variant="grandparent"
                          onEdit={onEdit}
                        />
                        <PersonCardInteractive 
                          person={paternalGrandmother}
                          title="Paternal Grandmother"
                          personType="paternalGrandmother"
                          variant="grandparent"
                          onEdit={onEdit}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-3 font-medium">Maternal</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <PersonCardInteractive 
                          person={maternalGrandfather}
                          title="Maternal Grandfather"
                          personType="maternalGrandfather"
                          variant="grandparent"
                          onEdit={onEdit}
                        />
                        <PersonCardInteractive 
                          person={maternalGrandmother}
                          title="Maternal Grandmother"
                          personType="maternalGrandmother"
                          variant="grandparent"
                          onEdit={onEdit}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parents Layer */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Parents (2nd Generation)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                    <PersonCardInteractive 
                      person={father}
                      title="Father"
                      personType="father"
                      variant="parent"
                      onEdit={onEdit}
                    />
                    <PersonCardInteractive 
                      person={mother}
                      title="Mother"
                      personType="mother"
                      variant="parent"
                      onEdit={onEdit}
                    />
                  </div>
                </div>

                {/* Client Layer */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Applicant & Spouse (1st Generation)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                    <PersonCardInteractive 
                      person={clientData}
                      title={clientData.sex === 'M' ? 'Male Applicant' : clientData.sex === 'F' ? 'Female Applicant' : 'Applicant'}
                      personType="client"
                      variant="client"
                      onEdit={onEdit}
                    />
                    <PersonCardInteractive 
                      person={spouse}
                      title="Spouse"
                      personType="spouse"
                      variant="spouse"
                      onEdit={onEdit}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: PDF Preview */}
            <PDFPreviewPanel 
              templateType="family-tree"
              className="sticky top-4 h-[calc(100vh-8rem)]"
            />
          </motion.div>
        ) : activeView === '3d' ? (
          <motion.div
            key="3d-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <FamilyTree3D
              clientData={clientData}
              spouse={spouse}
              father={father}
              mother={mother}
              paternalGrandfather={paternalGrandfather}
              paternalGrandmother={paternalGrandmother}
              maternalGrandfather={maternalGrandfather}
              maternalGrandmother={maternalGrandmother}
              paternalGreatGrandfather={paternalGreatGrandfather}
              paternalGreatGrandmother={paternalGreatGrandmother}
              maternalGreatGrandfather={maternalGreatGrandfather}
              maternalGreatGrandmother={maternalGreatGrandmother}
              onNodeClick={onEdit}
            />
          </motion.div>
        ) : (
          <motion.div
            key="2d-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tree Visualization */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative space-y-8"
            >
              {/* Polish Great Grandfathers Only */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                      Polish Great Grandfathers (4th Generation)
                    </span>
                  </h3>
                  {showBloodline && (
                    <Badge variant="outline" className="bg-red-950/30 border-red-900/50 text-red-400">
                      🇵🇱 Polish Bloodline Origin
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Only the 2 Polish great-grandfathers are relevant. Great-grandmothers excluded per process requirements.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                  <PersonCardInteractive 
                    person={paternalGreatGrandfather}
                    title="Paternal Great Grandfather"
                    personType="paternalGreatGrandfather"
                    variant="greatgrandparent"
                    onEdit={onEdit}
                  />
                  <PersonCardInteractive 
                    person={maternalGreatGrandfather}
                    title="Maternal Great Grandfather"
                    personType="maternalGreatGrandfather"
                    variant="greatgrandparent"
                    onEdit={onEdit}
                  />
                </div>
              </motion.div>

              {/* Grandparents Layer */}
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Grandparents (3rd Generation)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 font-medium">Paternal</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PersonCardInteractive 
                        person={paternalGrandfather}
                        title="Paternal Grandfather"
                        personType="paternalGrandfather"
                        variant="grandparent"
                        onEdit={onEdit}
                      />
                      <PersonCardInteractive 
                        person={paternalGrandmother}
                        title="Paternal Grandmother"
                        personType="paternalGrandmother"
                        variant="grandparent"
                        onEdit={onEdit}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 font-medium">Maternal</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PersonCardInteractive 
                        person={maternalGrandfather}
                        title="Maternal Grandfather"
                        personType="maternalGrandfather"
                        variant="grandparent"
                        onEdit={onEdit}
                      />
                      <PersonCardInteractive 
                        person={maternalGrandmother}
                        title="Maternal Grandmother"
                        personType="maternalGrandmother"
                        variant="grandparent"
                        onEdit={onEdit}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Parents Layer */}
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Parents (2nd Generation)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                  <PersonCardInteractive 
                    person={father}
                    title="Father"
                    personType="father"
                    variant="parent"
                    onEdit={onEdit}
                  />
                  <PersonCardInteractive 
                    person={mother}
                    title="Mother"
                    personType="mother"
                    variant="parent"
                    onEdit={onEdit}
                  />
                </div>
              </div>

              {/* Client Layer */}
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Applicant & Spouse (1st Generation)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
                  <PersonCardInteractive 
                    person={clientData}
                    title={clientData.sex === 'M' ? 'Male Applicant' : clientData.sex === 'F' ? 'Female Applicant' : 'Applicant'}
                    personType="client"
                    variant="client"
                    onEdit={onEdit}
                  />
                  <PersonCardInteractive 
                    person={spouse}
                    title="Spouse"
                    personType="spouse"
                    variant="spouse"
                    onEdit={onEdit}
                  />
                </div>
              </div>
            </motion.div>

            {/* Document Gap Analysis */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Gap Analysis
              </h3>
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Family Member</TableHead>
                      <TableHead className="text-center">Birth Cert</TableHead>
                      <TableHead className="text-center">Marriage Cert</TableHead>
                      <TableHead className="text-center">Passport</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPeople.filter(p => p.person?.firstName).map(({ person, title, type }) => {
                      const docs = person?.documents || {};
                      const completed = Object.values(docs).filter(Boolean).length;
                      const total = 3;
                      return (
                        <TableRow key={type} className="cursor-pointer hover:bg-muted/50" onClick={() => onEdit?.(type)}>
                          <TableCell className="font-medium">{title}</TableCell>
                          <TableCell className="text-center">
                            {docs.birthCertificate ? 
                              <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : 
                              <AlertCircle className="h-4 w-4 text-red-600 mx-auto" />
                            }
                          </TableCell>
                          <TableCell className="text-center">
                            {docs.marriageCertificate ? 
                              <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : 
                              <AlertCircle className="h-4 w-4 text-orange-600 mx-auto" />
                            }
                          </TableCell>
                          <TableCell className="text-center">
                            {docs.passport ? 
                              <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : 
                              <AlertCircle className="h-4 w-4 text-red-600 mx-auto" />
                            }
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={completed === total ? "default" : "destructive"}>
                              {completed}/{total}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
