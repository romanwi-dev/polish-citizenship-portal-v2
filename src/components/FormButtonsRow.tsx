import { Save, Sparkles, Download, FileText, Database, GitBranch, BookOpen, FileCheck, Award, Building, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FormButtonsRowProps {
  caseId: string;
  currentForm: 'intake' | 'family-tree' | 'family-history' | 'poa' | 'citizenship' | 'civil-registry' | 'additional-data';
  onSave: () => void;
  onClear: () => void;
  onGeneratePDF: () => void;
  saveLabel?: string;
  isSaving?: boolean;
}

const navigationButtons = [
  { id: 'intake', label: 'Client Intake', icon: FileText, path: '/admin/cases/:id/intake' },
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
    <div className="sticky top-0 z-50 flex flex-row gap-2 mb-8 overflow-x-auto scrollbar-hide py-2 -mx-4 md:-mx-6 px-4 md:px-6">
      {/* Action Buttons */}
      {currentForm !== 'intake' && (
        <div className="flex gap-2 flex-shrink-0 z-[10000]">
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="px-3 md:px-4 lg:px-5 py-2 text-sm md:text-base font-bold bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
          >
            <Save className="mr-1.5 h-4 w-4" />
            <span className="text-green-100 font-bold">{isSaving ? "Saving..." : saveLabel}</span>
          </Button>
          
          <Button
            onClick={onClear}
            className="px-3 md:px-4 lg:px-5 py-2 text-sm md:text-base font-bold bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            <span className="text-red-100 font-bold">Clear Data</span>
          </Button>
          
          <Button
            onClick={onGeneratePDF}
            className="px-3 md:px-4 lg:px-5 py-2 text-sm md:text-base font-bold bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          >
            <Download className="mr-1.5 h-4 w-4" />
            <span className="text-blue-100 font-bold">Generate PDF</span>
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
                px-3 md:px-4 lg:px-5 py-2 text-sm md:text-base font-bold
                whitespace-nowrap flex-shrink-0 border transition-colors
                ${isCurrent 
                  ? 'bg-white/10 hover:bg-white/15 border-white/40 opacity-60' 
                  : 'bg-white/5 hover:bg-white/10 border-white/20 opacity-50'
                }
              `}
            >
              <Icon className="mr-1.5 h-4 w-4 opacity-50" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{btn.label}</span>
            </Button>
          );
        })}
    </div>
  );
}
