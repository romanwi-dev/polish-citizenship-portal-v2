import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CollapsibleKPIStripProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export const CollapsibleKPIStrip = ({
  children,
  className,
  defaultOpen = true,
}: CollapsibleKPIStripProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="md:hidden w-full flex items-center justify-between p-2 h-auto text-xs text-muted-foreground hover:text-foreground"
      >
        <span>KPI Details</span>
        {isOpen ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>
      <div
        className={cn(
          "transition-all duration-200 overflow-hidden",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 md:max-h-96 md:opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  );
};
