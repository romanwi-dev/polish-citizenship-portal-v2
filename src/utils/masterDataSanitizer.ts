/**
 * Sanitizes form data before saving to master_table
 * Removes UI-only fields and converts structured data to proper format
 */
export const sanitizeMasterData = (formData: any): any => {
  const { 
    confirm_email, 
    applicant_address_street,
    applicant_address_city,
    applicant_address_state,
    applicant_address_postal,
    applicant_address_country,
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
