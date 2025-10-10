import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Type, Save, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useAccessibility } from "@/contexts/AccessibilityContext";

export default function AdditionalData() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();

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
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-t from-background via-primary/5 to-background pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="sticky top-0 z-20 bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm border-b mb-0"
        >
          <Card className="glass-card border-primary/20 overflow-hidden rounded-none border-x-0 border-t-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5" />
            <CardHeader className="relative pb-6 pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <CardTitle className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                    Additional Data
                  </CardTitle>
                </motion.div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => navigate(`/admin/case/${caseId}`)}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Back to Case"
                  >
                    <ArrowLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    size="lg"
                    variant="ghost"
                    className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Login / Register"
                  >
                    <User className="h-8 w-8" />
                  </Button>
                  <Button
                    onClick={toggleFontSize}
                    size="lg"
                    variant="ghost"
                    className={`h-16 w-16 rounded-full transition-all ${
                      isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                    }`}
                    title="Toggle font size"
                  >
                    <Type className="h-8 w-8" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Action Buttons Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-background via-background to-background/95 backdrop-blur-sm pb-4 pt-4"
        >
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 p-3 md:p-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <Button 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <Save className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Save data
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <Sparkles className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Clear Data
              </span>
            </Button>

            <Button 
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <Download className="h-4 md:h-5 w-4 md:w-5 mr-2 opacity-50" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Generate PDF
              </span>
            </Button>

            {/* Navigation Buttons */}
            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/intake`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Client Intake
              </span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/master-data`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Master Form
              </span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/family-tree`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[220px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Family Tree
              </span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/family-history`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Family History
              </span>
            </Button>

            <Button
              onClick={() => navigate(`/admin/cases/${caseId}/poa`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[180px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Power of Attorney
              </span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/citizenship`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px] md:min-w-[240px] lg:min-w-[280px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Citizenship Application
              </span>
            </Button>

            <Button 
              onClick={() => navigate(`/admin/cases/${caseId}/civil-registry`)}
              variant="outline" 
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Civil Registry
              </span>
            </Button>

            {/* Current form - Additional Data - HIGHLIGHTED */}
            <Button variant="default"
              className="text-sm md:text-base lg:text-lg font-bold px-4 md:px-6 lg:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-gradient-to-r from-primary to-secondary shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[200px] lg:min-w-[240px] whitespace-nowrap flex-shrink-0">
              <span className="text-white">Additional Data</span>
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-card border-primary/20">
            <CardContent className="p-6 md:p-10">
              <p className="text-lg text-muted-foreground text-center">
                Combined Additional Information page - Coming soon
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
