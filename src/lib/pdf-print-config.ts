/**
 * PDF Print Configuration
 * Defines default print copy counts for different PDF templates
 */

export const PDF_PRINT_CONFIG: Record<string, number> = {
  'poa-adult': 3,
  'poa-minor': 3,
  'poa-spouses': 3,
  'poa-combined': 3,
  'family-tree': 3,
  'citizenship': 1,
  'transcription': 1,
};

export function getDefaultCopies(templateType: string): number {
  return PDF_PRINT_CONFIG[templateType] || 1;
}
