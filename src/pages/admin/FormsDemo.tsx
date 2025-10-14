import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardList,
  GitBranch,
  ScrollText,
  FileText,
  Award,
  Building2,
  ArrowLeft,
  Sparkles,
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
    description: 'Collect client information, contact details, and passport data',
    icon: ClipboardList,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'familyTree',
    title: 'Family Tree',
    description: 'Document family structure and ancestry information',
    icon: GitBranch,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'familyHistory',
    title: 'Family History',
    description: 'Record family origin stories and cultural heritage',
    icon: ScrollText,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'poa',
    title: 'Power of Attorney',
    description: 'Generate POA documents for adults, minors, and spouses',
    icon: FileText,
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'citizenship',
    title: 'Citizenship Application',
    description: 'Complete Polish citizenship application form',
    icon: Award,
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'civilRegistry',
    title: 'Civil Registry',
    description: 'Civil registry applications and documentation',
    icon: Building2,
    color: 'from-teal-500 to-teal-600',
  },
];

export default function FormsDemo() {
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState<FormType>(null);

  const renderFormContent = () => {
    switch (openForm) {
      case 'intake':
        return <IntakeFormDemo onClose={() => setOpenForm(null)} />;
      case 'familyTree':
        return <FamilyTreeDemo onClose={() => setOpenForm(null)} />;
      case 'familyHistory':
        return <FamilyHistoryDemo onClose={() => setOpenForm(null)} />;
      case 'poa':
        return <POAFormDemo onClose={() => setOpenForm(null)} />;
      case 'citizenship':
        return <CitizenshipFormDemo onClose={() => setOpenForm(null)} />;
      case 'civilRegistry':
        return <CivilRegistryFormDemo onClose={() => setOpenForm(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
                Forms Inspection Center
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Test and perfect all forms with dummy data
              </p>
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
                <CardContent className="p-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br mb-4 flex items-center justify-center",
                    form.color,
                    "group-hover:scale-110 transition-transform duration-300"
                  )}>
                    <form.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-heading font-bold mb-2 group-hover:text-primary transition-colors">
                    {form.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {form.description}
                  </p>

                  <div className="mt-4 flex items-center text-primary text-sm font-medium gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-4 w-4" />
                    Click to inspect
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Form Dialog */}
        <Dialog open={openForm !== null} onOpenChange={() => setOpenForm(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto p-0">
            {renderFormContent()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
