import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  backgroundStyle?: "transparent" | "gradient" | "glass-strong" | "solid" | "bordered";
}

export function RequiredDocumentsSection({
  title,
  documents,
  onChange,
  variant = "subtle-glass",
  backgroundStyle = "transparent",
}: RequiredDocumentsSectionProps) {
  const getBackgroundClass = () => {
    if (variant !== "card-grid") return "";
    
    switch (backgroundStyle) {
      case "gradient":
        return "bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 rounded-lg";
      case "glass-strong":
        return "bg-card/50 backdrop-blur-xl border border-border/30 p-6 rounded-lg shadow-lg";
      case "solid":
        return "bg-muted/30 p-6 rounded-lg";
      case "bordered":
        return "border-2 border-border/40 p-6 rounded-lg";
      case "transparent":
      default:
        return "p-2";
    }
  };
  if (variant === "subtle-glass") {
    return (
      <div className="space-y-4">
        <h3 className="font-light text-foreground/50 text-sm uppercase tracking-wider">
          {title}
        </h3>
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
      <div className="space-y-4">
        <h3 className="font-light text-foreground/50 text-sm uppercase tracking-wider">
          {title}
        </h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${getBackgroundClass()}`}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border-2 border-border/50 rounded-lg p-4 hover:bg-accent/10 hover:border-primary/50 transition-all duration-200 hover:shadow-md"
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
                  className="font-medium text-foreground/70 text-sm uppercase tracking-wide cursor-pointer"
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
      <div className="space-y-4">
        <h3 className="font-light text-foreground/50 text-sm uppercase tracking-wider">
          {title}
        </h3>
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
      <div className="space-y-4">
        <h3 className="font-light text-foreground/50 text-sm uppercase tracking-wider">
          {title}
        </h3>
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
      <div className="space-y-4">
        <h3 className="font-light text-foreground/50 text-sm uppercase tracking-wider">
          {title}
        </h3>
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
