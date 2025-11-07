// SINGLE SOURCE OF TRUTH FOR ALL FORM FIELDS
// This file maps form fields to database columns across all 6 forms

export type FieldMapping = {
  formField: string;
  dbColumn: string;
  forms: ('intake' | 'poa' | 'citizenship' | 'family_tree' | 'civil_registry' | 'master')[];
  dbTable: 'intake_data' | 'master_table' | 'poa' | 'cases';
  fieldType: 'text' | 'date' | 'boolean' | 'array' | 'jsonb' | 'number';
  validation?: {
    required?: boolean;
    maxLength?: number;
    pattern?: string;
  };
};

// APPLICANT FIELDS - Used across multiple forms
export const APPLICANT_FIELDS: FieldMapping[] = [
  { formField: 'applicant_first_name', dbColumn: 'applicant_first_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'first_name', dbColumn: 'first_name', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_last_name', dbColumn: 'applicant_last_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'last_name', dbColumn: 'last_name', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_maiden_name', dbColumn: 'applicant_maiden_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'maiden_name', dbColumn: 'maiden_name', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_sex', dbColumn: 'applicant_sex', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'sex', dbColumn: 'sex', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_dob', dbColumn: 'applicant_dob', forms: ['master'], dbTable: 'master_table', fieldType: 'date' },
  { formField: 'date_of_birth', dbColumn: 'date_of_birth', forms: ['intake'], dbTable: 'intake_data', fieldType: 'date' },
  { formField: 'applicant_pob', dbColumn: 'applicant_pob', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'place_of_birth', dbColumn: 'place_of_birth', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_email', dbColumn: 'applicant_email', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'email', dbColumn: 'email', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_phone', dbColumn: 'applicant_phone', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'phone', dbColumn: 'phone', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_current_citizenship', dbColumn: 'applicant_current_citizenship', forms: ['master'], dbTable: 'master_table', fieldType: 'array' },
  { formField: 'current_citizenship', dbColumn: 'current_citizenship', forms: ['intake'], dbTable: 'intake_data', fieldType: 'array' },
  { formField: 'applicant_passport_number', dbColumn: 'applicant_passport_number', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'passport_number', dbColumn: 'passport_number', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_passport_issuing_country', dbColumn: 'applicant_passport_issuing_country', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'passport_issuing_country', dbColumn: 'passport_issuing_country', forms: ['intake'], dbTable: 'intake_data', fieldType: 'text' },
  { formField: 'applicant_passport_issue_date', dbColumn: 'applicant_passport_issue_date', forms: ['master'], dbTable: 'master_table', fieldType: 'date' },
  { formField: 'passport_issue_date', dbColumn: 'passport_issue_date', forms: ['intake'], dbTable: 'intake_data', fieldType: 'date' },
  { formField: 'applicant_passport_expiry_date', dbColumn: 'applicant_passport_expiry_date', forms: ['master'], dbTable: 'master_table', fieldType: 'date' },
  { formField: 'passport_expiry_date', dbColumn: 'passport_expiry_date', forms: ['intake'], dbTable: 'intake_data', fieldType: 'date' },
  { formField: 'applicant_address', dbColumn: 'applicant_address', forms: ['master'], dbTable: 'master_table', fieldType: 'jsonb' },
  { formField: 'address', dbColumn: 'address', forms: ['intake'], dbTable: 'intake_data', fieldType: 'jsonb' },
];

// SPOUSE FIELDS
export const SPOUSE_FIELDS: FieldMapping[] = [
  { formField: 'spouse_first_name', dbColumn: 'spouse_first_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'spouse_last_name', dbColumn: 'spouse_last_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'spouse_maiden_name', dbColumn: 'spouse_maiden_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'spouse_sex', dbColumn: 'spouse_sex', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'spouse_dob', dbColumn: 'spouse_dob', forms: ['master'], dbTable: 'master_table', fieldType: 'date' },
  { formField: 'spouse_pob', dbColumn: 'spouse_pob', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'spouse_current_citizenship', dbColumn: 'spouse_current_citizenship', forms: ['master'], dbTable: 'master_table', fieldType: 'array' },
  { formField: 'applicant_is_married', dbColumn: 'applicant_is_married', forms: ['master'], dbTable: 'master_table', fieldType: 'boolean' },
  { formField: 'date_of_marriage', dbColumn: 'date_of_marriage', forms: ['master'], dbTable: 'master_table', fieldType: 'date' },
  { formField: 'place_of_marriage', dbColumn: 'place_of_marriage', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'children_count', dbColumn: 'children_count', forms: ['master'], dbTable: 'master_table', fieldType: 'number' },
  { formField: 'minor_children_count', dbColumn: 'minor_children_count', forms: ['master'], dbTable: 'master_table', fieldType: 'number' },
  { formField: 'applicant_marital_status', dbColumn: 'applicant_marital_status', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'applicant_has_minor_children', dbColumn: 'applicant_has_minor_children', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'applicant_number_of_children', dbColumn: 'applicant_number_of_children', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'spouse_passport_number', dbColumn: 'spouse_passport_number', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
];

// FATHER FIELDS
export const FATHER_FIELDS: FieldMapping[] = [
  { formField: 'father_first_name', dbColumn: 'father_first_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'father_last_name', dbColumn: 'father_last_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'father_pob', dbColumn: 'father_pob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'father_dob', dbColumn: 'father_dob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'date' },
];

// MOTHER FIELDS
export const MOTHER_FIELDS: FieldMapping[] = [
  { formField: 'mother_first_name', dbColumn: 'mother_first_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mother_last_name', dbColumn: 'mother_last_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mother_maiden_name', dbColumn: 'mother_maiden_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mother_pob', dbColumn: 'mother_pob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mother_dob', dbColumn: 'mother_dob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'date' },
];

// GRANDPARENT FIELDS (PGF, PGM, MGF, MGM)
export const GRANDPARENT_FIELDS: FieldMapping[] = [
  // Paternal Grandfather
  { formField: 'pgf_first_name', dbColumn: 'pgf_first_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pgf_last_name', dbColumn: 'pgf_last_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pgf_pob', dbColumn: 'pgf_pob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pgf_dob', dbColumn: 'pgf_dob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'date' },
  
  // Paternal Grandmother
  { formField: 'pgm_first_name', dbColumn: 'pgm_first_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pgm_last_name', dbColumn: 'pgm_last_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pgm_maiden_name', dbColumn: 'pgm_maiden_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pgm_pob', dbColumn: 'pgm_pob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pgm_dob', dbColumn: 'pgm_dob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'date' },
  
  // Maternal Grandfather
  { formField: 'mgf_first_name', dbColumn: 'mgf_first_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mgf_last_name', dbColumn: 'mgf_last_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mgf_pob', dbColumn: 'mgf_pob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mgf_dob', dbColumn: 'mgf_dob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'date' },
  
  // Maternal Grandmother
  { formField: 'mgm_first_name', dbColumn: 'mgm_first_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mgm_last_name', dbColumn: 'mgm_last_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mgm_maiden_name', dbColumn: 'mgm_maiden_name', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mgm_pob', dbColumn: 'mgm_pob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mgm_dob', dbColumn: 'mgm_dob', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'date' },
];

// CHILDREN FIELDS (1-10)
export const CHILDREN_FIELDS: FieldMapping[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  return [
    { formField: `child_${num}_first_name`, dbColumn: `child_${num}_first_name`, forms: ['master'] as const, dbTable: 'master_table' as const, fieldType: 'text' as const },
    { formField: `child_${num}_last_name`, dbColumn: `child_${num}_last_name`, forms: ['master'] as const, dbTable: 'master_table' as const, fieldType: 'text' as const },
    { formField: `child_${num}_sex`, dbColumn: `child_${num}_sex`, forms: ['master'] as const, dbTable: 'master_table' as const, fieldType: 'text' as const },
    { formField: `child_${num}_dob`, dbColumn: `child_${num}_dob`, forms: ['master'] as const, dbTable: 'master_table' as const, fieldType: 'date' as const },
    { formField: `child_${num}_pob`, dbColumn: `child_${num}_pob`, forms: ['master'] as const, dbTable: 'master_table' as const, fieldType: 'text' as const },
    { formField: `child_${num}_is_alive`, dbColumn: `child_${num}_is_alive`, forms: ['master'] as const, dbTable: 'master_table' as const, fieldType: 'boolean' as const },
  ] as FieldMapping[];
}).flat();

// META FIELDS
export const META_FIELDS: FieldMapping[] = [
  { formField: 'language_preference', dbColumn: 'language_preference', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'ancestry_line', dbColumn: 'ancestry_line', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'completion_percentage', dbColumn: 'completion_percentage', forms: ['intake', 'master'], dbTable: 'master_table', fieldType: 'number' },
];

// ALL FIELDS COMBINED
export const ALL_FIELD_MAPPINGS: FieldMapping[] = [
  ...APPLICANT_FIELDS,
  ...SPOUSE_FIELDS,
  ...FATHER_FIELDS,
  ...MOTHER_FIELDS,
  ...GRANDPARENT_FIELDS,
  ...CHILDREN_FIELDS,
  ...META_FIELDS,
];

// GREAT-GRANDPARENTS FIELDS
export const GREAT_GRANDPARENT_FIELDS: FieldMapping[] = [
  // Paternal Great-Grandfather
  { formField: 'pggf_first_name', dbColumn: 'pggf_first_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pggf_last_name', dbColumn: 'pggf_last_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pggf_pob', dbColumn: 'pggf_pob', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pggf_notes', dbColumn: 'pggf_notes', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  
  // Paternal Great-Grandmother
  { formField: 'pggm_first_name', dbColumn: 'pggm_first_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pggm_last_name', dbColumn: 'pggm_last_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pggm_maiden_name', dbColumn: 'pggm_maiden_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pggm_pob', dbColumn: 'pggm_pob', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'pggm_notes', dbColumn: 'pggm_notes', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  
  // Maternal Great-Grandfather
  { formField: 'mggf_first_name', dbColumn: 'mggf_first_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mggf_last_name', dbColumn: 'mggf_last_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mggf_pob', dbColumn: 'mggf_pob', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mggf_notes', dbColumn: 'mggf_notes', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  
  // Maternal Great-Grandmother
  { formField: 'mggm_first_name', dbColumn: 'mggm_first_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mggm_last_name', dbColumn: 'mggm_last_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mggm_maiden_name', dbColumn: 'mggm_maiden_name', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mggm_pob', dbColumn: 'mggm_pob', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
  { formField: 'mggm_notes', dbColumn: 'mggm_notes', forms: ['master'], dbTable: 'master_table', fieldType: 'text' },
];

// UTILITY FUNCTIONS
export const getDbColumnForFormField = (formField: string, dbTable?: string): string | null => {
  const mapping = ALL_FIELD_MAPPINGS.find(m => 
    m.formField === formField && (!dbTable || m.dbTable === dbTable)
  );
  return mapping?.dbColumn || null;
};

export const getFormFieldForDbColumn = (dbColumn: string, formType: string): string | null => {
  const mapping = ALL_FIELD_MAPPINGS.find(m => 
    m.dbColumn === dbColumn && m.forms.includes(formType as any)
  );
  return mapping?.formField || null;
};

export const getFieldsForForm = (formType: 'intake' | 'poa' | 'citizenship' | 'family_tree' | 'civil_registry' | 'master'): FieldMapping[] => {
  return ALL_FIELD_MAPPINGS.filter(m => m.forms.includes(formType));
};

export const getFieldsForTable = (dbTable: 'intake_data' | 'master_table' | 'poa' | 'cases'): FieldMapping[] => {
  return ALL_FIELD_MAPPINGS.filter(m => m.dbTable === dbTable);
};

// SPECIAL MAPPINGS FOR POA PDF GENERATION
export const POA_PDF_FIELD_MAP: Record<string, string> = {
  // Applicant
  'applicant_first_name': 'firstName',
  'applicant_last_name': 'lastName',
  'applicant_dob': 'dateOfBirth',
  'applicant_pob': 'placeOfBirth',
  'applicant_passport_number': 'passportNumber',
  'applicant_passport_issuing_country': 'passportIssuingCountry',
  
  // Address fields
  'street': 'street',
  'city': 'city',
  'state': 'state',
  'zipCode': 'zipCode',
  'country': 'country',
  
  // Parents
  'father_first_name': 'fatherFirstName',
  'father_last_name': 'fatherLastName',
  'mother_first_name': 'motherFirstName',
  'mother_last_name': 'motherLastName',
  'mother_maiden_name': 'motherMaidenName',
};

export const mapFormDataToPDFFields = (formData: any): any => {
  const pdfData: any = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    const pdfFieldName = POA_PDF_FIELD_MAP[key];
    if (pdfFieldName) {
      pdfData[pdfFieldName] = value;
    }
  });
  
  return pdfData;
};
