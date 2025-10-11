import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Simple, reliable form sync - load once, save on demand
 */
export const useFormSync = (caseId: string | undefined) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load data when caseId changes
  useEffect(() => {
    if (!caseId || caseId === ':id') {
      setFormData({});
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      // Removed production console.log
      
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

      // Removed production console.log
      setFormData(data || {});
      setIsLoading(false);
    };

    loadData();
  }, [caseId]); // Re-load when caseId changes

  // Save function
  const saveData = useCallback(async (updates: any) => {
    if (!caseId || caseId === ':id') return false;

    setIsSaving(true);
    // Removed production console.log

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

      // Removed production console.log
      
      // Update local state with merged data
      setFormData((prev: any) => ({ ...prev, ...updates }));
      
      // Invalidate React Query cache to force refetch
      await queryClient.invalidateQueries({ queryKey: ['masterData', caseId] });
      
      toast.success('Saved');
      setIsSaving(false);
      return true;
    } catch (error: any) {
      console.error('❌ Save error:', error);
      toast.error('Failed to save');
      setIsSaving(false);
      return false;
    }
  }, [caseId, queryClient]);

  // Clear all data - set all fields to empty strings/null except case_id
  const clearAll = useCallback(async () => {
    if (!caseId || caseId === ':id') return;
    
    // Removed production console.log
    
    setIsSaving(true);
    
    try {
      // Get all current fields from the master_table for this case
      const { data: currentData, error: fetchError } = await supabase
        .from('master_table')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      // Create an object with all fields set to null (except case_id and system fields)
      const clearedData: any = {};
      if (currentData) {
        Object.keys(currentData).forEach(key => {
          // Skip system fields
          if (!['id', 'case_id', 'created_at', 'updated_at'].includes(key)) {
            clearedData[key] = null;
          }
        });
      }
      
      // Removed production console.log
      
      // Update the record with all fields set to null
      const { error } = await supabase
        .from('master_table')
        .update(clearedData)
        .eq('case_id', caseId);
      
      if (error) throw error;
      
      // Removed production console.log
      
      // Clear local state
      setFormData({});
      
      // Invalidate cache to force refetch (will return empty values)
      await queryClient.invalidateQueries({ queryKey: ['masterData', caseId] });
      
      toast.success('All data cleared');
      setIsSaving(false);
    } catch (error: any) {
      console.error('❌ Clear error:', error);
      toast.error('Failed to clear data');
      setIsSaving(false);
    }
  }, [caseId, queryClient]);

  // Clear single field
  const clearField = useCallback(async (field: string) => {
    // Removed production console.log
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
