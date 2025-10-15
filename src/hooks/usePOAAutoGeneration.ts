import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePOAAutoGeneration = () => {
  return useMutation({
    mutationFn: async (caseId: string) => {
      // Fetch intake data
      const { data: intakeData, error: intakeError } = await supabase
        .from("intake_data")
        .select("*")
        .eq("case_id", caseId)
        .single();

      if (intakeError) throw intakeError;
      if (!intakeData) throw new Error("No intake data found");

      // Map intake data to POA format
      const poaData = {
        case_id: caseId,
        poa_type: "adult",
        generated_at: new Date().toISOString(),
        status: "draft",
        hac_approved: false,
      };

      // Create POA record
      const { data: poaRecord, error: poaError } = await supabase
        .from("poa")
        .insert(poaData)
        .select()
        .single();

      if (poaError) throw poaError;

      // Generate PDF using generate-poa edge function
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
        "generate-poa",
        {
          body: {
            caseId,
            poaId: poaRecord.id,
            poaType: "adult",
            formData: {
              applicant_first_name: intakeData.first_name,
              applicant_last_name: intakeData.last_name,
              applicant_dob: intakeData.date_of_birth,
              applicant_pob: intakeData.place_of_birth,
              applicant_sex: intakeData.sex,
              applicant_passport_number: intakeData.passport_number,
              applicant_email: intakeData.email,
              applicant_phone: intakeData.phone,
            },
          },
        }
      );

      if (pdfError) throw pdfError;

      return { poaId: poaRecord.id, pdfUrl: pdfData.pdf_url };
    },
    onSuccess: (data) => {
      toast.success("POA draft auto-generated! Ready for HAC review.");
    },
    onError: (error: Error) => {
      console.error("POA auto-generation error:", error);
      toast.error(`Failed to auto-generate POA: ${error.message}`);
    },
  });
};
