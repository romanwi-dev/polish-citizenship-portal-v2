import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Users, FileText, CheckCircle2, AlertCircle, Edit, Download, Plus, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
        "p-3 border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group",
        variant === "greatgrandparent" && "min-w-[160px]",
        variant === "grandparent" && "min-w-[180px]",
        variant === "parent" && "min-w-[200px]",
        variant === "client" && "min-w-[240px]",
        variant === "spouse" && "min-w-[200px]"
      )}
      onClick={() => onEdit?.(personType)}>
        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          <p className="text-xs text-muted-foreground text-center">{title}</p>
        </div>
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
    <Card className={cn(
      "p-3 relative overflow-hidden group hover:shadow-lg transition-all border-border/50 cursor-pointer",
      variant === "greatgrandparent" && "bg-accent/5 border-accent/20 min-w-[160px]",
      variant === "grandparent" && "bg-accent/10 border-accent/30 min-w-[180px]",
      variant === "parent" && "bg-secondary/10 border-secondary/30 min-w-[200px]",
      variant === "spouse" && "bg-secondary/10 border-secondary/30 min-w-[200px]",
      variant === "client" && "bg-primary/10 border-primary/50 min-w-[240px]"
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
        <div className="flex gap-1 mt-2 flex-wrap">
          {completionRate === 100 ? (
            <CheckCircle2 className="h-3 w-3 text-green-600" />
          ) : (
            <AlertCircle className="h-3 w-3 text-orange-600" />
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold mb-2">Interactive Family Tree</h2>
          <p className="text-muted-foreground">Complete visualization with document tracking</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={onOpenMasterTable}
            className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-light bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/30 opacity-50 transition-colors"
          >
            <Edit className="mr-2 h-4 w-4 md:h-5 md:w-5 opacity-50" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-light">Master Data</span>
          </Button>
          <Button 
            onClick={handlePrint}
            className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-light bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/30 opacity-50 transition-colors"
          >
            <Download className="mr-2 h-4 w-4 md:h-5 md:w-5 opacity-50" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-light">Print</span>
          </Button>
          <Button 
            onClick={handleExport}
            className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-light bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/30 opacity-50 transition-colors"
          >
            <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5 opacity-50" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-light">Export</span>
          </Button>
        </div>
      </div>

      {/* Overall progress */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Case Completion Status</h3>
          <Badge variant={completionRate === 100 ? "default" : "secondary"} className="text-lg px-3 py-1">
            {completionRate}%
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              completionRate === 100 ? "bg-green-600" :
              completionRate >= 70 ? "bg-blue-600" :
              completionRate >= 40 ? "bg-yellow-600" : "bg-red-600"
            )}
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{totalPeople}</div>
            <p className="text-xs text-muted-foreground">Family Members</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{completedDocs}/{totalDocs}</div>
            <p className="text-xs text-muted-foreground">Documents</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">{12 - totalPeople}</div>
            <p className="text-xs text-muted-foreground">Missing Profiles</p>
          </div>
        </div>
      </Card>

      {/* Tree Visualization */}
      <div className="relative space-y-8">
        {/* Polish Great Grandfathers Only */}
        <div>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Polish Great Grandfathers (4th Generation)
          </h3>
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
        </div>

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
      </div>

      {/* Document Gap Analysis */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Gap Analysis
        </h3>
        <div className="w-full">
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
    </div>
  );
};
