import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * PDF Cleanup Job - PHASE A Critical Fix
 * Runs daily at 2 AM to delete old PDFs and prevent storage bloat
 * 
 * Retention Policy:
 * - Delete PDFs older than 30 days
 * - Keep only latest locked version per document
 * - Log cleanup metrics
 */

interface CleanupStats {
  totalScanned: number;
  deletedOld: number;
  deletedDuplicates: number;
  keptLocked: number;
  errors: number;
  bytesFreed: number;
}

Deno.serve(async () => {
  const startTime = Date.now();
  const stats: CleanupStats = {
    totalScanned: 0,
    deletedOld: 0,
    deletedDuplicates: 0,
    keptLocked: 0,
    errors: 0,
    bytesFreed: 0
  };

  try {
    console.log('[PDF Cleanup] Starting cleanup job...');
    
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(url, key);
    const bucket = 'generated-pdfs';
    
    // Retention period: 30 days
    const cutoffDate = Date.now() - 30 * 24 * 60 * 60 * 1000;
    console.log(`[PDF Cleanup] Cutoff date: ${new Date(cutoffDate).toISOString()}`);

    // Get all case directories
    const { data: cases, error: listError } = await sb.storage
      .from(bucket)
      .list('', { limit: 1000 });

    if (listError) {
      console.error('[PDF Cleanup] Failed to list cases:', listError);
      return new Response(JSON.stringify({ error: listError.message }), { status: 500 });
    }

    console.log(`[PDF Cleanup] Found ${cases?.length || 0} case directories`);

    // Process each case directory
    for (const dir of cases ?? []) {
      if (!dir?.name) continue;

      try {
        await cleanupCaseDirectory(sb, bucket, dir.name, cutoffDate, stats);
      } catch (error) {
        console.error(`[PDF Cleanup] Error processing ${dir.name}:`, error);
        stats.errors++;
      }
    }

    // Log final stats
    const duration = Date.now() - startTime;
    console.log('[PDF Cleanup] Cleanup completed:', {
      ...stats,
      durationMs: duration,
      durationMin: Math.round(duration / 60000)
    });

    // Store metrics in database
    await logCleanupMetrics(sb, stats, duration);

    return new Response(JSON.stringify({
      success: true,
      stats,
      duration
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[PDF Cleanup] Fatal error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      stats
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Clean up PDFs in a single case directory
 */
async function cleanupCaseDirectory(
  sb: any,
  bucket: string,
  caseDir: string,
  cutoffDate: number,
  stats: CleanupStats
): Promise<void> {
  const allFiles: any[] = [];
  let offset = 0;
  const pageSize = 1000;

  // Fetch all files in directory (paginated)
  while (true) {
    const { data: files, error } = await sb.storage
      .from(bucket)
      .list(caseDir, { limit: pageSize, offset });

    if (error) {
      console.error(`[PDF Cleanup] Error listing files in ${caseDir}:`, error);
      stats.errors++;
      break;
    }

    if (!files || files.length === 0) break;

    allFiles.push(...files);
    stats.totalScanned += files.length;
    offset += files.length;

    if (files.length < pageSize) break;
  }

  // Group files by document (locked vs unlocked versions)
  const fileGroups = new Map<string, any[]>();
  
  for (const file of allFiles) {
    // Extract document ID from filename (e.g., "doc-123-locked.pdf" or "doc-123.pdf")
    const baseId = file.name.replace(/-locked\.pdf$/, '.pdf').replace(/\.pdf$/, '');
    
    if (!fileGroups.has(baseId)) {
      fileGroups.set(baseId, []);
    }
    fileGroups.get(baseId)!.push(file);
  }

  // Process each file group
  const toDelete: string[] = [];

  for (const [baseId, files] of fileGroups) {
    // Find locked version
    const lockedFile = files.find(f => f.name.includes('-locked.pdf'));
    
    if (lockedFile) {
      // Keep locked version, delete all others
      for (const file of files) {
        if (file.name !== lockedFile.name) {
          toDelete.push(`${caseDir}/${file.name}`);
          stats.deletedDuplicates++;
        }
      }
      stats.keptLocked++;
    } else {
      // No locked version - delete old files based on date
      for (const file of files) {
        if (file.updated_at) {
          const fileDate = new Date(file.updated_at).getTime();
          
          if (fileDate < cutoffDate) {
            toDelete.push(`${caseDir}/${file.name}`);
            stats.deletedOld++;
            
            // Estimate bytes freed (rough estimate)
            if (file.metadata?.size) {
              stats.bytesFreed += file.metadata.size;
            }
          }
        }
      }
    }
  }

  // Delete files in batches of 100
  if (toDelete.length > 0) {
    console.log(`[PDF Cleanup] Deleting ${toDelete.length} files from ${caseDir}`);
    
    const batchSize = 100;
    for (let i = 0; i < toDelete.length; i += batchSize) {
      const batch = toDelete.slice(i, i + batchSize);
      const { error } = await sb.storage.from(bucket).remove(batch);
      
      if (error) {
        console.error(`[PDF Cleanup] Error deleting batch:`, error);
        stats.errors++;
      }
    }
  }
}

/**
 * Log cleanup metrics to database for monitoring
 */
async function logCleanupMetrics(
  sb: any,
  stats: CleanupStats,
  duration: number
): Promise<void> {
  try {
    await sb.from('pdf_cleanup_logs').insert({
      total_scanned: stats.totalScanned,
      deleted_old: stats.deletedOld,
      deleted_duplicates: stats.deletedDuplicates,
      kept_locked: stats.keptLocked,
      errors: stats.errors,
      bytes_freed: stats.bytesFreed,
      duration_ms: duration,
      cleanup_date: new Date().toISOString()
    });
  } catch (error) {
    console.error('[PDF Cleanup] Failed to log metrics:', error);
    // Don't fail the cleanup job if logging fails
  }
}
