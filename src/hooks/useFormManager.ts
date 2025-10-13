/**
 * Universal form manager hook
 * Combines common form logic for all forms
 */

import { useState, useEffect } from 'react';
import { useMasterData, useUpdateMasterData } from './useMasterData';
import { useRealtimeFormSync } from './useRealtimeFormSync';
import { useFormCompletion } from './useFormCompletion';
import { useAutoSave } from './useAutoSave';
import { useUnsavedChanges } from './useUnsavedChanges';
import { useFieldValidation } from './useFieldValidation';

export const useFormManager = (
  caseId: string | undefined,
  requiredFields: string[],
  dateFields: string[] = []
) => {
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMasterData = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("applicant");
  const [isFullView, setIsFullView] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Real-time sync
  useRealtimeFormSync(caseId, masterData, isLoading, setFormData);

  // Calculate completion
  const completion = useFormCompletion(formData, requiredFields);

  // Field validation
  const validation = useFieldValidation(formData, requiredFields, dateFields);

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

  // Save handler
  const handleSave = async () => {
    if (!caseId) return;
    await updateMasterData.mutateAsync({
      caseId,
      updates: formData,
    });
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
