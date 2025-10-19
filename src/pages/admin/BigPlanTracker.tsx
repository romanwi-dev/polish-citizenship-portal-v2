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
        status: "complete",
        completion: 100,
        files: ["Case naming system", "Client code generation"]
      },
      {
        id: 4,
        title: "UI Unified Design",
        status: "complete",
        completion: 100,
        files: ["index.css", "tailwind.config.ts", "All 6 forms with useFormManager"],
        route: "/admin/forms-demo"
      }
    ]
  },
  {
    id: 2,
    title: "Case Organization",
    description: "Intake, POA, and case management workflows",
    steps: [
      {
        id: 5,
        title: "Dashboard KPI Strip",
        status: "complete",
        completion: 100,
        files: ["CaseCard.tsx", "CollapsibleKPIStrip.tsx", "Live KPI values"]
      },
      {
        id: 6,
        title: "Universal Intake Wizard",
        status: "complete",
        completion: 100,
        files: ["IntakeForm.tsx", "useFormManager.ts", "OCR passport", "EN/PL toggle"],
        route: "/intake"
      },
      {
        id: 7,
        title: "POA Generation & E-Sign",
        status: "complete",
        completion: 100,
        files: ["POAForm.tsx", "usePOAAutoGeneration.ts", "generate-poa", "E-signature canvas"],
        route: "/admin/poa"
      },
      {
        id: 8,
        title: "OBY Draft Generation",
        status: "complete",
        completion: 100,
        files: ["CitizenshipForm.tsx", "useOBYAutoPopulation.ts", "86% auto-fill", "HAC approval"],
        route: "/admin/citizenship"
      },
      {
        id: 9,
        title: "Manual Case Creation",
        status: "complete",
        completion: 100,
        files: ["NewCase.tsx"],
        route: "/admin/new-case"
      }
    ]
  },
  {
    id: 3,
    title: "Application Generation",
    description: "Documents engine and WSC letter processing",
    steps: [
      {
        id: 10,
        title: "Documents Engine (Doc Radar)",
        status: "complete",
        completion: 100,
        files: ["DocumentManagement.tsx", "documents table", "Doc Radar for 7 ancestors", "Translation flags"],
        route: "/admin/documents"
      },
      {
        id: 11,
        title: "WSC Letter Stage",
        status: "complete",
        completion: 100,
        files: ["WSCLetterUpload.tsx", "StrategyButtons.tsx", "PUSH/NUDGE/SITDOWN", "OCR extraction"]
      }
    ]
  },
  {
    id: 4,
    title: "Integrations",
    description: "External APIs and data pipelines",
    steps: [
      {
        id: 12,
        title: "Partner API",
        status: "complete",
        completion: 100,
        files: ["partner-api edge function", "POST intake, GET status"],
        route: "/admin/partner-api"
      },
      {
        id: 13,
        title: "Typeform Integration",
        status: "complete",
        completion: 100,
        files: ["typeform-webhook edge function", "TYPEFORM_INTEGRATION_GUIDE.md", "Auto LEAD-### creation"],
        route: "/admin/partner-api"
      }
    ]
  },
  {
    id: 5,
    title: "Oversight & Security",
    description: "Logging, backups, and data protection",
    steps: [
      {
        id: 14,
        title: "HAC Logging",
        status: "complete",
        completion: 100,
        files: ["hac_logs table", "log_hac_action function", "All major actions logged"]
      },
      {
        id: 15,
        title: "System Checks Console",
        status: "complete",
        completion: 100,
        files: ["SystemHealth.tsx", "SecurityAudit.tsx", "Health/QA/Security/Performance/UX"],
        route: "/admin/system-health"
      },
      {
        id: 16,
        title: "Nightly Backups",
        status: "complete",
        completion: 100,
        files: ["backup_logs table", "Backup infrastructure ready"]
      },
      {
        id: 17,
        title: "Data Masking",
        status: "complete",
        completion: 100,
        files: ["Passport masking in UI", "Role-based access", "Security audit passed"]
      },
      {
        id: 18,
        title: "Role Management",
        status: "complete",
        completion: 100,
        files: ["user_roles table", "has_role function", "RLS policies", "Admin/Assistant/Client roles"]
      }
    ]
  },
  {
    id: 6,
    title: "Client Portal",
    description: "Client-facing dashboard and authentication",
    steps: [
      {
        id: 19,
        title: "Magic Link Login",
        status: "complete",
        completion: 100,
        files: ["ClientLogin.tsx", "client_portal_access table"],
        route: "/client/login"
      },
      {
        id: 20,
        title: "Client Dashboard",
        status: "complete",
        completion: 100,
        files: ["ClientDashboard.tsx", "CaseStageVisualization.tsx", "Upload/Messages/POA download"],
        route: "/client/dashboard"
      },
      {
        id: 21,
        title: "Consulate Kit Generator",
        status: "partial",
        priority: "low",
        completion: 60,
        files: ["designer-agent edge function"],
        missing: ["Auto-email to client", "Final polish"],
        estimate: "2 hours"
      }
    ]
  },
  {
    id: 7,
    title: "AI Agents & Automation",
    description: "5 AI agents with 21 specialized tools",
    steps: [
      {
        id: 22,
        title: "Main AI Agent (Coordinator)",
        status: "complete",
        completion: 100,
        files: ["ai-agent edge function", "7 tools operational", "Stage transitions/HAC logging"]
      },
      {
        id: 23,
        title: "Researcher Agent",
        status: "complete",
        completion: 100,
        files: ["researcher-agent edge function", "5 tools", "Archive searches/Doc analysis"]
      },
      {
        id: 24,
        title: "Translator Agent",
        status: "complete",
        completion: 100,
        files: ["translator-agent edge function", "4 tools", "EN↔PL translation/certification"]
      },
      {
        id: 25,
        title: "Writer Agent",
        status: "complete",
        completion: 100,
        files: ["writer-agent edge function", "3 tools", "Legal letters/Evidence bundles"]
      },
      {
        id: 26,
        title: "Designer Agent",
        status: "complete",
        completion: 100,
        files: ["designer-agent edge function", "2 tools", "PDF generation/Consulate kits"]
      }
    ]
  },
  {
    id: 8,
    title: "Final Testing & Documentation",
    description: "Production readiness verification",
    steps: [
      {
        id: 27,
        title: "NO-RUSH Verification (6 Areas)",
        status: "complete",
        completion: 100,
        files: ["SYSTEM_VERIFICATION_REPORT.md", "99.7% production readiness"]
      },
      {
        id: 28,
        title: "All 6 Forms Migration",
        status: "complete",
        completion: 100,
        files: ["useFormManager", "Auto-save", "Validation", "Real-time sync", "100% migrated"]
      },
      {
        id: 29,
        title: "Security Audit",
        status: "complete",
        completion: 100,
        files: ["Supabase linter", "RLS policies", "1 non-critical warning only"]
      },
      {
        id: 30,
        title: "E2E Testing Documentation",
        status: "complete",
        completion: 100,
        files: ["Playwright E2E suite (30+ tests)", "PERFORMANCE_BENCHMARKS.md", "E2E_TEST_RESULTS.md", "6 test files"],
        route: "/admin/qa-harness"
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

  const notStartedSteps = totalSteps - completedSteps - partialSteps;

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            Big Plan Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            AI Agent Build Sequence
          </p>
        </div>

        {/* Document Icon Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground/40" />
          </CardContent>
        </Card>

        {/* Overall Progress Card */}
        <Card className="border-border bg-card">
          <CardContent className="pt-6 space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Overall Progress</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {completedSteps} complete • {partialSteps} partial • {notStartedSteps} not started
              </p>
            </div>

            {/* Total Completion Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Completion</span>
                <span className="text-4xl font-bold">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center space-y-1">
                <div className="text-4xl font-bold text-green-500">{completedSteps}</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-4xl font-bold text-orange-500">{partialSteps}</div>
                <div className="text-sm text-muted-foreground">Partial</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-4xl font-bold text-muted-foreground/60">{notStartedSteps}</div>
                <div className="text-sm text-muted-foreground">Not Started</div>
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
