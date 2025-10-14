/**
 * Document Radar - Track Missing Documents Per Family Member
 * 
 * Monitors document collection for:
 * - AP (Applicant)
 * - F (Father)
 * - M (Mother)
 * - PGF (Paternal Grandfather)
 * - PGM (Paternal Grandmother)
 * - MGF (Maternal Grandfather)
 * - MGM (Maternal Grandmother)
 */

export interface PersonDocuments {
  personType: 'AP' | 'F' | 'M' | 'PGF' | 'PGM' | 'MGF' | 'MGM';
  personName: string;
  requiredDocs: DocumentRequirement[];
  collectedDocs: string[];
  missingDocs: string[];
  completionPercentage: number;
  needsTranslation: string[];
}

export interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
  collected: boolean;
  needsTranslation: boolean;
}

/**
 * Standard required documents for each person type
 */
const REQUIRED_DOCUMENTS: Record<string, DocumentRequirement[]> = {
  AP: [
    { type: 'birth_cert', label: 'Birth Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'passport', label: 'Passport Copy', required: true, collected: false, needsTranslation: false },
    { type: 'marriage_cert', label: 'Marriage Certificate', required: false, collected: false, needsTranslation: false },
    { type: 'naturalization', label: 'Naturalization Papers', required: false, collected: false, needsTranslation: false },
    { type: 'passport_photo', label: 'Passport Photo', required: true, collected: false, needsTranslation: false },
  ],
  F: [
    { type: 'birth_cert', label: 'Birth Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'marriage_cert', label: 'Marriage Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'naturalization', label: 'Naturalization Papers', required: false, collected: false, needsTranslation: false },
    { type: 'passport', label: 'Passport Copy', required: false, collected: false, needsTranslation: false },
  ],
  M: [
    { type: 'birth_cert', label: 'Birth Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'marriage_cert', label: 'Marriage Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'naturalization', label: 'Naturalization Papers', required: false, collected: false, needsTranslation: false },
    { type: 'passport', label: 'Passport Copy', required: false, collected: false, needsTranslation: false },
  ],
  PGF: [
    { type: 'birth_cert', label: 'Birth Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'marriage_cert', label: 'Marriage Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'naturalization', label: 'Naturalization Papers', required: false, collected: false, needsTranslation: false },
  ],
  PGM: [
    { type: 'birth_cert', label: 'Birth Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'marriage_cert', label: 'Marriage Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'naturalization', label: 'Naturalization Papers', required: false, collected: false, needsTranslation: false },
  ],
  MGF: [
    { type: 'birth_cert', label: 'Birth Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'marriage_cert', label: 'Marriage Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'naturalization', label: 'Naturalization Papers', required: false, collected: false, needsTranslation: false },
  ],
  MGM: [
    { type: 'birth_cert', label: 'Birth Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'marriage_cert', label: 'Marriage Certificate', required: true, collected: false, needsTranslation: false },
    { type: 'naturalization', label: 'Naturalization Papers', required: false, collected: false, needsTranslation: false },
  ],
};

/**
 * Analyzes document collection status for all family members
 */
export const analyzeDocumentRadar = (
  documents: Array<{
    type: string;
    person_type: string | null;
    is_translated: boolean;
    file_extension: string | null;
  }>,
  familyData: any
): PersonDocuments[] => {
  const radar: PersonDocuments[] = [];
  
  // Define all persons to track
  const personsToTrack: Array<{ type: 'AP' | 'F' | 'M' | 'PGF' | 'PGM' | 'MGF' | 'MGM', nameField: string }> = [
    { type: 'AP', nameField: 'applicant_first_name' },
    { type: 'F', nameField: 'father_first_name' },
    { type: 'M', nameField: 'mother_first_name' },
    { type: 'PGF', nameField: 'pgf_first_name' },
    { type: 'PGM', nameField: 'pgm_first_name' },
    { type: 'MGF', nameField: 'mgf_first_name' },
    { type: 'MGM', nameField: 'mgm_first_name' },
  ];
  
  personsToTrack.forEach(person => {
    const personName = familyData?.[person.nameField] || person.type;
    const requiredDocs = [...(REQUIRED_DOCUMENTS[person.type] || [])];
    
    // Find collected documents for this person
    const personDocs = documents.filter(doc => doc.person_type === person.type);
    const collectedTypes: string[] = [];
    const needsTranslation: string[] = [];
    
    personDocs.forEach(doc => {
      collectedTypes.push(doc.type);
      
      // Check if document needs translation (not in Polish)
      if (!doc.is_translated && !isPolishDocument(doc.file_extension)) {
        needsTranslation.push(`${doc.type} (${doc.file_extension})`);
      }
    });
    
    // Update required docs with collection status
    requiredDocs.forEach(req => {
      req.collected = collectedTypes.includes(req.type);
      req.needsTranslation = needsTranslation.some(nt => nt.startsWith(req.type));
    });
    
    const missingRequired = requiredDocs
      .filter(r => r.required && !r.collected)
      .map(r => r.label);
    
    const totalRequired = requiredDocs.filter(r => r.required).length;
    const collectedRequired = requiredDocs.filter(r => r.required && r.collected).length;
    const completionPercentage = totalRequired > 0 
      ? Math.round((collectedRequired / totalRequired) * 100) 
      : 100;
    
    radar.push({
      personType: person.type,
      personName,
      requiredDocs,
      collectedDocs: collectedTypes,
      missingDocs: missingRequired,
      completionPercentage,
      needsTranslation,
    });
  });
  
  return radar;
};

/**
 * Checks if a document is in Polish based on file extension or metadata
 */
const isPolishDocument = (fileExtension: string | null): boolean => {
  // Polish documents typically have .pl extensions or are from Polish archives
  return fileExtension?.includes('.pl') || false;
};

/**
 * Gets overall document collection percentage for a case
 */
export const getOverallDocumentCompletion = (radar: PersonDocuments[]): number => {
  if (radar.length === 0) return 0;
  
  const totalPercentage = radar.reduce((sum, person) => sum + person.completionPercentage, 0);
  return Math.round(totalPercentage / radar.length);
};

/**
 * Gets critical missing documents (applicant + parents)
 */
export const getCriticalMissingDocs = (radar: PersonDocuments[]): string[] => {
  const criticalPersons = radar.filter(p => ['AP', 'F', 'M'].includes(p.personType));
  return criticalPersons.flatMap(p => p.missingDocs);
};
