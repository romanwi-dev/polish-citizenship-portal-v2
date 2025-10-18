import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOBYAutoPopulation(caseId: string) {
  const { data: intakeData, isLoading: loadingIntake } = useQuery({
    queryKey: ['intake-data', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('intake_data')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  const { data: masterData, isLoading: loadingMaster } = useQuery({
    queryKey: ['master-table', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_table')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  const generateOBYData = () => {
    if (!intakeData && !masterData) {
      toast.error('No intake or master data found');
      return null;
    }

    // Helper functions for type-safe field access
    const getIntakeField = (field: string) => intakeData ? (intakeData as any)[field] : null;
    const getMasterField = (field: string) => masterData ? (masterData as any)[field] : null;
    const getField = (field: string) => getIntakeField(field) || getMasterField(field);

    return {
      // Section 1: Applicant Information
      applicant_first_name: getIntakeField('first_name') || getMasterField('applicant_first_name'),
      applicant_last_name: getIntakeField('last_name') || getMasterField('applicant_last_name'),
      applicant_maiden_name: getIntakeField('maiden_name') || getMasterField('applicant_maiden_name'),
      applicant_dob: getIntakeField('date_of_birth') || getMasterField('applicant_dob'),
      applicant_pob: getIntakeField('place_of_birth') || getMasterField('applicant_pob'),
      applicant_sex: getIntakeField('sex') || getMasterField('applicant_sex'),
      applicant_current_citizenship: getIntakeField('current_citizenship') || getMasterField('applicant_current_citizenship'),
      
      // Contact Information
      applicant_email: getIntakeField('email') || getMasterField('applicant_email'),
      applicant_phone: getIntakeField('phone') || getMasterField('applicant_phone'),
      applicant_address: getIntakeField('address') || getMasterField('applicant_address'),
      
      // Passport Information
      applicant_passport_number: getIntakeField('passport_number') || getMasterField('applicant_passport_number'),
      applicant_passport_issuing_country: getIntakeField('passport_issuing_country') || getMasterField('applicant_passport_issuing_country'),
      applicant_passport_issue_date: getIntakeField('passport_issue_date') || getMasterField('applicant_passport_issue_date'),
      applicant_passport_expiry_date: getIntakeField('passport_expiry_date') || getMasterField('applicant_passport_expiry_date'),
      
      // Section 2: Parents
      father_first_name: getField('father_first_name'),
      father_last_name: getField('father_last_name'),
      father_dob: getField('father_dob'),
      father_pob: getField('father_pob'),
      
      mother_first_name: getField('mother_first_name'),
      mother_last_name: getField('mother_last_name'),
      mother_maiden_name: getField('mother_maiden_name'),
      mother_dob: getField('mother_dob'),
      mother_pob: getField('mother_pob'),
      
      // Section 3: Grandparents (Paternal)
      pgf_first_name: getField('pgf_first_name'),
      pgf_last_name: getField('pgf_last_name'),
      pgf_dob: getField('pgf_dob'),
      pgf_pob: getField('pgf_pob'),
      
      pgm_first_name: getField('pgm_first_name'),
      pgm_last_name: getField('pgm_last_name'),
      pgm_maiden_name: getField('pgm_maiden_name'),
      pgm_dob: getField('pgm_dob'),
      pgm_pob: getField('pgm_pob'),
      
      // Section 4: Grandparents (Maternal)
      mgf_first_name: getField('mgf_first_name'),
      mgf_last_name: getField('mgf_last_name'),
      mgf_dob: getField('mgf_dob'),
      mgf_pob: getField('mgf_pob'),
      
      mgm_first_name: getField('mgm_first_name'),
      mgm_last_name: getField('mgm_last_name'),
      mgm_maiden_name: getField('mgm_maiden_name'),
      mgm_dob: getField('mgm_dob'),
      mgm_pob: getField('mgm_pob'),
      
      // Section 5: Spouse (if applicable)
      spouse_first_name: getField('spouse_first_name'),
      spouse_last_name: getField('spouse_last_name'),
      spouse_dob: getField('spouse_dob'),
      spouse_pob: getField('spouse_pob'),
      date_of_marriage: getField('date_of_marriage'),
      
      // Section 6: Ancestry Line
      ancestry_line: getIntakeField('ancestry_line') || getMasterField('ancestry_line'),
      
      // Metadata
      case_id: caseId,
      status: 'draft',
      completion_percentage: 0,
    };
  };

  const calculateCompletionPercentage = (formData: any) => {
    const criticalFields = [
      'applicant_first_name', 'applicant_last_name', 'applicant_dob', 'applicant_pob',
      'father_first_name', 'father_last_name', 'mother_first_name', 'mother_last_name',
      'ancestry_line'
    ];
    
    const filledCritical = criticalFields.filter(field => formData[field]).length;
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(v => v !== null && v !== undefined && v !== '').length;
    
    // Weight critical fields more heavily
    const criticalWeight = 0.6;
    const overallWeight = 0.4;
    
    const criticalPercentage = (filledCritical / criticalFields.length) * 100;
    const overallPercentage = (filledFields / totalFields) * 100;
    
    return Math.round((criticalPercentage * criticalWeight) + (overallPercentage * overallWeight));
  };

  return {
    intakeData,
    masterData,
    generateOBYData,
    calculateCompletionPercentage,
    isLoading: loadingIntake || loadingMaster,
    hasData: !!(intakeData || masterData),
  };
}
