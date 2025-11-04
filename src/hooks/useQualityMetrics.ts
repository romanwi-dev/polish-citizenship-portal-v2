import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface QualityMetric {
  name: string;
  score: number;
  weight: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  trend?: 'up' | 'down' | 'stable';
  details?: string;
}

interface QualityMetricsResult {
  overall: number;
  completeness: number;
  missingFields: string[];
  blockers: number;
  warnings: number;
  breakdown: QualityMetric[];
}

export function useQualityMetrics(caseId: string | undefined) {
  // Fetch OBY form data (contains master data)
  const { data: caseData } = useQuery({
    queryKey: ['case-master-data', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const { data, error } = await supabase
        .from('oby_forms')
        .select('form_data')
        .eq('case_id', caseId)
        .maybeSingle();
      if (error) throw error;
      return (data?.form_data as any) || {};
    },
    enabled: !!caseId,
  });

  // Fetch documents
  const { data: documents } = useQuery({
    queryKey: ['case-documents-quality', caseId],
    queryFn: async () => {
      if (!caseId) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('id, document_type, person_type, verification_status, is_verified_by_hac')
        .eq('case_id', caseId);
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  // Fetch OBY form
  const { data: obyForm } = useQuery({
    queryKey: ['oby-form-quality', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const { data, error } = await supabase
        .from('oby_forms')
        .select('form_data, status, hac_approved')
        .eq('case_id', caseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  // Calculate quality metrics
  const metrics = useMemo<QualityMetricsResult | null>(() => {
    if (!caseData) return null;

    const requiredFields = [
      'ap_first_name', 'ap_last_name', 'ap_birth_date', 'ap_birth_place',
      'f_first_name', 'f_last_name', 'm_first_name', 'm_last_name'
    ];

    const filledFields = requiredFields.filter(field => {
      const value = caseData[field];
      return value !== null && value !== undefined && value !== '';
    });

    const missingFields = requiredFields.filter(field => {
      const value = caseData[field];
      return value === null || value === undefined || value === '';
    });

    const completeness = (filledFields.length / requiredFields.length) * 100;

    // Document quality
    const totalDocs = documents?.length || 0;
    const verifiedDocs = documents?.filter(d => d.is_verified_by_hac).length || 0;
    const documentsScore = totalDocs > 0 ? (verifiedDocs / totalDocs) * 100 : 0;

    // Form quality
    const formScore = obyForm?.hac_approved ? 100 : obyForm?.status === 'draft' ? 30 : 60;

    // Blockers and warnings
    let blockers = 0;
    let warnings = 0;

    if (completeness < 50) blockers++;
    if (completeness < 75) warnings++;
    if (documentsScore < 60) warnings++;
    if (totalDocs === 0) blockers++;

    // Individual metrics
    const breakdown: QualityMetric[] = [
      {
        name: 'Data Completeness',
        score: completeness,
        weight: 2,
        status: completeness >= 90 ? 'excellent' : completeness >= 75 ? 'good' : completeness >= 60 ? 'warning' : 'poor',
        details: `${filledFields.length} of ${requiredFields.length} required fields filled`,
      },
      {
        name: 'Document Verification',
        score: documentsScore,
        weight: 2,
        status: documentsScore >= 90 ? 'excellent' : documentsScore >= 75 ? 'good' : documentsScore >= 60 ? 'warning' : 'poor',
        details: `${verifiedDocs} of ${totalDocs} documents verified`,
      },
      {
        name: 'Form Approval',
        score: formScore,
        weight: 1.5,
        status: formScore >= 90 ? 'excellent' : formScore >= 75 ? 'good' : formScore >= 60 ? 'warning' : 'poor',
        details: obyForm?.hac_approved ? 'HAC approved' : obyForm?.status || 'Not started',
      },
    ];

    // Calculate weighted overall score
    const totalWeight = breakdown.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = breakdown.reduce((sum, m) => sum + (m.score * m.weight), 0);
    const overall = weightedSum / totalWeight;

    return {
      overall,
      completeness,
      missingFields,
      blockers,
      warnings,
      breakdown,
    };
  }, [caseData, documents, obyForm]);

  return metrics;
}
