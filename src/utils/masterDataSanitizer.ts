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

  return sanitized;
};
