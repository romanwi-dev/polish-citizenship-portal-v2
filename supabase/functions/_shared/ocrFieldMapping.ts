/**
 * Shared OCR field mapping logic for Deno edge functions
 * This ensures consistency between frontend and backend field mappings
 */

export type PersonType = 'AP' | 'SPOUSE' | 'F' | 'M' | 'PGF' | 'PGM' | 'MGF' | 'MGM' | 'CHILD_1' | 'CHILD_2' | 'CHILD_3' | 'CHILD_4' | 'CHILD_5';
export type DocumentType = 'birth_certificate' | 'marriage_certificate' | 'passport' | 'death_certificate' | 'naturalization' | 'military_record' | 'other';

export interface FieldMapping {
  ocrField: string;
  masterTableField: string;
  transform?: (value: any) => any;
}

/**
 * Get field mappings for a specific person and document type
 */
export function getFieldMappings(personType: PersonType, documentType: DocumentType | null): Record<string, string> {
  const prefix = getPersonPrefix(personType);
  
  // Base mappings that apply to all document types
  const baseMapping: Record<string, string> = {
    'person_full_name': `${prefix}_full_name`,
    'person_first_name': `${prefix}_first_name`,
    'person_last_name': `${prefix}_last_name`,
    'date_of_birth': `${prefix}_dob`,
    'place_of_birth': `${prefix}_pob`,
  };

  // Document-specific mappings
  switch (documentType) {
    case 'birth_certificate':
      return {
        ...baseMapping,
        'father_name': `${prefix}_father_first_name`,
        'father_last_name': `${prefix}_father_last_name`,
        'mother_maiden_name': `${prefix}_mother_maiden_name`,
        'mother_first_name': `${prefix}_mother_first_name`,
        'birth_city': `${prefix}_birth_city`,
        'birth_country': `${prefix}_birth_country`,
      };

    case 'marriage_certificate':
      return {
        ...baseMapping,
        'spouse_first_name': 'spouse_first_name',
        'spouse_last_name': 'spouse_last_name',
        'marriage_date': 'marriage_date',
        'marriage_place': 'marriage_place',
        'date_of_event': 'marriage_date',
        'place_of_event': 'marriage_place',
      };

    case 'passport':
      return {
        ...baseMapping,
        'passport_number': `${prefix}_passport_number`,
        'passport_issue_date': `${prefix}_passport_issue_date`,
        'passport_expiry_date': `${prefix}_passport_expiry_date`,
        'passport_issuing_country': `${prefix}_passport_issuing_country`,
        'sex': `${prefix}_sex`,
        'nationality': `${prefix}_citizenship`,
      };

    default:
      return baseMapping;
  }
}

/**
 * Get the prefix for master_table fields based on person type
 */
function getPersonPrefix(personType: PersonType): string {
  switch (personType) {
    case 'AP': return 'applicant';
    case 'SPOUSE': return 'spouse';
    case 'F': return 'father';
    case 'M': return 'mother';
    case 'PGF': return 'pgf';
    case 'PGM': return 'pgm';
    case 'MGF': return 'mgf';
    case 'MGM': return 'mgm';
    case 'CHILD_1': return 'child_1';
    case 'CHILD_2': return 'child_2';
    case 'CHILD_3': return 'child_3';
    case 'CHILD_4': return 'child_4';
    case 'CHILD_5': return 'child_5';
    default: return 'applicant';
  }
}

/**
 * Map OCR data to master table fields
 */
export function mapOCRToMasterTable(
  ocrData: Record<string, any>,
  personType: PersonType,
  documentType: DocumentType | null
): Record<string, any> {
  const mappings = getFieldMappings(personType, documentType);
  const result: Record<string, any> = {};

  for (const [ocrField, masterField] of Object.entries(mappings)) {
    if (ocrData[ocrField] !== undefined && ocrData[ocrField] !== null) {
      result[masterField] = ocrData[ocrField];
    }
  }

  // Handle full name splitting if needed
  if (ocrData.person_full_name && !ocrData.person_first_name) {
    const { firstName, lastName } = parseFullName(ocrData.person_full_name);
    const prefix = getPersonPrefix(personType);
    result[`${prefix}_first_name`] = firstName;
    result[`${prefix}_last_name`] = lastName;
  }

  return result;
}

/**
 * Parse full name into first and last name
 */
function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}
