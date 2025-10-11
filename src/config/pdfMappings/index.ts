/**
 * Central export for all PDF field mappings
 */

export { POA_ADULT_PDF_MAP, POA_ADULT_REQUIRED_FIELDS } from './poaAdult';
export { POA_MINOR_PDF_MAP, POA_MINOR_REQUIRED_FIELDS } from './poaMinor';
export { POA_SPOUSES_PDF_MAP, POA_SPOUSES_REQUIRED_FIELDS } from './poaSpouses';
export { CITIZENSHIP_PDF_MAP, CITIZENSHIP_REQUIRED_FIELDS } from './citizenship';
export { UMIEJSCOWIENIE_PDF_MAP, UMIEJSCOWIENIE_REQUIRED_FIELDS } from './umiejscowienie';
export { UZUPELNIENIE_PDF_MAP, UZUPELNIENIE_REQUIRED_FIELDS } from './uzupelnienie';

// Family Tree mapping (only exists in edge function mappings)
export const FAMILY_TREE_REQUIRED_FIELDS = [
  'applicant_first_name',
  'applicant_last_name',
  'applicant_dob',
  'father_first_name',
  'father_last_name',
  'mother_first_name',
  'mother_last_name',
  'mother_maiden_name',
];

export type PDFTemplateType = 
  | 'poa-adult'
  | 'poa-minor'
  | 'poa-spouses'
  | 'citizenship'
  | 'family-tree'
  | 'umiejscowienie'
  | 'uzupelnienie';

export interface PDFMappingConfig {
  fieldMap: Record<string, string>;
  requiredFields: string[];
}

export const PDF_MAPPINGS: Record<PDFTemplateType, PDFMappingConfig> = {
  'poa-adult': {
    fieldMap: {}, // Will be imported from poaAdult.ts
    requiredFields: [],
  },
  'poa-minor': {
    fieldMap: {},
    requiredFields: [],
  },
  'poa-spouses': {
    fieldMap: {},
    requiredFields: [],
  },
  'citizenship': {
    fieldMap: {},
    requiredFields: [],
  },
  'family-tree': {
    fieldMap: {},
    requiredFields: [],
  },
  'umiejscowienie': {
    fieldMap: {},
    requiredFields: [],
  },
  'uzupelnienie': {
    fieldMap: {},
    requiredFields: [],
  },
};
