import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storeProposal, type ChangeProposal } from "@/utils/verificationWorkflow";

export default function VerifyAuditPlan() {
  const navigate = useNavigate();

  useEffect(() => {
    const auditProposal: ChangeProposal = {
      type: 'mixed',
      description: 'Complete diagnostic audit of Polish Citizenship Portal to identify and document all non-functional systems, verify working components, and create actionable fix plan.',
      impact: 'System-wide assessment across 32 edge functions, 52 database tables, PDF generation pipeline, AI agents, and client portal functionality.',
      files: [
        {
          path: 'supabase/functions/fill-pdf/index.ts',
          action: 'edit',
          changes: 'Analyze PDF generation function for content vs field-only loading issue',
          linesAffected: '1-500'
        },
        {
          path: 'supabase/functions/ai-agent/index.ts',
          action: 'edit',
          changes: 'Diagnose AI agent execution failures and Lovable AI Gateway connectivity',
          linesAffected: '1-400'
        },
        {
          path: 'supabase/functions/verify-changes/index.ts',
          action: 'edit',
          changes: 'Verify OpenAI verification system is functional',
          linesAffected: '1-293'
        },
        {
          path: 'supabase/functions/ocr-worker/index.ts',
          action: 'edit',
          changes: 'Investigate 100% OCR failure rate with Dropbox path errors',
          linesAffected: '1-300'
        },
        {
          path: 'src/components/PDFGenerationButtons.tsx',
          action: 'edit',
          changes: 'Review PDF generation UI and error handling',
          linesAffected: '1-300'
        },
        {
          path: 'src/pages/admin/UploadPDFTemplates.tsx',
          action: 'edit',
          changes: 'Check PDF template management and storage integration',
          linesAffected: '1-200'
        },
        {
          path: 'src/components/AIAgentPanel.tsx',
          action: 'edit',
          changes: 'Analyze AI agent interface and error states',
          linesAffected: '1-250'
        }
      ],
      edgeFunctions: [
        {
          name: 'fill-pdf',
          changes: 'Test execution, validate field mappings, check template content preservation'
        },
        {
          name: 'ai-agent',
          changes: 'Test Lovable AI Gateway connectivity, verify orchestration flow'
        },
        {
          name: 'ocr-worker',
          changes: 'Diagnose Dropbox path errors causing 100% failure rate'
        },
        {
          name: 'verify-changes',
          changes: 'Confirm OpenAI verification system operational'
        },
        {
          name: 'dropbox-sync',
          changes: 'Check Dropbox integration and path validation'
        }
      ],
      reasoning: `Critical Issues Identified:
1. PDF Templates - User reports templates load fields but not content → indicates fill-pdf function may not be extracting/preserving template content
2. AI Agent - User reports failures → ai-agent edge function not executing or hitting errors
3. OCR Worker - Logs show 100% failure rate (10/10 documents) with Dropbox path_not_found errors
4. No Edge Function Logs - Critical functions show no recent activity → possible deployment failure

Root Cause Hypotheses:
- Edge functions may not be deployed despite code existing
- fill-pdf may be filling fields but not preserving template graphics/formatting
- Dropbox paths in database don't match actual Dropbox structure
- AI agent may lack required API keys or have broken Lovable AI integration`,
      risks: [
        'Data Loss Risk - If PDF templates are corrupted, client documents may be unusable',
        'Client Impact - Failed AI agents and OCR mean manual work for staff',
        'Workflow Blockage - No PDFs = no POAs = cases cannot progress',
        'Security - Need to verify RLS policies during database checks',
        'Deployment State - Edge functions may be undeployed, breaking all backend logic'
      ],
      rollbackPlan: 'This is a READ-ONLY audit - no changes will be made. All findings will be documented. Fix proposals will be generated separately. Each fix will go through OpenAI verification before implementation. Version history available for any emergency rollback.'
    };

    // Store the proposal
    storeProposal(auditProposal);
    
    // Navigate to verification page
    navigate('/admin/verify-changes');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Preparing verification...</p>
      </div>
    </div>
  );
}
