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
      className="absolute inset-0 glass-card p-3 rounded-lg hover-glow flex items-center justify-center overflow-hidden"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
    >
      <div className="flex flex-col w-full h-full relative" onClick={(e) => e.stopPropagation()}>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-6 w-6 p-0 absolute top-0 left-0 z-10"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}

        <div className="flex-1 flex items-center justify-center px-2 w-full overflow-hidden">
          {!isEditing ? (
            <p className="text-sm text-muted-foreground text-center whitespace-pre-wrap px-2">
              {displayDescription || "Click edit to add description"}
            </p>
          ) : (
            <div className="flex flex-col gap-2 w-full h-full justify-center">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="!min-h-[50px] !h-[50px] w-full resize-none text-xs !py-1 !px-2"
                style={{ verticalAlign: 'top', textAlign: 'left' }}
                placeholder="Enter description..."
                autoFocus
              />
              <div className="flex gap-1.5 w-full">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="flex-1 h-6 text-xs py-0"
                  disabled={saveMutation.isPending}
                >
                  <Save className="h-2.5 w-2.5 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  variant="outline"
                  className="flex-1 h-6 text-xs py-0"
                  disabled={saveMutation.isPending}
                >
                  <X className="h-2.5 w-2.5 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};