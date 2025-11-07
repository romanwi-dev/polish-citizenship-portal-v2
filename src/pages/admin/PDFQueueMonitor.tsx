import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, 
  TrendingUp, Activity, Zap, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

interface QueueStats {
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  avgDuration: number;
  successRate: number;
}

interface QueueJob {
  id: string;
  case_id: string;
  template_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
  retry_count: number;
  pdf_url: string | null;
}

export default function PDFQueueMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch queue statistics
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['pdf-queue-stats'],
    queryFn: async (): Promise<QueueStats> => {
      const { data, error } = await supabase
        .from('pdf_queue')
        .select('status, created_at, completed_at, retry_count');

      if (error) throw error;

      const queued = data.filter(j => j.status === 'queued').length;
      const processing = data.filter(j => j.status === 'processing').length;
      const completed = data.filter(j => j.status === 'completed').length;
      const failed = data.filter(j => j.status === 'failed').length;

      const completedJobs = data.filter(j => j.status === 'completed' && j.completed_at);
      const avgDuration = completedJobs.length > 0
        ? completedJobs.reduce((sum, job) => {
            const start = new Date(job.created_at).getTime();
            const end = new Date(job.completed_at!).getTime();
            return sum + (end - start) / 1000;
          }, 0) / completedJobs.length
        : 0;

      const successRate = (completed + failed) > 0
        ? (completed / (completed + failed)) * 100
        : 100;

      return { queued, processing, completed, failed, avgDuration, successRate };
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch recent jobs
  const { data: jobs, refetch: refetchJobs } = useQuery({
    queryKey: ['pdf-queue-jobs'],
    queryFn: async (): Promise<QueueJob[]> => {
      const { data, error } = await supabase
        .from('pdf_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as QueueJob[];
    },
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const handleRetry = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('pdf_queue')
        .update({ 
          status: 'queued', 
          error_message: null,
          retry_count: 0
        })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Job queued for retry');
      refetchJobs();
      refetchStats();
    } catch (error: any) {
      toast.error(`Retry failed: ${error.message}`);
    }
  };

  const getHealthStatus = () => {
    if (!stats) return { color: 'text-gray-500', label: 'Loading...', icon: Activity };
    if (stats.successRate >= 95) return { color: 'text-green-500', label: 'Excellent', icon: CheckCircle2 };
    if (stats.successRate >= 80) return { color: 'text-yellow-500', label: 'Warning', icon: AlertCircle };
    return { color: 'text-red-500', label: 'Critical', icon: XCircle };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PDF Queue Monitor
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time monitoring of async PDF generation system
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                refetchStats();
                refetchJobs();
                toast.success('Refreshed');
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </Button>
          </div>
        </div>

        {/* Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HealthIcon className={`h-5 w-5 ${health.color}`} />
              System Health: {health.label}
            </CardTitle>
            <CardDescription>
              Success Rate: {stats?.successRate.toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Queued</span>
                </div>
                <div className="text-3xl font-bold">{stats?.queued || 0}</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Processing</span>
                </div>
                <div className="text-3xl font-bold">{stats?.processing || 0}</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
                <div className="text-3xl font-bold">{stats?.completed || 0}</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Failed</span>
                </div>
                <div className="text-3xl font-bold">{stats?.failed || 0}</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Avg Duration</span>
                </div>
                <div className="text-3xl font-bold">{stats?.avgDuration.toFixed(1)}s</div>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Job History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Jobs
            </CardTitle>
            <CardDescription>Last 50 PDF generation jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {jobs?.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{job.template_type}</span>
                      <Badge variant="outline" className="text-xs">
                        {job.case_id.slice(0, 8)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(job.created_at).toLocaleString()}
                      {job.completed_at && (
                        <> • Duration: {((new Date(job.completed_at).getTime() - new Date(job.created_at).getTime()) / 1000).toFixed(1)}s</>
                      )}
                    </div>
                    {job.error_message && (
                      <div className="text-xs text-red-500 mt-1">{job.error_message}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {job.retry_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Retry {job.retry_count}
                      </Badge>
                    )}
                    {job.status === 'queued' && (
                      <Badge className="bg-blue-500">Queued</Badge>
                    )}
                    {job.status === 'processing' && (
                      <Badge className="bg-yellow-500">Processing</Badge>
                    )}
                    {job.status === 'completed' && (
                      <Badge className="bg-green-500">Completed</Badge>
                    )}
                    {job.status === 'failed' && (
                      <>
                        <Badge variant="destructive">Failed</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(job.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!jobs || jobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No jobs found. Generate a PDF to see it here.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
