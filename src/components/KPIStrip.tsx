import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Mail, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface KPIStripProps {
  intakeCompleted?: boolean;
  poaApproved?: boolean;
  obyFiled?: boolean;
  wscReceived?: boolean;
  decisionReceived?: boolean;
  docsPercentage?: number;
  tasksCompleted?: number;
  tasksTotal?: number;
  caseId?: string;
  onKpiClick?: (kpiType: string) => void;
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
  caseId,
  onKpiClick,
}: KPIStripProps) => {
  const navigate = useNavigate();

  const handleKpiClick = (kpiType: string, tab?: string, section?: string) => {
    if (onKpiClick) {
      onKpiClick(kpiType);
    } else if (caseId) {
      let url = `/admin/cases/${caseId}?tab=${tab}`;
      if (section) {
        url += `&section=${section}`;
      }
      navigate(url);
    }
  };
  
  const kpis = [
    {
      label: "Intake",
      completed: intakeCompleted,
      icon: FileText,
      tab: "forms",
      section: "intake",
    },
    {
      label: "POA",
      completed: poaApproved,
      icon: CheckCircle2,
      tab: "forms",
      section: "poa",
    },
    {
      label: "OBY",
      completed: obyFiled,
      icon: FileText,
      tab: "forms",
      section: "citizenship",
    },
    {
      label: "WSC",
      completed: wscReceived,
      icon: Mail,
      tab: "overview",
    },
    {
      label: "Decision",
      completed: decisionReceived,
      icon: Award,
      tab: "overview",
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
              "min-w-[70px] justify-center cursor-pointer transition-all hover:scale-105",
              kpi.completed && "bg-green-500 hover:bg-green-600",
              !kpi.completed && "hover:border-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              handleKpiClick(kpi.label.toLowerCase(), kpi.tab, (kpi as any).section);
            }}
          >
            {kpi.label}
          </Badge>
        );
      })}
      
      <Badge 
        variant="secondary" 
        className="min-w-[70px] justify-center cursor-pointer transition-all hover:scale-105 hover:border-primary"
        onClick={(e) => {
          e.stopPropagation();
          handleKpiClick('documents', 'documents');
        }}
      >
        Docs {docsPercentage}%
      </Badge>
      
      <Badge 
        variant="secondary" 
        className="min-w-[70px] justify-center cursor-pointer transition-all hover:scale-105 hover:border-primary"
        onClick={(e) => {
          e.stopPropagation();
          handleKpiClick('tasks', 'tasks');
        }}
      >
        Tasks {tasksCompleted}/{tasksTotal}
      </Badge>
    </div>
  );
};
