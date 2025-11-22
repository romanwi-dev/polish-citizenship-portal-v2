import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getErrorMessage } from "../_shared/error-utils.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PDFGenerationMetrics {
  pdfType: string;
  totalGenerated: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgGenerationTime: number;
  commonErrors: Array<{
    field: string;
    error: string;
    frequency: number;
  }>;
  fieldMappingAccuracy: number;
  lastUpdated: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("🎯 PDF Generation Agent: Starting analysis...");

    // 1. ANALYZE PDF GENERATION PATTERNS
    const metrics = await analyzePDFGenerationMetrics(supabase);
    
    // 2. LEARN FIELD MAPPING PATTERNS
    const fieldPatterns = await analyzeFieldMappingPatterns(supabase);
    
    // 3. IDENTIFY VALIDATION ISSUES
    const validationIssues = await identifyValidationIssues(supabase);
    
    // 4. UPDATE AGENT MEMORY
    await updatePDFMemory(supabase, metrics, fieldPatterns, validationIssues);
    
    // 5. GENERATE OPTIMIZATION SUGGESTIONS
    const suggestions = generateOptimizationSuggestions(metrics, validationIssues);
    
    // 6. LOG ACTIVITY
    await logAgentActivity(supabase, metrics, suggestions);

    console.log("✅ PDF Generation Agent: Analysis complete");

    return new Response(
      JSON.stringify({
        success: true,
        metrics,
        fieldPatterns,
        validationIssues,
        suggestions,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ PDF Generation Agent error:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzePDFGenerationMetrics(supabase: any): Promise<PDFGenerationMetrics[]> {
  console.log("📊 Analyzing PDF generation metrics...");

  const { data: pdfHistory, error } = await supabase
    .from("pdf_history")
    .select("*")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

  if (error) {
    console.error("Error fetching PDF history:", error);
    return [];
  }

  // Group by PDF type (extract from document_id or action)
  const metricsByType: Record<string, PDFGenerationMetrics> = {};

  // Analyze generated_documents table for actual generation data
  const { data: generatedDocs, error: genError } = await supabase
    .from("generated_documents")
    .select("*")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (genError) {
    console.error("Error fetching generated documents:", genError);
  }

  if (generatedDocs) {
    const typeGroups: Record<string, any[]> = {};
    
    generatedDocs.forEach((doc: any) => {
      const type = doc.document_type || "unknown";
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(doc);
    });

    for (const [type, docs] of Object.entries(typeGroups)) {
      const successCount = docs.filter(d => d.status === "completed").length;
      const failureCount = docs.filter(d => d.status === "failed").length;
      const totalGenerated = docs.length;

      // Calculate average generation time
      const validTimes = docs
        .filter(d => d.generation_time_ms)
        .map(d => d.generation_time_ms);
      const avgGenerationTime = validTimes.length > 0
        ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
        : 0;

      // Extract common errors
      const errorMap: Record<string, number> = {};
      docs.forEach((doc: any) => {
        if (doc.error_message) {
          const errorKey = doc.error_message.substring(0, 100);
          errorMap[errorKey] = (errorMap[errorKey] || 0) + 1;
        }
      });

      const commonErrors = Object.entries(errorMap)
        .map(([error, frequency]) => ({
          field: "general",
          error,
          frequency,
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

      metricsByType[type] = {
        pdfType: type,
        totalGenerated,
        successCount,
        failureCount,
        successRate: totalGenerated > 0 ? (successCount / totalGenerated) * 100 : 0,
        avgGenerationTime: Math.round(avgGenerationTime),
        commonErrors,
        fieldMappingAccuracy: 100 - (failureCount / Math.max(totalGenerated, 1)) * 100,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  return Object.values(metricsByType);
}

async function analyzeFieldMappingPatterns(supabase: any) {
  console.log("🗺️ Analyzing field mapping patterns...");

  // Analyze intake_data completeness
  const { data: intakeData, error } = await supabase
    .from("intake_data")
    .select("*")
    .limit(100);

  if (error) {
    console.error("Error fetching intake data:", error);
    return {};
  }

  const fieldCompleteness: Record<string, { total: number; filled: number }> = {};

  intakeData?.forEach((record: any) => {
    Object.keys(record).forEach((field) => {
      if (!fieldCompleteness[field]) {
        fieldCompleteness[field] = { total: 0, filled: 0 };
      }
      fieldCompleteness[field].total++;
      if (record[field] !== null && record[field] !== "") {
        fieldCompleteness[field].filled++;
      }
    });
  });

  const fieldPatterns = Object.entries(fieldCompleteness).map(([field, stats]) => ({
    field,
    completionRate: (stats.filled / stats.total) * 100,
    totalRecords: stats.total,
    filledRecords: stats.filled,
  }));

  return {
    totalFields: fieldPatterns.length,
    highCompletionFields: fieldPatterns.filter(f => f.completionRate > 90),
    lowCompletionFields: fieldPatterns.filter(f => f.completionRate < 50),
    avgCompletionRate: fieldPatterns.reduce((sum, f) => sum + f.completionRate, 0) / fieldPatterns.length,
  };
}

async function identifyValidationIssues(supabase: any) {
  console.log("🔍 Identifying validation issues...");

  // Check for common validation failures in HAC logs
  const { data: hacLogs, error } = await supabase
    .from("hac_logs")
    .select("*")
    .or("action_type.eq.pdf_validation_failed,action_type.eq.pdf_generation_failed")
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching HAC logs:", error);
    return { totalIssues: 0, issuesByType: {} };
  }

  const issuesByType: Record<string, number> = {};
  
  hacLogs?.forEach((log: any) => {
    const issueType = log.field_changed || "unknown";
    issuesByType[issueType] = (issuesByType[issueType] || 0) + 1;
  });

  return {
    totalIssues: hacLogs?.length || 0,
    issuesByType,
    topIssues: Object.entries(issuesByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count })),
  };
}

async function updatePDFMemory(
  supabase: any,
  metrics: PDFGenerationMetrics[],
  fieldPatterns: any,
  validationIssues: any
) {
  console.log("💾 Updating PDF agent memory...");

  // Update field mappings memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "pdf_generator",
      memory_key: "field_mappings_validation",
      memory_value: {
        pdfTypes: metrics.reduce((acc, m) => {
          acc[m.pdfType] = {
            totalGenerated: m.totalGenerated,
            successRate: m.successRate,
            avgGenerationTime: m.avgGenerationTime,
            commonErrors: m.commonErrors,
            fieldMappingAccuracy: m.fieldMappingAccuracy,
            lastAnalyzed: m.lastUpdated,
          };
          return acc;
        }, {} as Record<string, any>),
        fieldCompleteness: fieldPatterns,
        lastUpdated: new Date().toISOString(),
      },
      expires_at: null,
    });

  // Update validation patterns memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "pdf_generator",
      memory_key: "validation_patterns",
      memory_value: {
        totalIssues: validationIssues.totalIssues,
        issuesByType: validationIssues.issuesByType,
        topIssues: validationIssues.topIssues,
        analysisDate: new Date().toISOString(),
      },
      expires_at: null,
    });

  // Update performance trends memory
  await supabase
    .from("agent_memory")
    .upsert({
      agent_type: "pdf_generator",
      memory_key: "performance_trends",
      memory_value: {
        overallSuccessRate: metrics.length > 0
          ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
          : 0,
        avgGenerationTime: metrics.length > 0
          ? metrics.reduce((sum, m) => sum + m.avgGenerationTime, 0) / metrics.length
          : 0,
        totalGenerated: metrics.reduce((sum, m) => sum + m.totalGenerated, 0),
        lastUpdated: new Date().toISOString(),
      },
      expires_at: null,
    });
}

function generateOptimizationSuggestions(
  metrics: PDFGenerationMetrics[],
  validationIssues: any
): string[] {
  const suggestions: string[] = [];

  // Analyze success rates
  metrics.forEach((metric) => {
    if (metric.successRate < 90) {
      suggestions.push(
        `Improve ${metric.pdfType} PDF generation: Success rate is ${metric.successRate.toFixed(1)}%. Review field mappings and validation rules.`
      );
    }

    if (metric.avgGenerationTime > 3000) {
      suggestions.push(
        `Optimize ${metric.pdfType} generation performance: Average time is ${metric.avgGenerationTime}ms. Consider caching or pre-processing.`
      );
    }

    if (metric.commonErrors.length > 0) {
      suggestions.push(
        `Address common ${metric.pdfType} errors: "${metric.commonErrors[0].error}" occurred ${metric.commonErrors[0].frequency} times.`
      );
    }
  });

  // Validation issue suggestions
  if (validationIssues.totalIssues > 50) {
    suggestions.push(
      `High validation failure rate detected (${validationIssues.totalIssues} issues in 7 days). Review validation logic and field requirements.`
    );
  }

  return suggestions;
}

async function logAgentActivity(
  supabase: any,
  metrics: PDFGenerationMetrics[],
  suggestions: string[]
) {
  const totalGenerated = metrics.reduce((sum, m) => sum + m.totalGenerated, 0);
  const avgSuccessRate = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
    : 0;

  await supabase.from("ai_agent_activity").insert({
    agent_type: "pdf_generator",
    case_id: "00000000-0000-0000-0000-000000000000", // System-level activity
    user_id: "00000000-0000-0000-0000-000000000000",
    prompt: "Analyze PDF generation patterns and update memory",
    completion: `Analyzed ${totalGenerated} PDFs across ${metrics.length} types. Average success rate: ${avgSuccessRate.toFixed(1)}%. Generated ${suggestions.length} optimization suggestions.`,
    success: true,
    response_time_ms: 0,
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
    model_used: "analysis_engine",
    tools_executed: 4,
    tools_failed: 0,
    metadata: {
      metrics,
      suggestions,
      analysisType: "pdf_generation_memory",
    },
  });
}
