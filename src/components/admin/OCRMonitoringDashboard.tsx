import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface OCRStats {
  total: number;
  queued: number;
  processing: number;
  success: number;
  failed: number;
  pending: number;
}

interface RecentError {
  id: string;
  document_name: string;
  error_message: string;
  created_at: string;
  retry_count: number;
}

interface PerformanceMetric {
  avg_processing_time: number;
  success_rate: number;
  throughput_per_hour: number;
}

export function OCRMonitoringDashboard() {
  const [stats, setStats] = useState<OCRStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetric | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('ocr_status');

      if (error) throw error;

      const stats: OCRStats = {
        total: data?.length || 0,
        queued: data?.filter(d => d.ocr_status === 'queued').length || 0,
        processing: data?.filter(d => d.ocr_status === 'processing').length || 0,
        success: data?.filter(d => d.ocr_status === 'completed').length || 0,
        failed: data?.filter(d => d.ocr_status === 'failed').length || 0,
        pending: data?.filter(d => d.ocr_status === 'pending' || !d.ocr_status).length || 0,
      };

      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch OCR stats:', error);
    }
  };

  const fetchRecentErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('ocr_processing_logs')
        .select('id, document_id, error_message, created_at, documents(name)')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const errors: RecentError[] = (data || []).map(log => ({
        id: log.id,
        document_name: (log.documents as any)?.name || 'Unknown',
        error_message: log.error_message || 'Unknown error',
        created_at: log.created_at,
        retry_count: 0
      }));

      setRecentErrors(errors);
    } catch (error) {
      console.error('Failed to fetch recent errors:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('ocr_processing_logs')
        .select('processing_duration_ms, status, created_at')
        .gte('created_at', oneDayAgo.toISOString());

      if (error) throw error;

      const successfulLogs = data?.filter(log => log.status === 'completed') || [];
      const avgTime = successfulLogs.length > 0
        ? successfulLogs.reduce((sum, log) => sum + (log.processing_duration_ms || 0), 0) / successfulLogs.length
        : 0;

      const successRate = data && data.length > 0
        ? (successfulLogs.length / data.length) * 100
        : 0;

      const throughput = data ? data.length : 0;

      setPerformance({
        avg_processing_time: avgTime,
        success_rate: successRate,
        throughput_per_hour: throughput
      });
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStats(), fetchRecentErrors(), fetchPerformance()]);
      setIsLoading(false);
    };

    loadData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!stats) return { status: 'unknown', color: 'gray' };
    
    const activeProcessing = stats.processing + stats.queued;
    const errorRate = stats.total > 0 ? (stats.failed / stats.total) * 100 : 0;

    if (errorRate > 20) return { status: 'critical', color: 'destructive' };
    if (errorRate > 10) return { status: 'warning', color: 'warning' };
    if (activeProcessing > 50) return { status: 'high-load', color: 'warning' };
    return { status: 'healthy', color: 'success' };
  };

  const health = getHealthStatus();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Phase 4: OCR Monitoring Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Phase 4: OCR Monitoring Dashboard
          <Badge variant={health.color === 'destructive' ? 'destructive' : 'default'} className="ml-auto">
            {health.status.toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time OCR processing metrics, error tracking, and performance analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold text-lg">{stats?.total || 0}</div>
              <div className="text-xs">Total Documents</div>
            </AlertDescription>
          </Alert>

          <Alert className="border-blue-500/50 bg-blue-500/5">
            <Clock className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              <div className="font-semibold text-lg">{stats?.queued || 0}</div>
              <div className="text-xs">Queued</div>
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-500/50 bg-yellow-500/5">
            <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />
            <AlertDescription>
              <div className="font-semibold text-lg">{stats?.processing || 0}</div>
              <div className="text-xs">Processing</div>
            </AlertDescription>
          </Alert>

          <Alert className="border-green-500/50 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              <div className="font-semibold text-lg">{stats?.success || 0}</div>
              <div className="text-xs">Completed</div>
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold text-lg">{stats?.failed || 0}</div>
              <div className="text-xs">Failed</div>
            </AlertDescription>
          </Alert>

          <Alert className="border-gray-500/50 bg-gray-500/5">
            <AlertTriangle className="h-4 w-4 text-gray-500" />
            <AlertDescription>
              <div className="font-semibold text-lg">{stats?.pending || 0}</div>
              <div className="text-xs">Pending</div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Progress Bar */}
        {stats && stats.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">
                {((stats.success / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={(stats.success / stats.total) * 100} className="h-2" />
          </div>
        )}

        {/* Performance Metrics */}
        {performance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Alert className="border-purple-500/50 bg-purple-500/5">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <AlertDescription>
                <div className="font-semibold">
                  {(performance.avg_processing_time / 1000).toFixed(1)}s
                </div>
                <div className="text-xs">Avg Processing Time</div>
              </AlertDescription>
            </Alert>

            <Alert className="border-green-500/50 bg-green-500/5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <div className="font-semibold">
                  {performance.success_rate.toFixed(1)}%
                </div>
                <div className="text-xs">Success Rate (24h)</div>
              </AlertDescription>
            </Alert>

            <Alert className="border-blue-500/50 bg-blue-500/5">
              <Activity className="h-4 w-4 text-blue-500" />
              <AlertDescription>
                <div className="font-semibold">
                  {performance.throughput_per_hour}
                </div>
                <div className="text-xs">Documents (24h)</div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Recent Errors */}
        {recentErrors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Recent Errors ({recentErrors.length})
            </h4>
            <ScrollArea className="h-48 border rounded-md p-2">
              {recentErrors.map((error) => (
                <div key={error.id} className="text-xs mb-2 p-2 bg-destructive/5 border border-destructive/20 rounded">
                  <div className="font-semibold text-destructive">{error.document_name}</div>
                  <div className="text-muted-foreground mt-1">{error.error_message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(error.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Health Status Alert */}
        {health.status !== 'healthy' && (
          <Alert variant={health.color === 'destructive' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {health.status === 'critical' && 'Critical: High error rate detected. Immediate attention required.'}
              {health.status === 'warning' && 'Warning: Elevated error rate or processing load.'}
              {health.status === 'high-load' && 'High Load: Many documents in processing queue.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
