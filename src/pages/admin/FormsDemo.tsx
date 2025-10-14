import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import form components (we'll create demo versions)
import IntakeFormDemo from "@/components/forms-demo/IntakeFormDemo";
import FamilyTreeDemo from "@/components/forms-demo/FamilyTreeDemo";
import FamilyHistoryDemo from "@/components/forms-demo/FamilyHistoryDemo";
import POAFormDemo from "@/components/forms-demo/POAFormDemo";
import CitizenshipFormDemo from "@/components/forms-demo/CitizenshipFormDemo";
import CivilRegistryFormDemo from "@/components/forms-demo/CivilRegistryFormDemo";

type FormType = 'intake' | 'familyTree' | 'familyHistory' | 'poa' | 'citizenship' | 'civilRegistry' | null;

const formCards = [
  {
    id: 'intake',
    title: 'Client Intake',
  },
  {
    id: 'familyTree',
    title: 'Family Tree',
  },
  {
    id: 'familyHistory',
    title: 'Family History',
  },
  {
    id: 'poa',
    title: 'Power of Attorney',
  },
  {
    id: 'citizenship',
    title: 'Citizenship Application',
  },
  {
    id: 'civilRegistry',
    title: 'Civil Registry',
  },
];

export default function FormsDemo() {
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState<FormType>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const renderFormContent = () => {
    switch (openForm) {
      case 'intake':
        return <IntakeFormDemo onClose={() => setOpenForm(null)} isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />;
      case 'familyTree':
        return <FamilyTreeDemo onClose={() => setOpenForm(null)} isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />;
      case 'familyHistory':
        return <FamilyHistoryDemo onClose={() => setOpenForm(null)} isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />;
      case 'poa':
        return <POAFormDemo onClose={() => setOpenForm(null)} isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />;
      case 'citizenship':
        return <CitizenshipFormDemo onClose={() => setOpenForm(null)} isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />;
      case 'civilRegistry':
        return <CivilRegistryFormDemo onClose={() => setOpenForm(null)} isExpanded={isExpanded} onToggleExpand={() => setIsExpanded(!isExpanded)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient-shift" />
      
      {/* Animated grid pattern */}
      <div 
        className="fixed inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'float 20s ease-in-out infinite'
        }}
      />
      
      <div className="container mx-auto py-12 px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight" style={{
                background: 'linear-gradient(135deg, hsl(221, 83%, 53%) 0%, hsl(204, 70%, 53%) 50%, hsl(221, 50%, 45%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Forms Inspection
              </h1>
            </motion.div>

            <Button
              onClick={() => navigate('/admin/cases')}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Cases
            </Button>
          </div>
        </motion.div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formCards.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "cursor-pointer group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50",
                  "hover:scale-105 transform"
                )}
                onClick={() => setOpenForm(form.id as FormType)}
              >
                <CardContent className="p-8 flex items-center justify-center">
                  <h3 className="text-2xl font-heading font-black tracking-tight" style={{
                    background: 'linear-gradient(135deg, hsl(221, 83%, 53%) 0%, hsl(204, 70%, 53%) 50%, hsl(221, 50%, 45%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {form.title}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Form Dialog */}
        <Dialog open={openForm !== null} onOpenChange={() => { setOpenForm(null); setIsExpanded(false); }}>
          <DialogContent className={`${isExpanded ? 'max-w-[98vw] max-h-[98vh]' : 'max-w-[95vw] max-h-[95vh]'} overflow-y-auto p-0`} hideCloseButton>
            {renderFormContent()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
