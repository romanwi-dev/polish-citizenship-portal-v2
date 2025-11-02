/**
 * OCR Field Mapping Configuration
 * Maps OCR extracted data to master_table columns based on person type and document type
 */

export type PersonType = 'AP' | 'SPOUSE' | 'F' | 'M' | 'PGF' | 'PGM' | 'MGF' | 'MGM';
export type DocumentType = 'birth_certificate' | 'marriage_certificate' | 'death_certificate' | 'naturalization' | 'passport' | 'military_record' | 'other';

export interface FieldMapping {
  ocrField: string; // Field name in OCR data
  masterField: string | string[]; // Field name(s) in master_table
  transform?: (value: any) => any; // Optional transformation function
}

/**
 * Maps OCR fields to master_table fields for each document type and person type
 */
export const OCR_FIELD_MAP: Record<DocumentType, Partial<Record<PersonType, FieldMapping[]>>> = {
  birth_certificate: {
    AP: [
      { ocrField: 'full_name', masterField: ['applicant_first_name', 'applicant_last_name'] },
      { ocrField: 'first_name', masterField: 'applicant_first_name' },
      { ocrField: 'last_name', masterField: 'applicant_last_name' },
      { ocrField: 'date_of_birth', masterField: 'applicant_date_of_birth' },
      { ocrField: 'place_of_birth', masterField: 'applicant_place_of_birth' },
      { ocrField: 'father_name', masterField: 'father_full_name' },
      { ocrField: 'mother_maiden_name', masterField: 'mother_maiden_name' },
      { ocrField: 'sex', masterField: 'applicant_sex' },
    ],
    F: [
      { ocrField: 'full_name', masterField: ['father_first_name', 'father_last_name'] },
      { ocrField: 'first_name', masterField: 'father_first_name' },
      { ocrField: 'last_name', masterField: 'father_last_name' },
      { ocrField: 'date_of_birth', masterField: 'father_date_of_birth' },
      { ocrField: 'place_of_birth', masterField: 'father_place_of_birth' },
      { ocrField: 'father_name', masterField: 'pgf_full_name' },
      { ocrField: 'mother_maiden_name', masterField: 'pgm_maiden_name' },
    ],
    M: [
      { ocrField: 'full_name', masterField: 'mother_maiden_name' },
      { ocrField: 'first_name', masterField: 'mother_first_name' },
      { ocrField: 'maiden_name', masterField: 'mother_maiden_name' },
      { ocrField: 'date_of_birth', masterField: 'mother_date_of_birth' },
      { ocrField: 'place_of_birth', masterField: 'mother_place_of_birth' },
      { ocrField: 'father_name', masterField: 'mgf_full_name' },
      { ocrField: 'mother_maiden_name', masterField: 'mgm_maiden_name' },
    ],
    PGF: [
      { ocrField: 'full_name', masterField: ['pgf_first_name', 'pgf_last_name'] },
      { ocrField: 'first_name', masterField: 'pgf_first_name' },
      { ocrField: 'last_name', masterField: 'pgf_last_name' },
      { ocrField: 'date_of_birth', masterField: 'pgf_date_of_birth' },
      { ocrField: 'place_of_birth', masterField: 'pgf_place_of_birth' },
    ],
    PGM: [
      { ocrField: 'full_name', masterField: 'pgm_maiden_name' },
      { ocrField: 'first_name', masterField: 'pgm_first_name' },
      { ocrField: 'maiden_name', masterField: 'pgm_maiden_name' },
      { ocrField: 'date_of_birth', masterField: 'pgm_date_of_birth' },
      { ocrField: 'place_of_birth', masterField: 'pgm_place_of_birth' },
    ],
    MGF: [
      { ocrField: 'full_name', masterField: ['mgf_first_name', 'mgf_last_name'] },
      { ocrField: 'first_name', masterField: 'mgf_first_name' },
      { ocrField: 'last_name', masterField: 'mgf_last_name' },
      { ocrField: 'date_of_birth', masterField: 'mgf_date_of_birth' },
      { ocrField: 'place_of_birth', masterField: 'mgf_place_of_birth' },
    ],
    MGM: [
      { ocrField: 'full_name', masterField: 'mgm_maiden_name' },
      { ocrField: 'first_name', masterField: 'mgm_first_name' },
      { ocrField: 'maiden_name', masterField: 'mgm_maiden_name' },
      { ocrField: 'date_of_birth', masterField: 'mgm_date_of_birth' },
      { ocrField: 'place_of_birth', masterField: 'mgm_place_of_birth' },
    ],
  },
  marriage_certificate: {
    AP: [
      { ocrField: 'spouse1_name', masterField: ['applicant_first_name', 'applicant_last_name'] },
      { ocrField: 'marriage_date', masterField: 'applicant_marriage_date' },
      { ocrField: 'marriage_place', masterField: 'applicant_marriage_place' },
    ],
    SPOUSE: [
      { ocrField: 'spouse2_name', masterField: ['spouse_first_name', 'spouse_last_name'] },
      { ocrField: 'marriage_date', masterField: 'spouse_marriage_date' },
    ],
    F: [
      { ocrField: 'marriage_date', masterField: 'father_marriage_date' },
      { ocrField: 'marriage_place', masterField: 'father_marriage_place' },
    ],
    M: [
      { ocrField: 'marriage_date', masterField: 'mother_marriage_date' },
    ],
  },
  naturalization: {
    AP: [
      { ocrField: 'full_name', masterField: ['applicant_first_name', 'applicant_last_name'] },
      { ocrField: 'naturalization_date', masterField: 'applicant_naturalization_date' },
      { ocrField: 'naturalization_country', masterField: 'applicant_naturalization_country' },
      { ocrField: 'certificate_number', masterField: 'applicant_naturalization_cert_number' },
    ],
    F: [
      { ocrField: 'full_name', masterField: ['father_first_name', 'father_last_name'] },
      { ocrField: 'naturalization_date', masterField: 'father_naturalization_date' },
      { ocrField: 'naturalization_country', masterField: 'father_naturalization_country' },
    ],
    PGF: [
      { ocrField: 'naturalization_date', masterField: 'pgf_naturalization_date' },
      { ocrField: 'naturalization_country', masterField: 'pgf_naturalization_country' },
    ],
  },
  passport: {
    AP: [
      { ocrField: 'full_name', masterField: ['applicant_first_name', 'applicant_last_name'] },
      { ocrField: 'date_of_birth', masterField: 'applicant_date_of_birth' },
      { ocrField: 'sex', masterField: 'applicant_sex' },
      { ocrField: 'passport_number', masterField: 'applicant_passport_number' },
      { ocrField: 'issue_date', masterField: 'applicant_passport_issue_date' },
      { ocrField: 'expiry_date', masterField: 'applicant_passport_expiry_date' },
    ],
  },
  death_certificate: {
    F: [
      { ocrField: 'date_of_death', masterField: 'father_date_of_death' },
      { ocrField: 'place_of_death', masterField: 'father_place_of_death' },
    ],
    M: [
      { ocrField: 'date_of_death', masterField: 'mother_date_of_death' },
      { ocrField: 'place_of_death', masterField: 'mother_place_of_death' },
    ],
    PGF: [
      { ocrField: 'date_of_death', masterField: 'pgf_date_of_death' },
    ],
    PGM: [
      { ocrField: 'date_of_death', masterField: 'pgm_date_of_death' },
    ],
  },
  military_record: {
    F: [
      { ocrField: 'service_dates', masterField: 'father_military_service_dates' },
      { ocrField: 'rank', masterField: 'father_military_rank' },
    ],
    PGF: [
      { ocrField: 'service_dates', masterField: 'pgf_military_service_dates' },
    ],
  },
  other: {},
};

/**
 * Get field mappings for a specific document type and person type
 */
export function getFieldMappings(documentType: DocumentType, personType: PersonType): FieldMapping[] {
  return OCR_FIELD_MAP[documentType]?.[personType] || [];
}

/**
 * Parse full name into first and last name
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const firstName = parts.slice(0, -1).join(' ');
  const lastName = parts[parts.length - 1];
  return { firstName, lastName };
}

/**
 * Apply OCR data to master table update object
 */
export function mapOCRToMasterTable(
  ocrData: Record<string, any>,
  documentType: DocumentType,
  personType: PersonType
): Record<string, any> {
  const mappings = getFieldMappings(documentType, personType);
  const updates: Record<string, any> = {};

  for (const mapping of mappings) {
    const ocrValue = ocrData[mapping.ocrField];
    if (ocrValue === undefined || ocrValue === null) continue;

    const finalValue = mapping.transform ? mapping.transform(ocrValue) : ocrValue;

    if (Array.isArray(mapping.masterField)) {
      // Handle full name splitting
      if (mapping.ocrField === 'full_name') {
        const { firstName, lastName } = parseFullName(finalValue);
        updates[mapping.masterField[0]] = firstName;
        updates[mapping.masterField[1]] = lastName;
      }
    } else {
      updates[mapping.masterField] = finalValue;
    }
  }

  return updates;
}
