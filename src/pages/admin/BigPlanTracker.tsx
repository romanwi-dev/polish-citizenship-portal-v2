import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ArrowRight,
  FileText,
  ExternalLink,
  Filter,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type StepStatus = "complete" | "partial" | "not-started";
type Priority = "critical" | "high" | "medium" | "low";

interface Step {
  id: number;
  title: string;
  status: StepStatus;
  priority?: Priority;
  completion: number;
  files?: string[];
  route?: string;
  missing?: string[];
  estimate?: string;
}

interface Part {
  id: number;
  title: string;
  description: string;
  steps: Step[];
}

const parts: Part[] = [
  {
    id: 1,
    title: "Foundation",
    description: "Core infrastructure and diagnostics",
    steps: [
      {
        id: 1,
        title: "QA Harness & Dropbox Diagnostics",
        status: "complete",
        completion: 100,
        files: ["QAHarness.tsx", "dropbox-diag"],
        route: "/admin/qa-harness"
      },
      {
        id: 2,
        title: "Dropbox Migration Scan",
        status: "complete",
        completion: 100,
        files: ["DropboxMigration.tsx", "dropbox-migration-scan"],
        route: "/admin/dropbox-migration"
      },
      {
        id: 3,
        title: "Hybrid Naming Scheme",
        status: "not-started",
        priority: "critical",
        completion: 0,
        missing: ["Auto-generation logic", "Migration from existing codes", "Validation rules"],
        estimate: "2-3 hours"
      }
    ]
  },
  {
    id: 2,
    title: "Case Organization",
    description: "Intake, POA, and case management workflows",
    steps: [
      {
        id: 4,
        title: "Dashboard KPI Strip",
        status: "complete",
        completion: 100,
        files: ["CaseCard.tsx", "CollapsibleKPIStrip.tsx"]
      },
      {
        id: 5,
        title: "Universal Intake Wizard",
        status: "partial",
        priority: "high",
        completion: 80,
        files: ["IntakeForm.tsx", "IntakeDemo.tsx", "ocr-passport"],
        missing: ["Client-facing version", "EN/PL toggle", "Multi-step wizard", "I don't know options"],
        estimate: "4-5 hours"
      },
      {
        id: 6,
        title: "POA Generation & E-Sign",
        status: "partial",
        priority: "high",
        completion: 70,
        files: ["POAForm.tsx", "generate-poa"],
        missing: ["Auto-generation from intake", "E-signature canvas", "Auto-upload to Dropbox"],
        estimate: "3-4 hours"
      },
      {
        id: 7,
        title: "OBY Draft Generation",
        status: "partial",
        priority: "critical",
        completion: 30,
        files: ["CitizenshipForm.tsx"],
        missing: ["Auto-population from intake", "Mark as Filed workflow", "HAC approval"],
        estimate: "4-5 hours"
      },
      {
        id: 12,
        title: "Manual Case Creation",
        status: "complete",
        completion: 100,
        files: ["NewCase.tsx"],
        route: "/admin/cases/new"
      }
    ]
  },
  {
    id: 3,
    title: "Application Generation",
    description: "Documents engine and WSC letter processing",
    steps: [
      {
        id: 8,
        title: "Documents Engine (Doc Radar)",
        status: "not-started",
        priority: "critical",
        completion: 0,
        missing: ["Document tracking for 7 family types", "Translation flags", "Archive request generator", "USC workflows"],
        estimate: "8-10 hours"
      },
      {
        id: 9,
        title: "WSC Letter Stage",
        status: "complete",
        completion: 100,
        files: ["WSCLetterUpload.tsx", "StrategyButtons.tsx", "caseStages.ts"]
      }
    ]
  },
  {
    id: 4,
    title: "Integrations",
    description: "External APIs and data pipelines",
    steps: [
      {
        id: 10,
        title: "Partner API",
        status: "not-started",
        priority: "medium",
        completion: 0,
        missing: ["POST /api/partner/intake", "GET /api/partner/status", "API key auth", "Rate limiting"],
        estimate: "4-5 hours"
      },
      {
        id: 11,
        title: "Typeform Integration",
        status: "not-started",
        priority: "medium",
        completion: 0,
        missing: ["Webhook endpoint", "Auto-create LEAD cases", "Field mapping"],
        estimate: "3-4 hours"
      }
    ]
  },
  {
    id: 5,
    title: "Oversight & Security",
    description: "Logging, backups, and data protection",
    steps: [
      {
        id: 13,
        title: "HAC Logging",
        status: "complete",
        completion: 100,
        files: ["hac_logs table", "StrategyButtons.tsx"],
        missing: ["Log viewer UI", "Export to CSV"]
      },
      {
        id: 14,
        title: "System Checks Console",
        status: "not-started",
        priority: "high",
        completion: 0,
        missing: ["Health dashboard", "Real-time monitoring", "Performance metrics"],
        estimate: "5-6 hours"
      },
      {
        id: 15,
        title: "Nightly Backups",
        status: "not-started",
        priority: "medium",
        completion: 0,
        missing: ["Cron job (2 AM UTC)", "Zip /CASES folder", "Restore capability"],
        estimate: "4-5 hours"
      },
      {
        id: 16,
        title: "Data Masking",
        status: "not-started",
        priority: "critical",
        completion: 0,
        missing: ["Mask passport numbers in UI", "Role-based unmasking", "Audit sensitive data in logs"],
        estimate: "3-4 hours"
      },
      {
        id: 17,
        title: "Role Management",
        status: "partial",
        priority: "medium",
        completion: 50,
        files: ["user_roles table"],
        missing: ["Permission matrix enforcement", "Route guards", "Feature flags per role"],
        estimate: "3-4 hours"
      }
    ]
  },
  {
    id: 6,
    title: "Client Portal",
    description: "Client-facing dashboard and authentication",
    steps: [
      {
        id: 18,
        title: "Magic Link Login",
        status: "complete",
        completion: 100,
        files: ["ClientLogin.tsx"],
        route: "/client/login"
      },
      {
        id: 19,
        title: "Client Dashboard",
        status: "complete",
        completion: 100,
        files: ["ClientDashboard.tsx", "CaseStageVisualization.tsx"],
        route: "/client/dashboard/:caseId"
      },
      {
        id: 20,
        title: "Consulate Kit Generator",
        status: "not-started",
        priority: "low",
        completion: 0,
        missing: ["Auto-generate PDF", "Passport checklist", "Auto-email to client"],
        estimate: "3-4 hours"
      }
    ]
  },
  {
    id: 7,
    title: "Final Testing",
    description: "E2E validation and quality assurance",
    steps: [
      {
        id: 21,
        title: "E2E Case Flows (Lead → Decision)",
        status: "not-started",
        priority: "medium",
        completion: 0,
        estimate: "10-12 hours"
      },
      {
        id: 30,
        title: "Multi-source Creation Test",
        status: "not-started",
        priority: "medium",
        completion: 0,
        estimate: "2 hours"
      },
      {
        id: 31,
        title: "WSC Full Lifecycle Test",
        status: "not-started",
        priority: "medium",
        completion: 0,
        estimate: "2 hours"
      }
    ]
  }
];

const getStatusIcon = (status: StepStatus) => {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "partial":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "not-started":
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusBadge = (status: StepStatus) => {
  const variants = {
    complete: "default",
    partial: "secondary",
    "not-started": "outline"
  } as const;

  const labels = {
    complete: "Complete",
    partial: "Partial",
    "not-started": "Not Started"
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
};

const getPriorityBadge = (priority?: Priority) => {
  if (!priority) return null;

  const colors = {
    critical: "destructive",
    high: "default",
    medium: "secondary",
    low: "outline"
  } as const;

  return <Badge variant={colors[priority]} className="ml-2">{priority.toUpperCase()}</Badge>;
};

export default function BigPlanTracker() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<StepStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  // Calculate overall progress
  const allSteps = parts.flatMap(p => p.steps);
  const totalSteps = allSteps.length;
  const completedSteps = allSteps.filter(s => s.status === "complete").length;
  const partialSteps = allSteps.filter(s => s.status === "partial").length;
  const overallProgress = Math.round((completedSteps + partialSteps * 0.5) / totalSteps * 100);

  // Filter steps
  const filteredParts = parts.map(part => ({
    ...part,
    steps: part.steps.filter(step => {
      const statusMatch = filterStatus === "all" || step.status === filterStatus;
      const priorityMatch = filterPriority === "all" || step.priority === filterPriority;
      return statusMatch && priorityMatch;
    })
  })).filter(part => part.steps.length > 0);

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Big Plan Tracker
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              AI Agent Build Sequence
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => window.open("/BIG_PLAN_STATUS.md", "_blank")}
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">View Full Documentation</span>
          </Button>
        </div>

        {/* Overall Progress Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Progress
            </CardTitle>
            <CardDescription>
              {completedSteps} complete • {partialSteps} partial • {totalSteps - completedSteps - partialSteps} not started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Total Completion</span>
                <span className="text-xl sm:text-2xl font-bold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 sm:h-3" />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-500">{completedSteps}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-yellow-500">{partialSteps}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Partial</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-gray-400">{totalSteps - completedSteps - partialSteps}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Not Started</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterStatus("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "complete" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterStatus("complete")}
                >
                  Complete
                </Button>
                <Button
                  variant={filterStatus === "partial" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterStatus("partial")}
                >
                  Partial
                </Button>
                <Button
                  variant={filterStatus === "not-started" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterStatus("not-started")}
                >
                  Not Started
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium">Priority</label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={filterPriority === "all" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterPriority("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterPriority === "critical" ? "destructive" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterPriority("critical")}
                >
                  Critical
                </Button>
                <Button
                  variant={filterPriority === "high" ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterPriority("high")}
                >
                  High
                </Button>
                <Button
                  variant={filterPriority === "medium" ? "secondary" : "outline"}
                  size="sm"
                  className="text-xs h-8 px-2 sm:px-3"
                  onClick={() => setFilterPriority("medium")}
                >
                  Medium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">All</TabsTrigger>
            {parts.map(part => (
              <TabsTrigger key={part.id} value={`part-${part.id}`}>
                Part {part.id}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredParts.map(part => {
              const partProgress = Math.round(
                part.steps.reduce((sum, s) => sum + s.completion, 0) / part.steps.length
              );

              return (
                <Card key={part.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Part {part.id}: {part.title}</CardTitle>
                        <CardDescription>{part.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{partProgress}%</div>
                        <div className="text-xs text-muted-foreground">
                          {part.steps.filter(s => s.status === "complete").length}/{part.steps.length} complete
                        </div>
                      </div>
                    </div>
                    <Progress value={partProgress} className="h-2 mt-4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {part.steps.map(step => (
                      <div
                        key={step.id}
                        className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(step.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">Step {step.id}: {step.title}</h4>
                                {getStatusBadge(step.status)}
                                {getPriorityBadge(step.priority)}
                              </div>
                              
                              {step.files && step.files.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  📁 Files: {step.files.join(", ")}
                                </div>
                              )}
                              
                              {step.missing && step.missing.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <div className="text-xs font-medium text-yellow-600">Missing:</div>
                                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                                    {step.missing.map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {step.estimate && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  ⏱️ Estimate: {step.estimate}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <div className="text-lg font-bold">{step.completion}%</div>
                              <Progress value={step.completion} className="h-1 w-20" />
                            </div>
                            {step.route && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(step.route!)}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {parts.map(part => (
            <TabsContent key={part.id} value={`part-${part.id}`} className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Part {part.id}: {part.title}</CardTitle>
                  <CardDescription>{part.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {part.steps.map(step => (
                    <div
                      key={step.id}
                      className="border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(step.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">Step {step.id}: {step.title}</h4>
                              {getStatusBadge(step.status)}
                              {getPriorityBadge(step.priority)}
                            </div>
                            
                            {step.files && step.files.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-2">
                                📁 Files: {step.files.join(", ")}
                              </div>
                            )}
                            
                            {step.missing && step.missing.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs font-medium text-yellow-600">Missing:</div>
                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                  {step.missing.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {step.estimate && (
                              <div className="text-xs text-muted-foreground mt-2">
                                ⏱️ Estimate: {step.estimate}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <div className="text-lg font-bold">{step.completion}%</div>
                            <Progress value={step.completion} className="h-1 w-20" />
                          </div>
                          {step.route && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(step.route!)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Next Actions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Recommended Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <Badge variant="destructive">CRITICAL</Badge>
                <div className="flex-1">
                  <div className="font-semibold">Step 16: Data Masking</div>
                  <div className="text-sm text-muted-foreground">Security vulnerability - mask passport numbers in UI</div>
                  <div className="text-xs text-muted-foreground mt-1">⏱️ 3-4 hours</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="destructive">CRITICAL</Badge>
                <div className="flex-1">
                  <div className="font-semibold">Step 3: Hybrid Naming Scheme</div>
                  <div className="text-sm text-muted-foreground">Foundation for case organization</div>
                  <div className="text-xs text-muted-foreground mt-1">⏱️ 2-3 hours</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="destructive">CRITICAL</Badge>
                <div className="flex-1">
                  <div className="font-semibold">Step 8: Documents Engine</div>
                  <div className="text-sm text-muted-foreground">Core feature - track documents for all family members</div>
                  <div className="text-xs text-muted-foreground mt-1">⏱️ 8-10 hours</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge>HIGH</Badge>
                <div className="flex-1">
                  <div className="font-semibold">Complete Step 7: OBY Auto-Generation</div>
                  <div className="text-sm text-muted-foreground">Auto-populate citizenship form from intake</div>
                  <div className="text-xs text-muted-foreground mt-1">⏱️ 4-5 hours</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge>HIGH</Badge>
                <div className="flex-1">
                  <div className="font-semibold">Complete Step 6: POA E-Signature</div>
                  <div className="text-sm text-muted-foreground">Add signature canvas and auto-upload workflow</div>
                  <div className="text-xs text-muted-foreground mt-1">⏱️ 3-4 hours</div>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
