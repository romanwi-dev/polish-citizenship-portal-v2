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
  defaultDescription?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EditableCardBack = ({
  workflowName,
  cardId,
  defaultDescription = "",
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
    <div 
      className="absolute inset-0 glass-card p-4 sm:p-6 rounded-lg hover-glow flex items-center justify-center"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
    >
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex items-center justify-between">
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0 absolute top-2 right-2"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {!isEditing ? (
            <p className="text-sm text-muted-foreground text-center whitespace-pre-wrap">
              {displayDescription || "Click edit to add description"}
            </p>
          ) : (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
              placeholder="Enter card description..."
            />
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="flex-1 h-7 text-xs"
              disabled={saveMutation.isPending}
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              disabled={saveMutation.isPending}
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};