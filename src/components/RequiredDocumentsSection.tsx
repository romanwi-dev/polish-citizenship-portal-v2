import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

export interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface RequiredDocumentsSectionProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
  variant?: "subtle-glass" | "card-grid" | "bordered-list" | "compact-table" | "gradient-blocks";
  backgroundStyle?: "dark-slate-glow" | "vibrant-gradient-mesh" | "paper-texture-warm" | "glass-neumorphism" | "bordered-grid-minimal";
}

export function RequiredDocumentsSection({
  title,
  documents,
  onChange,
  variant = "subtle-glass",
  backgroundStyle = "dark-slate-glow",
}: RequiredDocumentsSectionProps) {
  const isComplete = documents.every(doc => doc.checked);
  
  const getBackgroundClass = () => {
    if (variant !== "card-grid") return "";
    
    if (isComplete) {
      switch (backgroundStyle) {
        case "dark-slate-glow":
          return "bg-slate-900/95 p-6 rounded-lg shadow-2xl shadow-green-500/30 border-2 border-green-500";
        case "vibrant-gradient-mesh":
          return "bg-gradient-to-br from-green-500/20 via-primary/20 to-green-500/20 p-6 rounded-lg backdrop-blur-sm border-2 border-green-500/60 shadow-xl";
        case "paper-texture-warm":
          return "bg-green-50/80 dark:bg-green-900/20 p-6 rounded-lg shadow-lg border-2 border-green-400/70";
        case "glass-neumorphism":
          return "bg-green-500/10 backdrop-blur-2xl p-6 rounded-2xl shadow-[inset_0_2px_22px_rgba(34,197,94,0.2)] border-2 border-green-400/40";
        case "bordered-grid-minimal":
          return "p-6 rounded-none border-4 border-green-500/70";
        default:
          return "p-6";
      }
    }
    
    switch (backgroundStyle) {
      case "dark-slate-glow":
        return "bg-slate-900/95 p-6 rounded-lg shadow-2xl shadow-primary/20 border border-slate-700";
      case "vibrant-gradient-mesh":
        return "bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20 p-6 rounded-lg backdrop-blur-sm border border-primary/30 shadow-xl";
      case "paper-texture-warm":
        return "bg-amber-50/80 dark:bg-amber-900/20 p-6 rounded-lg shadow-lg border-2 border-amber-200/50 dark:border-amber-700/50";
      case "glass-neumorphism":
        return "bg-white/10 dark:bg-black/10 backdrop-blur-2xl p-6 rounded-2xl shadow-[inset_0_2px_22px_rgba(255,255,255,0.1)] border border-white/20 dark:border-white/10";
      case "bordered-grid-minimal":
        return "p-6 rounded-none border-4 border-primary/40";
      default:
        return "p-6";
    }
  };

  const getCardClass = () => {
    if (variant !== "card-grid") return "border-2 border-border/50 rounded-lg p-4 hover:bg-accent/10 hover:border-primary/50 transition-all duration-200 hover:shadow-md";
    
    switch (backgroundStyle) {
      case "dark-slate-glow":
        return "border-2 border-slate-700 bg-slate-800/50 rounded-lg p-4 hover:bg-slate-700/50 hover:border-primary/50 transition-all duration-200 hover:shadow-lg";
      case "vibrant-gradient-mesh":
        return "border-2 border-primary/40 bg-card/60 backdrop-blur rounded-lg p-4 hover:bg-card/80 hover:border-primary/70 transition-all duration-200 hover:shadow-lg";
      case "paper-texture-warm":
        return "border-2 border-amber-300/60 dark:border-amber-600/60 bg-white/40 dark:bg-amber-800/20 rounded-lg p-4 hover:bg-amber-100/60 dark:hover:bg-amber-700/30 hover:border-amber-400 transition-all duration-200 hover:shadow-md";
      case "glass-neumorphism":
        return "border border-white/30 dark:border-white/10 bg-white/5 dark:bg-black/5 backdrop-blur-sm rounded-xl p-4 hover:bg-white/10 dark:hover:bg-black/10 hover:border-white/50 transition-all duration-200 shadow-lg";
      case "bordered-grid-minimal":
        return "border-b border-r border-border/30 p-4 hover:bg-accent/5 hover:border-primary/40 transition-all duration-200";
      default:
        return "border-2 border-border/50 rounded-lg p-4 hover:bg-accent/10 hover:border-primary/50 transition-all duration-200 hover:shadow-md";
    }
  };

  const getLabelClass = () => {
    switch (backgroundStyle) {
      case "dark-slate-glow":
        return "font-medium text-slate-100 text-sm uppercase tracking-wide cursor-pointer";
      case "vibrant-gradient-mesh":
        return "font-medium text-foreground text-sm uppercase tracking-wide cursor-pointer";
      case "paper-texture-warm":
        return "font-medium text-amber-900 dark:text-amber-100 text-sm uppercase tracking-wide cursor-pointer";
      case "glass-neumorphism":
        return "font-medium text-foreground/90 text-sm uppercase tracking-wide cursor-pointer";
      case "bordered-grid-minimal":
        return "font-medium text-foreground/70 text-sm uppercase tracking-wide cursor-pointer";
      default:
        return "font-medium text-foreground/70 text-sm uppercase tracking-wide cursor-pointer";
    }
  };
  if (variant === "subtle-glass") {
    return (
      <div className={`space-y-4 relative ${isComplete ? 'border-2 border-green-500/50 p-4 rounded-lg shadow-lg shadow-green-500/20' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-light text-sm uppercase tracking-wider ${isComplete ? 'text-green-500' : 'text-foreground/50'}`}>
            {title}
          </h3>
          {isComplete && (
            <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide animate-in fade-in slide-in-from-right-2 duration-300">
              <Check className="h-3 w-3" />
              Completed
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-card/30 backdrop-blur p-6 rounded-none">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center space-x-4">
              <Checkbox
                id={doc.id}
                checked={doc.checked}
                onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                className="h-6 w-6"
              />
              <Label
                htmlFor={doc.id}
                className="font-light text-foreground/50 text-sm uppercase tracking-wider cursor-pointer"
              >
                {doc.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "card-grid") {
    return (
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <h3 className={`font-light text-sm uppercase tracking-wider ${isComplete ? 'text-green-500' : 'text-foreground/50'}`}>
            {title}
          </h3>
          {isComplete && (
            <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide animate-in fade-in slide-in-from-right-2 duration-300">
              <Check className="h-3 w-3" />
              Completed
            </div>
          )}
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${getBackgroundClass()}`}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={getCardClass()}
            >
              <div className="flex items-center space-x-4">
                <Checkbox
                  id={doc.id}
                  checked={doc.checked}
                  onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                  className="h-6 w-6"
                />
                <Label
                  htmlFor={doc.id}
                  className={getLabelClass()}
                >
                  {doc.label}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "bordered-list") {
    return (
      <div className={`space-y-4 relative ${isComplete ? 'border-2 border-green-500/50 p-4 rounded-lg shadow-lg shadow-green-500/20' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-light text-sm uppercase tracking-wider ${isComplete ? 'text-green-500' : 'text-foreground/50'}`}>
            {title}
          </h3>
          {isComplete && (
            <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide animate-in fade-in slide-in-from-right-2 duration-300">
              <Check className="h-3 w-3" />
              Completed
            </div>
          )}
        </div>
        <div className="space-y-0 border-t border-border/30">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className={`border-b border-border/30 py-4 px-2 hover:border-l-4 hover:border-l-primary hover:bg-accent/5 transition-all ${
                index === documents.length - 1 ? "border-b-0" : ""
              }`}
            >
              <div className="flex items-center space-x-4">
                <Checkbox
                  id={doc.id}
                  checked={doc.checked}
                  onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                  className="h-6 w-6"
                />
                <Label
                  htmlFor={doc.id}
                  className="font-light text-foreground/60 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {doc.label}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "compact-table") {
    return (
      <div className={`space-y-4 relative ${isComplete ? 'border-2 border-green-500/50 p-4 rounded-lg shadow-lg shadow-green-500/20' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-light text-sm uppercase tracking-wider ${isComplete ? 'text-green-500' : 'text-foreground/50'}`}>
            {title}
          </h3>
          {isComplete && (
            <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide animate-in fade-in slide-in-from-right-2 duration-300">
              <Check className="h-3 w-3" />
              Completed
            </div>
          )}
        </div>
        <div className="space-y-0 overflow-hidden rounded-md border border-border/30">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className={`py-2 px-4 hover:bg-accent/20 transition-colors ${
                index % 2 === 1 ? "bg-accent/5" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={doc.id}
                  checked={doc.checked}
                  onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                  className="h-5 w-5"
                />
                <Label
                  htmlFor={doc.id}
                  className="font-light text-foreground/60 text-sm uppercase tracking-wide cursor-pointer"
                >
                  {doc.label}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "gradient-blocks") {
    return (
      <div className={`space-y-4 relative ${isComplete ? 'border-2 border-green-500/50 p-4 rounded-lg shadow-lg shadow-green-500/20' : ''}`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-light text-sm uppercase tracking-wider ${isComplete ? 'text-green-500' : 'text-foreground/50'}`}>
            {title}
          </h3>
          {isComplete && (
            <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide animate-in fade-in slide-in-from-right-2 duration-300">
              <Check className="h-3 w-3" />
              Completed
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-md p-4 hover:from-primary/10 hover:to-secondary/10 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <Checkbox
                  id={doc.id}
                  checked={doc.checked}
                  onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                  className="h-6 w-6"
                />
                <Label
                  htmlFor={doc.id}
                  className="font-light text-foreground/70 text-sm uppercase tracking-wider cursor-pointer"
                >
                  {doc.label}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
