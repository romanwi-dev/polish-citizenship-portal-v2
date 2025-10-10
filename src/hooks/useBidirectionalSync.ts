import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ALL_FIELD_MAPPINGS } from '@/config/fieldMappings';

/**
 * Bidirectional sync between intake_data and master_table
 * Automatically syncs changes in both directions based on field mappings
 */
export const useBidirectionalSync = (caseId: string | undefined) => {
  
  // Normalize gender/sex values
  const normalizeGender = (value: any): string | null => {
    if (!value) return null;
    const val = String(value).toUpperCase();
    if (val.includes('MALE') || val.includes('MĘZCZYZNA') || val === 'M') return 'M';
    if (val.includes('FEMALE') || val.includes('KOBIETA') || val === 'F') return 'F';
    return null;
  };

  // Sync intake_data -> master_table
  const syncIntakeToMaster = useCallback(async (intakeData: any) => {
    if (!caseId || !intakeData) return;

    const masterUpdates: any = {};
    
    // Map intake fields to master fields
    ALL_FIELD_MAPPINGS.forEach(mapping => {
      if (mapping.dbTable === 'intake_data' && intakeData[mapping.dbColumn] !== undefined) {
        // Find corresponding master_table field
        const masterMapping = ALL_FIELD_MAPPINGS.find(
          m => m.dbTable === 'master_table' && 
          (m.formField === mapping.formField || m.dbColumn === mapping.dbColumn)
        );
        
        if (masterMapping) {
          let value = intakeData[mapping.dbColumn];
          // Normalize gender/sex values
          if (mapping.dbColumn === 'sex' || mapping.dbColumn === 'applicant_sex') {
            value = normalizeGender(value);
          }
          masterUpdates[masterMapping.dbColumn] = value;
        }
      }
    });

    // Additional direct mappings for common fields
    const directMappings: Record<string, string> = {
      'first_name': 'applicant_first_name',
      'last_name': 'applicant_last_name',
      'maiden_name': 'applicant_maiden_name',
      'sex': 'applicant_sex',
      'date_of_birth': 'applicant_dob',
      'place_of_birth': 'applicant_pob',
      'email': 'applicant_email',
      'phone': 'applicant_phone',
      'current_citizenship': 'applicant_current_citizenship',
      'passport_number': 'applicant_passport_number',
      'passport_issuing_country': 'applicant_passport_issuing_country',
      'passport_issue_date': 'applicant_passport_issue_date',
      'passport_expiry_date': 'applicant_passport_expiry_date',
      'address': 'applicant_address',
    };

    Object.entries(directMappings).forEach(([intakeField, masterField]) => {
      if (intakeData[intakeField] !== undefined) {
        let value = intakeData[intakeField];
        // Normalize gender/sex values
        if (intakeField === 'sex') {
          value = normalizeGender(value);
        }
        masterUpdates[masterField] = value;
      }
    });

    if (Object.keys(masterUpdates).length > 0) {
      const { data: existing } = await supabase
        .from('master_table')
        .select('id')
        .eq('case_id', caseId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('master_table')
          .update(masterUpdates)
          .eq('case_id', caseId);
      } else {
        await supabase
          .from('master_table')
          .insert({ case_id: caseId, ...masterUpdates });
      }
    }
  }, [caseId]);

  // Sync master_table -> intake_data
  const syncMasterToIntake = useCallback(async (masterData: any) => {
    if (!caseId || !masterData) return;

    const intakeUpdates: any = {};
    
    // Reverse mapping: master fields to intake fields
    const reverseMappings: Record<string, string> = {
      'applicant_first_name': 'first_name',
      'applicant_last_name': 'last_name',
      'applicant_maiden_name': 'maiden_name',
      'applicant_sex': 'sex',
      'applicant_dob': 'date_of_birth',
      'applicant_pob': 'place_of_birth',
      'applicant_email': 'email',
      'applicant_phone': 'phone',
      'applicant_current_citizenship': 'current_citizenship',
      'applicant_passport_number': 'passport_number',
      'applicant_passport_issuing_country': 'passport_issuing_country',
      'applicant_passport_issue_date': 'passport_issue_date',
      'applicant_passport_expiry_date': 'passport_expiry_date',
      'applicant_address': 'address',
    };

    // Map common family fields (these are already same name in both tables)
    const commonFields = [
      'father_first_name', 'father_last_name', 'father_pob', 'father_dob',
      'mother_first_name', 'mother_last_name', 'mother_maiden_name', 'mother_pob', 'mother_dob',
      'pgf_first_name', 'pgf_last_name', 'pgf_pob', 'pgf_dob',
      'pgm_first_name', 'pgm_last_name', 'pgm_maiden_name', 'pgm_pob', 'pgm_dob',
      'mgf_first_name', 'mgf_last_name', 'mgf_pob', 'mgf_dob',
      'mgm_first_name', 'mgm_last_name', 'mgm_maiden_name', 'mgm_pob', 'mgm_dob',
      'ancestry_line', 'language_preference'
    ];

    // Apply reverse mappings
    Object.entries(reverseMappings).forEach(([masterField, intakeField]) => {
      if (masterData[masterField] !== undefined) {
        intakeUpdates[intakeField] = masterData[masterField];
      }
    });

    // Apply common fields
    commonFields.forEach(field => {
      if (masterData[field] !== undefined) {
        intakeUpdates[field] = masterData[field];
      }
    });

    if (Object.keys(intakeUpdates).length > 0) {
      const { data: existing } = await supabase
        .from('intake_data')
        .select('id')
        .eq('case_id', caseId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('intake_data')
          .update(intakeUpdates)
          .eq('case_id', caseId);
      } else {
        await supabase
          .from('intake_data')
          .insert({ case_id: caseId, ...intakeUpdates });
      }
    }
  }, [caseId]);

  return {
    syncIntakeToMaster,
    syncMasterToIntake,
  };
};
