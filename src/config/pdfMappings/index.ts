/**
 * Central export for all PDF field mappings
 */

export { POA_ADULT_PDF_MAP, POA_ADULT_REQUIRED_FIELDS } from './poaAdult';
export { POA_MINOR_PDF_MAP, POA_MINOR_REQUIRED_FIELDS } from './poaMinor';
export { POA_SPOUSES_PDF_MAP, POA_SPOUSES_REQUIRED_FIELDS } from './poaSpouses';
export { CITIZENSHIP_PDF_MAP, CITIZENSHIP_REQUIRED_FIELDS } from './citizenship';
export { FAMILY_TREE_PDF_MAP, FAMILY_TREE_REQUIRED_FIELDS } from './familyTree';
export { UMIEJSCOWIENIE_PDF_MAP, UMIEJSCOWIENIE_REQUIRED_FIELDS } from './umiejscowienie';
export { UZUPELNIENIE_PDF_MAP, UZUPELNIENIE_REQUIRED_FIELDS } from './uzupelnienie';

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
