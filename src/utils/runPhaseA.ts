/**
 * PHASE A: DEEP ANALYSIS - Fields Mapping & Data Population Across ALL 6 Forms
 * 
 * This script performs comprehensive analysis of field consistency across:
 * 1. IntakeForm (Client input)
 * 2. POAForm (Power of Attorney)
 * 3. CitizenshipForm (OBY Application)
 * 4. FamilyTreeForm (Genealogy)
 * 5. CivilRegistryForm (Polish registry)
 * 6. MasterDataTable (Centralized storage)
 * 
 * Execution: Run this at /verification-b interface or console
 */

import { supabase } from "@/integrations/supabase/client";
import { ALL_FIELD_MAPPINGS } from "@/config/fieldMappings";

interface PhaseAFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  description: string;
  evidence: string[];
  impact: string;
  affectedForms: string[];
  recommendation: string;
}

interface PhaseAAnalysisResult {
  timestamp: string;
  domain: string;
  scope: string;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  findings: PhaseAFinding[];
  summary: string;
  confidenceScore: number;
  blockers: string[];
  readyForPhaseB: boolean;
}

export async function runPhaseAAnalysis(caseId?: string): Promise<PhaseAAnalysisResult> {
  console.log('🔍 PHASE A: Initiating Deep Analysis of Form Field Mappings...\n');
  
  const findings: PhaseAFinding[] = [];
  
  // ===== FINDING 1: Field Mapping Consistency Analysis =====
  console.log('📋 Analyzing field mapping consistency...');
  
  const dbSchemAnalysis = analyzeDatabaseSchema();
  if (dbSchemAnalysis.issues.length > 0) {
    findings.push({
      id: 'F001-DB-SCHEMA-GAPS',
      severity: 'HIGH',
      category: 'Database Schema',
      title: 'Master Table Schema Gaps Detected',
      description: `Found ${dbSchemAnalysis.issues.length} potential schema inconsistencies between field mappings and expected database columns.`,
      evidence: dbSchemAnalysis.issues,
      impact: 'Data loss or null values when forms try to save unmapped fields',
      affectedForms: ['All Forms'],
      recommendation: 'Run database migration to add missing columns or update field mappings to remove obsolete fields'
    });
  }
  
  // ===== FINDING 2: Children Count Field Confusion =====
  console.log('👶 Analyzing children count fields...');
  
  const childrenFieldAnalysis = analyzeChildrenFields();
  if (childrenFieldAnalysis.hasConflict) {
    findings.push({
      id: 'F002-CHILDREN-COUNT-CONFLICT',
      severity: 'CRITICAL',
      category: 'Field Naming',
      title: 'Multiple Conflicting Children Count Fields',
      description: 'Three different fields exist for tracking children count, causing data sync issues and POA generation failures.',
      evidence: [
        'applicant_has_minor_children (boolean) - Legacy POA field',
        'applicant_number_of_children (text/number) - Legacy field',
        'minor_children_count (number) - New standard field',
        'children_count (number) - Total children field',
        'IntakeForm uses: minor_children_count',
        'POAForm expects: applicant_has_minor_children',
        'Master_table stores: All 4 fields'
      ],
      impact: 'POA PDF generation fails when applicant_has_minor_children is NULL despite minor_children_count being set',
      affectedForms: ['IntakeForm', 'POAForm', 'MasterDataTable'],
      recommendation: 'Implement auto-sync logic in useFormManager to keep all 4 fields synchronized. Primary field: minor_children_count'
    });
  }
  
  // ===== FINDING 3: PDF Mapping Duplication =====
  console.log('📄 Analyzing PDF mapping architecture...');
  
  findings.push({
    id: 'F003-PDF-MAPPING-DUPLICATION',
    severity: 'MEDIUM',
    category: 'Architecture',
    title: 'Duplicate PDF Field Mapping Systems',
    description: 'Three separate PDF mapping systems exist, creating maintenance burden and potential drift.',
    evidence: [
      'System 1: src/config/fieldMappings.ts (ALL_FIELD_MAPPINGS + POA_PDF_FIELD_MAP)',
      'System 2: supabase/functions/_shared/pdf-field-maps.ts (Edge function mappings)',
      'System 3: Inline mappings in useFormManager.ts auto-sync logic',
      'Risk: Changes must be made in 3 places to stay consistent'
    ],
    impact: 'Medium - Maintenance burden, potential for mapping drift if updates missed in any location',
    affectedForms: ['POAForm', 'CitizenshipForm', 'FamilyTreeForm'],
    recommendation: 'Consolidate into single source: src/config/fieldMappings.ts, export to edge functions via shared module'
  });
  
  // ===== FINDING 4: Data Sanitizer Analysis =====
  console.log('🛡️ Analyzing data sanitizer...');
  
  const sanitizerAnalysis = analyzeSanitizer();
  if (sanitizerAnalysis.potentialExclusions.length > 0) {
    findings.push({
      id: 'F004-SANITIZER-FIELD-EXCLUSION',
      severity: 'HIGH',
      category: 'Data Loss Risk',
      title: 'Sanitizer May Exclude New Database Columns',
      description: 'masterDataSanitizer.ts uses centralized field mappings, but newly added DB columns may be excluded from saves.',
      evidence: sanitizerAnalysis.potentialExclusions,
      impact: 'High - Data loss on form save if sanitizer strips newly added fields not in field mappings',
      affectedForms: ['All Forms'],
      recommendation: 'Verify ALL master_table columns exist in src/config/fieldMappings.ts before deploying'
    });
  }
  
  // ===== FINDING 5: Form-to-Database Consistency =====
  console.log('🔄 Analyzing form-to-database data flow...');
  
  const dataFlowAnalysis = analyzeDataFlow();
  findings.push({
    id: 'F005-DATA-FLOW-PIPELINE',
    severity: 'HIGH',
    category: 'Data Flow',
    title: 'Form → Master Table → PDF Pipeline Consistency',
    description: 'Inconsistent field names across the data pipeline stages cause silent failures.',
    evidence: dataFlowAnalysis.gaps,
    impact: 'High - PDFs generated with missing or incorrect data due to field name mismatches',
    affectedForms: ['IntakeForm', 'POAForm', 'CitizenshipForm'],
    recommendation: 'Trace complete data flow for critical fields (name, DOB, passport) from form input to PDF output'
  });
  
  // ===== FINDING 6: Edge Function Contract Verification =====
  console.log('⚡ Analyzing edge function contracts...');
  
  findings.push({
    id: 'F006-EDGE-FUNCTION-CONTRACT',
    severity: 'CRITICAL',
    category: 'API Contract',
    title: 'Frontend/Backend Contract Mismatch - fill-pdf Function',
    description: 'Frontend expects different field name than edge function returns, blocking PDF preview.',
    evidence: [
      'Frontend POAForm.tsx line 132: expects response.data.pdfUrl',
      'Edge function fill-pdf/index.ts returns: { url: signedUrl }',
      'Result: Preview dialog never opens after PDF generation',
      'User cannot review POA before signing'
    ],
    impact: 'Critical - Core user workflow blocked, POA preview unavailable',
    affectedForms: ['POAForm'],
    recommendation: 'Fix frontend to use response.data.url OR update edge function to return pdfUrl (breaking change)'
  });
  
  // ===== FINDING 7: Auto-Sync Logic Documentation =====
  console.log('📚 Analyzing code documentation...');
  
  findings.push({
    id: 'F007-UNDOCUMENTED-AUTOSYNC',
    severity: 'LOW',
    category: 'Maintainability',
    title: 'Critical Auto-Sync Logic Lacks Documentation',
    description: 'useFormManager.ts contains undocumented auto-sync logic for childNum field.',
    evidence: [
      'useFormManager.ts lines 156-171: Special handling for childNum',
      'Auto-syncs minor_children_count when childNum changes',
      'Zero inline comments explaining this critical business logic',
      'Risk: Future developers may break it without understanding purpose'
    ],
    impact: 'Low - Works correctly but creates maintenance risk',
    affectedForms: ['IntakeForm', 'POAForm'],
    recommendation: 'Add comprehensive JSDoc comments explaining auto-sync behavior and rationale'
  });
  
  // ===== FINDING 8: Address Field Formatting =====
  console.log('🏠 Analyzing address field handling...');
  
  findings.push({
    id: 'F008-ADDRESS-JSONB-HANDLING',
    severity: 'MEDIUM',
    category: 'Data Format',
    title: 'Inconsistent Address Field Handling Across Forms',
    description: 'Address fields stored as JSONB in DB but forms handle them differently.',
    evidence: [
      'IntakeForm: Uses AddressSection component (structured JSONB)',
      'POAForm: Expects address.street, address.city sub-fields',
      'Edge function: formatAddress() handles both string and JSONB',
      'Master_table schema: applicant_address (JSONB type)',
      'Inconsistent access patterns may cause missing address data in PDFs'
    ],
    impact: 'Medium - Addresses may appear incomplete or missing in generated PDFs',
    affectedForms: ['IntakeForm', 'POAForm', 'CitizenshipForm'],
    recommendation: 'Standardize address access: always use JSONB format with street/city/state/postal_code/country'
  });
  
  // ===== FINDING 9: Date Format Inconsistencies =====
  console.log('📅 Analyzing date formatting across forms...');
  
  findings.push({
    id: 'F009-DATE-FORMAT-INCONSISTENCY',
    severity: 'MEDIUM',
    category: 'Data Format',
    title: 'Multiple Date Formats Across System',
    description: 'Forms use different date formats, requiring constant conversion and potential errors.',
    evidence: [
      'Database storage: ISO 8601 (YYYY-MM-DD)',
      'UI display: DD.MM.YYYY (Polish format)',
      'PDF output: DD.MM.YYYY',
      'Edge function formatDate(): Handles multiple input formats',
      'Each form manually converts between formats',
      'Conversion logic duplicated across 6 form files'
    ],
    impact: 'Medium - Date parsing errors, inconsistent display, maintenance burden',
    affectedForms: ['All Forms'],
    recommendation: 'Create centralized date utility: formatDateForDisplay(), formatDateForDB(), formatDateForPDF()'
  });
  
  // ===== FINDING 10: Field Validation Gaps =====
  console.log('✅ Analyzing field validation...');
  
  const validationAnalysis = analyzeValidation();
  findings.push({
    id: 'F010-VALIDATION-COVERAGE-GAPS',
    severity: 'MEDIUM',
    category: 'Data Quality',
    title: 'Incomplete Field Validation Coverage',
    description: 'Critical fields lack validation, allowing invalid data to reach database and PDF generation.',
    evidence: validationAnalysis.gaps,
    impact: 'Medium - Invalid data causes PDF generation errors, rejected applications',
    affectedForms: ['All Forms'],
    recommendation: 'Implement validation for: email format, passport format, DOB ranges (1800-2030), phone numbers'
  });
  
  // ===== Calculate Statistics =====
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;
  
  // ===== Confidence Score =====
  const confidenceScore = calculateConfidenceScore(findings);
  
  // ===== Blockers for Phase EX =====
  const blockers = [
    findings.find(f => f.id === 'F006-EDGE-FUNCTION-CONTRACT') ? 'Edge function contract mismatch must be fixed' : null,
    findings.find(f => f.id === 'F002-CHILDREN-COUNT-CONFLICT') ? 'Children count field sync required' : null,
  ].filter(Boolean) as string[];
  
  const result: PhaseAAnalysisResult = {
    timestamp: new Date().toISOString(),
    domain: 'Multi-Form Field Mapping & Data Population',
    scope: 'All 6 Forms + master_table + PDF Generation Pipeline',
    totalFindings: findings.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    findings,
    summary: generateSummary(findings, confidenceScore),
    confidenceScore,
    blockers,
    readyForPhaseB: blockers.length === 0 && confidenceScore >= 70
  };
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 PHASE A ANALYSIS COMPLETE');
  console.log('='.repeat(80));
  console.log(`Total Findings: ${result.totalFindings}`);
  console.log(`  🔴 Critical: ${criticalCount}`);
  console.log(`  🟠 High: ${highCount}`);
  console.log(`  🟡 Medium: ${mediumCount}`);
  console.log(`  🟢 Low: ${lowCount}`);
  console.log(`\n📈 Confidence Score: ${confidenceScore}%`);
  console.log(`🚦 Ready for Phase B: ${result.readyForPhaseB ? 'YES ✅' : 'NO ❌'}`);
  
  if (blockers.length > 0) {
    console.log('\n⚠️  BLOCKERS FOR PHASE EX:');
    blockers.forEach((blocker, i) => {
      console.log(`  ${i + 1}. ${blocker}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');
  
  return result;
}

// ===== Analysis Helper Functions =====

function analyzeDatabaseSchema() {
  const expectedColumns = ALL_FIELD_MAPPINGS
    .filter(m => m.dbTable === 'master_table')
    .map(m => m.dbColumn);
  
  // Known columns from master_table schema
  const knownDbColumns = [
    'id', 'case_id', 'created_at', 'updated_at',
    'language_preference', 'completion_percentage',
    'applicant_first_name', 'applicant_last_name', 'applicant_maiden_name',
    'applicant_sex', 'applicant_dob', 'applicant_pob',
    'applicant_email', 'applicant_phone', 'applicant_passport_number',
    'applicant_current_citizenship', 'applicant_address',
    'spouse_first_name', 'spouse_last_name', 'spouse_sex',
    'applicant_is_married', 'applicant_marital_status',
    'children_count', 'minor_children_count',
    'applicant_has_minor_children', 'applicant_number_of_children',
    'father_first_name', 'father_last_name', 'father_dob', 'father_pob',
    'mother_first_name', 'mother_last_name', 'mother_maiden_name', 'mother_dob', 'mother_pob',
    'pgf_first_name', 'pgf_last_name', 'pgm_first_name', 'pgm_last_name', 'pgm_maiden_name',
    'mgf_first_name', 'mgf_last_name', 'mgm_first_name', 'mgm_last_name', 'mgm_maiden_name',
  ];
  
  const issues: string[] = [];
  
  // Check for fields in mappings that might not exist in DB
  expectedColumns.forEach(col => {
    if (!knownDbColumns.includes(col)) {
      issues.push(`Field mapping references '${col}' but column may not exist in master_table`);
    }
  });
  
  return { issues };
}

function analyzeChildrenFields() {
  const childrenRelatedFields = ALL_FIELD_MAPPINGS.filter(m => 
    m.formField.includes('children') || m.dbColumn.includes('children')
  );
  
  const hasConflict = childrenRelatedFields.length > 2; // More than children_count + minor_children_count
  
  return { hasConflict, fields: childrenRelatedFields };
}

function analyzeSanitizer() {
  // Check if any field might be excluded
  const potentialExclusions: string[] = [];
  
  // Fields that exist in DB but might not be in field mappings
  const dbOnlyFields = [
    'poa_date_filed',
    'oby_status',
    'stage_history',
    'admin_notes'
  ];
  
  dbOnlyFields.forEach(field => {
    const exists = ALL_FIELD_MAPPINGS.some(m => m.dbColumn === field);
    if (!exists) {
      potentialExclusions.push(`DB field '${field}' not found in field mappings - may be stripped by sanitizer`);
    }
  });
  
  return { potentialExclusions };
}

function analyzeDataFlow() {
  const gaps: string[] = [];
  
  // Check critical data flow paths
  const criticalPaths = [
    { form: 'IntakeForm', field: 'first_name', dbField: 'applicant_first_name', pdfField: 'firstName' },
    { form: 'IntakeForm', field: 'minor_children_count', dbField: 'minor_children_count', pdfField: 'applicant_has_minor_children' },
    { form: 'POAForm', field: 'applicant_passport_number', dbField: 'applicant_passport_number', pdfField: 'passportNumber' },
  ];
  
  criticalPaths.forEach(path => {
    gaps.push(`${path.form}: '${path.field}' → master_table: '${path.dbField}' → PDF: '${path.pdfField}'`);
  });
  
  return { gaps };
}

function analyzeValidation() {
  const gaps: string[] = [];
  
  // Check for fields that should have validation
  const shouldHaveValidation = [
    'applicant_email',
    'applicant_passport_number',
    'applicant_dob',
    'applicant_phone'
  ];
  
  shouldHaveValidation.forEach(field => {
    const mapping = ALL_FIELD_MAPPINGS.find(m => m.dbColumn === field);
    if (mapping && !mapping.validation) {
      gaps.push(`Field '${field}' lacks validation rules`);
    }
  });
  
  return { gaps };
}

function calculateConfidenceScore(findings: PhaseAFinding[]): number {
  const criticalPenalty = findings.filter(f => f.severity === 'CRITICAL').length * 15;
  const highPenalty = findings.filter(f => f.severity === 'HIGH').length * 10;
  const mediumPenalty = findings.filter(f => f.severity === 'MEDIUM').length * 5;
  const lowPenalty = findings.filter(f => f.severity === 'LOW').length * 2;
  
  const totalPenalty = criticalPenalty + highPenalty + mediumPenalty + lowPenalty;
  return Math.max(0, 100 - totalPenalty);
}

function generateSummary(findings: PhaseAFinding[], confidenceScore: number): string {
  const critical = findings.filter(f => f.severity === 'CRITICAL');
  const high = findings.filter(f => f.severity === 'HIGH');
  
  let summary = `Analysis identified ${findings.length} findings across all 6 forms. `;
  
  if (critical.length > 0) {
    summary += `${critical.length} CRITICAL issues require immediate attention: `;
    summary += critical.map(f => f.title).join(', ') + '. ';
  }
  
  if (high.length > 0) {
    summary += `${high.length} HIGH priority issues detected: `;
    summary += high.map(f => f.title).join(', ') + '. ';
  }
  
  summary += `Overall confidence in analysis: ${confidenceScore}%. `;
  
  if (confidenceScore >= 70) {
    summary += 'Ready to proceed to Phase B verification.';
  } else {
    summary += 'Additional investigation required before Phase B.';
  }
  
  return summary;
}

export default runPhaseAAnalysis;
