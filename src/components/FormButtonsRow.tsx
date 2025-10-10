import { Save, Sparkles, Download, FileText, Database, GitBranch, BookOpen, FileCheck, Award, Building, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormButtonsRowProps {
  caseId: string;
  currentForm: 'intake' | 'master-data' | 'family-tree' | 'family-history' | 'poa' | 'citizenship' | 'civil-registry' | 'additional-data';
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
  { id: 'additional-data', label: 'Additional Data', icon: FolderOpen, path: '/admin/cases/:id/additional-data' },
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
    <div className="flex flex-row gap-3 mb-8 overflow-x-auto scrollbar-hide z-50 relative">
      {/* Action Buttons */}
      <div className="flex gap-3 flex-shrink-0">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 group relative overflow-hidden opacity-50 z-50"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center">
            <Save className="mr-2 h-4 w-4 md:h-5 md:w-5 opacity-50" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {isSaving ? "Saving..." : saveLabel}
            </span>
          </span>
        </Button>
        
        <Button
          onClick={onClear}
          className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 group relative overflow-hidden opacity-50 z-50"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center">
            <Sparkles className="mr-2 h-4 w-4 md:h-5 md:w-5 opacity-50" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Clear Data
            </span>
          </span>
        </Button>
        
        <Button
          onClick={onGeneratePDF}
          className="h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 group relative overflow-hidden opacity-50 z-50"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center">
            <Download className="mr-2 h-4 w-4 md:h-5 md:w-5 opacity-50" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Generate PDF
            </span>
          </span>
        </Button>
      </div>

      {/* Navigation Buttons */}
      {navigationButtons.map((btn) => {
          const isCurrent = btn.id === currentForm;
          const Icon = btn.icon;
          
          return (
            <Button
              key={btn.id}
              onClick={() => navigate(btn.path.replace(':id', caseId))}
              className={`
                h-10 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold
                whitespace-nowrap flex-shrink-0 backdrop-blur-md border group relative overflow-hidden opacity-50 z-50
                ${isCurrent 
                  ? 'bg-white/5 hover:bg-white/10 shadow-glow hover-glow border-white/30' 
                  : 'bg-white/5 hover:bg-white/10 border-white/20'
                }
              `}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center">
                <Icon className="mr-2 h-4 w-4 md:h-5 md:w-5 opacity-50" />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {btn.label}
                </span>
              </span>
            </Button>
          );
        })}
    </div>
  );
}
