/**
 * PDF Field Mappings for Citizenship (OBY) Template
 * Maps database columns from master_table to PDF form field names
 */

export const CITIZENSHIP_PDF_MAP: Record<string, string> = {
  // Applicant Section
  'OBY-A-GN': 'applicant_first_name',
  'OBY-A-SN': 'applicant_last_name',
  'OBY-A-BD': 'applicant_dob',
  'OBY-A-BP': 'applicant_pob',
  
  // Father Section  
  'OBY-F-GN': 'father_first_name',
  'OBY-F-SN': 'father_last_name',
  
  // Mother Section
  'OBY-M-GN': 'mother_first_name',
  'OBY-M-SN': 'mother_last_name',
  
  // Grandparents
  'OBY-PGF-GN': 'pgf_first_name',
  'OBY-PGF-SN': 'pgf_last_name',
  'OBY-PGM-GN': 'pgm_first_name',
  'OBY-PGM-SN': 'pgm_last_name',
  'OBY-MGF-GN': 'mgf_first_name',
  'OBY-MGF-SN': 'mgf_last_name',
  'OBY-MGM-GN': 'mgm_first_name',
  'OBY-MGM-SN': 'mgm_last_name',
};
