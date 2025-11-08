import { supabase } from "@/integrations/supabase/client";

interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  completionRate: number;
  requiredFieldsFilled: number;
  totalRequiredFields: number;
}

export const validatePOAData = async (caseId: string): Promise<ValidationResult> => {
  const { data: masterData, error } = await supabase
    .from('master_table')
    .select('*')
    .eq('case_id', caseId)
    .single();

  if (error || !masterData) {
    return {
      valid: false,
      issues: [{ field: 'case_id', message: 'Case data not found', severity: 'error' }],
      completionRate: 0,
      requiredFieldsFilled: 0,
      totalRequiredFields: 0,
    };
  }

  const issues: ValidationIssue[] = [];
  const requiredFields = [
    'applicant_first_name',
    'applicant_last_name',
    'applicant_passport_number',
  ];

  let requiredFieldsFilled = 0;

  // Check required fields
  requiredFields.forEach((field) => {
    if (!masterData[field] || masterData[field].toString().trim() === '') {
      issues.push({
        field,
        message: `${field.replace(/_/g, ' ')} is required`,
        severity: 'error',
      });
    } else {
      requiredFieldsFilled++;
    }
  });

  // Validate passport number format (basic check)
  if (masterData.applicant_passport_number) {
    const passportNum = masterData.applicant_passport_number.toString().trim();
    if (passportNum.length < 6 || passportNum.length > 12) {
      issues.push({
        field: 'applicant_passport_number',
        message: 'Passport number should be 6-12 characters',
        severity: 'warning',
      });
    }
  }

  // Validate date format (DD.MM.YYYY) and constraints
  const dateFields = [
    'applicant_dob',
    'passport_issue_date',
    'passport_expiry_date',
    'poa_date_filed',
  ];

  dateFields.forEach((field) => {
    if (masterData[field]) {
      const dateStr = masterData[field].toString().trim();
      const dateMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      
      if (!dateMatch) {
        issues.push({
          field,
          message: `${field.replace(/_/g, ' ')} must be in DD.MM.YYYY format`,
          severity: 'error',
        });
      } else {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);

        if (day < 1 || day > 31) {
          issues.push({
            field,
            message: `${field.replace(/_/g, ' ')}: day must be 1-31`,
            severity: 'error',
          });
        }
        if (month < 1 || month > 12) {
          issues.push({
            field,
            message: `${field.replace(/_/g, ' ')}: month must be 1-12`,
            severity: 'error',
          });
        }
        if (year > 2030) {
          issues.push({
            field,
            message: `${field.replace(/_/g, ' ')}: year cannot exceed 2030`,
            severity: 'error',
          });
        }
      }
    }
  });

  const completionRate = (requiredFieldsFilled / requiredFields.length) * 100;
  const hasErrors = issues.some((issue) => issue.severity === 'error');

  return {
    valid: !hasErrors && requiredFieldsFilled === requiredFields.length,
    issues,
    completionRate,
    requiredFieldsFilled,
    totalRequiredFields: requiredFields.length,
  };
};

export const calculateFieldCompletionRate = (masterData: any): number => {
  if (!masterData) return 0;

  const allFields = Object.keys(masterData).filter(
    (key) => !['id', 'case_id', 'created_at', 'updated_at', 'version'].includes(key)
  );

  const filledFields = allFields.filter((field) => {
    const value = masterData[field];
    return value !== null && value !== undefined && value.toString().trim() !== '';
  });

  return (filledFields.length / allFields.length) * 100;
};
