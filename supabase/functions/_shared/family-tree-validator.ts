/**
 * Family Tree Pre-Generation Validator
 * Validates data completeness before PDF generation
 */

export interface FamilyTreeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  bloodline: 'paternal' | 'maternal' | 'unknown';
  dataCompleteness: number;
  missingRequired: string[];
}

export function validateFamilyTreeData(masterData: Record<string, any>): FamilyTreeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];
  
  // Determine bloodline
  const fatherIsPolish = masterData.father_is_polish === true;
  const motherIsPolish = masterData.mother_is_polish === true;
  
  let bloodline: 'paternal' | 'maternal' | 'unknown' = 'unknown';
  
  if (fatherIsPolish && motherIsPolish) {
    warnings.push('Both parents marked as Polish. Using paternal bloodline by default.');
    bloodline = 'paternal';
  } else if (fatherIsPolish) {
    bloodline = 'paternal';
  } else if (motherIsPolish) {
    bloodline = 'maternal';
  } else {
    errors.push('No Polish parent identified. Cannot determine bloodline for Family Tree.');
  }
  
  // Check applicant required fields
  const applicantFields = [
    'applicant_first_name',
    'applicant_last_name',
    'applicant_dob',
  ];
  
  for (const field of applicantFields) {
    if (!masterData[field]) {
      missingRequired.push(field);
    }
  }
  
  // Check parent fields based on bloodline
  if (bloodline === 'paternal') {
    const paternalFields = [
      'father_first_name',
      'father_last_name',
      'father_dob',
      'mother_first_name',
      'mother_maiden_name',
      'father_mother_marriage_date',
      'pgf_first_name',
      'pgf_last_name',
      'pgf_dob',
      'pgm_first_name',
      'pgm_maiden_name',
      'pgf_pgm_marriage_date',
      'pggf_first_name',
      'pggf_last_name',
      'pggm_first_name',
      'pggm_maiden_name',
    ];
    
    for (const field of paternalFields) {
      if (!masterData[field]) {
        missingRequired.push(field);
      }
    }
  } else if (bloodline === 'maternal') {
    const maternalFields = [
      'mother_first_name',
      'mother_maiden_name',
      'mother_dob',
      'father_first_name',
      'father_last_name',
      'father_mother_marriage_date',
      'mgf_first_name',
      'mgf_last_name',
      'mgf_dob',
      'mgm_first_name',
      'mgm_maiden_name',
      'mgf_mgm_marriage_date',
      'mggf_first_name',
      'mggf_last_name',
      'mggm_first_name',
      'mggm_maiden_name',
    ];
    
    for (const field of maternalFields) {
      if (!masterData[field]) {
        missingRequired.push(field);
      }
    }
  }
  
  // Check for minor children overflow (PDF supports only 3)
  const childrenFields = [];
  for (let i = 1; i <= 10; i++) {
    if (masterData[`child_${i}_first_name`] || masterData[`child_${i}_last_name`]) {
      childrenFields.push(i);
    }
  }
  
  if (childrenFields.length > 3) {
    warnings.push(
      `You have ${childrenFields.length} minor children, but PDF template only supports 3. ` +
      `Children ${childrenFields.slice(3).join(', ')} will not appear in the PDF.`
    );
  }
  
  // Calculate data completeness
  const totalRequiredFields = applicantFields.length + (bloodline === 'paternal' ? 16 : 16);
  const filledFields = totalRequiredFields - missingRequired.length;
  const dataCompleteness = Math.round((filledFields / totalRequiredFields) * 100);
  
  // Determine if valid (no errors)
  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    warnings,
    bloodline,
    dataCompleteness,
    missingRequired,
  };
}
