import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CaseDetailData {
  id: string;
  client_name: string;
  client_code: string | null;
  country: string | null;
  status: string;
  current_stage: string | null;
  progress: number | null;
  intake_completed: boolean | null;
  poa_approved: boolean | null;
  oby_filed: boolean | null;
  wsc_received: boolean | null;
  decision_received: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface IntakeData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  completion_percentage: number | null;
  [key: string]: any;
}

export interface DocumentData {
  id: string;
  name: string;
  type: string | null;
  category: string | null;
  created_at: string;
  is_verified: boolean | null;
}

export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  due_date: string | null;
  priority: string | null;
  completed_at: string | null;
}

export const useCaseDetail = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: async () => {
      if (!caseId) throw new Error("Case ID is required");

      const [caseRes, intakeRes, docsRes, tasksRes] = await Promise.all([
        supabase.from("cases").select("*").eq("id", caseId).single(),
        supabase.from("intake_data").select("*").eq("case_id", caseId).maybeSingle(),
        supabase.from("documents").select("*").eq("case_id", caseId).order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").eq("case_id", caseId).order("created_at", { ascending: false }),
      ]);

      if (caseRes.error) throw caseRes.error;

      return {
        case: caseRes.data as CaseDetailData,
        intake: intakeRes.data as IntakeData | null,
        documents: (docsRes.data || []) as DocumentData[],
        tasks: (tasksRes.data || []) as TaskData[],
      };
    },
    enabled: !!caseId,
    staleTime: 30000,
  });
};
