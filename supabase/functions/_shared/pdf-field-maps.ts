/**
 * Centralized PDF Field Mappings
 * Single source of truth for all PDF template field mappings
 */

// Import all field mappings from edge function mappings directory
import { POA_ADULT_PDF_MAP } from './mappings/poa-adult.ts';
import { POA_MINOR_PDF_MAP } from './mappings/poa-minor.ts';
import { POA_SPOUSES_PDF_MAP } from './mappings/poa-spouses.ts';
import { transcriptionFieldMappings } from './mappings/transcription.ts';
import { CITIZENSHIP_PDF_MAP } from './mappings/citizenship.ts';
import { FAMILY_TREE_PDF_MAP } from './mappings/family-tree.ts';

/**
 * Template field mappings registry
 * Maps template type to PDF field mapping object
 */
export const PDF_FIELD_MAPS: Record<string, Record<string, string>> = {
  'poa-adult': POA_ADULT_PDF_MAP,
  'poa-minor': POA_MINOR_PDF_MAP,
  'poa-spouses': POA_SPOUSES_PDF_MAP,
  'citizenship': CITIZENSHIP_PDF_MAP,
  'family-tree': FAMILY_TREE_PDF_MAP,
  'transcription': transcriptionFieldMappings,
  // Aliases point to transcription (3-page combined form)
  'registration': transcriptionFieldMappings,
  'uzupelnienie': transcriptionFieldMappings,
  'umiejscowienie': transcriptionFieldMappings,
};

/**
 * Required fields registry
 * Maps template type to array of required field names
 * 
 * Note: These are basic required fields. Full validation should check
 * template-specific requirements based on document type.
 */
export const PDF_REQUIRED_FIELDS: Record<string, string[]> = {
  'poa-adult': ['applicant_first_name', 'applicant_last_name', 'applicant_passport_number'],
  'poa-minor': ['applicant_first_name', 'applicant_last_name', 'child_1_first_name', 'child_1_last_name'],
  'poa-spouses': ['applicant_first_name', 'applicant_last_name', 'spouse_first_name', 'spouse_last_name'],
  'uzupelnienie': ['applicant_first_name', 'applicant_last_name'],
  'citizenship': ['applicant_first_name', 'applicant_last_name', 'applicant_dob'],
  'family-tree': ['applicant_first_name', 'applicant_last_name'],
  'registration': ['applicant_first_name', 'applicant_last_name'],
  'transcription': ['applicant_first_name', 'applicant_last_name'],
  'umiejscowienie': ['applicant_first_name', 'applicant_last_name'],
};

/**
 * Valid template types
 */
export const VALID_TEMPLATES = new Set([
  'poa-adult',
  'poa-minor',
  'poa-spouses',
  'uzupelnienie',
  'citizenship',
  'family-tree',
  'registration',
  'transcription',
  'umiejscowienie',
]);

/**
 * Get field mapping for a template type
 * @param templateType - Template identifier
 * @returns Field mapping object or null if not found
 */
export function getFieldMapping(templateType: string): Record<string, string> | null {
  return PDF_FIELD_MAPS[templateType] || null;
}

/**
 * Get required fields for a template type
 * @param templateType - Template identifier
 * @returns Array of required field names
 */
export function getRequiredFields(templateType: string): string[] {
  return PDF_REQUIRED_FIELDS[templateType] || [];
}

/**
 * Validate template type
 * @param templateType - Template identifier to validate
 * @returns True if valid template type
 */
export function isValidTemplate(templateType: string): boolean {
  return VALID_TEMPLATES.has(templateType);
}

/**
 * Normalize template type (handle aliases)
 * @param templateType - Raw template type
 * @returns Normalized template type
 */
export function normalizeTemplateType(templateType: string): string {
  const aliases: Record<string, string> = {
    'registration': 'transcription',
    'uzupelnienie': 'transcription',
    'umiejscowienie': 'transcription',
  };
  
  return aliases[templateType] || templateType;
}
