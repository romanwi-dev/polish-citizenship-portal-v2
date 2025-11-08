/**
 * Field mappings for new-TRANSCRIPTION.pdf (3-page Civil Registry form)
 * 
 * Pages 1-2: Transcription request (identical)
 * Page 3: Supplementation request (different)
 */

export const transcriptionFieldMappings = {
  // Page 1 & 2 fields (Transcription request)
  'foreign_act_place': 'place_of_foreign_act', // Where foreign act was created
  'name_on_act': 'full_name', // Name(s) as they appear on act
  'event_place': 'place_of_event', // Where event occurred  
  'event_date': 'event_date', // DD.MM.YYYY format
  
  // Checkboxes for attachments
  'original_with_translation': 'has_original_translation',
  'tax_payment_proof': 'has_tax_proof',
  'power_of_attorney': 'has_poa',
  'passport_copy': 'has_passport_copy',
  
  // Delivery method
  'send_to_attorney': 'delivery_to_attorney',
  
  // Signature field
  'applicant_signature': 'signature',
  
  // Pickup date
  'pickup_date': 'document_pickup_date',
  
  // Page 3 fields (Supplementation request)
  'birth_act_office': 'birth_registry_office', // USC office name
  'birth_act_number': 'birth_certificate_number',
  'birth_act_year': 'birth_certificate_year',
  'father_maiden_name': 'father_birth_last_name',
  'mother_maiden_name': 'mother_birth_last_name',
  'supplementation_source_office': 'source_registry_office' // Office with earlier act
};

/**
 * Maps master_table / civil_registry fields to PDF form fields
 */
export function mapCivilRegistryToTranscription(data: any) {
  return {
    // Transcription (pages 1-2)
    place_of_foreign_act: data.foreign_country || '',
    full_name: `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
    place_of_event: data.birth_city || data.birth_country || '',
    event_date: data.birth_date || '',
    
    // Attachments (assumed true if POA exists)
    has_original_translation: true,
    has_tax_proof: true,
    has_poa: !!data.poa_signed_at,
    has_passport_copy: !!data.passport_number,
    
    // Delivery
    delivery_to_attorney: true, // Default to attorney
    
    // Signature (populated from master data)
    signature: data.applicant_signature || '',
    
    // Pickup date
    document_pickup_date: data.pickup_date || '',
    
    // Supplementation (page 3)
    birth_registry_office: 'Urząd Stanu Cywilnego m.st Warszawa',
    birth_certificate_number: data.birth_certificate_number || '',
    birth_certificate_year: data.birth_year || '',
    father_birth_last_name: data.father_last_name || '',
    mother_birth_last_name: data.mother_last_name || '',
    source_registry_office: data.source_registry || ''
  };
}

/**
 * Validates transcription data before PDF generation
 */
export function validateTranscriptionData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!data.place_of_foreign_act) errors.push('Foreign act place is required');
  if (!data.full_name) errors.push('Full name is required');
  if (!data.event_date) errors.push('Event date is required');
  
  // Date validation (DD.MM.YYYY)
  if (data.event_date && !/^\d{2}\.\d{2}\.\d{4}$/.test(data.event_date)) {
    errors.push('Event date must be in DD.MM.YYYY format');
  }
  
  // For page 3 (supplementation)
  if (data.birth_certificate_number && !data.birth_certificate_year) {
    errors.push('Birth certificate year required when number provided');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
