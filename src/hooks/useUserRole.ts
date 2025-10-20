import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/secureLogger";

export type UserRole = 'admin' | 'assistant' | 'user';

export const useUserRole = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userRole", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        logger.error("Error fetching user role", error, { sanitize: true });
        return null;
      }

      return data?.role as UserRole | null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useIsAdmin = (userId: string | undefined) => {
  const { data: role, isLoading } = useUserRole(userId);
  return { data: role === 'admin', isLoading };
};

export const useIsStaff = (userId: string | undefined) => {
  const { data: role, isLoading } = useUserRole(userId);
  return { data: role === 'admin' || role === 'assistant', isLoading };
};
