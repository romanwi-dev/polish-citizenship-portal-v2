// Field mapping validation and audit utilities

import { ALL_FIELD_MAPPINGS, type FieldMapping } from '@/config/fieldMappings';

type ValidationIssue = {
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  location: string;
};

export class FieldMappingValidator {
  private issues: ValidationIssue[] = [];

  // Validate that form data matches expected database columns
  validateFormData(formData: any, formType: string, dbTable: string): ValidationIssue[] {
    this.issues = [];
    
    const expectedMappings = ALL_FIELD_MAPPINGS.filter(
      m => m.forms.includes(formType as any) && m.dbTable === dbTable
    );

    // Check for fields in formData that don't have mappings
    Object.keys(formData).forEach(formField => {
      const mapping = expectedMappings.find(m => m.formField === formField);
      
      if (!mapping) {
        this.issues.push({
          severity: 'warning',
          field: formField,
          message: `Form field "${formField}" has no mapping to ${dbTable}`,
          location: `${formType} form`
        });
      }
    });

    // Check for type mismatches
    expectedMappings.forEach(mapping => {
      const value = formData[mapping.formField];
      if (value !== undefined && value !== null) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        const expectedType = mapping.fieldType === 'date' ? 'string' : mapping.fieldType;
        
        if (actualType !== expectedType && !(expectedType === 'text' && actualType === 'string')) {
          this.issues.push({
            severity: 'error',
            field: mapping.formField,
            message: `Type mismatch: expected ${expectedType}, got ${actualType}`,
            location: `${formType} form -> ${dbTable}.${mapping.dbColumn}`
          });
        }
      }
    });

    return this.issues;
  }

  // Validate PDF field mappings
  validatePDFMapping(formData: any, pdfFieldMap: Record<string, string>): ValidationIssue[] {
    this.issues = [];

    Object.keys(formData).forEach(formField => {
      if (!pdfFieldMap[formField]) {
        this.issues.push({
          severity: 'info',
          field: formField,
          message: `Form field "${formField}" has no PDF mapping`,
          location: 'PDF generation'
        });
      }
    });

    return this.issues;
  }

  // Generate audit report
  generateAuditReport(): string {
    const report = [
      '=== FIELD MAPPING AUDIT REPORT ===\n',
      `Total fields mapped: ${ALL_FIELD_MAPPINGS.length}\n`,
      `Unique form fields: ${new Set(ALL_FIELD_MAPPINGS.map(m => m.formField)).size}\n`,
      `Unique DB columns: ${new Set(ALL_FIELD_MAPPINGS.map(m => m.dbColumn)).size}\n`,
      '\nFIELDS BY FORM:',
      `- intake: ${ALL_FIELD_MAPPINGS.filter(m => m.forms.includes('intake')).length}`,
      `- master: ${ALL_FIELD_MAPPINGS.filter(m => m.forms.includes('master')).length}`,
      `- poa: ${ALL_FIELD_MAPPINGS.filter(m => m.forms.includes('poa')).length}`,
      '\nFIELDS BY TABLE:',
      `- intake_data: ${ALL_FIELD_MAPPINGS.filter(m => m.dbTable === 'intake_data').length}`,
      `- master_table: ${ALL_FIELD_MAPPINGS.filter(m => m.dbTable === 'master_table').length}`,
      '\nFIELD TYPES:',
      `- text: ${ALL_FIELD_MAPPINGS.filter(m => m.fieldType === 'text').length}`,
      `- date: ${ALL_FIELD_MAPPINGS.filter(m => m.fieldType === 'date').length}`,
      `- boolean: ${ALL_FIELD_MAPPINGS.filter(m => m.fieldType === 'boolean').length}`,
      `- array: ${ALL_FIELD_MAPPINGS.filter(m => m.fieldType === 'array').length}`,
      `- jsonb: ${ALL_FIELD_MAPPINGS.filter(m => m.fieldType === 'jsonb').length}`,
    ];

    return report.join('\n');
  }

  // Find duplicate mappings
  findDuplicates(): { formFields: string[], dbColumns: string[] } {
    const formFieldCounts = new Map<string, number>();
    const dbColumnCounts = new Map<string, number>();

    ALL_FIELD_MAPPINGS.forEach(mapping => {
      formFieldCounts.set(mapping.formField, (formFieldCounts.get(mapping.formField) || 0) + 1);
      dbColumnCounts.set(mapping.dbColumn, (dbColumnCounts.get(mapping.dbColumn) || 0) + 1);
    });

    return {
      formFields: Array.from(formFieldCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([field]) => field),
      dbColumns: Array.from(dbColumnCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([col]) => col)
    };
  }
}

// Singleton instance
export const fieldValidator = new FieldMappingValidator();
