import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight, ExternalLink, Play, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TestStatus = "not_started" | "in_progress" | "passed" | "failed" | "partial";
type TestCategory = "foundation" | "case_management" | "client_portal" | "documents" | "forms" | "partial_features";

interface TestStep {
  id: string;
  title: string;
  category: TestCategory;
  completionLevel: number; // 0-100
  duration: string;
  location: string;
  route?: string;
  status: TestStatus;
  procedures: string[];
  expectedResults: string[];
  acceptanceCriteria: string[];
  missingFeatures?: string[];
}

const testSteps: TestStep[] = [
  {
    id: "qa-harness",
    title: "QA Harness & Dropbox Diagnostics",
    category: "foundation",
    completionLevel: 100,
    duration: "5 min",
    location: "/admin/qa-harness",
    route: "/admin/qa-harness",
    status: "not_started",
    procedures: [
      "Navigate to /admin/qa-harness",
      "Click 'Run All Tests' button",
      "Wait for all 6 tests to complete",
      "Verify all tests show green 'PASS' badges"
    ],
    expectedResults: [
      "All tests should show green PASS badges",
      "Each test should show duration (ms)",
      "Summary: ✓ 6 passed, ✗ 0 failed, ⚠ 0 warnings",
      "No console errors in browser dev tools"
    ],
    acceptanceCriteria: [
      "All 6 tests pass with status PASS",
      "Database connection < 500ms",
      "Authentication confirms logged-in user email",
      "RLS policies allow authenticated access"
    ]
  },
  {
    id: "dropbox-migration",
    title: "Dropbox Migration Scan",
    category: "foundation",
    completionLevel: 100,
    duration: "10 min",
    location: "/admin/dropbox-migration",
    route: "/admin/dropbox-migration",
    status: "not_started",
    procedures: [
      "Navigate to /admin/dropbox-migration",
      "Review migration plan statistics",
      "If changes exist, review proposed changes",
      "Click 'Execute Migration' button",
      "Verify completion toast appears",
      "Test Undo feature by clicking Undo on last migration"
    ],
    expectedResults: [
      "Migration plan loads without errors",
      "Proposed changes show: current_path → proposed_path",
      "Execution completes with success toast",
      "New entry appears in Migration History",
      "Undo button appears and works correctly"
    ],
    acceptanceCriteria: [
      "Migration plan identifies naming inconsistencies",
      "Execution creates log entry with metadata",
      "Undo reverses changes accurately",
      "No orphaned files in Dropbox"
    ]
  },
  {
    id: "kpi-strip",
    title: "Dashboard KPI Strip",
    category: "case_management",
    completionLevel: 100,
    duration: "5 min",
    location: "/admin/dashboard",
    route: "/admin/dashboard",
    status: "not_started",
    procedures: [
      "Navigate to main dashboard",
      "Locate any case card",
      "Observe KPI strip at bottom of card",
      "Verify KPI chips display correctly",
      "Click on KPI strip to test collapse/expand"
    ],
    expectedResults: [
      "KPI strip visible on all case cards",
      "Color coding correct (green = complete, yellow = pending)",
      "Collapsible functionality works smoothly",
      "Real-time updates when case data changes"
    ],
    acceptanceCriteria: [
      "All KPI fields render correctly",
      "Color coding matches status",
      "Collapsible animation smooth",
      "Data accuracy verified against database"
    ]
  },
  {
    id: "wsc-letter",
    title: "WSC Letter Stage",
    category: "documents",
    completionLevel: 100,
    duration: "10 min",
    location: "Case Detail page",
    status: "not_started",
    procedures: [
      "Navigate to any case detail page",
      "Scroll to 'WSC Letter Upload' section",
      "Upload a test PDF document",
      "Fill in Letter Date, Reference Number, Deadline",
      "Click 'Upload WSC Letter'",
      "Test Strategy buttons (PUSH, NUDGE, SITDOWN)"
    ],
    expectedResults: [
      "File upload succeeds with toast notification",
      "wsc_received KPI updates to true",
      "Timeline displays WSC Letter stage",
      "Strategy buttons create HAC log entries",
      "WSC data saved to wsc_letters table"
    ],
    acceptanceCriteria: [
      "WSC letter data persists after page refresh",
      "Strategy actions logged with timestamp and user",
      "Case KPI strip reflects WSC received status"
    ]
  },
  {
    id: "manual-case",
    title: "Manual Case Creation",
    category: "case_management",
    completionLevel: 100,
    duration: "8 min",
    location: "/admin/cases/new",
    route: "/admin/cases/new",
    status: "not_started",
    procedures: [
      "Navigate to /admin/cases/new",
      "Fill in Client Name, Email, Country",
      "Upload client photo (optional)",
      "Click 'Create Case'",
      "Verify auto-generated client code",
      "Check Dropbox folder creation"
    ],
    expectedResults: [
      "Case created in cases table",
      "Client code follows format: {COUNTRY}{NUMBER}",
      "Dropbox folder structure created",
      "Magic link token saved",
      "Redirect to new case detail page"
    ],
    acceptanceCriteria: [
      "Case appears in dashboard immediately",
      "Client code is unique",
      "Master table entry auto-created",
      "All default fields populated"
    ]
  },
  {
    id: "magic-link",
    title: "Magic Link Login",
    category: "client_portal",
    completionLevel: 100,
    duration: "5 min",
    location: "/client/login",
    route: "/client/login",
    status: "not_started",
    procedures: [
      "Navigate to /client/login",
      "Enter a valid case ID",
      "Enter the magic link token",
      "Click 'Access Portal'",
      "Test dev mode bypass (if enabled)"
    ],
    expectedResults: [
      "Valid token grants access",
      "Invalid token shows error",
      "Session stored in localStorage",
      "Redirect to /client/dashboard/:caseId"
    ],
    acceptanceCriteria: [
      "Token expiration enforced",
      "Session persists across refreshes",
      "Logout clears session correctly"
    ]
  },
  {
    id: "client-dashboard",
    title: "Client Dashboard",
    category: "client_portal",
    completionLevel: 100,
    duration: "10 min",
    location: "/client/dashboard/:caseId",
    status: "not_started",
    procedures: [
      "Login via magic link",
      "Verify Timeline Visualization visible",
      "Check Document Checklist",
      "Test Upload Box functionality",
      "Test POA Download (if available)",
      "Send a test message"
    ],
    expectedResults: [
      "Timeline shows accurate case stage",
      "Document checklist matches requirements",
      "Upload functionality triggers",
      "Messages saved to messages table",
      "POA download works if exists"
    ],
    acceptanceCriteria: [
      "All data loads without errors",
      "Client-safe view (no admin controls)",
      "Stage progression accurate",
      "Real-time message updates"
    ]
  },
  {
    id: "hac-logging",
    title: "HAC Logging Infrastructure",
    category: "case_management",
    completionLevel: 100,
    duration: "5 min",
    location: "Database + Strategy Buttons",
    status: "not_started",
    procedures: [
      "Navigate to case detail page",
      "Use Strategy buttons (PUSH/NUDGE/SITDOWN)",
      "Click 'PUSH' button",
      "Query hac_logs table in database",
      "Verify log entry created"
    ],
    expectedResults: [
      "New log entry with action_type, performed_by, timestamp",
      "case_id correctly set",
      "metadata JSON valid"
    ],
    acceptanceCriteria: [
      "Log entries persist after refresh",
      "Timestamps accurate",
      "User attribution correct"
    ],
    missingFeatures: [
      "No UI log viewer yet (logs viewable via database only)",
      "No CSV export functionality"
    ]
  },
  {
    id: "forms-excellence",
    title: "Forms Excellence (All 6 Forms)",
    category: "forms",
    completionLevel: 100,
    duration: "30 min",
    location: "All admin forms",
    status: "not_started",
    procedures: [
      "Test Intake Form: auto-save, validation, unsaved changes",
      "Test POA Form: same procedures",
      "Test Citizenship Form: same procedures",
      "Test Family Tree Form: same procedures",
      "Test Civil Registry Form: same procedures",
      "Test Family History Form: same procedures"
    ],
    expectedResults: [
      "Auto-save triggers after 30s inactivity",
      "Date validation enforces DD.MM.YYYY",
      "Required fields show errors when empty",
      "Unsaved changes warning works",
      "Real-time sync across sessions"
    ],
    acceptanceCriteria: [
      "All 6 forms use useFormManager hook",
      "Completion percentage badge accurate",
      "Validation summary displays error count",
      "No data loss on page refresh"
    ]
  },
  {
    id: "intake-wizard",
    title: "Universal Intake Wizard",
    category: "partial_features",
    completionLevel: 80,
    duration: "10 min",
    location: "/admin/intake/:caseId",
    status: "not_started",
    procedures: [
      "Navigate to /admin/intake/:caseId",
      "Fill out all sections",
      "Upload passport photo",
      "Wait for OCR to auto-fill fields",
      "Verify auto-save works"
    ],
    expectedResults: [
      "Full intake form renders",
      "Auto-save every 30s",
      "Passport OCR auto-fills: name, DOB, sex, passport number",
      "Data persists in intake_data table"
    ],
    acceptanceCriteria: [
      "Admin can complete intake form",
      "OCR works for passport upload",
      "Data saves correctly"
    ],
    missingFeatures: [
      "Client-facing public version missing",
      "EN/PL language toggle not implemented",
      "I don't know checkboxes missing",
      "Multi-step wizard UI needed"
    ]
  },
  {
    id: "poa-generation",
    title: "POA Generation & E-Sign",
    category: "partial_features",
    completionLevel: 70,
    duration: "8 min",
    location: "/admin/poa/:caseId",
    status: "not_started",
    procedures: [
      "Navigate to /admin/poa/:caseId",
      "Fill in POA-specific fields",
      "Verify form saves correctly",
      "Test edge function manually in console"
    ],
    expectedResults: [
      "POA form saves data",
      "Edge function generate-poa runs without errors",
      "HAC approval field exists"
    ],
    acceptanceCriteria: [
      "POA form saves data",
      "Edge function runs without errors",
      "HAC can mark POA as approved"
    ],
    missingFeatures: [
      "Auto-generation from intake_data → poa",
      "E-signature canvas for client",
      "Auto-upload signed POA to Dropbox",
      "Email notification after signing"
    ]
  },
  {
    id: "oby-draft",
    title: "OBY Draft Generation",
    category: "partial_features",
    completionLevel: 30,
    duration: "5 min",
    location: "/admin/citizenship/:caseId",
    status: "not_started",
    procedures: [
      "Navigate to /admin/citizenship/:caseId",
      "Observe ~140 fields present",
      "Manually fill in a few fields",
      "Verify auto-save works"
    ],
    expectedResults: [
      "Form renders without errors",
      "Fields save to database",
      "Auto-save works"
    ],
    acceptanceCriteria: [
      "Form renders without errors",
      "Fields save to database",
      "Auto-save works"
    ],
    missingFeatures: [
      "Auto-population from intake_data",
      "Mark as Filed workflow",
      "HAC approval before filing",
      "Timeline stage tracking"
    ]
  }
];

export default function TestingDashboard() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestStep[]>(testSteps);
  const [filterCategory, setFilterCategory] = useState<TestCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TestStatus | "all">("all");
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  const updateTestStatus = (testId: string, status: TestStatus) => {
    setTests(tests.map(test => 
      test.id === testId ? { ...test, status } : test
    ));
  };

  const toggleExpanded = (testId: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const filteredTests = tests.filter(test => {
    if (filterCategory !== "all" && test.category !== filterCategory) return false;
    if (filterStatus !== "all" && test.status !== filterStatus) return false;
    return true;
  });

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    const variants: Record<TestStatus, any> = {
      passed: "default",
      failed: "destructive",
      in_progress: "secondary",
      partial: "outline",
      not_started: "outline"
    };
    return <Badge variant={variants[status]}>{status.replace("_", " ").toUpperCase()}</Badge>;
  };

  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.status === "passed").length;
  const failedTests = tests.filter(t => t.status === "failed").length;
  const inProgressTests = tests.filter(t => t.status === "in_progress").length;
  const overallProgress = (passedTests / totalTests) * 100;

  const categories: { id: TestCategory | "all"; label: string }[] = [
    { id: "all", label: "All Tests" },
    { id: "foundation", label: "Foundation" },
    { id: "case_management", label: "Case Management" },
    { id: "client_portal", label: "Client Portal" },
    { id: "documents", label: "Documents" },
    { id: "forms", label: "Forms" },
    { id: "partial_features", label: "Partial Features" }
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-4 md:space-y-6 pb-20">
      <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:justify-between md:items-start">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Testing Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Comprehensive testing suite for all implemented features
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Testing Progress</CardTitle>
          <CardDescription>Track completion of all test procedures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span>Progress</span>
              <span className="font-semibold">{passedTests}/{totalTests} tests passed</span>
            </div>
            <Progress value={overallProgress} className="h-2 md:h-3" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Passed</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{passedTests}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Failed</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">{failedTests}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">In Progress</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">{inProgressTests}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-muted-foreground">Not Started</p>
              <p className="text-xl md:text-2xl font-bold text-muted-foreground">
                {totalTests - passedTests - failedTests - inProgressTests}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters - Scrollable Tabs on Mobile */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <Tabs value={filterCategory} onValueChange={(v) => setFilterCategory(v as TestCategory | "all")}>
            <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
              <TabsList className="inline-flex md:grid md:w-full md:grid-cols-7 min-w-max md:min-w-0">
                {categories.map(cat => (
                  <TabsTrigger key={cat.id} value={cat.id} className="whitespace-nowrap text-xs md:text-sm px-3 md:px-4">
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Cards */}
      <div className="space-y-4">
        {filteredTests.map((test) => (
          <Card key={test.id}>
            <Collapsible
              open={expandedTests.has(test.id)}
              onOpenChange={() => toggleExpanded(test.id)}
            >
              <CardHeader className="cursor-pointer p-3 md:p-6" onClick={() => toggleExpanded(test.id)}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(test.status)}</div>
                    <div className="space-y-1 md:space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base md:text-xl truncate">{test.title}</CardTitle>
                        {expandedTests.has(test.id) ? 
                          <ChevronDown className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" /> : 
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                        }
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        {getStatusBadge(test.status)}
                        <Badge variant="outline" className="text-xs">{test.category.replace("_", " ")}</Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {test.duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{test.completionLevel}% Complete</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs md:text-sm truncate">
                        <span className="truncate">{test.location}</span>
                        {test.route && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 md:h-6 px-1.5 md:px-2 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(test.route!);
                            }}
                          >
                            <ExternalLink className="h-3 w-3 md:mr-1" />
                            <span className="hidden md:inline">Open</span>
                          </Button>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Vertical Stack on Mobile */}
                  <div className="flex md:flex-row flex-col gap-1.5 md:gap-2 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full md:w-auto text-xs md:text-sm h-8 md:h-9"
                      onClick={() => updateTestStatus(test.id, "in_progress")}
                    >
                      <Play className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full md:w-auto text-xs md:text-sm h-8 md:h-9 text-green-600 hover:text-green-700"
                      onClick={() => updateTestStatus(test.id, "passed")}
                    >
                      <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Pass
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full md:w-auto text-xs md:text-sm h-8 md:h-9 text-red-600 hover:text-red-700"
                      onClick={() => updateTestStatus(test.id, "failed")}
                    >
                      <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Fail
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="space-y-4 md:space-y-6 pt-0 p-3 md:p-6">
                  {/* Test Procedures */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                      <span className="text-blue-600">1.</span>
                      Test Procedures
                    </h4>
                    <ul className="space-y-1 ml-4 md:ml-6">
                      {test.procedures.map((proc, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-muted-foreground list-disc">
                          {proc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Results */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                      <span className="text-green-600">2.</span>
                      Expected Results
                    </h4>
                    <ul className="space-y-1 ml-4 md:ml-6">
                      {test.expectedResults.map((result, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-muted-foreground list-disc">
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Acceptance Criteria */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
                      <span className="text-purple-600">3.</span>
                      Acceptance Criteria
                    </h4>
                    <ul className="space-y-1 ml-4 md:ml-6">
                      {test.acceptanceCriteria.map((criteria, idx) => (
                        <li key={idx} className="text-xs md:text-sm text-muted-foreground list-disc">
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Features (if partial) */}
                  {test.missingFeatures && test.missingFeatures.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-950 p-3 md:p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm md:text-base">
                        <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
                        Missing Features to Document
                      </h4>
                      <ul className="space-y-1 ml-4 md:ml-6">
                        {test.missingFeatures.map((feature, idx) => (
                          <li key={idx} className="text-xs md:text-sm text-yellow-700 dark:text-yellow-300 list-disc">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  );
}
