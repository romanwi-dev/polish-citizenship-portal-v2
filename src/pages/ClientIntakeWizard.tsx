import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { ProgressStepper } from "@/components/intake-wizard/ProgressStepper";
import { LanguageSwitcher } from "@/components/intake-wizard/LanguageSwitcher";
import { Step1BasicInfo } from "@/components/intake-wizard/Step1BasicInfo";
import { Step2Contact } from "@/components/intake-wizard/Step2Contact";
import { Step3Passport } from "@/components/intake-wizard/Step3Passport";
import { Step4Family } from "@/components/intake-wizard/Step4Family";
import { Step5PolishConnection } from "@/components/intake-wizard/Step5PolishConnection";
import { Step6Additional } from "@/components/intake-wizard/Step6Additional";
import { Step7Review } from "@/components/intake-wizard/Step7Review";

export default function ClientIntakeWizard() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [dontKnowFields, setDontKnowFields] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 7;
  const stepLabels = [
    t('steps.basicInfo'),
    t('steps.contact'),
    t('steps.passport'),
    t('steps.family'),
    t('steps.polishConnection'),
    t('steps.additional'),
    t('steps.review'),
  ];

  // Validate token and load case data
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error('Invalid access link');
        navigate('/');
        return;
      }

      try {
        // TODO: Implement token validation via edge function
        // For now, extract caseId from token (format: case_{caseId}_{timestamp})
        const parts = token.split('_');
        if (parts.length >= 2 && parts[0] === 'case') {
          const extractedCaseId = parts[1];
          setCaseId(extractedCaseId);
          
          // Load existing intake data
          const { data, error } = await supabase
            .from('intake_data')
            .select('*')
            .eq('case_id', extractedCaseId)
            .maybeSingle();
          
          if (error) throw error;
          if (data) {
            setFormData(data);
          }
        } else {
          throw new Error('Invalid token format');
        }
      } catch (error) {
        console.error('Token validation error');
        toast.error('Invalid or expired access link');
        navigate('/');
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDontKnowToggle = (field: string, checked: boolean) => {
    setDontKnowFields((prev) => {
      const updated = new Set(prev);
      if (checked) {
        updated.add(field);
        // Clear the field value when "don't know" is checked
        handleFieldChange(field, '');
      } else {
        updated.delete(field);
      }
      return updated;
    });
  };

  const saveProgress = async () => {
    if (!caseId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('intake_data')
        .upsert({
          case_id: caseId,
          ...formData,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      toast.success(t('progressSaved'));
    } catch (error) {
      console.error('Save error');
      toast.error(t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Auto-save before moving to next step
    await saveProgress();
    
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!caseId) return;
    
    setIsSubmitting(true);
    try {
      // Save final data
      const { error: updateError } = await supabase
        .from('intake_data')
        .upsert({
          case_id: caseId,
          ...formData,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        });
      
      if (updateError) throw updateError;
      
      toast.success(t('submitted'));
      
      // Redirect to thank you page or client dashboard
      setTimeout(() => {
        navigate(`/client/dashboard/${caseId}`);
      }, 2000);
    } catch (error) {
      console.error('Submit error');
      toast.error(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepComponents = [
    <Step1BasicInfo
      formData={formData}
      onChange={handleFieldChange}
      dontKnowFields={dontKnowFields}
      onDontKnowToggle={handleDontKnowToggle}
    />,
    <Step2Contact
      formData={formData}
      onChange={handleFieldChange}
      dontKnowFields={dontKnowFields}
      onDontKnowToggle={handleDontKnowToggle}
    />,
    <Step3Passport
      formData={formData}
      onChange={handleFieldChange}
      dontKnowFields={dontKnowFields}
      onDontKnowToggle={handleDontKnowToggle}
    />,
    <Step4Family
      formData={formData}
      onChange={handleFieldChange}
      dontKnowFields={dontKnowFields}
      onDontKnowToggle={handleDontKnowToggle}
    />,
    <Step5PolishConnection
      formData={formData}
      onChange={handleFieldChange}
      dontKnowFields={dontKnowFields}
      onDontKnowToggle={handleDontKnowToggle}
    />,
    <Step6Additional
      formData={formData}
      onChange={handleFieldChange}
      dontKnowFields={dontKnowFields}
      onDontKnowToggle={handleDontKnowToggle}
    />,
    <Step7Review
      formData={formData}
      dontKnowFields={dontKnowFields}
    />,
  ];

  if (!caseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {t('steps.basicInfo')} - {t('step')} {currentStep}
          </h1>
          <LanguageSwitcher />
        </div>

        {/* Progress Stepper */}
        <ProgressStepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />

        {/* Main Content */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{stepLabels[currentStep - 1]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stepComponents[currentStep - 1]}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('previous')}
          </Button>

          <Button
            variant="ghost"
            onClick={saveProgress}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '...' : t('saveProgress')}
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} className="gap-2">
              {t('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? t('submitting') : t('submit')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
