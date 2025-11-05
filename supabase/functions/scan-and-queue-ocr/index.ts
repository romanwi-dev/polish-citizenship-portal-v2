import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DropboxEntry {
  ".tag": string;
  name: string;
  path_display: string;
  path_lower: string;
  id?: string;
}

interface DropboxListResult {
  entries: DropboxEntry[];
  cursor?: string;
  has_more: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { folderPath, caseId } = await req.json();

    if (!folderPath) {
      throw new Error("folderPath is required");
    }

    console.log(`Scanning Dropbox folder: ${folderPath}`);

    // Get Dropbox credentials from environment
    const appKey = Deno.env.get("DROPBOX_APP_KEY");
    const appSecret = Deno.env.get("DROPBOX_APP_SECRET");
    const refreshToken = Deno.env.get("DROPBOX_REFRESH_TOKEN");

    if (!appKey || !appSecret || !refreshToken) {
      throw new Error("Missing Dropbox credentials in environment");
    }

    // Generate Dropbox access token
    const accessToken = await generateAccessToken(appKey, appSecret, refreshToken);
    console.log("Dropbox access token generated");

    // List all files in the folder (recursive)
    const allFiles: DropboxEntry[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;

    // Initial request
    const listResponse = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: folderPath,
        recursive: true,
        include_deleted: false,
      }),
    });

    if (!listResponse.ok) {
      const error = await listResponse.text();
      throw new Error(`Dropbox list failed: ${listResponse.status} - ${error}`);
    }

    const listData: DropboxListResult = await listResponse.json();
    allFiles.push(...listData.entries.filter(e => e[".tag"] === "file"));
    cursor = listData.cursor;
    hasMore = listData.has_more;

    // Continue fetching if there are more files
    while (hasMore && cursor) {
      const continueResponse = await fetch("https://api.dropboxapi.com/2/files/list_folder/continue", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cursor }),
      });

      if (!continueResponse.ok) {
        console.error("Failed to continue listing, stopping pagination");
        break;
      }

      const continueData: DropboxListResult = await continueResponse.json();
      allFiles.push(...continueData.entries.filter(e => e[".tag"] === "file"));
      cursor = continueData.cursor;
      hasMore = continueData.has_more;
    }

    console.log(`Found ${allFiles.length} files in Dropbox`);

    // Determine case ID
    let targetCaseId = caseId;
    if (!targetCaseId) {
      // Get first available case as fallback
      const { data: cases } = await supabase
        .from("cases")
        .select("id")
        .limit(1)
        .single();
      
      if (cases) {
        targetCaseId = cases.id;
      } else {
        throw new Error("No case found - please create a case first");
      }
    }

    // Filter for OCR-able files
    const ocrableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp'];
    const ocrableFiles = allFiles.filter(file => {
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return ocrableExtensions.includes(ext);
    });

    console.log(`${ocrableFiles.length} files are OCR-able`);

    // Create document records with CORRECT paths
    const inserted = [];
    const failed = [];

    for (const file of ocrableFiles) {
      try {
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        
        // Insert with EXACT Dropbox path
        const { data, error } = await supabase
          .from("documents")
          .insert({
            case_id: targetCaseId,
            name: file.name,
            dropbox_path: file.path_display, // EXACT path from Dropbox
            dropbox_file_id: file.id,
            file_extension: ext,
            ocr_status: "queued",
            ocr_retry_count: 0,
            category: "scanned_document",
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to insert ${file.name}:`, error);
          failed.push({ name: file.name, error: error.message });
        } else {
          console.log(`✓ Queued: ${file.name}`);
          inserted.push(data);
        }
      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err);
        failed.push({ name: file.name, error: err.message });
      }
    }

    // Trigger OCR worker
    try {
      console.log("Triggering OCR worker...");
      await supabase.functions.invoke("ocr-worker", {
        body: { trigger: "scan-complete" },
      });
    } catch (err: any) {
      console.error("Failed to trigger OCR worker:", err);
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanned: allFiles.length,
        ocrable: ocrableFiles.length,
        inserted: inserted.length,
        failed: failed.length,
        documents: inserted,
        errors: failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Scan error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
