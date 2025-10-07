import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users, MapPin, Calendar, Edit, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Person {
  firstName: string;
  lastName: string;
  maidenName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  isAlive?: boolean;
  isPolish?: boolean;
}

interface FamilyTreeProps {
  clientData: Person & {
    sex?: string;
  };
  father?: Person;
  mother?: Person;
  paternalGrandfather?: Person;
  paternalGrandmother?: Person;
  maternalGrandfather?: Person;
  maternalGrandmother?: Person;
  onEdit?: () => void;
}

const PersonCard = ({ 
  person, 
  title, 
  icon: Icon = User,
  variant = "default" 
}: { 
  person?: Person; 
  title: string; 
  icon?: any;
  variant?: "default" | "grandparent" | "parent" | "client";
}) => {
  if (!person?.firstName && !person?.lastName) {
    return (
      <Card className={cn(
        "p-4 border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group",
        variant === "grandparent" && "min-w-[180px]",
        variant === "parent" && "min-w-[200px]",
        variant === "client" && "min-w-[240px]"
      )}>
        <div className="flex flex-col items-center justify-center gap-2 opacity-50">
          <Plus className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
          <p className="text-xs text-muted-foreground text-center">{title}</p>
        </div>
      </Card>
    );
  }

  const fullName = `${person.firstName} ${person.lastName}`;
  const displayName = person.maidenName 
    ? `${person.firstName} ${person.maidenName} (${person.lastName})`
    : fullName;

  return (
    <Card className={cn(
      "p-4 relative overflow-hidden group hover:shadow-lg transition-all border-border/50",
      person.isPolish && "bg-red-950/30 border-red-900/50",
      !person.isPolish && variant === "grandparent" && "bg-accent/10 border-accent/30",
      !person.isPolish && variant === "parent" && "bg-secondary/10 border-secondary/30",
      !person.isPolish && variant === "client" && "bg-primary/10 border-primary/50",
      variant === "grandparent" && "min-w-[180px]",
      variant === "parent" && "min-w-[200px]",
      variant === "client" && "min-w-[240px]"
    )}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          person.isPolish && "bg-red-900/30",
          !person.isPolish && variant === "grandparent" && "bg-accent/20",
          !person.isPolish && variant === "parent" && "bg-secondary/20",
          !person.isPolish && variant === "client" && "bg-primary/20"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className={cn(
                "text-xs mb-1",
                person.isPolish ? "text-red-400 font-semibold" : "text-muted-foreground"
              )}>
                {title}
              </p>
              <h4 className="font-semibold text-sm leading-tight">{displayName}</h4>
            </div>
          </div>
          
          {person.dateOfBirth && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3" />
              <span>{new Date(person.dateOfBirth).toLocaleDateString()}</span>
            </div>
          )}
          
          {person.placeOfBirth && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{person.placeOfBirth}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const FamilyTree = ({
  clientData,
  father,
  mother,
  paternalGrandfather,
  paternalGrandmother,
  maternalGrandfather,
  maternalGrandmother,
  onEdit
}: FamilyTreeProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Polish Family Tree</h2>
          <p className="text-muted-foreground">Three generation ancestry visualization</p>
        </div>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Family Data
        </Button>
      </div>

      {/* Generation Legend */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary/50" />
          <span className="text-sm">Client</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-secondary/20 border-2 border-secondary/50" />
          <span className="text-sm">Parents</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-accent/20 border-2 border-accent/50" />
          <span className="text-sm">Grandparents</span>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="relative">
        {/* Grandparents Layer */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Grandparents
          </h3>
          <div className="grid grid-cols-2 gap-8">
            {/* Paternal Grandparents */}
            <div>
              <p className="text-sm text-muted-foreground mb-4 font-medium">Paternal</p>
              <div className="grid grid-cols-2 gap-4">
                <PersonCard 
                  person={paternalGrandfather}
                  title="Paternal Grandfather"
                  variant="grandparent"
                />
                <PersonCard 
                  person={paternalGrandmother}
                  title="Paternal Grandmother"
                  variant="grandparent"
                />
              </div>
            </div>
            
            {/* Maternal Grandparents */}
            <div>
              <p className="text-sm text-muted-foreground mb-4 font-medium">Maternal</p>
              <div className="grid grid-cols-2 gap-4">
                <PersonCard 
                  person={maternalGrandfather}
                  title="Maternal Grandfather"
                  variant="grandparent"
                />
                <PersonCard 
                  person={maternalGrandmother}
                  title="Maternal Grandmother"
                  variant="grandparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Connection Lines - Decorative */}
        <div className="absolute left-1/2 top-[200px] w-px h-12 bg-gradient-to-b from-accent/50 to-secondary/50 -translate-x-1/2" />

        {/* Parents Layer */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Parents
          </h3>
          <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
            <PersonCard 
              person={father}
              title="Father"
              icon={User}
              variant="parent"
            />
            <PersonCard 
              person={mother}
              title="Mother"
              icon={User}
              variant="parent"
            />
          </div>
        </div>

        {/* Connection Line to Client */}
        <div className="absolute left-1/2 bottom-[180px] w-px h-12 bg-gradient-to-b from-secondary/50 to-primary/50 -translate-x-1/2" />

        {/* Client Layer */}
        <div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5" />
            Client
          </h3>
          <div className="flex justify-center">
            <PersonCard 
              person={clientData}
              title={clientData.sex === 'M' ? 'Male Client' : clientData.sex === 'F' ? 'Female Client' : 'Client'}
              icon={User}
              variant="client"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-4">Family Data Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {[clientData, father, mother, paternalGrandfather, paternalGrandmother, maternalGrandfather, maternalGrandmother]
                .filter(p => p?.firstName && p?.lastName).length}
            </div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">3</div>
            <p className="text-sm text-muted-foreground">Generations</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">
              {[clientData, father, mother, paternalGrandfather, paternalGrandmother, maternalGrandfather, maternalGrandmother]
                .filter(p => p?.placeOfBirth).length}
            </div>
            <p className="text-sm text-muted-foreground">Birth Places Recorded</p>
          </div>
        </div>
      </Card>
    </div>
  );
};