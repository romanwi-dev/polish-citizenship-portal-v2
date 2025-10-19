/**
 * Sanitizes form data before saving to master_table
 * Uses centralized field mappings for consistency
 */
import { getDbColumnForFormField, getFieldsForTable } from '@/config/fieldMappings';

// Normalize gender/sex values to M/F
const normalizeGender = (value: any): string | null => {
  if (!value) return null;
  const val = String(value).toUpperCase();
  if (val.includes('MALE') || val.includes('MĘZCZYZNA') || val === 'M') return 'M';
  if (val.includes('FEMALE') || val.includes('KOBIETA') || val === 'F') return 'F';
  return null;
};

export const sanitizeMasterData = (formData: any): any => {
  const sanitized: any = {};
  
  // Get all expected master_table fields from centralized mappings
  const masterTableFields = getFieldsForTable('master_table');
  
  // UI-only fields that should NOT be saved
  const uiOnlyFields = [
    'confirm_email',
    // Address components (stored in applicant_address JSONB)
    'applicant_address_street',
    'applicant_address_city',
    'applicant_address_state',
    'applicant_address_postal',
    'applicant_address_country',
    // Children flags (derived from children_count)
    'has_children',
    'has_minor_children',
    'applicant_has_children',
    'applicant_has_minor_children',
    'applicant_minor_children_count', // NOT a DB column
    'has_child_1', 'has_child_2', 'has_child_3', 'has_child_4', 'has_child_5',
    'has_child_6', 'has_child_7', 'has_child_8', 'has_child_9', 'has_child_10',
  ];

  // Process each field in the form data
  Object.entries(formData).forEach(([formField, value]) => {
    // Skip UI-only fields
    if (uiOnlyFields.includes(formField)) {
      return;
    }

    // Get the database column name from field mappings
    const dbColumn = getDbColumnForFormField(formField, 'master_table');
    
    if (dbColumn) {
      // Handle special field types
      const mapping = masterTableFields.find(m => m.formField === formField);
      
      if (mapping) {
        switch (mapping.fieldType) {
          case 'array':
            // Convert comma/semicolon/newline separated strings to arrays
            if (typeof value === 'string' && value.trim()) {
              sanitized[dbColumn] = value.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(value)) {
              sanitized[dbColumn] = value;
            } else {
              sanitized[dbColumn] = null;
            }
            break;
            
          case 'boolean':
            sanitized[dbColumn] = value === true || value === 'true';
            break;
            
          case 'text':
            // Special handling for gender/sex fields
            if (formField.includes('_sex') || formField === 'sex') {
              sanitized[dbColumn] = normalizeGender(value);
            } else {
              sanitized[dbColumn] = value === '' ? null : value;
            }
            break;
            
          case 'number':
            sanitized[dbColumn] = value === '' || value === null ? null : Number(value);
            break;
            
          case 'date':
            sanitized[dbColumn] = value === '' ? null : value;
            break;
            
          case 'jsonb':
            // Handle address JSONB
            if (formField === 'applicant_address') {
              sanitized[dbColumn] = value || {};
            } else {
              sanitized[dbColumn] = value;
            }
            break;
            
          default:
            // Other types - no special handling needed
            break;
        }
      }
    } else {
      // Field not in mappings - could be a deprecated field or alias
      // Handle known aliases
      if (formField === 'additional_info') {
        sanitized['family_notes'] = value === '' ? null : value;
      } else if (formField === 'applicant_additional_info') {
        sanitized['applicant_notes'] = value === '' ? null : value;
      } else if (formField === 'applicant_children_count') {
        sanitized['children_count'] = value === '' || value === null ? null : Number(value);
      } else if (formField === 'applicant_minor_children_count') {
        // Map UI field to actual DB column
        sanitized['minor_children_count'] = value === '' || value === null ? null : Number(value);
      }
    }
  });

  // Reconstruct applicant_address from individual fields if present
  if (formData.applicant_address_street || formData.applicant_address_city || 
      formData.applicant_address_state || formData.applicant_address_postal || 
      formData.applicant_address_country) {
    sanitized.applicant_address = {
      street: formData.applicant_address_street || '',
      city: formData.applicant_address_city || '',
      state: formData.applicant_address_state || '',
      postal: formData.applicant_address_postal || '',
      country: formData.applicant_address_country || '',
    };
  }

  return sanitized;
};
