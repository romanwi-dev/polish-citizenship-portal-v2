import { Save, Sparkles, Download, FileText, Database, GitBranch, BookOpen, FileCheck, Award, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormButtonsRowProps {
  caseId: string;
  currentForm: 'intake' | 'master-data' | 'family-tree' | 'family-history' | 'poa' | 'citizenship' | 'civil-registry';
  onSave: () => void;
  onClear: () => void;
  onGeneratePDF: () => void;
  saveLabel?: string;
  isSaving?: boolean;
}

const navigationButtons = [
  { id: 'intake', label: 'Client Intake', icon: FileText, path: '/admin/cases/:id/intake' },
  { id: 'master-data', label: 'Master Form', icon: Database, path: '/admin/cases/:id/master-data' },
  { id: 'family-tree', label: 'Family Tree', icon: GitBranch, path: '/admin/cases/:id/family-tree' },
  { id: 'family-history', label: 'Family History', icon: BookOpen, path: '/admin/cases/:id/family-history' },
  { id: 'poa', label: 'Power of Attorney', icon: FileCheck, path: '/admin/cases/:id/poa' },
  { id: 'citizenship', label: 'Citizenship Application', icon: Award, path: '/admin/cases/:id/citizenship' },
  { id: 'civil-registry', label: 'Civil Registry', icon: Building, path: '/admin/cases/:id/civil-registry' },
];

export function FormButtonsRow({ 
  caseId, 
  currentForm, 
  onSave, 
  onClear, 
  onGeneratePDF,
  saveLabel = "Save data",
  isSaving = false
}: FormButtonsRowProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Action Buttons - Left Side */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onSave}
          disabled={isSaving}
          variant="default"
          className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold"
        >
          <Save className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {isSaving ? "Saving..." : saveLabel}
          </span>
        </Button>
        
        <Button
          onClick={onClear}
          variant="outline"
          className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold"
        >
          <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Clear Data
          </span>
        </Button>
        
        <Button
          onClick={onGeneratePDF}
          variant="outline"
          className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold"
        >
          <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Generate PDF
          </span>
        </Button>
      </div>

      {/* Navigation Buttons - Right Side */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {navigationButtons.map((btn) => {
          const isCurrent = btn.id === currentForm;
          const Icon = btn.icon;
          
          return (
            <Button
              key={btn.id}
              onClick={() => navigate(btn.path.replace(':id', caseId))}
              variant={isCurrent ? "default" : "outline"}
              className={`
                h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold
                whitespace-nowrap flex-shrink-0
                ${isCurrent 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <Icon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              {isCurrent ? (
                <span>{btn.label}</span>
              ) : (
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {btn.label}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
