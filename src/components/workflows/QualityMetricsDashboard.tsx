import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Target,
  Award,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

interface QualityMetric {
  name: string;
  score: number;
  weight: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  trend?: 'up' | 'down' | 'stable';
  details?: string;
}

interface QualityMetricsDashboardProps {
  caseId: string;
  metrics: QualityMetric[];
  overallScore: number;
  completeness: number;
  missingFields: string[];
  blockers: number;
  warnings: number;
}

const statusConfig = {
  excellent: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  good: { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  poor: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' }
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus
};

export function QualityMetricsDashboard({
  caseId,
  metrics,
  overallScore,
  completeness,
  missingFields,
  blockers,
  warnings
}: QualityMetricsDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Score Header */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Quality Score</h3>
              <p className="text-sm text-muted-foreground">Overall case data quality</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {getScoreLabel(overallScore)}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(completeness)}%</div>
            <div className="text-xs text-muted-foreground">Completeness</div>
            <Progress value={completeness} className="h-1 mt-2" />
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${blockers > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {blockers}
            </div>
            <div className="text-xs text-muted-foreground">Blockers</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${warnings > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
              {warnings}
            </div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </div>
        </div>
      </Card>

      {/* Detailed Metrics */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-lg">Quality Breakdown</h4>
        </div>
        
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const config = statusConfig[metric.status];
            const Icon = config.icon;
            const TrendIcon = metric.trend ? trendIcons[metric.trend] : null;
            
            return (
              <motion.div
                key={metric.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${config.border} ${config.bg}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.name}</span>
                        {TrendIcon && (
                          <TrendIcon className={`w-4 h-4 ${
                            metric.trend === 'up' ? 'text-green-500' : 
                            metric.trend === 'down' ? 'text-red-500' : 
                            'text-gray-500'
                          }`} />
                        )}
                      </div>
                      {metric.details && (
                        <p className="text-xs text-muted-foreground mt-1">{metric.details}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${config.color}`}>
                      {Math.round(metric.score)}%
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      Weight: {metric.weight}x
                    </Badge>
                  </div>
                </div>
                
                <Progress value={metric.score} className="h-2" />
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Missing Fields Alert */}
      {missingFields.length > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">
                Missing Required Fields ({missingFields.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field, idx) => (
                  <Badge key={idx} variant="outline" className="bg-white">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Ready Indicator */}
      {overallScore >= 85 && blockers === 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900">Ready for Next Stage</h4>
              <p className="text-sm text-green-700">
                Quality score meets requirements. No blockers detected.
              </p>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
