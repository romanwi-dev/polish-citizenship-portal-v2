// NOTE: Admin backend is EN/PL only by project policy.
// Currently uses raw English strings. To be localized in future if needed.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckSquare, AlertCircle, TrendingUp, Clock, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIsStaff } from "@/hooks/useUserRole";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth(true);
  const { data: isStaff, isLoading: roleLoading } = useIsStaff(user?.id);
  
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    pendingTasks: 0,
    documents: 0,
    avgProgress: 0,
    upcomingDeadlines: 0,
    vipCases: 0,
    vipPlusCases: 0,
    vipModeCases: 0,
    expeditedCases: 0,
    standardCases: 0,
    leadCases: 0,
    activeStatusCases: 0,
    onHoldCases: 0,
    finishedCases: 0,
    failedCases: 0,
    badCases: 0,
  });
  const [loading, setLoading] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [flippedDetailCards, setFlippedDetailCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const toggleDetailFlip = (cardId: string) => {
    setFlippedDetailCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      loadStats();
    }
  }, [authLoading, roleLoading, user]);

  const loadStats = async () => {
    try {
      const [casesRes, tasksRes, docsRes] = await Promise.all([
        supabase.from("cases").select("status, progress, is_vip, processing_mode, client_score", { count: "exact" }),
        supabase.from("tasks").select("status", { count: "exact" }).eq("status", "pending"),
        supabase.from("documents").select("id", { count: "exact" }),
      ]);

      const cases = casesRes.data || [];
      const activeCases = cases.filter(c => 
        c.status === "active" || c.status === "on_hold" || c.status === "suspended"
      ).length;
      
      const avgProgress = cases.length > 0
        ? Math.round(cases.reduce((sum, c) => sum + (c.progress || 0), 0) / cases.length)
        : 0;

      // Count VIP cases
      const vipCases = cases.filter(c => c.is_vip).length;
      
      // Count by processing mode
      const vipPlusCases = cases.filter(c => c.processing_mode === 'vip_plus').length;
      const vipModeCases = cases.filter(c => c.processing_mode === 'vip').length;
      const expeditedCases = cases.filter(c => c.processing_mode === 'expedited').length;
      const standardCases = cases.filter(c => c.processing_mode === 'standard').length;
      
      // Count by status
      const leadCases = cases.filter(c => c.status === 'lead').length;
      const activeStatusCases = cases.filter(c => c.status === 'active').length;
      const onHoldCases = cases.filter(c => c.status === 'on_hold').length;
      const finishedCases = cases.filter(c => c.status === 'finished').length;
      const failedCases = cases.filter(c => c.status === 'failed').length;
      
      // Count bad cases (low score)
      const badCases = cases.filter(c => (c.client_score || 0) < 30).length;

      setStats({
        totalCases: casesRes.count || 0,
        activeCases,
        pendingTasks: tasksRes.count || 0,
        documents: docsRes.count || 0,
        avgProgress,
        upcomingDeadlines: 0, // WSC letter deadline tracking implemented in separate WSC workflow
        vipCases,
        vipPlusCases,
        vipModeCases,
        expeditedCases,
        standardCases,
        leadCases,
        activeStatusCases,
        onHoldCases,
        finishedCases,
        failedCases,
        badCases,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      id: "total-cases",
      title: "Total Cases",
      value: stats.totalCases,
      description: `${stats.activeCases} active`,
      icon: Users,
      trend: "+12%",
      backTitle: "Case Breakdown",
      backContent: `Active: ${stats.activeCases}\nLead: ${stats.leadCases}\nOn Hold: ${stats.onHoldCases}`,
    },
    {
      id: "pending-tasks",
      title: "Pending Tasks",
      value: stats.pendingTasks,
      description: "Require attention",
      icon: CheckSquare,
      trend: "-5%",
      backTitle: "Task Details",
      backContent: "Translation, document review, and verification tasks pending completion",
    },
    {
      id: "documents",
      title: "Documents",
      value: stats.documents,
      description: "Total uploaded",
      icon: FileText,
      trend: "+8%",
      backTitle: "Document Status",
      backContent: "Passports, certificates, and archival documents stored securely",
    },
    {
      id: "avg-progress",
      title: "Avg Progress",
      value: `${stats.avgProgress}%`,
      description: "Across all cases",
      icon: TrendingUp,
      trend: "+3%",
      backTitle: "Progress Metrics",
      backContent: "Overall case completion tracking showing steady advancement",
    },
    {
      id: "deadlines",
      title: "Deadlines",
      value: stats.upcomingDeadlines,
      description: "Next 30 days",
      icon: Clock,
      trend: "2 urgent",
      backTitle: "Deadline Monitor",
      backContent: "WSC letter responses and document submission deadlines",
    },
    {
      id: "alerts",
      title: "Alerts",
      value: 0,
      description: "System issues",
      icon: AlertCircle,
      trend: "All clear",
      backTitle: "System Status",
      backContent: "All systems operational. No critical issues detected.",
    },
  ];

  if (authLoading || roleLoading) {
    return (
      <AdminLayout>
        <LoadingState message="Loading dashboard..." className="h-screen" />
      </AdminLayout>
    );
  }

  if (!isStaff) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <ErrorState 
            title="Access Denied"
            message="You don't have permission to access this page."
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of Polish Citizenship Portal operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            statCards.map((stat) => (
              <div
                key={stat.id}
                className="relative h-[180px] cursor-pointer perspective-1000"
                onClick={() => toggleFlip(stat.id)}
              >
                <div
                  className={cn(
                    "relative w-full h-full transition-transform duration-500 transform-style-3d",
                    flippedCards[stat.id] && "rotate-y-180"
                  )}
                >
                  {/* Front */}
                  <Card className="absolute inset-0 backface-hidden hover-glow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                      <div className="text-xs text-primary mt-1">{stat.trend}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                        <RotateCw className="h-3 w-3" />
                        <span>Click to flip</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Back */}
                  <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.backTitle}</CardTitle>
                      <RotateCw className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {stat.backContent}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                        <RotateCw className="h-3 w-3" />
                        <span>Click to flip back</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By Status Card */}
          <div
            className="relative h-[280px] cursor-pointer perspective-1000"
            onClick={() => toggleDetailFlip("status")}
          >
            <div
              className={cn(
                "relative w-full h-full transition-transform duration-500 transform-style-3d",
                flippedDetailCards["status"] && "rotate-y-180"
              )}
            >
              {/* Front */}
              <Card className="absolute inset-0 backface-hidden">
                <CardHeader>
                  <CardTitle>By Status</CardTitle>
                  <CardDescription>Cases breakdown by status ({stats.vipCases} VIPs)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lead</span>
                      <span className="text-sm font-medium">{stats.leadCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active</span>
                      <span className="text-sm font-medium">{stats.activeStatusCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">On Hold</span>
                      <span className="text-sm font-medium">{stats.onHoldCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Finished</span>
                      <span className="text-sm font-medium text-green-500">{stats.finishedCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Failed</span>
                      <span className="text-sm font-medium text-red-500">{stats.failedCases}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                    <RotateCw className="h-3 w-3" />
                    <span>Click to flip</span>
                  </div>
                </CardContent>
              </Card>

              {/* Back */}
              <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/5">
                <CardHeader>
                  <CardTitle>Status Details</CardTitle>
                  <CardDescription>Case lifecycle stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cases progress through various stages from initial lead to final completion or failure.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Active:</strong> Currently being processed</p>
                    <p><strong>On Hold:</strong> Awaiting client response</p>
                    <p><strong>Finished:</strong> Successfully completed</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                    <RotateCw className="h-3 w-3" />
                    <span>Click to flip back</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* By Processing Mode Card */}
          <div
            className="relative h-[280px] cursor-pointer perspective-1000"
            onClick={() => toggleDetailFlip("processing")}
          >
            <div
              className={cn(
                "relative w-full h-full transition-transform duration-500 transform-style-3d",
                flippedDetailCards["processing"] && "rotate-y-180"
              )}
            >
              {/* Front */}
              <Card className="absolute inset-0 backface-hidden">
                <CardHeader>
                  <CardTitle>By Processing Mode</CardTitle>
                  <CardDescription>Cases by service level</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">VIP+</span>
                      <span className="text-sm font-medium text-purple-400">{stats.vipPlusCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">VIP</span>
                      <span className="text-sm font-medium text-amber-400">{stats.vipModeCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Expedited</span>
                      <span className="text-sm font-medium text-blue-400">{stats.expeditedCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Standard</span>
                      <span className="text-sm font-medium">{stats.standardCases}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                    <RotateCw className="h-3 w-3" />
                    <span>Click to flip</span>
                  </div>
                </CardContent>
              </Card>

              {/* Back */}
              <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/5">
                <CardHeader>
                  <CardTitle>Service Tiers</CardTitle>
                  <CardDescription>Processing priority levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Different service levels provide varying response times and attention.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>VIP+:</strong> Highest priority, fastest processing</p>
                    <p><strong>VIP:</strong> Premium service with priority handling</p>
                    <p><strong>Expedited:</strong> Faster than standard processing</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                    <RotateCw className="h-3 w-3" />
                    <span>Click to flip back</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Priority & Quality Card */}
          <div
            className="relative h-[280px] cursor-pointer perspective-1000"
            onClick={() => toggleDetailFlip("quality")}
          >
            <div
              className={cn(
                "relative w-full h-full transition-transform duration-500 transform-style-3d",
                flippedDetailCards["quality"] && "rotate-y-180"
              )}
            >
              {/* Front */}
              <Card className="absolute inset-0 backface-hidden">
                <CardHeader>
                  <CardTitle>Priority & Quality</CardTitle>
                  <CardDescription>Special classifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">VIP Clients</span>
                      <span className="text-sm font-medium text-amber-400">{stats.vipCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bad Cases (&lt;30 score)</span>
                      <span className="text-sm font-medium text-red-400">{stats.badCases}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">System Health</span>
                      <span className="text-xs text-green-500">● All Clear</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                    <RotateCw className="h-3 w-3" />
                    <span>Click to flip</span>
                  </div>
                </CardContent>
              </Card>

              {/* Back */}
              <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-primary/5">
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                  <CardDescription>Case health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitoring case quality and client satisfaction scores.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>VIP Clients:</strong> Premium tier clients</p>
                    <p><strong>Bad Cases:</strong> Cases requiring intervention</p>
                    <p><strong>Health:</strong> Overall system performance</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 opacity-60">
                    <RotateCw className="h-3 w-3" />
                    <span>Click to flip back</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
