import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useIntakeData = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["intakeData", caseId],
    queryFn: async () => {
      if (!caseId) throw new Error("Case ID is required");

      const { data, error } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) throw error;
      
      // Map master_table fields to intake form field names for backwards compatibility
      if (data) {
        return {
          ...data,
          given_names: data.applicant_first_name,
          last_name: data.applicant_last_name,
          passport_number: data.applicant_passport_number,
          phone: data.applicant_phone,
          email: data.applicant_email,
          confirm_email: data.applicant_email, // Same as email
          civil_status: data.applicant_is_married ? "married" : "not_married",
          has_children: data.children_count > 0,
          has_minor_children: (data as any).has_minor_children || false,
          minor_children_count: (data as any).minor_children_count || 0,
        };
      }
      return data;
    },
    enabled: !!caseId,
    staleTime: 30000,
  });
};

export const useUpdateIntakeData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: any }) => {
      // Map intake form fields to master_table field names
      const masterUpdates: any = {};
      
      if (updates.given_names !== undefined) masterUpdates.applicant_first_name = updates.given_names;
      if (updates.last_name !== undefined) masterUpdates.applicant_last_name = updates.last_name;
      if (updates.passport_number !== undefined) masterUpdates.applicant_passport_number = updates.passport_number;
      if (updates.phone !== undefined) masterUpdates.applicant_phone = updates.phone;
      if (updates.email !== undefined) masterUpdates.applicant_email = updates.email;
      if (updates.civil_status !== undefined) masterUpdates.applicant_is_married = updates.civil_status === "married";
      if (updates.children_count !== undefined) masterUpdates.children_count = updates.children_count;
      if (updates.has_minor_children !== undefined) masterUpdates.has_minor_children = updates.has_minor_children;
      if (updates.minor_children_count !== undefined) masterUpdates.minor_children_count = updates.minor_children_count;

      // Check if record exists
      const { data: existing } = await supabase
        .from("master_table")
        .select("id")
        .eq("case_id", caseId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("master_table")
          .update(masterUpdates)
          .eq("case_id", caseId);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("master_table")
          .insert({ case_id: caseId, ...masterUpdates });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["intakeData", variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ["masterData", variables.caseId] });
      toast.success("Data saved successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });
};
