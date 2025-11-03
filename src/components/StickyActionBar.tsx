import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  onSave: () => void;
  onGenerate: () => void;
  onClear: () => void;
  isGenerating?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
  className?: string;
};

const StickyActionBar: React.FC<Props> = ({
  onSave,
  onGenerate,
  onClear,
  isGenerating = false,
  isSaving = false,
  disabled = false,
  className,
}) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100]",
        "backdrop-blur-md supports-[backdrop-filter]:bg-background/80 bg-background/95",
        "border-b transition-shadow",
        hasScrolled ? "shadow-md" : "border-border",
        "pt-[env(safe-area-inset-top)]",
        className
      )}
      style={{ height: "calc(var(--actionbar-h, 56px) + env(safe-area-inset-top))" }}
      role="region"
      aria-label="Primary actions"
    >
      <div className="mx-auto max-w-6xl h-[var(--actionbar-h, 56px)] flex items-center px-3 gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={disabled || isSaving}
          className={cn(
            "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
            disabled || isSaving
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-accent hover:text-accent-foreground",
            "border-input bg-background"
          )}
          aria-busy={isSaving}
        >
          {isSaving ? "Saving…" : "Save Data"}
        </button>

        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || isGenerating}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            disabled || isGenerating
              ? "opacity-80 cursor-not-allowed"
              : "hover:opacity-90",
            "bg-primary text-primary-foreground shadow"
          )}
          aria-busy={isGenerating}
        >
          {isGenerating ? "Generating…" : "Generate PDF"}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            disabled
              ? "opacity-60 cursor-not-allowed"
              : "hover:bg-destructive/10 hover:text-destructive",
            "border border-input bg-background"
          )}
        >
          Clear Data
        </button>

        {/* Mobile-friendly spacer */}
        <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
          Always on top
        </div>
      </div>
    </div>
  );
};

export default StickyActionBar;
