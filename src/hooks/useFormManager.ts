/**
 * Universal form manager hook
 * Combines common form logic for all forms
 */

import { useState, useEffect, useMemo } from 'react';
import { useMasterData, useUpdateMasterData } from './useMasterData';
import { useRealtimeFormSync } from './useRealtimeFormSync';
import { useFormCompletion } from './useFormCompletion';
import { useAutoSave } from './useAutoSave';
import { useUnsavedChanges } from './useUnsavedChanges';
import { useFieldValidation } from './useFieldValidation';
import { toast } from 'sonner';

export const useFormManager = (
  caseId: string | undefined,
  requiredFields: string[],
  dateFields: string[] = []
) => {
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMasterData = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("select");
  const [isFullView, setIsFullView] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Real-time sync
  useRealtimeFormSync(caseId, masterData, isLoading, setFormData);

  // Calculate completion
  const completion = useFormCompletion(formData, requiredFields);

  // Field validation
  // Identify phone, email, passport fields dynamically
  const phoneFields = useMemo(() => requiredFields.filter(f => f.includes('phone')), [requiredFields]);
  const emailFields = useMemo(() => requiredFields.filter(f => f.includes('email')), [requiredFields]);
  const passportFields = useMemo(() => requiredFields.filter(f => f.includes('passport')), [requiredFields]);

  const validation = useFieldValidation(formData, requiredFields, dateFields, phoneFields, emailFields, passportFields);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(masterData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, masterData]);

  // Unsaved changes protection
  useUnsavedChanges(hasUnsavedChanges);

  // Auto-save (30 seconds after last change)
  const handleAutoSave = async () => {
    if (!caseId || !hasUnsavedChanges) return;
    await updateMasterData.mutateAsync({
      caseId,
      updates: formData,
    });
  };

  const autoSave = useAutoSave({
    data: formData,
    onSave: handleAutoSave,
    interval: 30000,
    enabled: !!caseId && hasUnsavedChanges,
  });

  // Input change handler
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Save handler with optional validation
  const handleSave = async () => {
    if (!caseId) return false;
    
    // Optional: Block save if critical fields missing (configurable)
    const criticalFieldsMissing = validation.errors.some(e => 
      e.message === 'This field is required' && 
      ['applicant_first_name', 'applicant_last_name'].includes(e.field)
    );
    
    if (criticalFieldsMissing && completion.completionPercentage < 10) {
      toast.error('Please fill in at least the applicant name before saving');
      return false;
    }
    
    try {
      await updateMasterData.mutateAsync({
        caseId,
        updates: formData,
      });
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  };

  // Clear field handler
  const handleClearField = (field: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: null }));
  };

  // Clear all handler
  const handleClearAll = async () => {
    const clearedData = Object.keys(formData).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as any);
    
    setFormData(clearedData);
    
    if (caseId) {
      await updateMasterData.mutateAsync({
        caseId,
        updates: clearedData,
      });
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    isSaving: updateMasterData.isPending,
    activeTab,
    setActiveTab,
    isFullView,
    setIsFullView,
    completion,
    validation,
    autoSave,
    hasUnsavedChanges,
    handleInputChange,
    handleSave,
    handleClearField,
    handleClearAll,
  };
};
