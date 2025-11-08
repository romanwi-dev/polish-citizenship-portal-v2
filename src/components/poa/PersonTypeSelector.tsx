import { Users, User, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export type PersonType = 'AP' | 'SPOUSE' | 'CHILD_1' | 'CHILD_2' | 'CHILD_3' | 'CHILD_4' | 
                          'CHILD_5' | 'CHILD_6' | 'CHILD_7' | 'CHILD_8' | 'CHILD_9' | 'CHILD_10';

export type DocumentType = 'passport' | 'birth_certificate';

interface PersonTypeSelectorProps {
  onSelect: (personType: PersonType, documentType: DocumentType) => void;
  selectedPerson?: PersonType;
  selectedDocType?: DocumentType;
  childrenCount?: number;
}

export const PersonTypeSelector = ({ onSelect, selectedPerson, selectedDocType, childrenCount = 0 }: PersonTypeSelectorProps) => {
  const isAdult = (type: PersonType) => type === 'AP' || type === 'SPOUSE';
  
  const personOptions: { type: PersonType; label: string; icon: typeof User }[] = [
    { type: 'AP', label: 'Applicant', icon: User },
    { type: 'SPOUSE', label: 'Spouse', icon: Users },
    { type: 'CHILD_1', label: 'Child', icon: UserRound },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl md:text-3xl font-heading font-bold mb-6">Select Person</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {personOptions.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={selectedPerson === type ? "default" : "outline"}
              onClick={() => {
                if (isAdult(type)) {
                  onSelect(type, 'passport');
                } else {
                  // For children, don't auto-select - show document type chooser
                  if (selectedPerson !== type) {
                    onSelect(type, 'passport'); // Default to passport
                  }
                }
              }}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {selectedPerson && isAdult(selectedPerson) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {selectedPerson === 'AP' ? 'Applicant' : 'Spouse'} must provide a VALID (non-expired) passport.
              Birth certificates are not accepted for adults.
            </AlertDescription>
          </Alert>
        )}

        {selectedPerson && !isAdult(selectedPerson) && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Document Type for {selectedPerson.replace('_', ' ')}:</p>
            <div className="flex gap-2">
              <Button
                variant={selectedDocType === 'passport' ? "default" : "outline"}
                onClick={() => onSelect(selectedPerson, 'passport')}
                className="flex-1"
              >
                Passport
              </Button>
              <Button
                variant={selectedDocType === 'birth_certificate' ? "default" : "outline"}
                onClick={() => onSelect(selectedPerson, 'birth_certificate')}
                className="flex-1"
              >
                Birth Certificate
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Children can use either a valid passport OR birth certificate
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
