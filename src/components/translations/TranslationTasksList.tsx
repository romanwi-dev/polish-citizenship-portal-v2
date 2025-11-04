import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Languages, CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { TranslationTaskBadge } from "@/components/docs/TranslationTaskBadge";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  metadata: any;
  related_person: string;
  documents?: {
    id: string;
    name: string;
    language: string;
    needs_translation: boolean;
    is_translated: boolean;
  };
}

interface TranslationTasksListProps {
  caseId: string;
  showCompleted?: boolean;
}

/**
 * Lists all translation tasks for a case
 * Shows auto-generated tasks from language detection system
 */
export function TranslationTasksList({ caseId, showCompleted = false }: TranslationTasksListProps) {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["translation-tasks", caseId, showCompleted],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select(`
          *,
          documents:related_document_id (
            id,
            name,
            language,
            needs_translation,
            is_translated
          )
        `)
        .eq("case_id", caseId)
        .eq("task_type", "translation")
        .order("created_at", { ascending: false });

      if (!showCompleted) {
        query = query.neq("status", "completed");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress') || [];
  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Translation Tasks
          <Badge variant="secondary">{pendingTasks.length + inProgressTasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No translation tasks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending ({pendingTasks.length})
                </h4>
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4 animate-pulse" />
                  In Progress ({inProgressTasks.length})
                </h4>
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {showCompleted && completedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed ({completedTasks.length})
                </h4>
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskCard({ task }: { task: Task }) {
  const isAutoCreated = task.metadata?.auto_created;
  const sourceLanguage = task.metadata?.source_language || 'UNKNOWN';
  const documentName = task.metadata?.document_name;

  return (
    <div className="flex items-start justify-between p-3 bg-muted rounded-lg border border-border">
      <div className="flex items-start gap-3 flex-1">
        <FileText className="w-4 h-4 text-muted-foreground mt-1" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm mb-1">{task.title}</p>
          {documentName && (
            <p className="text-xs text-muted-foreground mb-2">{documentName}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {task.documents && (
              <TranslationTaskBadge
                language={task.documents.language}
                needsTranslation={task.documents.needs_translation}
                isTranslated={task.documents.is_translated}
                compact
              />
            )}
            {task.related_person && (
              <Badge variant="outline" className="text-xs">
                {task.related_person}
              </Badge>
            )}
            {task.priority && (
              <Badge 
                variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {task.priority}
              </Badge>
            )}
            {isAutoCreated && (
              <Badge variant="secondary" className="text-xs gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-created
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Created {format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
}
