import { Save, Sparkles, Download, FileText, Database, GitBranch, BookOpen, FileCheck, Award, Building, FolderOpen, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormButtonsRowProps {
  caseId: string;
  currentForm: 'intake' | 'family-tree' | 'family-history' | 'poa' | 'citizenship' | 'civil-registry' | 'additional-data';
  formData?: any;
  onSave: () => void;
  onClear: () => void;
  onGeneratePDF: () => void;
  saveLabel?: string;
  isSaving?: boolean;
}

const getNavigationButtons = (formData: any) => {
  const buttons = [
    { id: 'intake', label: 'Client Intake', icon: FileText, path: '/admin/intake/:id', condition: true },
    { id: 'family-tree', label: 'Family Tree', icon: GitBranch, path: '/admin/family-tree/:id', condition: true },
    { id: 'family-history', label: 'Family History', icon: BookOpen, path: '/admin/family-history/:id', condition: true },
    { id: 'poa', label: 'Power of Attorney', icon: FileCheck, path: '/admin/poa/:id', condition: true },
    { id: 'citizenship', label: 'Citizenship Application', icon: Award, path: '/admin/citizenship/:id', condition: true },
    { id: 'civil-registry', label: 'Civil Registry', icon: Building, path: '/admin/civil-registry/:id', condition: true },
  ];
  
  // Conditionally add Children button if children_count > 0
  if (formData?.children_count > 0) {
    buttons.splice(2, 0, { id: 'children', label: 'Children', icon: Users, path: '/admin/intake/:id', condition: true });
  }
  
  // Conditionally add Spouse button if married
  if (formData?.applicant_is_married) {
    buttons.splice(2, 0, { id: 'spouse', label: 'Spouse', icon: User, path: '/admin/intake/:id', condition: true });
  }
  
  return buttons.filter(btn => btn.condition);
};

export function FormButtonsRow({ 
  caseId, 
  currentForm, 
  onSave, 
  onClear, 
  onGeneratePDF,
  saveLabel = "Save data",
  isSaving = false,
  formData
}: FormButtonsRowProps) {
  const navigate = useNavigate();
  const navigationButtons = getNavigationButtons(formData || {});

  return (
    <div className="sticky top-0 z-50 flex flex-row gap-0.5 mb-8 overflow-x-auto scrollbar-hide py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-row gap-0.5 w-full">
      {currentForm !== 'intake' && (
        <div className="flex gap-0.5 flex-shrink-0 z-[10000]">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="px-6 md:px-8 lg:px-10 py-2 text-sm md:text-base font-bold bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
          >
            <span className="text-green-100 font-bold">{isSaving ? "Saving..." : saveLabel}</span>
          </Button>
          
          <Button
            onClick={onClear}
            className="px-6 md:px-8 lg:px-10 py-2 text-sm md:text-base font-bold bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            <span className="text-red-100 font-bold">Clear Data</span>
          </Button>
        </div>
      )}

      {/* Navigation Buttons */}
      {navigationButtons
        .filter(btn => btn.id !== currentForm)
        .map((btn) => {
          const isCurrent = btn.id === currentForm;
          const Icon = btn.icon;
          
          return (
            <Button
              key={btn.id}
              onClick={() => navigate(btn.path.replace(':id', caseId))}
              className={`
                px-6 md:px-8 lg:px-10 py-2 text-sm md:text-base font-bold
                whitespace-nowrap flex-shrink-0 border transition-colors
                ${isCurrent 
                  ? 'bg-white/10 hover:bg-white/15 border-white/40 opacity-60' 
                  : 'bg-white/5 hover:bg-white/10 border-white/20 opacity-50'
                }
              `}
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{btn.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
