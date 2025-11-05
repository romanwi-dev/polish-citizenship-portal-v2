import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FolderSync, BarChart3, Settings, RefreshCw, Trash2, Archive } from "lucide-react";
import { DropboxSyncStats } from "@/components/dropbox/DropboxSyncStats";
import { SyncHistoryLog } from "@/components/dropbox/SyncHistoryLog";
import { ResyncConfirmationDialog } from "@/components/cases/ResyncConfirmationDialog";
import { CleanupDatabaseDialog } from "@/components/cases/CleanupDatabaseDialog";
import { ArchivedCategoriesManager } from "@/components/dropbox/ArchivedCategoriesManager";
import { DropboxPathVerifier } from "@/components/admin/DropboxPathVerifier";
import DropboxMigration from "./DropboxMigration";

const DropboxWorkflow = () => {
  const [showResyncDialog, setShowResyncDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);

  const handleProceedToCleanup = () => {
    setShowResyncDialog(false);
    setShowCleanupDialog(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderSync className="h-8 w-8" />
            Dropbox Sync Workflow
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage Dropbox folder synchronization, database cleanup, and migrations
          </p>
        </div>

        <Tabs defaultValue="operations" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="operations" className="gap-2">
              <FolderSync className="h-4 w-4" />
              Operations Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Sync Analytics
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="gap-2">
              <Settings className="h-4 w-4" />
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="migration" className="gap-2">
              <Settings className="h-4 w-4" />
              Migration Tools
            </TabsTrigger>
            <TabsTrigger value="archived" className="gap-2">
              <Archive className="h-4 w-4" />
              Archived Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="mt-6 space-y-6">
            {/* Quick Stats */}
            <DropboxSyncStats />

            {/* Primary Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-6 border rounded-lg bg-card space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Resync with Dropbox</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan Dropbox folders and update database paths for all cases and documents. 
                    This process will match folder names to client surnames and sync paths.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={() => setShowResyncDialog(true)}
                    className="w-full"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start Resync
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  <p><strong>What this does:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Scans 7 active Dropbox categories</li>
                    <li>Matches folders to cases by surname</li>
                    <li>Updates dropbox_path for cases & documents</li>
                    <li>Shows unmatched folders for review</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border rounded-lg bg-card space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <h3 className="text-lg font-semibold">Clean Database</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remove orphan cases that don't have valid Dropbox paths. 
                    Run resync first to ensure paths are up-to-date before cleaning.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={() => setShowCleanupDialog(true)}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean Database
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  <p><strong>What this does:</strong></p>
                  <ul className="list-disc list-inside ml-2 space-y-0.5">
                    <li>Finds cases with null/invalid Dropbox paths</li>
                    <li>Shows preview before deletion</li>
                    <li>Requires confirmation to execute</li>
                    <li>Logs all deletions for audit trail</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommended Workflow */}
            <div className="p-4 bg-muted/50 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                💡 Recommended Workflow
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li><strong>Run Resync</strong> – Updates all case/document paths from Dropbox</li>
                <li><strong>Review Unmatched Folders</strong> – Check which folders didn't match any cases</li>
                <li><strong>Run Clean Database</strong> – Removes cases with invalid Dropbox paths</li>
                <li><strong>Check Analytics</strong> – Review sync history and statistics</li>
              </ol>
            </div>

            {/* Current Status Info */}
            <div className="text-xs text-muted-foreground p-4 border rounded-lg bg-card/50">
              <p><strong>Active Dropbox Categories Being Scanned:</strong></p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['POTENTIAL', 'VIP+', 'VIP', 'CITIZENS-X', 'GLOBAL-P', 'FOURTH', 'FIFTH'].map(cat => (
                  <span key={cat} className="px-2 py-1 bg-primary/10 rounded text-primary font-mono text-xs">
                    {cat}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-muted-foreground">
                Folders in other categories (###ON HOLD, ###BAD CASES, ###FINISHED, etc.) are not scanned 
                and will appear as "unmatched" during resync.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <SyncHistoryLog />
          </TabsContent>

          <TabsContent value="diagnostics" className="mt-6">
            <DropboxPathVerifier />
          </TabsContent>

          <TabsContent value="migration" className="mt-6">
            <DropboxMigration />
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <ArchivedCategoriesManager />
          </TabsContent>
        </Tabs>
      </div>

      <ResyncConfirmationDialog
        open={showResyncDialog}
        onOpenChange={setShowResyncDialog}
        onProceedToCleanup={handleProceedToCleanup}
      />

      <CleanupDatabaseDialog
        open={showCleanupDialog}
        onOpenChange={setShowCleanupDialog}
      />
    </AdminLayout>
  );
};

export default DropboxWorkflow;
