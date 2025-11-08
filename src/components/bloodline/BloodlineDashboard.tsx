import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users, Heart, ArrowRight, TreePine, CheckCircle2, AlertCircle } from "lucide-react";

interface BloodlineDashboardProps {
  masterData: any;
}

export function BloodlineDashboard({ masterData }: BloodlineDashboardProps) {
  const fatherIsPolish = masterData?.father_is_polish === true;
  const motherIsPolish = masterData?.mother_is_polish === true;
  const bloodlineSide = fatherIsPolish && !motherIsPolish ? 'paternal' : 
                        motherIsPolish && !fatherIsPolish ? 'maternal' : 
                        fatherIsPolish && motherIsPolish ? 'both' : 'none';

  // Helper to get full name
  const fullName = (first?: string, last?: string, maiden?: string) => {
    const parts = [first, last || maiden].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Not specified';
  };

  // Determine which lineage to show
  const showPaternal = bloodlineSide === 'paternal' || bloodlineSide === 'both';
  const showMaternal = bloodlineSide === 'maternal' || bloodlineSide === 'both';

  const renderPersonCard = (
    label: string, 
    firstName?: string, 
    lastName?: string, 
    maiden?: string,
    isPolish: boolean = true,
    isSpouse: boolean = false
  ) => {
    const name = fullName(firstName, lastName, maiden);
    const hasData = firstName || lastName || maiden;

    return (
      <div 
        className={`p-4 rounded-lg border-2 transition-all ${
          isPolish && !isSpouse 
            ? 'bg-green-50 dark:bg-green-950/30 border-green-500 shadow-lg shadow-green-500/20' 
            : isSpouse
            ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500 shadow-lg shadow-yellow-500/20'
            : 'bg-muted/50 border-muted-foreground/20'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          {isPolish && !isSpouse && (
            <Badge variant="default" className="bg-green-600 text-white text-xs">
              Polish Line
            </Badge>
          )}
          {isSpouse && (
            <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
              Spouse
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <User className={`h-4 w-4 ${isPolish && !isSpouse ? 'text-green-600' : isSpouse ? 'text-yellow-600' : 'text-muted-foreground'}`} />
          <p className="font-semibold text-sm">{name}</p>
        </div>
        {hasData && (
          <CheckCircle2 className="h-3 w-3 text-green-600 mt-1" />
        )}
        {!hasData && (
          <AlertCircle className="h-3 w-3 text-muted-foreground mt-1" />
        )}
      </div>
    );
  };

  return (
    <Card className="w-full bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <TreePine className="h-7 w-7 text-primary" />
            Polish Bloodline Path
          </CardTitle>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {bloodlineSide === 'both' ? 'Both Sides' : 
             bloodlineSide === 'paternal' ? 'Paternal Line' :
             bloodlineSide === 'maternal' ? 'Maternal Line' : 'Not Determined'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Complete ancestry visualization showing Polish bloodline members (green), spouses (yellow), and generation connections
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Legend */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
            <span className="text-xs font-medium">Polish Ancestor (Full Data)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded border-2 border-yellow-600"></div>
            <span className="text-xs font-medium">Spouse (Name Only)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded border-2 border-muted-foreground/20"></div>
            <span className="text-xs font-medium">Non-Polish Line (NIE DOTYCZY)</span>
          </div>
        </div>

        {/* Generation 0: Applicant */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">Generation 0</Badge>
            <span className="text-sm font-semibold">Applicant</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderPersonCard(
              'Applicant',
              masterData?.applicant_first_name,
              masterData?.applicant_last_name,
              undefined,
              false,
              false
            )}
            {masterData?.spouse_first_name && renderPersonCard(
              'Spouse',
              masterData?.spouse_first_name,
              masterData?.spouse_last_name,
              undefined,
              false,
              true
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
        </div>

        {/* Generation 1: Parents */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">Generation 1</Badge>
            <span className="text-sm font-semibold">Parents</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showPaternal && renderPersonCard(
              'Father (Polish)',
              masterData?.father_first_name,
              masterData?.father_last_name,
              undefined,
              true,
              false
            )}
            {showPaternal && renderPersonCard(
              'Mother (Spouse)',
              masterData?.mother_first_name,
              masterData?.mother_maiden_name,
              undefined,
              false,
              true
            )}
            {showMaternal && !showPaternal && renderPersonCard(
              'Mother (Polish)',
              masterData?.mother_first_name,
              masterData?.mother_maiden_name,
              undefined,
              true,
              false
            )}
            {showMaternal && !showPaternal && renderPersonCard(
              'Father (Spouse)',
              masterData?.father_first_name,
              masterData?.father_last_name,
              undefined,
              false,
              true
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
        </div>

        {/* Generation 2: Grandparents */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">Generation 2</Badge>
            <span className="text-sm font-semibold">Grandparents</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showPaternal && (
              <>
                {renderPersonCard(
                  'Paternal Grandfather (Polish)',
                  masterData?.pgf_first_name,
                  masterData?.pgf_last_name,
                  undefined,
                  true,
                  false
                )}
                {renderPersonCard(
                  'Paternal Grandmother (Spouse)',
                  masterData?.pgm_first_name,
                  masterData?.pgm_maiden_name,
                  undefined,
                  false,
                  true
                )}
              </>
            )}
            {showMaternal && !showPaternal && (
              <>
                {renderPersonCard(
                  'Maternal Grandfather (Polish)',
                  masterData?.mgf_first_name,
                  masterData?.mgf_last_name,
                  undefined,
                  true,
                  false
                )}
                {renderPersonCard(
                  'Maternal Grandmother (Spouse)',
                  masterData?.mgm_first_name,
                  masterData?.mgm_maiden_name,
                  undefined,
                  false,
                  true
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
        </div>

        {/* Generation 3: Great-Grandparents */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">Generation 3</Badge>
            <span className="text-sm font-semibold">Great-Grandparents</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showPaternal && (
              <>
                {renderPersonCard(
                  'Paternal Great-Grandfather (Polish)',
                  masterData?.pggf_first_name,
                  masterData?.pggf_last_name,
                  undefined,
                  true,
                  false
                )}
                {renderPersonCard(
                  'Paternal Great-Grandmother (Spouse)',
                  masterData?.pggm_first_name,
                  masterData?.pggm_maiden_name,
                  undefined,
                  false,
                  true
                )}
              </>
            )}
            {showMaternal && !showPaternal && (
              <>
                {renderPersonCard(
                  'Maternal Great-Grandfather (Polish)',
                  masterData?.mggf_first_name,
                  masterData?.mggf_last_name,
                  undefined,
                  true,
                  false
                )}
                {renderPersonCard(
                  'Maternal Great-Grandmother (Spouse)',
                  masterData?.mggm_first_name,
                  masterData?.mggm_maiden_name,
                  undefined,
                  false,
                  true
                )}
              </>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bloodline Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">4</p>
              <p className="text-xs text-muted-foreground">Polish Ancestors</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">4</p>
              <p className="text-xs text-muted-foreground">Spouses</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">3</p>
              <p className="text-xs text-muted-foreground">Generations</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {bloodlineSide === 'paternal' ? 'Father' : bloodlineSide === 'maternal' ? 'Mother' : 'Both'}
              </p>
              <p className="text-xs text-muted-foreground">Bloodline Path</p>
            </div>
          </CardContent>
        </Card>

        {/* Data Strategy Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4 text-blue-600" />
            Polish Bloodline Strategy
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Green cards:</strong> Polish ancestors - ALL data required (DOB, POB, emigration, naturalization, etc.)</li>
            <li>• <strong>Yellow cards:</strong> Spouses of Polish ancestors - ONLY full name required</li>
            <li>• <strong>Gray cards:</strong> Non-Polish family line - Auto-filled with "NIE DOTYCZY" in citizenship form</li>
            <li>• <strong>Citizenship PDF:</strong> Non-Polish line fields automatically filled with "NIE DOTYCZY" (Not Applicable)</li>
            <li>• <strong>Family Tree PDF:</strong> Only Polish bloodline + spouse names are included</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
