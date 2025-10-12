import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFavoriteCases = (userId: string | undefined) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    const loadFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from("user_favorites")
          .select("case_id")
          .eq("user_id", userId);

        if (error) throw error;
        
        const favSet = new Set(data?.map(f => f.case_id) || []);
        setFavorites(favSet);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [userId]);

  const toggleFavorite = async (caseId: string) => {
    if (!userId) return;

    const isFavorite = favorites.has(caseId);
    
    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("case_id", caseId);

        if (error) throw error;
        
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(caseId);
          return next;
        });

        toast({
          title: "Removed from favorites",
          description: "Case has been removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from("user_favorites")
          .insert({ user_id: userId, case_id: caseId });

        if (error) throw error;
        
        setFavorites(prev => new Set(prev).add(caseId));

        toast({
          title: "Added to favorites",
          description: "Case has been added to your favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite: (caseId: string) => favorites.has(caseId),
  };
};
