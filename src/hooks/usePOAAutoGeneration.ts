import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePOAAutoGeneration = (caseId?: string) => {
  // Query to fetch intake/master data for auto-fill
  const { data: intakeData } = useQuery({
    queryKey: ['intake-data', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const { data, error } = await supabase
        .from('intake_data')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  const { data: masterData } = useQuery({
    queryKey: ['master-table', caseId],
    queryFn: async () => {
      if (!caseId) return null;
      const { data, error } = await supabase
        .from('master_table')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
  });

  const generatePOAData = () => {
    if (!intakeData && !masterData) {
      toast.error('No intake or master data found');
      return null;
    }

    // Type-safe accessors
    const getIntakeField = (field: string) => intakeData ? (intakeData as any)[field] : null;
    const getMasterField = (field: string) => masterData ? (masterData as any)[field] : null;
    
    return {
      // Applicant basic info
      first_name: getIntakeField('first_name') || getMasterField('applicant_first_name'),
      last_name: getIntakeField('last_name') || getMasterField('applicant_last_name'),
      maiden_name: getIntakeField('maiden_name') || getMasterField('applicant_maiden_name'),
      date_of_birth: getIntakeField('date_of_birth') || getMasterField('applicant_dob'),
      place_of_birth: getIntakeField('place_of_birth') || getMasterField('applicant_pob'),
      sex: getIntakeField('sex') || getMasterField('applicant_sex'),
      
      // Contact & Document
      email: getIntakeField('email') || getMasterField('applicant_email'),
      phone: getIntakeField('phone') || getMasterField('applicant_phone'),
      passport_number: getIntakeField('passport_number') || getMasterField('applicant_passport_number'),
      passport_issue_date: getIntakeField('passport_issue_date') || getMasterField('applicant_passport_issue_date'),
      passport_expiry_date: getIntakeField('passport_expiry_date') || getMasterField('applicant_passport_expiry_date'),
      passport_issuing_country: getIntakeField('passport_issuing_country') || getMasterField('applicant_passport_issuing_country'),
      
      // Address
      address: getIntakeField('address') || getMasterField('applicant_address'),
      
      // Parents
      father_first_name: getIntakeField('father_first_name') || getMasterField('father_first_name'),
      father_last_name: getIntakeField('father_last_name') || getMasterField('father_last_name'),
      father_date_of_birth: getIntakeField('father_dob') || getMasterField('father_dob'),
      father_place_of_birth: getIntakeField('father_pob') || getMasterField('father_pob'),
      
      mother_first_name: getIntakeField('mother_first_name') || getMasterField('mother_first_name'),
      mother_last_name: getIntakeField('mother_last_name') || getMasterField('mother_last_name'),
      mother_maiden_name: getIntakeField('mother_maiden_name') || getMasterField('mother_maiden_name'),
      mother_date_of_birth: getIntakeField('mother_dob') || getMasterField('mother_dob'),
      mother_place_of_birth: getIntakeField('mother_pob') || getMasterField('mother_pob'),
      
      // Spouse (if married)
      spouse_first_name: getIntakeField('spouse_first_name') || getMasterField('spouse_first_name'),
      spouse_last_name: getIntakeField('spouse_last_name') || getMasterField('spouse_last_name'),
      spouse_date_of_birth: getIntakeField('spouse_dob') || getMasterField('spouse_dob'),
      date_of_marriage: getIntakeField('date_of_marriage') || getMasterField('date_of_marriage'),
    };
  };

  const mutation = useMutation({
    mutationFn: async (targetCaseId: string) => {
      // Fetch intake data
      const { data: fetchedIntake, error: intakeError } = await supabase
        .from("intake_data")
        .select("*")
        .eq("case_id", targetCaseId)
        .maybeSingle();

      if (intakeError) throw intakeError;
      if (!fetchedIntake) throw new Error("No intake data found");

      // Map intake data to POA format
      const poaData = {
        case_id: targetCaseId,
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
            caseId: targetCaseId,
            poaId: poaRecord.id,
            poaType: "adult",
            formData: {
              applicant_first_name: fetchedIntake.first_name,
              applicant_last_name: fetchedIntake.last_name,
              applicant_dob: fetchedIntake.date_of_birth,
              applicant_pob: fetchedIntake.place_of_birth,
              applicant_sex: fetchedIntake.sex,
              applicant_passport_number: fetchedIntake.passport_number,
              applicant_email: fetchedIntake.email,
              applicant_phone: fetchedIntake.phone,
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

  return {
    ...mutation,
    intakeData,
    masterData,
    generatePOAData,
    hasData: !!(intakeData || masterData),
  };
};
