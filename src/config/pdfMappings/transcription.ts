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

export const TRANSCRIPTION_REQUIRED_FIELDS = [
  'place_of_foreign_act',
  'full_name',
  'event_date',
];
