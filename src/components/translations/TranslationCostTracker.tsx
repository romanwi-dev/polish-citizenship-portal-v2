import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, FileText, CheckCircle } from "lucide-react";

interface TranslationCostTrackerProps {
  caseId?: string;
}

export const TranslationCostTracker = ({ caseId }: TranslationCostTrackerProps) => {
  const { data: costs } = useQuery({
    queryKey: ['translation-costs', caseId],
    queryFn: async () => {
      let query = supabase
        .from('translation_requests')
        .select('*');
      
      if (caseId) {
        query = query.eq('case_id', caseId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const estimated = data?.reduce((sum, req) => sum + (req.estimated_cost_pln || 0), 0) || 0;
      const actual = data?.reduce((sum, req) => sum + (req.actual_cost_pln || 0), 0) || 0;
      const completed = data?.filter(req => req.status === 'completed').length || 0;
      const total = data?.length || 0;

      // Group by language pair
      const byLanguagePair: Record<string, { estimated: number; actual: number; count: number }> = {};
      data?.forEach(req => {
        const pair = `${req.source_language}→${req.target_language}`;
        if (!byLanguagePair[pair]) {
          byLanguagePair[pair] = { estimated: 0, actual: 0, count: 0 };
        }
        byLanguagePair[pair].estimated += req.estimated_cost_pln || 0;
        byLanguagePair[pair].actual += req.actual_cost_pln || 0;
        byLanguagePair[pair].count += 1;
      });

      return {
        estimatedTotal: estimated,
        actualTotal: actual,
        completedJobs: completed,
        totalJobs: total,
        byLanguagePair
      };
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{costs?.estimatedTotal.toFixed(2)} PLN</div>
          <p className="text-xs text-muted-foreground mt-1">Total estimated</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actual Cost</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{costs?.actualTotal.toFixed(2)} PLN</div>
          <p className="text-xs text-muted-foreground mt-1">
            {costs?.actualTotal && costs?.estimatedTotal 
              ? `${((costs.actualTotal / costs.estimatedTotal) * 100).toFixed(0)}% of estimate`
              : 'No data'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Translation Jobs</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{costs?.totalJobs || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">Total requests</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{costs?.completedJobs || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {costs?.totalJobs 
              ? `${((costs.completedJobs / costs.totalJobs) * 100).toFixed(0)}% complete`
              : 'No jobs'}
          </p>
        </CardContent>
      </Card>

      {costs?.byLanguagePair && Object.keys(costs.byLanguagePair).length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cost by Language Pair</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(costs.byLanguagePair).map(([pair, data]) => (
                <div key={pair} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pair}</span>
                    <span className="text-sm text-muted-foreground">({data.count} jobs)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{data.actual.toFixed(2)} PLN</div>
                    <div className="text-xs text-muted-foreground">
                      est: {data.estimated.toFixed(2)} PLN
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
