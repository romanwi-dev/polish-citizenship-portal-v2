import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Validates magic link expiration
 * @param token - Magic link token
 * @returns True if valid, false if expired or invalid
 */
export const validateMagicLink = async (token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("client_portal_access")
      .select("magic_link_expires_at, case_id, user_id")
      .eq("magic_link_token", token)
      .maybeSingle();

    if (error || !data) {
      toast.error("Invalid magic link");
      return false;
    }

    const expiresAt = new Date(data.magic_link_expires_at);
    const now = new Date();

    if (expiresAt < now) {
      toast.error("Magic link has expired. Please request a new one.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Magic link validation error:", error);
    toast.error("Failed to validate magic link");
    return false;
  }
};

/**
 * Hook for magic link validation
 */
export const useMagicLinkValidation = () => {
  return {
    validate: validateMagicLink,
  };
};
