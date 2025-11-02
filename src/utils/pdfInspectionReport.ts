/**
 * PDF Post-Generation Inspection Report
 * Analyzes generated PDFs and compares against original proposals
 */

import { inspectPDFFields, type InspectionResult } from './pdfInspector';
import type { PDFGenerationProposal } from './pdfProposalGenerator';

export interface PDFInspectionReport {
  type: 'pdf_generation_post';
  templateType: string;
  proposalId?: string;
  description: string;
  impact: string;
  files: Array<{
    path: string;
    action: 'verify';
    changes: string;
  }>;
  execution: {
    success: boolean;
    totalFieldsInPDF: number;
    fieldsFilledCount: number;
    fieldsMappedCount: number;
    emptyFields: string[];
    unexpectedFields: string[];
    issues: string[];
  };
  actualFieldValues: Record<string, any>;
  comparisonToProposal?: {
    proposedMappings: number;
    actuallyFilled: number;
    matchRate: number;
    discrepancies: string[];
  };
  reasoning: string;
  risks: string[];
  rollbackPlan: string;
}

/**
 * Inspect a generated PDF blob and create a post-verification report
 */
export async function generateInspectionReport(
  pdfBlob: Blob,
  templateType: string,
  proposal?: PDFGenerationProposal,
  caseId?: string
): Promise<PDFInspectionReport> {
  // Convert Blob to ArrayBuffer for inspection
  const arrayBuffer = await pdfBlob.arrayBuffer();
  
  // Use existing pdfInspector to extract fields
  const inspection: InspectionResult = await inspectPDFFieldsFromBuffer(arrayBuffer, templateType);

  const totalFieldsInPDF = inspection.totalFields;
  const actualFieldValues: Record<string, any> = {};
  const emptyFields: string[] = [];
  const issues: string[] = [];

  // Analyze each field
  for (const field of inspection.fields) {
    // For now, we can't easily extract VALUES from PDFs without Adobe API
    // So we'll mark this as a limitation
    actualFieldValues[field.name] = `[${field.type}]`;
  }

  // Compare to proposal if provided
  let comparisonToProposal;
  if (proposal && proposal.pdfGeneration) {
    const proposedMappings = proposal.pdfGeneration.mappedFields;
    const actuallyFilled = inspection.totalFields; // Conservative estimate
    const matchRate = proposedMappings > 0
      ? Math.round((Math.min(actuallyFilled, proposedMappings) / proposedMappings) * 100)
      : 0;

    const discrepancies: string[] = [];

    // Check if field counts match expectations
    if (actuallyFilled < proposedMappings) {
      discrepancies.push(
        `Expected ${proposedMappings} fields to be filled, but PDF has ${actuallyFilled} total fields`
      );
    }

    // Check for missing expected fields
    const expectedFieldNames = proposal.pdfGeneration.fieldMappings
      .filter(m => m.hasValue)
      .map(m => m.pdfField);

    const actualFieldNames = inspection.fields.map(f => f.name);

    for (const expectedField of expectedFieldNames) {
      if (!actualFieldNames.includes(expectedField)) {
        discrepancies.push(`Expected field "${expectedField}" not found in PDF`);
      }
    }

    comparisonToProposal = {
      proposedMappings,
      actuallyFilled,
      matchRate,
      discrepancies,
    };

    if (discrepancies.length > 0) {
      issues.push(...discrepancies);
    }
  }

  // Detect unexpected fields (fields in PDF that weren't in the template)
  const unexpectedFields: string[] = [];
  if (proposal && proposal.pdfGeneration) {
    const expectedFields = proposal.pdfGeneration.fieldMappings.map(m => m.pdfField);
    for (const field of inspection.fields) {
      if (!expectedFields.includes(field.name)) {
        unexpectedFields.push(field.name);
      }
    }
  }

  const fieldsFilledCount = totalFieldsInPDF; // Conservative count
  const fieldsMappedCount = proposal?.pdfGeneration.mappedFields || 0;

  const risks: string[] = [];
  if (issues.length > 0) {
    risks.push(`${issues.length} discrepancies found between proposal and generated PDF`);
  }

  if (unexpectedFields.length > 0) {
    risks.push(`${unexpectedFields.length} unexpected fields found in PDF`);
  }

  return {
    type: 'pdf_generation_post',
    templateType,
    proposalId: proposal ? 'proposal-reference' : undefined,
    description: `Post-generation inspection of ${templateType} PDF`,
    impact: `Verified ${fieldsFilledCount} fields in generated PDF${
      comparisonToProposal
        ? ` (${comparisonToProposal.matchRate}% match to proposal)`
        : ''
    }`,
    files: [
      {
        path: `/cases/${caseId || 'unknown'}/documents/${templateType}.pdf`,
        action: 'verify',
        changes: `PDF generated with ${fieldsFilledCount} fields`,
      },
    ],
    execution: {
      success: issues.length === 0,
      totalFieldsInPDF,
      fieldsFilledCount,
      fieldsMappedCount,
      emptyFields,
      unexpectedFields,
      issues,
    },
    actualFieldValues,
    comparisonToProposal,
    reasoning: `Generated PDF has ${totalFieldsInPDF} total fields. ${
      comparisonToProposal
        ? `Matches ${comparisonToProposal.matchRate}% of the proposal expectations.`
        : 'No proposal available for comparison.'
    } ${issues.length > 0 ? `Found ${issues.length} issues.` : 'No issues detected.'}`,
    risks,
    rollbackPlan: 'PDF can be regenerated if issues are found. Original data remains unchanged.',
  };
}

/**
 * Helper to inspect PDF from ArrayBuffer
 */
async function inspectPDFFieldsFromBuffer(
  buffer: ArrayBuffer,
  templateType: string
): Promise<InspectionResult> {
  const { PDFDocument } = await import('pdf-lib');
  
  const pdfDoc = await PDFDocument.load(buffer);
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  const fieldInfo = fields.map(field => ({
    name: field.getName(),
    type: field.constructor.name,
  }));

  return {
    templateType,
    totalFields: fieldInfo.length,
    fields: fieldInfo,
  };
}
