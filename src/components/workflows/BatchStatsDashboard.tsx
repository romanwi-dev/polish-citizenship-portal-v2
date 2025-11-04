import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Clock, Layers, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface BatchStatsDashboardProps {
  queueSize: number;
  activeRequests: number;
  totalDocuments: number;
  completedDocuments: number;
  failedDocuments: number;
  startTime?: Date;
}

export function BatchStatsDashboard({
  queueSize,
  activeRequests,
  totalDocuments,
  completedDocuments,
  failedDocuments,
  startTime
}: BatchStatsDashboardProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [processingRate, setProcessingRate] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
      
      // Calculate processing rate (docs per minute)
      if (elapsed > 0) {
        const rate = (completedDocuments / elapsed) * 60;
        setProcessingRate(Math.round(rate * 10) / 10);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, completedDocuments]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDocuments > 0 
    ? Math.round((completedDocuments / totalDocuments) * 100) 
    : 0;

  const throughputStatus = 
    activeRequests === 0 ? 'idle' :
    activeRequests >= 3 ? 'high' : 'normal';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Queue Size */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Layers className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Queue Size</p>
            <p className="text-2xl font-bold">{queueSize}</p>
          </div>
        </div>
        <div className="mt-2">
          <Badge variant={queueSize > 0 ? "default" : "secondary"} className="text-xs">
            {queueSize > 0 ? "Pending" : "Empty"}
          </Badge>
        </div>
      </Card>

      {/* Active Requests */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Activity className={`h-5 w-5 text-purple-500 ${activeRequests > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{activeRequests}/3</p>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={(activeRequests / 3) * 100} className="h-1" />
        </div>
      </Card>

      {/* Processing Rate */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Rate</p>
            <p className="text-2xl font-bold">{processingRate}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">docs/min</p>
        </div>
      </Card>

      {/* Elapsed Time */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Elapsed</p>
            <p className="text-2xl font-bold">{formatTime(elapsedSeconds)}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">
            {startTime ? 'Running' : 'Not started'}
          </p>
        </div>
      </Card>

      {/* Overall Progress */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Zap className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="text-2xl font-bold">{progressPercentage}%</p>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={progressPercentage} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{completedDocuments}/{totalDocuments}</span>
            {failedDocuments > 0 && (
              <span className="text-destructive">{failedDocuments} failed</span>
            )}
          </div>
        </div>
      </Card>

      {/* Throughput Status */}
      <Card className="p-4 col-span-1 md:col-span-2 lg:col-span-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Throughput Status</p>
            <p className="text-xs text-muted-foreground">
              Batching {activeRequests} concurrent requests with 500ms rate limiting
            </p>
          </div>
          <Badge 
            variant={
              throughputStatus === 'idle' ? 'secondary' :
              throughputStatus === 'high' ? 'default' : 'outline'
            }
          >
            {throughputStatus === 'idle' ? 'Idle' :
             throughputStatus === 'high' ? 'High Load' : 'Normal'}
          </Badge>
        </div>
        {activeRequests > 0 && (
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < activeRequests ? 'bg-primary animate-pulse' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
