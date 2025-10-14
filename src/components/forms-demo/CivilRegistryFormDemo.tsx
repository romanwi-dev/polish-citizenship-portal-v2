import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CivilRegistryFormDemoProps {
  onClose: () => void;
}

export default function CivilRegistryFormDemo({ onClose }: CivilRegistryFormDemoProps) {
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  return (
    <div className={`p-6 ${isLargeFonts ? 'text-lg' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
          Civil Registry
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts">
            <Type className="h-6 w-6" />
          </Button>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Civil Registry Form</CardTitle>
          <CardDescription>
            Civil registry applications and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg">Form coming soon...</p>
            <p className="text-sm mt-2">Civil registry form will be implemented with full field validation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
