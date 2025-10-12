import { useState, useEffect, useCallback } from "react";
import { Search, FileText, User, Calendar, X } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const navigate = useNavigate();
  const { data: cases = [] } = useCases();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter cases based on search term
  const filteredCases = cases.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.client_name.toLowerCase().includes(term) ||
      c.client_code?.toLowerCase().includes(term) ||
      c.country?.toLowerCase().includes(term) ||
      c.status.toLowerCase().includes(term)
    );
  });

  const handleSelect = useCallback((caseId: string) => {
    navigate(`/admin/cases/${caseId}`);
    onOpenChange(false);
    setSearchTerm("");
  }, [navigate, onOpenChange]);

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search cases by name, code, country..."
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No cases found.</CommandEmpty>
        
        {filteredCases.length > 0 && (
          <CommandGroup heading="Cases">
            {filteredCases.slice(0, 10).map((caseItem) => (
              <CommandItem
                key={caseItem.id}
                onSelect={() => handleSelect(caseItem.id)}
                className="flex items-center gap-3 py-3"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{caseItem.client_name}</span>
                    {caseItem.client_code && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {caseItem.client_code}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {caseItem.country && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {caseItem.country}
                      </span>
                    )}
                    <span className={cn(
                      "px-2 py-0.5 rounded-full",
                      caseItem.status === "active" && "bg-green-500/20 text-green-400",
                      caseItem.status === "lead" && "bg-blue-500/20 text-blue-400",
                    )}>
                      {caseItem.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {caseItem.document_count} docs
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => {
            navigate("/admin/cases/new");
            onOpenChange(false);
          }}>
            <User className="mr-2 h-4 w-4" />
            Create New Case
          </CommandItem>
          <CommandItem onSelect={() => {
            navigate("/admin/cases");
            onOpenChange(false);
          }}>
            <FileText className="mr-2 h-4 w-4" />
            View All Cases
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
