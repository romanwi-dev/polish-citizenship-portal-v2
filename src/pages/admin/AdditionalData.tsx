import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowLeft, User, Type, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { FormButtonsRow } from "@/components/FormButtonsRow";

export default function AdditionalData() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [isFullView, setIsFullView] = useState(false);

  if (!caseId || caseId === ':id') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Case ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please navigate to this page from a valid case detail page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden min-h-screen">
      <div className="container mx-auto py-12 px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="animate-fade-in-up sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0">
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <CardHeader className="pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="animate-fade-in">
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Additional Data
                  </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-2xl font-light opacity-60"
                    title="How to fill this form"
                  >
                    ?
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/forms-demo')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-60"
                    title="Back to Case"
                  >
                    <ArrowLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={() => setIsFullView(!isFullView)}
                    size="lg"
                    variant="ghost"
                    className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 opacity-60 ${
                      isFullView ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
                    }`}
                    title={isFullView ? "Collapse" : "Expand All"}
                  >
                    {isFullView ? <Minimize2 className="h-8 w-8" /> : <Maximize2 className="h-8 w-8" />}
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-60"
                    title="Login / Register"
                  >
                    <User className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={toggleFontSize}
                    size="lg"
                    variant="ghost"
                    className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 opacity-60 ${
                      isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
                    }`}
                    title="Toggle font size"
                  >
                    <Type className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <FormButtonsRow 
                caseId={caseId!}
                currentForm="additional-data"
                onSave={() => {}}
                onClear={() => {}}
                onGeneratePDF={() => {}}
                isSaving={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          <Card className="glass-card border-primary/20">
            <CardContent className="p-6 md:p-10">
              <p className="text-lg text-muted-foreground text-center">
                Combined Additional Information page - Coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
