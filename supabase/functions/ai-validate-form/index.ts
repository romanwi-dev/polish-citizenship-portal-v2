import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationCheck {
  passed: boolean;
  message: string;
  critical: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, templateType, checkType } = await req.json();

    console.log(`[ai-validate-form] Starting ${checkType} validation for ${templateType}`);

    // Initialize checks
    const checks: Record<string, ValidationCheck> = {};

    // 1. Polish characters validation
    const polishCharsRegex = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
    const hasPolishChars = Object.values(formData).some((val: any) => 
      typeof val === 'string' && polishCharsRegex.test(val)
    );
    
    checks.polish_chars = {
      passed: true, // Always pass - just informational
      message: hasPolishChars 
        ? 'Polish characters detected - PDF will use NeedAppearances flag' 
        : 'No Polish characters detected',
      critical: false
    };

    // 2. Date format validation (DD.MM.YYYY, year ≤ 2030)
    const dateFields = [
      'applicant_dob', 'father_dob', 'mother_dob', 'spouse_dob',
      'poa_date_filed', 'date_of_marriage', 'application_submission_date'
    ];
    
    const invalidDates: string[] = [];
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d{2}$/;
    
    dateFields.forEach(field => {
      const dateValue = formData[field];
      if (dateValue && typeof dateValue === 'string') {
        if (!dateRegex.test(dateValue)) {
          invalidDates.push(field);
        } else {
          const [, , year] = dateValue.split('.').map(Number);
          if (year > 2030) {
            invalidDates.push(`${field} (year > 2030)`);
          }
        }
      }
    });
    
    checks.dates = {
      passed: invalidDates.length === 0,
      message: invalidDates.length === 0 
        ? 'All date formats valid (DD.MM.YYYY, year ≤ 2030)' 
        : `Invalid dates: ${invalidDates.join(', ')}`,
      critical: true
    };

    // 3. Passport number validation (Polish format: AA1234567)
    const passportRegex = /^[A-Z]{2}[0-9]{7}$/;
    const passport = formData.applicant_passport_number;
    
    if (passport) {
      checks.passport = {
        passed: passportRegex.test(passport),
        message: passportRegex.test(passport) 
          ? `Passport format valid: ${passport}` 
          : `Invalid passport format: ${passport} (expected: AA1234567)`,
        critical: true
      };
    } else {
      checks.passport = {
        passed: false,
        message: 'Passport number missing',
        critical: true
      };
    }

    // 4. Mandatory fields validation (template-specific)
    const mandatoryFieldsMap: Record<string, string[]> = {
      'poa-adult': ['applicant_first_name', 'applicant_last_name', 'applicant_passport_number'],
      'poa-minor': ['applicant_first_name', 'applicant_last_name', 'applicant_passport_number', 'child_1_first_name', 'child_1_last_name'],
      'poa-spouses': ['applicant_first_name', 'applicant_last_name', 'applicant_passport_number', 'spouse_first_name', 'spouse_last_name'],
      'citizenship': ['applicant_first_name', 'applicant_last_name', 'applicant_dob', 'applicant_pob'],
      'family-tree': ['applicant_first_name', 'applicant_last_name'],
      'umiejscowienie': ['applicant_first_name', 'applicant_last_name', 'submission_location'],
      'uzupelnienie': ['applicant_first_name', 'applicant_last_name', 'submission_location'],
    };

    const mandatoryFields = mandatoryFieldsMap[templateType] || [];
    const missingFields = mandatoryFields.filter(field => !formData[field]);
    
    checks.mandatory_fields = {
      passed: missingFields.length === 0,
      message: missingFields.length === 0 
        ? 'All mandatory fields present' 
        : `Missing: ${missingFields.join(', ')}`,
      critical: true
    };

    // 5. Name consistency check
    const firstNameVariants = [
      formData.applicant_first_name,
      formData.given_name,
      formData.first_name
    ].filter(Boolean);
    
    const lastNameVariants = [
      formData.applicant_last_name,
      formData.surname,
      formData.last_name
    ].filter(Boolean);
    
    const nameInconsistency = 
      (new Set(firstNameVariants).size > 1) || 
      (new Set(lastNameVariants).size > 1);
    
    checks.name_consistency = {
      passed: !nameInconsistency,
      message: nameInconsistency 
        ? 'Name inconsistency detected across fields' 
        : 'Names consistent across all fields',
      critical: false
    };

    // 6. Address format validation
    const address = formData.applicant_address;
    const hasValidAddress = address && (
      (typeof address === 'object' && address.city && address.country) ||
      (typeof address === 'string' && address.length > 10)
    );
    
    checks.address_format = {
      passed: hasValidAddress,
      message: hasValidAddress 
        ? 'Address format valid' 
        : 'Address incomplete or invalid',
      critical: false
    };

    // 7. Cross-field relationships
    const relationshipIssues: string[] = [];
    
    // Check: If married, spouse fields should be filled
    if (formData.applicant_is_married === true || formData.applicant_is_married === 'Married') {
      if (!formData.spouse_first_name || !formData.spouse_last_name) {
        relationshipIssues.push('Married status but spouse name missing');
      }
      if (!formData.date_of_marriage) {
        relationshipIssues.push('Married status but marriage date missing');
      }
    }
    
    // Check: If children exist, child fields should be filled
    if (formData.children_count > 0) {
      if (!formData.child_1_first_name || !formData.child_1_last_name) {
        relationshipIssues.push(`${formData.children_count} children declared but child 1 incomplete`);
      }
    }
    
    checks.cross_field_relationships = {
      passed: relationshipIssues.length === 0,
      message: relationshipIssues.length === 0 
        ? 'All cross-field relationships valid' 
        : relationshipIssues.join('; '),
      critical: false
    };

    console.log('[ai-validate-form] Validation complete');
    console.log('Results:', JSON.stringify(checks, null, 2));

    return new Response(
      JSON.stringify({ checks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ai-validate-form] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
