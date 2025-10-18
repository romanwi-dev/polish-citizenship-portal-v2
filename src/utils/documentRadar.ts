import { 
  PersonType, 
  DocumentType, 
  DOCUMENT_REQUIREMENTS, 
  PERSON_TYPE_LABELS 
} from './docRadarConfig';

type Document = {
  id: string;
  person_type: string | null;
  document_type: string | null;
  [key: string]: any;
};

export interface DocumentStatus {
  personType: PersonType;
  personName: string;
  required: number;
  uploaded: number;
  percentage: number;
  missing: Array<{
    type: DocumentType;
    label: string;
    isCritical: boolean;
    description: string;
  }>;
  criticalMissing: number;
}

export function calculateDocumentStatus(
  documents: Document[],
  personType: PersonType,
  personName: string
): DocumentStatus {
  const requirements = DOCUMENT_REQUIREMENTS[personType] || [];
  const personDocs = documents.filter(d => d.person_type === personType);
  const uploadedTypes = new Set(personDocs.map(d => d.document_type).filter(Boolean));
  
  const missing = requirements.filter(req => !uploadedTypes.has(req.type));
  const criticalMissing = missing.filter(req => req.isCritical).length;
  const uploaded = requirements.length - missing.length;
  const percentage = requirements.length > 0 
    ? Math.round((uploaded / requirements.length) * 100)
    : 0;

  return {
    personType,
    personName: personName || PERSON_TYPE_LABELS[personType],
    required: requirements.length,
    uploaded,
    percentage,
    missing,
    criticalMissing,
  };
}

export function getOverallDocumentCompletion(statuses: DocumentStatus[]): number {
  if (statuses.length === 0) return 0;
  
  const totalUploaded = statuses.reduce((sum, s) => sum + s.uploaded, 0);
  const totalRequired = statuses.reduce((sum, s) => sum + s.required, 0);
  
  return totalRequired > 0 ? Math.round((totalUploaded / totalRequired) * 100) : 0;
}

export function getCriticalDocumentsStatus(statuses: DocumentStatus[]): {
  totalCritical: number;
  missingCritical: number;
  hasCriticalGaps: boolean;
} {
  const totalCritical = statuses.reduce(
    (sum, s) => sum + DOCUMENT_REQUIREMENTS[s.personType].filter(r => r.isCritical).length, 
    0
  );
  const missingCritical = statuses.reduce((sum, s) => sum + s.criticalMissing, 0);
  
  return {
    totalCritical,
    missingCritical,
    hasCriticalGaps: missingCritical > 0
  };
}

// Legacy exports for backwards compatibility
export type { PersonType, DocumentType } from './docRadarConfig';
export { PERSON_TYPE_LABELS } from './docRadarConfig';
