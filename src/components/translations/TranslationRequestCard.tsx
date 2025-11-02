import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, FileText, User, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TranslationRequestCardProps {
  request: any;
  translators: any[];
}

export const TranslationRequestCard = ({ request, translators }: TranslationRequestCardProps) => {
  const queryClient = useQueryClient();
  const [selectedTranslator, setSelectedTranslator] = useState<string>(request.assigned_translator_id || "");
  const [deadline, setDeadline] = useState<Date | undefined>(
    request.deadline ? new Date(request.deadline) : undefined
  );
  const [estimatedCost, setEstimatedCost] = useState<string>(request.estimated_cost_pln?.toString() || "");
  const [notes, setNotes] = useState<string>(request.internal_notes || "");

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('assign-translator', {
        body: {
          requestId: request.id,
          translatorId: selectedTranslator,
          deadline: deadline ? format(deadline, 'yyyy-MM-dd') : null,
          estimatedCostPln: estimatedCost ? parseFloat(estimatedCost) : null,
          internalNotes: notes,
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Translator assigned successfully");
      queryClient.invalidateQueries({ queryKey: ['translation-requests'] });
    },
    onError: (error: any) => {
      toast.error("Failed to assign translator: " + error.message);
    }
  });

  const markCompletedMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('translation_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', request.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Translation marked as completed");
      queryClient.invalidateQueries({ queryKey: ['translation-requests'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-700';
      case 'in_progress': return 'bg-blue-500/20 text-blue-700';
      case 'assigned': return 'bg-yellow-500/20 text-yellow-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-700';
      case 'high': return 'bg-orange-500/20 text-orange-700';
      case 'medium': return 'bg-blue-500/20 text-blue-700';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {request.documents?.ai_generated_name || request.documents?.name || 'Unknown Document'}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
              <Badge className={getPriorityColor(request.priority)}>
                {request.priority}
              </Badge>
              <Badge variant="outline">
                {request.source_language} → {request.target_language}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Case</p>
            <p className="font-medium">{request.cases?.client_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Person Type</p>
            <p className="font-medium">{request.documents?.person_type}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Assign Translator
            </label>
            <Select value={selectedTranslator} onValueChange={setSelectedTranslator}>
              <SelectTrigger>
                <SelectValue placeholder="Select translator" />
              </SelectTrigger>
              <SelectContent>
                {translators.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.full_name} ({t.languages?.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <CalendarIcon className="w-4 h-4" />
              Deadline
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {deadline ? format(deadline, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={deadline} onSelect={setDeadline} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" />
              Estimated Cost (PLN)
            </label>
            <Input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Internal Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="HAC notes (not visible to client)"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => assignMutation.mutate()}
            disabled={!selectedTranslator || assignMutation.isPending}
            className="flex-1"
          >
            {request.assigned_translator_id ? 'Update Assignment' : 'Assign'}
          </Button>
          {request.status === 'in_progress' && (
            <Button
              onClick={() => markCompletedMutation.mutate()}
              disabled={markCompletedMutation.isPending}
              variant="outline"
            >
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
