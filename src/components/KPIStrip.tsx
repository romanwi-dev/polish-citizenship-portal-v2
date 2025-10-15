import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Mail, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPIStripProps {
  intakeCompleted?: boolean;
  poaApproved?: boolean;
  obyFiled?: boolean;
  wscReceived?: boolean;
  decisionReceived?: boolean;
  docsPercentage?: number;
  tasksCompleted?: number;
  tasksTotal?: number;
}

export const KPIStrip = ({
  intakeCompleted = false,
  poaApproved = false,
  obyFiled = false,
  wscReceived = false,
  decisionReceived = false,
  docsPercentage = 0,
  tasksCompleted = 0,
  tasksTotal = 0,
}: KPIStripProps) => {
  const kpis = [
    {
      label: "Intake",
      completed: intakeCompleted,
      icon: FileText,
    },
    {
      label: "POA",
      completed: poaApproved,
      icon: CheckCircle2,
    },
    {
      label: "OBY",
      completed: obyFiled,
      icon: FileText,
    },
    {
      label: "WSC",
      completed: wscReceived,
      icon: Mail,
    },
    {
      label: "Decision",
      completed: decisionReceived,
      icon: Award,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Badge
            key={kpi.label}
            variant={kpi.completed ? "default" : "outline"}
            className={cn(
              "gap-1.5",
              kpi.completed && "bg-green-500 hover:bg-green-600"
            )}
          >
            <Icon className="w-3 h-3" />
            {kpi.label}
          </Badge>
        );
      })}
      
      <Badge variant="secondary" className="gap-1.5">
        <FileText className="w-3 h-3" />
        Docs {docsPercentage}%
      </Badge>
      
      <Badge variant="secondary" className="gap-1.5">
        <Clock className="w-3 h-3" />
        Tasks {tasksCompleted}/{tasksTotal}
      </Badge>
    </div>
  );
};
