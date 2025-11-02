import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Scan, 
  Languages, 
  CheckCircle, 
  Send, 
  FileCheck,
  Award,
  Building
} from "lucide-react";
import { format } from "date-fns";

interface WorkflowStage {
  id: string;
  title: string;
  icon: any;
  description: string;
  stage_keys: string[];
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "upload",
    title: "1. Upload Documents",
    icon: Upload,
    description: "Client uploads quality photos",
    stage_keys: ["upload_pending", "uploaded"]
  },
  {
    id: "ocr",
    title: "2. OCR Scanning",
    icon: Scan,
    description: "Scan and extract text",
    stage_keys: ["ocr_processing", "ocr_complete"]
  },
  {
    id: "ai_translate",
    title: "3. AI Translation",
    icon: Languages,
    description: "Using official templates",
    stage_keys: ["ai_translating", "ai_complete"]
  },
  {
    id: "hac_review",
    title: "4. HAC Verification",
    icon: CheckCircle,
    description: "Review and approve",
    stage_keys: ["hac_review", "hac_approved"]
  },
  {
    id: "sworn_translator",
    title: "5. Sworn Translator",
    icon: Award,
    description: "Certification + seal",
    stage_keys: ["sent_to_translator", "translator_certified"]
  },
  {
    id: "ready",
    title: "6. Ready for Submission",
    icon: FileCheck,
    description: "Prepare documents",
    stage_keys: ["ready_for_submission"]
  },
  {
    id: "wsc",
    title: "7. Submit to WSC",
    icon: Building,
    description: "WSC submission",
    stage_keys: ["submitted_wsc"]
  },
  {
    id: "usc",
    title: "8. Submit to USC",
    icon: Send,
    description: "USC submission",
    stage_keys: ["submitted_usc", "completed"]
  }
];

export const TranslationWorkflowBoard = () => {
  const { data: workflows, isLoading } = useQuery({
    queryKey: ["translation-workflows"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("translation_requests")
        .select(`
          *,
          cases!inner(client_name, client_code),
          documents(name, type, dropbox_path),
          sworn_translators(full_name, certification_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getWorkflowsForStage = (stageKeys: string[]) => {
    return workflows?.filter((w: any) => stageKeys.includes(w.workflow_stage || w.status)) || [];
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-500",
      medium: "bg-blue-500",
      high: "bg-orange-500",
      urgent: "bg-red-500"
    };
    return colors[priority] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {WORKFLOW_STAGES.map((stage) => {
          const stageWorkflows = getWorkflowsForStage(stage.stage_keys);
          const Icon = stage.icon;

          return (
            <Card key={stage.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold truncate">
                        {stage.title}
                      </CardTitle>
                      <CardDescription className="text-xs truncate">
                        {stage.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {stageWorkflows.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                {stageWorkflows.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No items
                  </p>
                ) : (
                  stageWorkflows.map((workflow: any) => (
                    <Card key={workflow.id} className="p-3 hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">
                              {workflow.cases?.client_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {workflow.cases?.client_code}
                            </p>
                          </div>
                          <Badge 
                            className={`${getPriorityColor(workflow.priority)} text-white text-xs`}
                          >
                            {workflow.priority}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground truncate">
                          {workflow.documents?.name}
                        </p>

                        {workflow.ai_confidence && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-secondary rounded-full h-1.5">
                              <div 
                                className="bg-primary rounded-full h-1.5 transition-all"
                                style={{ width: `${workflow.ai_confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium shrink-0">
                              {(workflow.ai_confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}

                        {workflow.sworn_translators && (
                          <p className="text-xs text-muted-foreground truncate">
                            👤 {workflow.sworn_translators.full_name}
                          </p>
                        )}

                        {workflow.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(workflow.due_date), "MMM d")}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
