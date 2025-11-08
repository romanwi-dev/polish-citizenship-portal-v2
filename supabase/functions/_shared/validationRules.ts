/**
 * Validation rules for POA document processing
 * Different rules for Applicant, Spouse, and Children
 */

export type PersonType = 'AP' | 'SPOUSE' | 'CHILD_1' | 'CHILD_2' | 'CHILD_3' | 'CHILD_4' | 'CHILD_5' | 
                          'CHILD_6' | 'CHILD_7' | 'CHILD_8' | 'CHILD_9' | 'CHILD_10';

export type DocumentType = 'passport' | 'birth_certificate';

export const VALIDATION_ERRORS = {
  EXPIRED_PASSPORT: (personType: string, expiryDate: string) => 
    `${getPersonLabel(personType as PersonType)} passport expired on ${expiryDate}. Please provide a valid passport.`,
  
  BIRTH_CERT_FOR_ADULT: (personType: string) =>
    `Birth certificates are not accepted for ${getPersonLabel(personType as PersonType)}. Please upload a valid passport.`,
  
  EXPIRES_SOON: (expiryDate: string, daysRemaining: number) =>
    `Warning: Passport expires soon on ${expiryDate} (${daysRemaining} days remaining). Consider renewing before applying.`,
  
  INVALID_DOCUMENT_TYPE: (personType: string, docType: string) =>
    `Invalid document type "${docType}" for ${getPersonLabel(personType as PersonType)}.`,
  
  NO_DOCUMENT: (personType: string) =>
    `No document provided for ${getPersonLabel(personType as PersonType)}.`
};

export function getPersonLabel(personType: PersonType): string {
  if (personType === 'AP') return 'Applicant';
  if (personType === 'SPOUSE') return 'Spouse';
  if (personType.startsWith('CHILD_')) {
    const num = personType.replace('CHILD_', '');
    return `Child ${num}`;
  }
  return personType;
}

export function isAdult(personType: PersonType): boolean {
  return personType === 'AP' || personType === 'SPOUSE';
}

export function isChild(personType: PersonType): boolean {
  return personType.startsWith('CHILD_');
}

export function getAllowedDocumentTypes(personType: PersonType): DocumentType[] {
  if (isAdult(personType)) {
    return ['passport']; // Adults MUST use passport only
  }
  return ['passport', 'birth_certificate']; // Children can use either
}

export function validateDocumentType(personType: PersonType, documentType: DocumentType): {
  valid: boolean;
  error?: string;
} {
  const allowedTypes = getAllowedDocumentTypes(personType);
  
  if (!allowedTypes.includes(documentType)) {
    return {
      valid: false,
      error: isAdult(personType) 
        ? VALIDATION_ERRORS.BIRTH_CERT_FOR_ADULT(personType)
        : VALIDATION_ERRORS.INVALID_DOCUMENT_TYPE(personType, documentType)
    };
  }
  
  return { valid: true };
}

export function mustValidatePassportExpiry(personType: PersonType, documentType: DocumentType): boolean {
  // Only validate expiry for adults using passports
  // Children's passports can be expired if they have a birth certificate alternative
  return isAdult(personType) && documentType === 'passport';
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  personType: PersonType;
  documentType: DocumentType;
  isPassportValid?: boolean;
  expiryDate?: string;
  daysUntilExpiry?: number;
}
