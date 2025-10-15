import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Type, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { FamilyTreeInteractive } from "@/components/FamilyTreeInteractive";

export default function FamilyTreePage() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();
  const { isLargeFonts, toggleFontSize } = useAccessibility();
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('id', caseId)
          .single();

        if (error) throw error;
        
        // Use direct case data
        setFormData(data || {});
      } catch (error) {
        console.error('Error loading family tree data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [caseId]);

  const mapPersonData = (prefix: string) => ({
    firstName: formData[`${prefix}_first_name`] || "",
    lastName: formData[`${prefix}_last_name`] || "",
    maidenName: formData[`${prefix}_maiden_name`],
    dateOfBirth: formData[`${prefix}_dob`],
    placeOfBirth: formData[`${prefix}_pob`],
    dateOfMarriage: formData[`${prefix === 'applicant' ? 'date_of_marriage' : `${prefix}_date_of_marriage`}`],
    placeOfMarriage: formData[`${prefix === 'applicant' ? 'place_of_marriage' : `${prefix}_place_of_marriage`}`],
    dateOfEmigration: formData[`${prefix}_date_of_emigration`],
    dateOfNaturalization: formData[`${prefix}_date_of_naturalization`],
    isAlive: formData[`${prefix}_is_alive`],
    notes: formData[`${prefix}_notes`],
    documents: {
      birthCertificate: formData[`${prefix}_has_birth_cert`] || false,
      marriageCertificate: formData[`${prefix}_has_marriage_cert`] || false,
      passport: formData[`${prefix}_has_passport`] || false,
      naturalizationDocs: formData[`${prefix}_has_naturalization`] || false,
    }
  });

  const handlePersonEdit = (personType: string) => {
    // Navigate to the family tree form
    navigate(`/admin/family-tree/${caseId}`);
  };

  if (caseId !== 'demo-preview' && (!caseId || caseId === ':id')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 max-w-md">
          <CardContent>
            <p>Please navigate to this page from a valid case.</p>
            <Button onClick={() => navigate('/admin/cases')} className="mt-4">
              Go to Cases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-16 w-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden min-h-screen relative">
      {/* Checkered grid background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto py-12 px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text cursor-text select-text">
                Family Tree Visualization
              </h1>
            </motion.div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/admin/forms-demo')}
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                title="Back to Case"
              >
                <ArrowLeft className="h-8 w-8" />
              </Button>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 z-50 opacity-60"
                title="Login / Register"
              >
                <User className="h-8 w-8" />
              </Button>
              <Button
                onClick={toggleFontSize}
                size="lg"
                variant="ghost"
                className={`h-16 w-16 rounded-full transition-all hover:bg-primary/10 z-50 opacity-60 ${
                  isLargeFonts ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
                title="Toggle font size"
              >
                <Type className="h-8 w-8" />
              </Button>
              <Button
                onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                size="lg"
                variant="ghost"
                className="h-16 w-16 rounded-full transition-all text-muted-foreground hover:text-primary hover:bg-primary/10 text-2xl font-light opacity-60"
                title="How to fill this form"
              >
                ?
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Family Tree Interactive Component */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <FamilyTreeInteractive
            clientData={{
              ...mapPersonData('applicant'),
              sex: formData.applicant_sex
            }}
            spouse={formData.applicant_is_married ? mapPersonData('spouse') : undefined}
            father={mapPersonData('father')}
            mother={mapPersonData('mother')}
            paternalGrandfather={mapPersonData('pgf')}
            paternalGrandmother={mapPersonData('pgm')}
            maternalGrandfather={mapPersonData('mgf')}
            maternalGrandmother={mapPersonData('mgm')}
            paternalGreatGrandfather={mapPersonData('pggf_paternal')}
            paternalGreatGrandmother={mapPersonData('pggm_paternal')}
            maternalGreatGrandfather={mapPersonData('mggf_maternal')}
            maternalGreatGrandmother={mapPersonData('mggm_maternal')}
            onEdit={handlePersonEdit}
            onOpenMasterTable={() => navigate(`/admin/master-data/${caseId}`)}
          />
        </motion.div>
      </div>
    </div>
  );
}
