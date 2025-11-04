import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FolderSync, Database, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const DropboxSyncStats = () => {
  // Get total cases
  const { data: totalCases, isLoading: loadingTotal } = useQuery({
    queryKey: ['dropbox-stats-total'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Get cases with valid Dropbox paths
  const { data: casesWithPaths, isLoading: loadingWithPaths } = useQuery({
    queryKey: ['dropbox-stats-with-paths'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .not('dropbox_path', 'is', null)
        .neq('dropbox_path', '');
      if (error) throw error;
      return count || 0;
    }
  });

  // Get cases without valid paths (orphans)
  const { data: orphanCases, isLoading: loadingOrphans } = useQuery({
    queryKey: ['dropbox-stats-orphans'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .or('dropbox_path.is.null,dropbox_path.eq.');
      if (error) throw error;
      return count || 0;
    }
  });

  // Get last sync time from hac_logs
  const { data: lastSync, isLoading: loadingLastSync } = useQuery({
    queryKey: ['dropbox-last-sync'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hac_logs')
        .select('performed_at')
        .eq('action_type', 'dropbox_resync')
        .order('performed_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data?.performed_at || null;
    }
  });

  const isLoading = loadingTotal || loadingWithPaths || loadingOrphans || loadingLastSync;

  const stats = [
    {
      label: "Total Cases",
      value: totalCases || 0,
      icon: Database,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Synced with Dropbox",
      value: casesWithPaths || 0,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Missing Dropbox Path",
      value: orphanCases || 0,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Last Sync",
      value: lastSync 
        ? new Date(lastSync).toLocaleDateString() + ' ' + new Date(lastSync).toLocaleTimeString()
        : "Never",
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      isTime: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className={`text-2xl font-bold ${stat.isTime ? 'text-base' : ''}`}>
                  {stat.value}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
