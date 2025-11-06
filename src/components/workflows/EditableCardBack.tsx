import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditableCardBackProps {
  workflowName: string;
  cardId: string;
  defaultDescription: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const EditableCardBack = ({ 
  workflowName, 
  cardId, 
  defaultDescription,
  icon: Icon 
}: EditableCardBackProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const queryClient = useQueryClient();

  // Fetch custom description
  const { data: customDescription } = useQuery({
    queryKey: ['workflow-card-description', workflowName, cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_card_descriptions')
        .select('description')
        .eq('workflow_name', workflowName)
        .eq('card_id', cardId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.description || null;
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (newDescription: string) => {
      const { error } = await supabase
        .from('workflow_card_descriptions')
        .upsert({
          workflow_name: workflowName,
          card_id: cardId,
          description: newDescription
        }, {
          onConflict: 'workflow_name,card_id'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['workflow-card-description', workflowName, cardId] 
      });
      setIsEditing(false);
      toast.success("Description updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to save description");
      console.error(error);
    }
  });

  const displayDescription = customDescription || defaultDescription;

  const handleEdit = () => {
    setEditedText(displayDescription);
    setIsEditing(true);
  };

  const handleSave = () => {
    saveMutation.mutate(editedText);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText("");
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="mb-4 relative">
        <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center">
          <Icon className="w-16 h-16 text-secondary opacity-60" />
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground">
          Stage Details
        </h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[120px] resize-none"
            placeholder="Enter card description..."
          />
        ) : (
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {displayDescription}
            </p>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleSave}
            size="sm"
            className="flex-1"
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={handleCancel}
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={saveMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {!isEditing && (
        <p className="text-xs text-muted-foreground/60 text-center">
          Tap to flip back
        </p>
      )}
    </div>
  );
};