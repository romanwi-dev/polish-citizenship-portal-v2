/**
 * PDF Pre-Generation Proposal Generator
 * Creates structured proposals for OpenAI verification BEFORE PDF generation
 */

import { POA_ADULT_PDF_MAP, POA_MINOR_PDF_MAP, POA_SPOUSES_PDF_MAP, POA_COMBINED_PDF_MAP, POA_ADULT_REQUIRED_FIELDS, POA_MINOR_REQUIRED_FIELDS, POA_SPOUSES_REQUIRED_FIELDS } from '@/config/pdfMappings';

const getPDFMapping = (templateType: string): Record<string, string> => {
  const mappings: Record<string, Record<string, string>> = {
    'poa-adult': POA_ADULT_PDF_MAP,
    'poa-minor': POA_MINOR_PDF_MAP,
    'poa-spouses': POA_SPOUSES_PDF_MAP,
    'poa-combined': POA_COMBINED_PDF_MAP,
  };
  return mappings[templateType] || {};
};

const getRequiredFields = (templateType: string): string[] => {
  const required: Record<string, string[]> = {
    'poa-adult': POA_ADULT_REQUIRED_FIELDS,
    'poa-minor': POA_MINOR_REQUIRED_FIELDS,
    'poa-spouses': POA_SPOUSES_REQUIRED_FIELDS,
  };
  return required[templateType] || [];
};

export interface PDFGenerationProposal {
  type: 'pdf_generation_pre';
  templateType: string;
  description: string;
  impact: string;
  files: Array<{
    path: string;
    action: 'create';
    changes: string;
  }>;
  pdfGeneration: {
    templateName: string;
    totalPDFFields: number;
    mappedFields: number;
    fieldMappings: Array<{
      pdfField: string;
      dbColumn: string;
      hasValue: boolean;
      value?: any;
    }>;
    requiredFields: Array<{
      name: string;
      filled: boolean;
      value?: any;
    }>;
    dataCoverage: number;
    missingRequired: string[];
  };
  reasoning: string;
  risks: string[];
  rollbackPlan: string;
}

/**
 * Generate a PDF generation proposal for OpenAI verification
 */
export async function generatePDFProposal(
  caseId: string,
  templateType: string,
  masterData: Record<string, any>
): Promise<PDFGenerationProposal> {
  const mapping = getPDFMapping(templateType);
  const requiredFields = getRequiredFields(templateType);

  if (!mapping) {
    throw new Error(`No mapping found for template: ${templateType}`);
  }

  // Analyze field mappings
  const fieldMappings = Object.entries(mapping).map(([pdfField, dbColumn]: [string, string]) => {
    // Handle composite fields (e.g., "first_name|last_name")
    const isComposite = dbColumn.includes('|');
    const columns = isComposite ? dbColumn.split('|') : [dbColumn];
    
    // Handle date splits (e.g., "submission_date.day")
    const values = columns.map(col => {
      if (col.includes('.')) {
        const [field, part] = col.split('.');
        const dateValue = masterData[field];
        if (!dateValue) return null;
        const date = new Date(dateValue);
        if (part === 'day') return date.getDate().toString().padStart(2, '0');
        if (part === 'month') return (date.getMonth() + 1).toString().padStart(2, '0');
        if (part === 'year') return date.getFullYear().toString();
        return null;
      }
      return masterData[col];
    });

    const hasValue = values.every(v => v !== null && v !== undefined && v !== '');
    const value = isComposite ? values.filter(Boolean).join(' ') : values[0];

    return {
      pdfField,
      dbColumn,
      hasValue,
      value: hasValue ? value : undefined,
    };
  });

  // Analyze required fields
  const requiredFieldsAnalysis = requiredFields.map(fieldName => {
    const value = masterData[fieldName];
    const filled = value !== null && value !== undefined && value !== '';
    return {
      name: fieldName,
      filled,
      value: filled ? value : undefined,
    };
  });

  const filledRequired = requiredFieldsAnalysis.filter(f => f.filled).length;
  const dataCoverage = requiredFields.length > 0
    ? Math.round((filledRequired / requiredFields.length) * 100)
    : 100;

  const missingRequired = requiredFieldsAnalysis
    .filter(f => !f.filled)
    .map(f => f.name);

  // Calculate mapped fields count
  const mappedFields = fieldMappings.filter(f => f.hasValue).length;
  const totalPDFFields = Object.keys(mapping).length;

  // Generate risks
  const risks: string[] = [];
  
  if (missingRequired.length > 0) {
    risks.push(`Missing ${missingRequired.length} required fields: ${missingRequired.join(', ')}`);
  }

  if (dataCoverage < 80) {
    risks.push(`Low data coverage (${dataCoverage}%) - PDF may be incomplete`);
  }

  // Check for date format issues
  const dateFields = Object.keys(masterData).filter(k => k.includes('_date') || k.includes('_dob'));
  for (const dateField of dateFields) {
    const value = masterData[dateField];
    if (value && typeof value === 'string') {
      // Check if it's in DD.MM.YYYY format
      const ddmmyyyyRegex = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!ddmmyyyyRegex.test(value) && !value.includes('T')) {
        risks.push(`Date field "${dateField}" may not be in DD.MM.YYYY format: ${value}`);
      }
    }
  }

  // Check for passport number format
  if (masterData.applicant_passport_number) {
    const passportRegex = /^[A-Z0-9]{6,9}$/;
    if (!passportRegex.test(masterData.applicant_passport_number)) {
      risks.push(`Passport number format may be invalid: ${masterData.applicant_passport_number}`);
    }
  }

  return {
    type: 'pdf_generation_pre',
    templateType,
    description: `Generate ${templateType} PDF for case ${caseId}`,
    impact: `Will create a PDF document with ${mappedFields}/${totalPDFFields} fields filled (${dataCoverage}% required field coverage)`,
    files: [
      {
        path: `/cases/${caseId}/documents/${templateType}.pdf`,
        action: 'create',
        changes: `PDF generation using template ${templateType} with ${mappedFields} filled fields`,
      },
    ],
    pdfGeneration: {
      templateName: templateType,
      totalPDFFields,
      mappedFields,
      fieldMappings,
      requiredFields: requiredFieldsAnalysis,
      dataCoverage,
      missingRequired,
    },
    reasoning: `This PDF generation will create a ${templateType} document with ${dataCoverage}% of required fields populated. ${
      missingRequired.length > 0
        ? `Missing fields: ${missingRequired.join(', ')}.`
        : 'All required fields are available.'
    }`,
    risks,
    rollbackPlan: 'PDF generation can be retried after fixing missing data. No database changes will be made.',
  };
}
