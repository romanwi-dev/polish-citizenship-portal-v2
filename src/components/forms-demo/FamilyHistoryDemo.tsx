import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dummyData = {
  family_origin_story: "The Kowalski family originated from the Mazovia region of Poland, where they worked as farmers for several generations.",
  emigration_journey: "In 1920, great-grandfather Józef emigrated to the United States seeking better economic opportunities.",
  cultural_traditions: "The family maintains strong Polish traditions including celebrating Wigilia (Christmas Eve dinner) and Dyngus Day.",
  notable_stories: "During World War II, the family helped hide several Jewish families in their farmhouse barn.",
  historical_context: "The family lived through both World Wars and the communist era in Poland.",
  additional_notes: "Extensive family archives include letters, photographs, and documents dating back to 1890.",
};

interface FamilyHistoryDemoProps {
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function FamilyHistoryDemo({ onClose, isExpanded, onToggleExpand }: FamilyHistoryDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  return (
    <div className={`relative min-h-full ${isLargeFonts ? 'text-lg' : ''}`}>
      {/* Checkered grid background - matching footer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 p-3 md:p-6">
        <div className="flex items-center justify-between mb-2 md:mb-6">
          <h2 className="text-3xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
            Family History
          </h2>
          <div className="flex items-center gap-1 md:gap-2">
            <Button onClick={onToggleExpand} variant="ghost" size="icon" title="Toggle fullscreen" className="h-8 w-8 md:h-10 md:w-10">
              <Maximize2 className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
            <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts" className="h-8 w-8 md:h-10 md:w-10">
              <Type className="h-4 w-4 md:h-6 md:w-6" />
            </Button>
          <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <X className="h-4 w-4 md:h-6 md:w-6" />
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
