/**
 * Centralized PDF Mappings and Validation
 * Exports all PDF mappings and required fields for verification
 */

import { POA_ADULT_PDF_MAP, POA_ADULT_REQUIRED_FIELDS } from './poaAdult';
import { POA_MINOR_PDF_MAP, POA_MINOR_REQUIRED_FIELDS } from './poaMinor';
import { POA_SPOUSES_PDF_MAP, POA_SPOUSES_REQUIRED_FIELDS } from './poaSpouses';
import { UZUPELNIENIE_PDF_MAP, UZUPELNIENIE_REQUIRED_FIELDS } from './uzupelnienie';
import { CITIZENSHIP_PDF_MAP, CITIZENSHIP_REQUIRED_FIELDS } from './citizenship';
import { FAMILY_TREE_PDF_MAP, FAMILY_TREE_REQUIRED_FIELDS } from './familyTree';

// Re-export individual maps for direct imports
export { 
  POA_ADULT_PDF_MAP, 
  POA_MINOR_PDF_MAP, 
  POA_SPOUSES_PDF_MAP, 
  UZUPELNIENIE_PDF_MAP,
  CITIZENSHIP_PDF_MAP,
  FAMILY_TREE_PDF_MAP
};

// Export all mappings
export const PDF_MAPPINGS: Record<string, Record<string, string>> = {
  'poa-adult': POA_ADULT_PDF_MAP,
  'poa-minor': POA_MINOR_PDF_MAP,
  'poa-spouses': POA_SPOUSES_PDF_MAP,
  'uzupelnienie': UZUPELNIENIE_PDF_MAP,
  'citizenship': CITIZENSHIP_PDF_MAP,
  'family-tree': FAMILY_TREE_PDF_MAP,
};

// Export all required fields
export const REQUIRED_FIELDS: Record<string, string[]> = {
  'poa-adult': POA_ADULT_REQUIRED_FIELDS,
  'poa-minor': POA_MINOR_REQUIRED_FIELDS,
  'poa-spouses': POA_SPOUSES_REQUIRED_FIELDS,
  'uzupelnienie': UZUPELNIENIE_REQUIRED_FIELDS,
  'citizenship': CITIZENSHIP_REQUIRED_FIELDS,
  'family-tree': FAMILY_TREE_REQUIRED_FIELDS,
};

// Get mapping for a specific template
export function getPDFMapping(templateType: string): Record<string, string> | null {
  return PDF_MAPPINGS[templateType] || null;
}

// Get required fields for a specific template
export function getRequiredFields(templateType: string): string[] {
  return REQUIRED_FIELDS[templateType] || [];
}

// Validate if a template is supported
export function isSupportedTemplate(templateType: string): boolean {
  return templateType in PDF_MAPPINGS;
}
