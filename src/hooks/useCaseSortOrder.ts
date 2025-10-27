import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SortOrderUpdate {
  case_id: string;
  sort_order: number;
}

export const useUpdateCaseSortOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: SortOrderUpdate[]) => {
      const { error } = await supabase.rpc('update_case_sort_orders', {
        case_orders: updates as any
      });
      
      if (error) throw error;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["cases"] });
      
      const previousCases = queryClient.getQueryData(["cases"]);
      
      queryClient.setQueryData(["cases"], (old: any) => {
        if (!old) return old;
        
        return old.map((caseItem: any) => {
          const update = updates.find(u => u.case_id === caseItem.id);
          return update ? { ...caseItem, sort_order: update.sort_order } : caseItem;
        });
      });
      
      return { previousCases };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousCases) {
        queryClient.setQueryData(["cases"], context.previousCases);
      }
      toast.error(`Failed to update order: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Case order updated");
    },
  });
};

export const useResetCaseSortOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('cases')
        .update({ sort_order: null })
        .not('sort_order', 'is', null);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Manual ordering reset");
    },
    onError: (error: any) => {
      toast.error(`Failed to reset order: ${error.message}`);
    },
  });
};
