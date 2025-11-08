import { Save, Sparkles, Download, FileText, Database, GitBranch, BookOpen, FileCheck, Award, Building, FolderOpen, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PDFGenerateButton } from "@/components/pdf/PDFGenerateButton";

interface FormButtonsRowProps {
  caseId: string;
  currentForm: 'intake' | 'family-tree' | 'family-history' | 'poa' | 'citizenship' | 'civil-registry' | 'additional-data';
  formData?: any;
  onSave: () => void;
  onClear: () => void;
  onGeneratePDF: ((url: string) => void) | (() => void); // Support both callback patterns
  saveLabel?: string;
  isSaving?: boolean;
  activePOAType?: string;
}

const getNavigationButtons = (formData: any) => {
  const buttons = [
    { id: 'intake', label: 'Client Intake', icon: FileText, path: '/admin/intake/:id', condition: true },
    { id: 'family-tree', label: 'Family Tree', icon: GitBranch, path: '/admin/family-tree/:id', condition: true },
    { id: 'poa', label: 'Power of Attorney', icon: FileCheck, path: '/admin/poa/:id', condition: true },
    { id: 'citizenship', label: 'Citizenship Application', icon: Award, path: '/admin/citizenship/:id', condition: true },
    { id: 'family-history', label: 'Family History', icon: BookOpen, path: '/admin/family-history/:id', condition: true },
    { id: 'civil-registry', label: 'Civil Registry', icon: Building, path: '/admin/civil-registry/:id', condition: true },
  ];
  
  return buttons.filter(btn => btn.condition);
};

export function FormButtonsRow({ 
  caseId, 
  currentForm, 
  onSave, 
  onClear, 
  onGeneratePDF,
  saveLabel = "Save Data",
  isSaving = false,
  formData,
  activePOAType = 'adult'
}: FormButtonsRowProps) {
  const navigate = useNavigate();
  const navigationButtons = getNavigationButtons(formData || {});

  return (
    <>
      {/* Navigation Buttons Row - Static at top, no background */}
      <div className="mb-2 md:mb-8 py-2 md:py-3">
        <div className="flex flex-row gap-0.5 overflow-x-auto scrollbar-hide md:justify-between px-0 md:px-6 max-w-full">
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
                    px-6 py-2 text-sm md:text-base font-bold
                    flex-shrink-0 md:flex-1 border transition-colors
                    ${isCurrent 
                      ? 'bg-white/10 hover:bg-white/15 border-white/40 opacity-60' 
                      : 'bg-white/5 hover:bg-white/10 border-white/20 opacity-50'
                    }
                  `}
                >
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent whitespace-nowrap">{btn.label}</span>
                </Button>
              );
            })}
        </div>
      </div>

      {/* Sticky Action Buttons Row - FIXED AT BOTTOM */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] backdrop-blur-md bg-background/95 border-t border-border shadow-lg">
        <div className="mx-auto max-w-7xl px-3 md:px-6 py-2 md:py-3">
          <div className="flex flex-row gap-0.5">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-6 md:py-2 text-sm md:text-base font-bold flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
            >
              <span className="text-green-100 font-bold whitespace-nowrap">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </Button>
            
            {currentForm !== 'intake' && (
              currentForm === 'poa' ? (
                // POA: Direct button click (no URL callback)
                <Button
                  onClick={() => (onGeneratePDF as () => void)()}
                  disabled={isSaving}
                  className="px-6 py-6 md:py-2 text-sm md:text-base font-bold flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                >
                  <span className="text-blue-100 font-bold whitespace-nowrap">
                    Generate
                  </span>
                </Button>
              ) : (
                // Other forms: Use PDFGenerateButton with URL callback
                <PDFGenerateButton
                  caseId={caseId}
                  templateType={
                    currentForm === 'family-tree' ? 'family-tree' :
                    currentForm === 'citizenship' ? 'citizenship' :
                    currentForm === 'civil-registry' ? 'registration' :
                    currentForm
                  }
                  onGenerate={onGeneratePDF as (url: string) => void}
                  disabled={isSaving}
                >
                  <span className="text-blue-100 font-bold whitespace-nowrap">
                    Generate
                  </span>
                </PDFGenerateButton>
              )
            )}
            
            <Button
              onClick={onClear}
              className="px-6 py-6 md:py-2 text-sm md:text-base font-bold flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
            >
              <span className="text-red-100 font-bold whitespace-nowrap">
                Clear
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for sticky action buttons at bottom */}
      <div className="h-[56px] md:h-[52px]" />
    </>
  );
}
