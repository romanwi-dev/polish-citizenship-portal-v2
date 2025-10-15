import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateTranslationJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTranslationJobDialog = ({ open, onOpenChange }: CreateTranslationJobDialogProps) => {
  const [formData, setFormData] = useState({
    case_id: "",
    document_id: "",
    source_language: "EN",
    source_text: "",
    priority: "medium"
  });

  const queryClient = useQueryClient();

  const { data: cases } = useQuery({
    queryKey: ["cases-for-translation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, client_name, client_code')
        .order('client_name');
      if (error) throw error;
      return data;
    }
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('translation_jobs')
        .insert({
          ...formData,
          document_id: formData.document_id || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Translation job created");
      queryClient.invalidateQueries({ queryKey: ["translation-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["translation-job-counts"] });
      onOpenChange(false);
      setFormData({
        case_id: "",
        document_id: "",
        source_language: "EN",
        source_text: "",
        priority: "medium"
      });
    },
    onError: (error) => {
      toast.error("Failed to create job", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Translation Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Case</Label>
            <Select
              value={formData.case_id}
              onValueChange={(value) => setFormData({ ...formData, case_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.client_name} ({c.client_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Source Language</Label>
            <Select
              value={formData.source_language}
              onValueChange={(value) => setFormData({ ...formData, source_language: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="ES">Spanish</SelectItem>
                <SelectItem value="PT">Portuguese</SelectItem>
                <SelectItem value="HE">Hebrew</SelectItem>
                <SelectItem value="RU">Russian</SelectItem>
                <SelectItem value="UK">Ukrainian</SelectItem>
                <SelectItem value="DE">German</SelectItem>
                <SelectItem value="FR">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Source Text</Label>
            <Textarea
              value={formData.source_text}
              onChange={(e) => setFormData({ ...formData, source_text: e.target.value })}
              placeholder="Enter text to translate..."
              className="min-h-[200px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createJobMutation.mutate()}
              disabled={!formData.case_id || !formData.source_text || createJobMutation.isPending}
            >
              {createJobMutation.isPending ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};