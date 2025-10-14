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
}

export default function FamilyHistoryDemo({ onClose }: FamilyHistoryDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  return (
    <div className={`p-6 ${isLargeFonts ? 'text-lg' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
          Family History
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
          <CardTitle>Family Historical Narrative</CardTitle>
          <CardDescription>
            Document your family's journey, traditions, and heritage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Family Origin Story</Label>
            <Textarea
              value={formData.family_origin_story}
              onChange={(e) => setFormData({ ...formData, family_origin_story: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Emigration Journey</Label>
            <Textarea
              value={formData.emigration_journey}
              onChange={(e) => setFormData({ ...formData, emigration_journey: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Polish Cultural Traditions & Heritage</Label>
            <Textarea
              value={formData.cultural_traditions}
              onChange={(e) => setFormData({ ...formData, cultural_traditions: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Notable Family Stories & Anecdotes</Label>
            <Textarea
              value={formData.notable_stories}
              onChange={(e) => setFormData({ ...formData, notable_stories: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Historical Context</Label>
            <Textarea
              value={formData.historical_context}
              onChange={(e) => setFormData({ ...formData, historical_context: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label>Additional Notes & Information</Label>
            <Textarea
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
