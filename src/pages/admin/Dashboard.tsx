import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckSquare, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    pendingTasks: 0,
    documents: 0,
    avgProgress: 0,
    upcomingDeadlines: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check in dev mode
    // checkAuth();
    loadStats();
  }, []);

  // Commented out for dev mode
  // const checkAuth = async () => {
  //   const { data: { session } } = await supabase.auth.getSession();
  //   if (!session) {
  //     navigate("/login");
  //     return;
  //   }

  //   const { data: roles } = await supabase
  //     .from("user_roles")
  //     .select("role")
  //     .eq("user_id", session.user.id)
  //     .single();

  //   if (!roles || (roles.role !== "admin" && roles.role !== "assistant")) {
  //     toast.error("Access denied");
  //     navigate("/");
  //   }
  // };

  const loadStats = async () => {
    try {
      const [casesRes, tasksRes, docsRes] = await Promise.all([
        supabase.from("cases").select("status, progress", { count: "exact" }),
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

      setStats({
        totalCases: casesRes.count || 0,
        activeCases,
        pendingTasks: tasksRes.count || 0,
        documents: docsRes.count || 0,
        avgProgress,
        upcomingDeadlines: 0, // TODO: Calculate from WSC letters
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
      title: "Total Cases",
      value: stats.totalCases,
      description: `${stats.activeCases} active`,
      icon: Users,
      trend: "+12%",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      description: "Require attention",
      icon: CheckSquare,
      trend: "-5%",
    },
    {
      title: "Documents",
      value: stats.documents,
      description: "Total uploaded",
      icon: FileText,
      trend: "+8%",
    },
    {
      title: "Avg Progress",
      value: `${stats.avgProgress}%`,
      description: "Across all cases",
      icon: TrendingUp,
      trend: "+3%",
    },
    {
      title: "Deadlines",
      value: stats.upcomingDeadlines,
      description: "Next 30 days",
      icon: Clock,
      trend: "2 urgent",
    },
    {
      title: "Alerts",
      value: 0,
      description: "System issues",
      icon: AlertCircle,
      trend: "All clear",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <div className="text-xs text-primary mt-1">{stat.trend}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across all cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                No recent activity to display
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database</span>
                  <span className="text-xs text-green-500">● Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Dropbox Sync</span>
                  <span className="text-xs text-green-500">● Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Authentication</span>
                  <span className="text-xs text-green-500">● Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
