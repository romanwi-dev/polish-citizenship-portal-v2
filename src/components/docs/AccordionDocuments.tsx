import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FolderOpen, CheckCircle2, Clock } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";
import { useState } from "react";

interface AccordionDocumentsProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function AccordionDocuments({
  title,
  documents,
  onChange,
}: AccordionDocumentsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = documents.filter(doc => doc.checked).length;
  const isComplete = completedCount === documents.length;

  const handleMasterToggle = () => {
    documents.forEach(doc => onChange(doc.id, !isComplete));
  };

  // Split into categories for demo
  const categoryA = documents.slice(0, Math.ceil(documents.length / 2));
  const categoryB = documents.slice(Math.ceil(documents.length / 2));

  const CategorySection = ({ docs, categoryName }: { docs: DocumentItem[], categoryName: string }) => {
    const [categoryOpen, setCategoryOpen] = useState(true);
    const categoryCompleted = docs.filter(d => d.checked).length;

    return (
      <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
        <CollapsibleTrigger className="w-full p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? 'rotate-0' : '-rotate-90'}`} />
              <FolderOpen className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{categoryName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {categoryCompleted}/{docs.length}
              </span>
              {categoryCompleted === docs.length && (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-1">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className={`ml-6 p-2.5 rounded border transition-all hover:shadow-sm ${
                doc.checked
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-card border-border/30 hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={doc.id}
                  checked={doc.checked}
                  onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={doc.id}
                  className={`flex-1 text-sm cursor-pointer ${
                    doc.checked ? 'line-through opacity-60' : ''
                  }`}
                >
                  {doc.label}
                </label>
                {doc.checked ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground/30" />
                )}
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-3">
      {/* Main header */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className={`p-5 rounded-xl border-2 transition-all ${
            isComplete
              ? 'bg-green-500/10 border-green-500/40'
              : 'bg-gradient-to-r from-slate-500/10 to-blue-500/10 border-slate-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                <h3 className="text-xl font-bold">{title}</h3>
                {isComplete && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold">{completedCount}/{documents.length}</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((completedCount / documents.length) * 100)}% complete
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMasterToggle();
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
                >
                  {isComplete ? 'Reset' : 'Complete All'}
                </button>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3 space-y-2">
          <CategorySection docs={categoryA} categoryName="Essential Documents" />
          <CategorySection docs={categoryB} categoryName="Supporting Documents" />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
