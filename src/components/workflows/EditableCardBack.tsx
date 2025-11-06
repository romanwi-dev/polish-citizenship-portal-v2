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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    setEditedText(displayDescription);
    setIsEditing(true);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    saveMutation.mutate(editedText);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    setIsEditing(false);
    setEditedText("");
  };

  return (
    <div 
      className="absolute inset-0 glass-card p-6 rounded-lg hover-glow flex items-center justify-center"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
    >
      <div className="flex flex-col gap-3 w-full h-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-7 w-7 p-0 absolute top-3 left-3"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="flex-1 flex items-start justify-center px-2 pt-8">
          {!isEditing ? (
            <p className="text-sm text-muted-foreground text-center whitespace-pre-wrap">
              {displayDescription || "Click edit to add description"}
            </p>
          ) : (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="!min-h-[70px] h-[70px] w-full resize-none text-sm !py-2 !px-2 align-text-top"
              style={{ verticalAlign: 'top', textAlign: 'left' }}
              placeholder="Enter card description..."
              autoFocus
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