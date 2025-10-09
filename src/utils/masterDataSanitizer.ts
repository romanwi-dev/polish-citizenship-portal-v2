/**
 * Sanitizes form data before saving to master_table
 * Removes UI-only fields and converts structured data to proper format
 */
export const sanitizeMasterData = (formData: any): any => {
  const { 
    // UI-only email confirmation
    confirm_email,
    
    // UI-only split address fields (converted to applicant_address JSONB)
    applicant_address_street,
    applicant_address_city,
    applicant_address_state,
    applicant_address_postal,
    applicant_address_country,
    
    // UI-only children flags (derived from children_count)
    has_children,
    has_minor_children,
    minor_children_count,
    applicant_has_children,
    applicant_has_minor_children,
    applicant_minor_children_count,
    applicant_children_count, // Should use children_count instead
    
    // UI-only field aliases that don't exist in schema
    additional_info, // Use applicant_notes or family_notes instead
    applicant_additional_info, // Not in schema
    
    // NON-EXISTENT FIELDS - These don't exist in master_table schema
    applicant_last_name_after_marriage, // Not in schema
    spouse_last_name_after_marriage, // Not in schema
    
    ...rest 
  } = formData;

  // Build applicant_address if any address fields exist
  const addressFields = {
    street: applicant_address_street,
    city: applicant_address_city,
    state: applicant_address_state,
    postal: applicant_address_postal,
    country: applicant_address_country,
  };

  const hasAddressData = Object.values(addressFields).some(v => v);

  const sanitized: any = { ...rest };

  // Only add applicant_address if we have address data
  if (hasAddressData) {
    sanitized.applicant_address = addressFields;
  }

  // Map applicant_children_count to children_count if it exists
  if (applicant_children_count !== undefined) {
    sanitized.children_count = applicant_children_count;
  }

  // Map additional_info to family_notes (general notes field)
  if (additional_info !== undefined && !sanitized.family_notes) {
    sanitized.family_notes = additional_info;
  }

  // Map applicant_additional_info to applicant_notes
  if (applicant_additional_info !== undefined && !sanitized.applicant_notes) {
    sanitized.applicant_notes = applicant_additional_info;
  }

  // Convert string arrays to proper arrays for ARRAY columns
  // These fields are ARRAY type in DB but may come as text from textareas
  const arrayFields = ['applicant_current_citizenship', 'spouse_current_citizenship', 'applicant_other_citizenships'];
  
  arrayFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      // Split by comma, newline, or semicolon and filter empty
      sanitized[field] = sanitized[field]
        .split(/[,;\n]+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    }
  });

  // Convert empty strings to null for nullable fields to avoid constraint violations
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });

  return sanitized;
};
