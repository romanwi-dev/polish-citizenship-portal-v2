import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface SecurityScoreCardProps {
  score: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  infoIssues: number;
  compliance: {
    'OWASP Top 10': boolean;
    'GDPR Ready': boolean;
    'Production Ready': boolean;
  };
}

export default function SecurityScoreCard({
  score,
  criticalIssues,
  highIssues,
  mediumIssues,
  lowIssues,
  infoIssues,
  compliance
}: SecurityScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 95) return { icon: CheckCircle, label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 75) return { icon: AlertTriangle, label: 'Needs Improvement', color: 'bg-yellow-100 text-yellow-800' };
    return { icon: XCircle, label: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  const status = getScoreStatus(score);
  const StatusIcon = status.icon;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          Security Posture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-3">
          <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
            {score}<span className="text-3xl text-muted-foreground">/100</span>
          </div>
          <Badge className={status.color}>
            <StatusIcon className="h-4 w-4 mr-1" />
            {status.label}
          </Badge>
          <Progress value={score} className="h-3" />
        </div>

        {/* Issue Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Critical</span>
              <span className="font-bold text-red-600">{criticalIssues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">High</span>
              <span className="font-bold text-orange-600">{highIssues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Medium</span>
              <span className="font-bold text-yellow-600">{mediumIssues}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low</span>
              <span className="font-bold text-blue-600">{lowIssues}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Info</span>
              <span className="font-bold text-gray-600">{infoIssues}</span>
            </div>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Compliance Status</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(compliance).map(([key, passed]) => (
              <Badge
                key={key}
                variant={passed ? 'default' : 'destructive'}
                className="text-xs"
              >
                {passed ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                {key}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}