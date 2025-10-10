/**
 * Universal form manager hook
 * Combines common form logic for all forms
 */

import { useState, useEffect } from 'react';
import { useMasterData, useUpdateMasterData } from './useMasterData';
import { useRealtimeFormSync } from './useRealtimeFormSync';
import { useFormCompletion } from './useFormCompletion';

export const useFormManager = (
  caseId: string | undefined,
  requiredFields: string[]
) => {
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMasterData = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("applicant");
  const [isFullView, setIsFullView] = useState(false);

  // Real-time sync
  useRealtimeFormSync(caseId, masterData, isLoading, setFormData);

  // Calculate completion
  const completion = useFormCompletion(formData, requiredFields);

  // Input change handler
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
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
    handleInputChange,
    handleSave,
    handleClearField,
    handleClearAll,
  };
};
