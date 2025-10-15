import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CivilRegistryFormDemoProps {
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function CivilRegistryFormDemo({ onClose, isExpanded, onToggleExpand }: CivilRegistryFormDemoProps) {
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  return (
    <div className={`relative min-h-full ${isLargeFonts ? 'text-lg' : ''}`}>
      
      <div className="relative z-10 pt-2 px-3 pb-3 md:p-6">
        <div className="flex items-center justify-between mb-1 md:mb-6">
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text text-center md:text-left flex-1">
            Civil Registry
          </h2>
          <div className="flex items-center gap-0.5 md:gap-2">
            <Button onClick={onToggleExpand} variant="ghost" size="icon" title="Toggle fullscreen" className="h-7 w-7 md:h-10 md:w-10">
              <Maximize2 className="h-3.5 w-3.5 md:h-6 md:w-6" />
            </Button>
            <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts" className="h-7 w-7 md:h-10 md:w-10">
              <Type className="h-3.5 w-3.5 md:h-6 md:w-6" />
            </Button>
          <Button onClick={onClose} variant="ghost" size="icon" className="h-7 w-7 md:h-10 md:w-10">
            <X className="h-3.5 w-3.5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>

      <Card>
...
      </Card>
      </div>
    </div>
  );
}
