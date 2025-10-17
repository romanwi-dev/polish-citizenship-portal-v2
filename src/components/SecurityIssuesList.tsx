import { AlertTriangle, Info, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface SecurityIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  remediation: string;
  affected_items?: string[];
}

interface SecurityIssuesListProps {
  issues: SecurityIssue[];
}

export default function SecurityIssuesList({ issues }: SecurityIssuesListProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'high': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'low': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleItem = (index: number) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenItems(newOpen);
  };

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, SecurityIssue[]>);

  if (issues.length === 0) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="py-8 text-center">
          <div className="text-green-600 text-lg font-semibold flex items-center justify-center gap-2">
            <XCircle className="h-6 w-6" />
            No security issues detected! 🎉
          </div>
          <p className="text-muted-foreground mt-2">Your application passes all security checks.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {getSeverityIcon(categoryIssues[0].severity)}
              {category}
              <Badge variant="outline" className="ml-auto">
                {categoryIssues.length} {categoryIssues.length === 1 ? 'issue' : 'issues'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryIssues.map((issue, idx) => {
              const globalIdx = issues.indexOf(issue);
              const isOpen = openItems.has(globalIdx);
              
              return (
                <Collapsible key={globalIdx} open={isOpen} onOpenChange={() => toggleItem(globalIdx)}>
                  <div className={`border rounded-lg p-4 ${getSeverityColor(issue.severity)}`}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 text-left">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <h4 className="font-semibold">{issue.title}</h4>
                            <p className="text-sm mt-1 opacity-90">{issue.description}</p>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="h-5 w-5 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 flex-shrink-0" />}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-4 pt-4 border-t border-current/20">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-sm mb-1">Remediation:</h5>
                          <p className="text-sm opacity-90">{issue.remediation}</p>
                        </div>
                        
                        {issue.affected_items && issue.affected_items.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-sm mb-1">Affected Items:</h5>
                            <div className="flex flex-wrap gap-1">
                              {issue.affected_items.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}