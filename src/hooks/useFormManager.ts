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
    
    console.log('🔄 [Auto-save] Starting...', { caseId, fieldCount: Object.keys(formData).length });
    
    try {
      await updateMasterData.mutateAsync({
        caseId,
        updates: formData,
      });
      console.log('✅ [Auto-save] Success');
    } catch (error: any) {
      console.error('❌ [Auto-save] FAILED:', error);
      toast.error(`Auto-save failed: ${error.message}`);
    }
  };

  const autoSave = useAutoSave({
    data: formData,
    onSave: handleAutoSave,
    interval: 30000,
    enabled: !!caseId && hasUnsavedChanges,
  });

  // Input change handler with automatic field syncing
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => {
      const updates: any = { [field]: value };
      
      // AUTO-SYNC: Keep minor children fields in sync
      if (field === 'minor_children_count') {
        const count = parseInt(value) || 0;
        updates.applicant_has_minor_children = count > 0 ? 'yes' : 'no';
        updates.applicant_number_of_children = count.toString();
      }
      
      // AUTO-SYNC: If applicant_number_of_children changes, update related fields
      if (field === 'applicant_number_of_children') {
        const count = parseInt(value) || 0;
        updates.applicant_has_minor_children = count > 0 ? 'yes' : 'no';
        // If minor_children_count is not set or is greater than total, adjust it
        if (!prev.minor_children_count || parseInt(prev.minor_children_count) > count) {
          updates.minor_children_count = count;
        }
      }
      
      // AUTO-SYNC: If applicant_has_minor_children changes to "no", clear counts
      if (field === 'applicant_has_minor_children' && (value === 'no' || value === 'No')) {
        updates.applicant_number_of_children = '0';
        updates.minor_children_count = 0;
      }
      
      return { ...prev, ...updates };
    });
    setHasUnsavedChanges(true);
  };

  // Save handler with optional validation
  const handleSave = async () => {
    if (!caseId) return false;
    
    console.log('💾 [Manual Save] Starting...', { 
      caseId, 
      fieldCount: Object.keys(formData).length,
      sampleFields: {
        applicant_first_name: formData.applicant_first_name,
        applicant_last_name: formData.applicant_last_name,
        father_first_name: formData.father_first_name,
      }
    });
    
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
      console.log('✅ [Manual Save] Success');
      toast.success('Data saved successfully');
      return true;
    } catch (error: any) {
      console.error('❌ [Manual Save] FAILED:', error);
      toast.error(error?.message || 'Failed to save data. Please try again.');
      return false;
    }
  };

  // Clear field handler
  const handleClearField = (field: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: null }));
  };

  // Clear all handler (preserves dates AND marriage name fields)
  const handleClearAll = async () => {
    const fieldsToPreserve = [
      ...dateFields,
      'wife_last_name_after_marriage',
      'husband_last_name_after_marriage',
    ];
    
    const clearedData = Object.keys(formData).reduce((acc, key) => {
      // Preserve date fields and marriage name fields
      if (fieldsToPreserve.includes(key)) {
        acc[key] = formData[key];
      } else {
        acc[key] = null;
      }
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
