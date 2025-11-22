import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  FAMILY_TREE_FORM_RULES,
  FORM_VALIDATION_PATTERNS,
  POA_FORM_RULES,
  INTAKE_FORM_RULES,
  OBY_CITIZENSHIP_FORM_RULES,
  DOCUMENT_RADAR_RULES,
  SYSTEM_PROMPT_FORMS_ANALYSIS,
} from '../_shared/form-analysis-prompts.ts';
import { getErrorMessage } from '../_shared/error-utils.ts';

const AGENT_NAME = 'forms_memory';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[${AGENT_NAME}] Starting Forms Memory Agent cycle...`);

    // Analyze intake data patterns
    const { data: intakeData } = await supabase
      .from('intake_data')
      .select('case_id, data, created_at, updated_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(500);

    // Analyze master table completion
    const { data: masterTables } = await supabase
      .from('master_table')
      .select('case_id, completion_percentage, language_preference, updated_at')
      .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(300);

    // Analyze form validation errors from HAC logs
    const { data: validationLogs } = await supabase
      .from('hac_logs')
      .select('action_type, action_details, performed_at, case_id, field_changed')
      .in('action_type', ['form_validation_error', 'field_validation_failed', 'intake_error'])
      .gte('performed_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .limit(500);

    // Analyze POA forms
    const { data: poaForms } = await supabase
      .from('poa')
      .select('case_id, applicant_sex, created_at, updated_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(200);

    const insights = {
      intakePatterns: analyzeIntakePatterns(intakeData || []),
      completionMetrics: analyzeCompletionMetrics(masterTables || []),
      validationPatterns: analyzeValidationPatterns(validationLogs || []),
      fieldPopulationRules: generateAutoFillRules(intakeData || [], poaForms || []),
      commonErrors: identifyCommonErrors(validationLogs || []),
      knowledgeBase: {
        familyTreeRules: FAMILY_TREE_FORM_RULES,
        formValidationPatterns: FORM_VALIDATION_PATTERNS,
        poaRules: POA_FORM_RULES,
        intakeRules: INTAKE_FORM_RULES,
        obyRules: OBY_CITIZENSHIP_FORM_RULES,
        documentRadarRules: DOCUMENT_RADAR_RULES,
        systemPrompt: SYSTEM_PROMPT_FORMS_ANALYSIS,
        poaSpecificRules: {
          fieldMappings: {
            singleSourceOfTruth: 'supabase/functions/_shared/mappings/*.ts',
            neverDuplicate: true,
            frontendImportsFromBackend: true,
            spouseFields: ['spouse_first_name', 'spouse_last_name', 'spouse_passport_number', 'husband_last_name_after_marriage', 'wife_last_name_after_marriage'],
          },
          pdfFormatting: {
            font: 'Helvetica-Bold (for compatibility across all devices)',
            fontSize: '0 (auto-size)',
            textTransform: 'UPPERCASE for all non-date fields',
            dateFieldsException: 'No bold, normal case, keep original format',
            appearanceString: '/Helvetica-Bold 0 Tf 0 g',
          },
          mobileCompatibility: {
            pdfFormat: 'AcroForm (NOT XFA) - set useObjectStreams: false',
            editingApp: 'Adobe Acrobat Reader (free)',
            previewLimitation: 'iframe cannot edit forms on mobile browsers',
            downloadInstruction: 'Download PDF → Open in Adobe Reader → Edit → Save',
          },
          multiPOAPreview: {
            stateTracking: 'generatedPOATypes: string[]',
            urlTracking: 'pdfUrls: Record<string, string>',
            tabSwitching: 'conditional on availablePOATypes.length > 1',
            types: ['adult', 'minor', 'spouses'],
          },
          commonIssues: {
            fieldClearing: 'Missing from SPOUSE_FIELDS array',
            fontIssues: 'Using non-embedded font or wrong appearance syntax',
            previewBugs: 'Incorrect state management for multi-POA',
            mobileEditing: 'Browser limitation, provide Adobe Reader link',
          },
        },
      },
    };

    // Update agent memory
    const memoryUpdates = [
      {
        key: 'intake_patterns',
        value: insights.intakePatterns,
      },
      {
        key: 'completion_metrics',
        value: insights.completionMetrics,
      },
      {
        key: 'validation_patterns',
        value: insights.validationPatterns,
      },
      {
        key: 'autofill_rules',
        value: insights.fieldPopulationRules,
      },
      {
        key: 'common_errors',
        value: insights.commonErrors,
      },
      {
        key: 'knowledge_base',
        value: insights.knowledgeBase,
      },
    ];

    for (const update of memoryUpdates) {
      await supabase
        .from('agent_memory')
        .upsert({
          agent_type: AGENT_NAME,
          memory_key: update.key,
          memory_value: update.value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'agent_type,memory_key' });
    }

    // Log agent activity
    await supabase.from('ai_agent_activity').insert({
      agent_name: AGENT_NAME,
      activity_type: 'memory_update',
      status: 'completed',
      details: {
        insights_generated: Object.keys(insights).length,
        intake_analyzed: intakeData?.length || 0,
        validation_errors: validationLogs?.length || 0,
        autofill_rules: insights.fieldPopulationRules.totalRules || 0,
      },
    });

    console.log(`[${AGENT_NAME}] Cycle completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${AGENT_NAME}] Error:`, error);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('ai_agent_activity').insert({
      agent_name: AGENT_NAME,
      activity_type: 'memory_update',
      status: 'failed',
      details: { error: getErrorMessage(error) },
    });

    return new Response(
      JSON.stringify({ success: false, error: getErrorMessage(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function analyzeIntakePatterns(data: any[]) {
  const patterns = {
    totalIntakes: data.length,
    averageFieldsCompleted: 0,
    commonlyFilledFields: {} as Record<string, number>,
    emptyFields: {} as Record<string, number>,
  };

  data.forEach(intake => {
    if (intake.data && typeof intake.data === 'object') {
      const fields = Object.keys(intake.data);
      fields.forEach(field => {
        const value = intake.data[field];
        if (value && value !== '') {
          patterns.commonlyFilledFields[field] = (patterns.commonlyFilledFields[field] || 0) + 1;
        } else {
          patterns.emptyFields[field] = (patterns.emptyFields[field] || 0) + 1;
        }
      });
    }
  });

  return patterns;
}

function analyzeCompletionMetrics(tables: any[]) {
  const metrics = {
    totalForms: tables.length,
    averageCompletion: 0,
    completionDistribution: {
      '0-25%': 0,
      '26-50%': 0,
      '51-75%': 0,
      '76-100%': 0,
    },
    languagePreference: {} as Record<string, number>,
  };

  tables.forEach(table => {
    const completion = table.completion_percentage || 0;
    metrics.averageCompletion += completion;

    if (completion <= 25) metrics.completionDistribution['0-25%']++;
    else if (completion <= 50) metrics.completionDistribution['26-50%']++;
    else if (completion <= 75) metrics.completionDistribution['51-75%']++;
    else metrics.completionDistribution['76-100%']++;

    if (table.language_preference) {
      metrics.languagePreference[table.language_preference] = 
        (metrics.languagePreference[table.language_preference] || 0) + 1;
    }
  });

  if (tables.length > 0) {
    metrics.averageCompletion = Math.round(metrics.averageCompletion / tables.length);
  }

  return metrics;
}

function analyzeValidationPatterns(logs: any[]) {
  const patterns = {
    totalErrors: logs.length,
    errorsByType: {} as Record<string, number>,
    errorsByField: {} as Record<string, number>,
    recentErrors: [] as any[],
  };

  logs.forEach(log => {
    const errorType = log.action_type || 'unknown';
    patterns.errorsByType[errorType] = (patterns.errorsByType[errorType] || 0) + 1;

    if (log.field_changed) {
      patterns.errorsByField[log.field_changed] = (patterns.errorsByField[log.field_changed] || 0) + 1;
    }

    if (patterns.recentErrors.length < 10) {
      patterns.recentErrors.push({
        type: errorType,
        field: log.field_changed,
        details: log.action_details,
        timestamp: log.performed_at,
      });
    }
  });

  return patterns;
}

function generateAutoFillRules(intakes: any[], poas: any[]) {
  const rules = {
    totalRules: 0,
    dateFormatRules: {
      pattern: 'DD.MM.YYYY',
      validation: 'DD<=31, MM<=12, YYYY<=2030',
      excludedFromClear: true,
    },
    nameRules: {
      capitalizeFirstLetter: true,
      trimWhitespace: true,
      uppercase: true,
    },
    childrenLogic: {
      totalChildrenField: 'children_count',
      minorChildrenField: 'minor_children_count',
      rule: 'minor_children_count must be <= children_count',
      childrenTabVisibility: 'Only show if minor_children_count > 0',
      formsRendered: 'Exactly minor_children_count forms (NOT always 10)',
    },
    polishBloodlineLogic: {
      grandparents: {
        fatherPolish: 'Show PGF & PGM',
        motherPolish: 'Show MGF & MGM',
        neitherPolish: 'Show all 4 (fallback)',
      },
      greatGrandparents: {
        pgfPolish: 'Show PGGF & PGGM',
        mgfPolish: 'Show MGGF & MGGM',
        neitherPolish: 'Hide great-grandparents tab',
      },
    },
    childDocumentsRules: {
      strictDocuments: ['POA', 'Passport Copy', 'Birth Certificate', 'Additional Documents'],
      neverShow: ['Polish Documents', 'Marriage Certificate', 'Naturalization', 'Foreign Docs', 'Military Record'],
    },
    sexDependentRules: [] as any[],
    dependentFields: [] as any[],
  };

  // Analyze sex-dependent field filling
  const maleCount = poas.filter(p => p.applicant_sex === 'Male').length;
  const femaleCount = poas.filter(p => p.applicant_sex === 'Female').length;

  if (maleCount > 0 || femaleCount > 0) {
    rules.sexDependentRules.push({
      condition: 'applicant_sex = Male',
      action: 'Show father fields, hide spouse fields unless married',
      occurrences: maleCount,
    });
    rules.sexDependentRules.push({
      condition: 'applicant_sex = Female',
      action: 'Show spouse fields for married women',
      occurrences: femaleCount,
    });
    rules.sexDependentRules.push({
      condition: 'sex = Male',
      action: 'Show Military Service Record in documents',
      occurrences: maleCount,
    });
  }

  // Common dependent fields
  rules.dependentFields.push({
    parentField: 'father_last_name',
    childFields: ['child_1_last_name', 'child_2_last_name', 'child_3_last_name'],
    rule: 'Auto-populate children last names from father',
  });
  rules.dependentFields.push({
    parentField: 'children_count',
    childField: 'minor_children_count',
    rule: 'minor_children_count dropdown max = children_count value',
  });
  rules.dependentFields.push({
    parentField: 'father_is_polish',
    childFields: ['pgf', 'pgm'],
    rule: 'Show paternal grandparents only if father is Polish',
  });
  rules.dependentFields.push({
    parentField: 'mother_is_polish',
    childFields: ['mgf', 'mgm'],
    rule: 'Show maternal grandparents only if mother is Polish',
  });

  rules.totalRules = 2 + rules.sexDependentRules.length + rules.dependentFields.length + 3; // +3 for new logic

  return rules;
}

function identifyCommonErrors(logs: any[]) {
  const errors = {
    topErrors: [] as any[],
    errorFrequency: {} as Record<string, number>,
    suggestedFixes: [] as any[],
  };

  logs.forEach(log => {
    const errorKey = `${log.action_type}_${log.field_changed}`;
    errors.errorFrequency[errorKey] = (errors.errorFrequency[errorKey] || 0) + 1;
  });

  // Get top 5 errors
  errors.topErrors = Object.entries(errors.errorFrequency)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([error, count]) => ({ error, count }));

  // Generate suggested fixes
  errors.topErrors.forEach(({ error }) => {
    if (error.includes('date')) {
      errors.suggestedFixes.push({
        error,
        suggestion: 'Add date picker with DD.MM.YYYY format validation',
      });
    } else if (error.includes('name')) {
      errors.suggestedFixes.push({
        error,
        suggestion: 'Add auto-capitalize and trim validation',
      });
    }
  });

  return errors;
}
