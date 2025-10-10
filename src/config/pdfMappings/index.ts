/**
 * Central export for all PDF field mappings
 */

export { POA_ADULT_PDF_MAP, POA_ADULT_REQUIRED_FIELDS } from './poaAdult';
export { CITIZENSHIP_PDF_MAP, CITIZENSHIP_REQUIRED_FIELDS } from './citizenship';

export type PDFTemplateType = 
  | 'poa-adult'
  | 'poa-minor'
  | 'poa-spouses'
  | 'citizenship'
  | 'family-tree'
  | 'registration'
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
  'registration': {
    fieldMap: {},
    requiredFields: [],
  },
  'uzupelnienie': {
    fieldMap: {},
    requiredFields: [],
  },
};
