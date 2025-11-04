import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Activity,
  Timer,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface StageMetrics {
  stage: string;
  stageName: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  startedAt?: string;
  completedAt?: string;
  duration?: number; // seconds
  expectedDuration?: number; // seconds
  efficiency?: number; // percentage
  bottleneck?: boolean;
}

interface StagePerformanceAnalyticsProps {
  caseId: string;
  workflowStartTime?: Date;
  stages: StageMetrics[];
  totalDuration?: number;
  estimatedCompletion?: Date;
  currentStage: string;
}

export function StagePerformanceAnalytics({
  caseId,
  workflowStartTime,
  stages,
  totalDuration,
  estimatedCompletion,
  currentStage
}: StagePerformanceAnalyticsProps) {
  const completedStages = stages.filter(s => s.status === 'completed').length;
  const totalStages = stages.length;
  const progressPercentage = (completedStages / totalStages) * 100;

  const avgStageTime = stages
    .filter(s => s.duration)
    .reduce((sum, s) => sum + (s.duration || 0), 0) / completedStages || 0;

  const bottlenecks = stages.filter(s => s.bottleneck);
  const inefficientStages = stages.filter(s => s.efficiency && s.efficiency < 70);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return 'text-muted-foreground';
    if (efficiency >= 90) return 'text-green-500';
    if (efficiency >= 75) return 'text-blue-500';
    if (efficiency >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Progress</span>
          </div>
          <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
          <div className="text-xs text-muted-foreground">
            {completedStages} of {totalStages} stages
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Avg Stage Time</span>
          </div>
          <div className="text-2xl font-bold">{formatDuration(Math.round(avgStageTime))}</div>
          <div className="text-xs text-muted-foreground">Per stage</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Bottlenecks</span>
          </div>
          <div className={`text-2xl font-bold ${bottlenecks.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {bottlenecks.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {bottlenecks.length === 0 ? 'None detected' : 'Need attention'}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">ETA</span>
          </div>
          <div className="text-2xl font-bold">
            {estimatedCompletion 
              ? formatDistanceToNow(estimatedCompletion, { addSuffix: true })
              : 'TBD'}
          </div>
          <div className="text-xs text-muted-foreground">Estimated completion</div>
        </Card>
      </div>

      {/* Stage Timeline */}
      <Card className="p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Stage Performance
        </h4>

        <div className="space-y-3">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border ${
                stage.bottleneck ? 'border-red-300 bg-red-50' : 
                stage.status === 'completed' ? 'border-green-200 bg-green-50' :
                currentStage === stage.stage ? 'border-blue-300 bg-blue-50' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(stage.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stage.stageName}</span>
                      {currentStage === stage.stage && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                      {stage.bottleneck && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Bottleneck
                        </Badge>
                      )}
                    </div>
                    
                    {stage.duration && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Duration: {formatDuration(stage.duration)}
                        {stage.expectedDuration && (
                          <span className="ml-2">
                            (Expected: {formatDuration(stage.expectedDuration)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {stage.efficiency && (
                  <div className="text-right">
                    <div className={`text-xl font-bold ${getEfficiencyColor(stage.efficiency)}`}>
                      {Math.round(stage.efficiency)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Efficiency</div>
                  </div>
                )}
              </div>

              {/* Progress bar for in-progress stages */}
              {stage.status === 'in_progress' && stage.startedAt && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    Started {formatDistanceToNow(new Date(stage.startedAt), { addSuffix: true })}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Alerts */}
      {(bottlenecks.length > 0 || inefficientStages.length > 0) && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">Performance Alerts</h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                {bottlenecks.map(stage => (
                  <li key={stage.stage}>
                    • {stage.stageName} is experiencing delays
                  </li>
                ))}
                {inefficientStages.map(stage => (
                  <li key={stage.stage}>
                    • {stage.stageName} efficiency below target ({Math.round(stage.efficiency || 0)}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
