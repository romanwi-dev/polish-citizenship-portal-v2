import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { DeleteArchivedDialog } from "./DeleteArchivedDialog";

interface CategoryStats {
  category: string;
  cases: number;
  documents: number;
}

export function ArchivedCategoriesManager() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['archived-categories-stats'],
    queryFn: async () => {
      const archivedCategories = ['###FINISHED', '###FAILED', '###ON HOLD', '###BAD CASES', '###OTHER'];
      
      const statsPromises = archivedCategories.map(async (category) => {
        const { count: casesCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .like('dropbox_path', `/CASES/${category}/%`);

        const { data: cases } = await supabase
          .from('cases')
          .select('id')
          .like('dropbox_path', `/CASES/${category}/%`);

        const caseIds = cases?.map(c => c.id) || [];
        
        const { count: docsCount } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .in('case_id', caseIds);

        return {
          category,
          cases: casesCount || 0,
          documents: docsCount || 0
        };
      });

      const results = await Promise.all(statsPromises);
      return results.filter(r => r.cases > 0);
    }
  });

  const totalCases = stats?.reduce((sum, s) => sum + s.cases, 0) || 0;
  const totalDocuments = stats?.reduce((sum, s) => sum + s.documents, 0) || 0;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-archived-cases');
      
      if (error) throw error;

      setBackupData(data.backup);

      // Download JSON file
      const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Backup created successfully', {
        description: `Exported ${totalCases} cases and ${totalDocuments} documents`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export backup');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading archived categories...</div>;
  }

  if (!stats || stats.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No archived categories found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Archived Categories Overview</h3>
            <p className="text-sm text-muted-foreground">
              Manage cases in archived categories (###FINISHED, ###FAILED, etc.)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Backup
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              disabled={!backupData}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Archived
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="p-4 bg-muted/50">
              <div className="text-2xl font-bold">{totalCases}</div>
              <div className="text-sm text-muted-foreground">Total Cases</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-2xl font-bold">{stats.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </Card>
          </div>

          <div className="space-y-2">
            {stats.map((stat) => (
              <div key={stat.category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="font-mono text-sm">{stat.category}</span>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{stat.cases} cases</span>
                  <span>{stat.documents} documents</span>
                </div>
              </div>
            ))}
          </div>

          {!backupData && (
            <div className="flex items-start gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-500 mb-1">Backup Required</p>
                <p className="text-muted-foreground">
                  Export a backup before deletion is enabled. This ensures data safety.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <DeleteArchivedDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        stats={stats}
        totalCases={totalCases}
        totalDocuments={totalDocuments}
        backupCreated={!!backupData}
      />
    </div>
  );
}
