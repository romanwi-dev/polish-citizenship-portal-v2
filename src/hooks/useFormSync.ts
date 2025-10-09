import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Simple, reliable form sync - load once, save on demand
 */
export const useFormSync = (caseId: string | undefined) => {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load data once on mount
  useEffect(() => {
    if (!caseId || caseId === ':id') return;

    const loadData = async () => {
      console.log('📥 Loading data for case:', caseId);
      
      const { data, error } = await supabase
        .from('master_table')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();

      if (error) {
        console.error('❌ Load error:', error);
        toast.error('Failed to load data');
        setIsLoading(false);
        return;
      }

      console.log('✅ Data loaded:', data ? Object.keys(data).length + ' fields' : 'empty');
      setFormData(data || {});
      setIsLoading(false);
    };

    loadData();
  }, []); // Load once only

  // Save function
  const saveData = useCallback(async (updates: any) => {
    if (!caseId || caseId === ':id') return false;

    setIsSaving(true);
    console.log('💾 Saving data:', Object.keys(updates).length, 'fields');

    try {
      const { data: existing } = await supabase
        .from('master_table')
        .select('id')
        .eq('case_id', caseId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('master_table')
          .update(updates)
          .eq('case_id', caseId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('master_table')
          .insert({ case_id: caseId, ...updates });

        if (error) throw error;
      }

      console.log('✅ Data saved successfully');
      setFormData(updates);
      toast.success('Saved');
      setIsSaving(false);
      return true;
    } catch (error: any) {
      console.error('❌ Save error:', error);
      toast.error('Failed to save');
      setIsSaving(false);
      return false;
    }
  }, [caseId]);

  // Clear all data
  const clearAll = useCallback(async () => {
    console.log('🧹 Clearing all data');
    const cleared = {};
    setFormData(cleared);
    await saveData(cleared);
  }, [saveData]);

  // Clear single field
  const clearField = useCallback(async (field: string) => {
    console.log('🧹 Clearing field:', field);
    const updated = { ...formData, [field]: null };
    setFormData(updated);
    await saveData({ [field]: null });
  }, [formData, saveData]);

  return {
    formData,
    setFormData,
    isLoading,
    isSaving,
    saveData,
    clearAll,
    clearField,
  };
};
