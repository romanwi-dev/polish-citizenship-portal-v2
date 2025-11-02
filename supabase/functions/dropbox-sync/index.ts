// Dropbox sync edge function with OAuth refresh token support
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
  id: string;
}

interface DropboxListResult {
  entries: DropboxEntry[];
  cursor?: string;
  has_more: boolean;
}

// Global variable to store the current access token in memory
let currentAccessToken: string | null = null;

// Refresh the access token using the refresh token
async function refreshAccessToken(appKey: string, appSecret: string, refreshToken: string): Promise<string> {
  console.log("Refreshing Dropbox access token...");
  
  // Create Basic auth header
  const credentials = btoa(`${appKey}:${appSecret}`);
  
  const response = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} - ${error}`);
  }

  const data = await response.json();
  currentAccessToken = data.access_token;
  console.log("Access token refreshed successfully");
  
  return data.access_token;
}

// Parse case classification from folder name
function parseClassification(folderName: string): {
  status: string;
  generation: string | null;
  isVip: boolean;
} {
  const name = folderName.toLowerCase();
  
  if (name.includes("###bad")) return { status: "bad", generation: null, isVip: false };
  if (name.includes("###failed")) return { status: "failed", generation: null, isVip: false };
  if (name.includes("###finished")) return { status: "finished", generation: null, isVip: false };
  if (name.includes("###name change")) return { status: "name_change", generation: null, isVip: false };
  if (name.includes("###on hold")) return { status: "on_hold", generation: null, isVip: false };
  if (name.includes("###suspended")) return { status: "suspended", generation: null, isVip: false };
  if (name.includes("###other")) return { status: "other", generation: null, isVip: false };
  if (name.includes("##leads")) return { status: "lead", generation: null, isVip: false };
  if (name.includes("v i p") || name.includes("vip")) return { status: "active", generation: "vip", isVip: true };
  if (name.includes("3. third")) return { status: "active", generation: "third", isVip: false };
  if (name.includes("4. fourth")) return { status: "active", generation: "fourth", isVip: false };
  if (name.includes("5. fifth")) return { status: "active", generation: "fifth", isVip: false };
  if (name.includes("10. ten")) return { status: "active", generation: "ten", isVip: false };
  if (name.includes("global")) return { status: "active", generation: "global", isVip: false };
  if (name.includes("work")) return { status: "active", generation: "work", isVip: false };
  
  return { status: "other", generation: "other", isVip: false };
}

// Extract client code from folder name (e.g., "ALBERT (v-...-D-3-3'500)")
function extractClientCode(folderName: string): string | null {
  const match = folderName.match(/\((v-.*?)\)/);
  return match ? match[1] : null;
}

// Clean client name by removing code suffix
function cleanClientName(folderName: string): string {
  return folderName.replace(/\s*\(.*?\)\s*$/, '').trim();
}

async function listDropboxFolder(
  accessToken: string,
  path: string,
  appKey: string,
  appSecret: string,
  refreshToken: string,
  retry = true
): Promise<DropboxEntry[]> {
  const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: path,
      recursive: false,
      include_mounted_folders: false,
    }),
  });

  // If we get a 401 and haven't retried yet, refresh the token and retry
  if (response.status === 401 && retry) {
    console.log("Access token expired, refreshing...");
    const newToken = await refreshAccessToken(appKey, appSecret, refreshToken);
    return listDropboxFolder(newToken, path, appKey, appSecret, refreshToken, false);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dropbox API error: ${response.status} - ${error}`);
  }

  const result: DropboxListResult = await response.json();
  return result.entries;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const dropboxAppKey = Deno.env.get("DROPBOX_APP_KEY");
    const dropboxAppSecret = Deno.env.get("DROPBOX_APP_SECRET");
    const dropboxRefreshToken = Deno.env.get("DROPBOX_REFRESH_TOKEN");
    
    if (!dropboxAppKey || !dropboxAppSecret || !dropboxRefreshToken) {
      throw new Error("Missing Dropbox credentials: DROPBOX_APP_KEY, DROPBOX_APP_SECRET, and DROPBOX_REFRESH_TOKEN required");
    }

    // Generate fresh access token on-demand
    currentAccessToken = await generateAccessToken(dropboxAppKey, dropboxAppSecret, dropboxRefreshToken);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { syncType = "full" } = await req.json();

    // Create sync log
    const { data: syncLog, error: logError } = await supabase
      .from("sync_logs")
      .insert({
        sync_type: syncType,
        status: "started",
        metadata: { started_at: new Date().toISOString() },
      })
      .select()
      .single();

    if (logError) {
      console.error("Failed to create sync log:", logError);
      throw logError;
    }

    console.log("Starting Dropbox sync...");
    let processedCount = 0;
    let failedCount = 0;

    // Only process active case folders (skip finished, failed, leads, etc.)
    const activeFolders = [
      "###BAD CASES",
      "###ON HOLD",
      "###SUSPENDED",
      "3. THIRD",
      "4. FOURTH",
      "5. FIFTH",
      "10. TEN",
      "GLOBAL",
      "V I P"
    ];

    // Exclude non-client folders
    const nonClientFolders = [
      "TRANSLATIONS",
      "SEARCH",
      "NAME CHANGE",
      "WSC",
      "USC",
      "POA"
    ];

    // List classification folders in /CASES
    const classificationFolders = await listDropboxFolder(
      currentAccessToken!,
      "/CASES",
      dropboxAppKey,
      dropboxAppSecret,
      dropboxRefreshToken
    );
    console.log(`Found ${classificationFolders.length} classification folders`);

    for (const classFolder of classificationFolders) {
      if (classFolder[".tag"] !== "folder") continue;

      // Skip folders that are not in the active list
      const isActiveFolder = activeFolders.some(activeFolder => 
        classFolder.name.toUpperCase().includes(activeFolder.toUpperCase())
      );
      
      if (!isActiveFolder) {
        console.log(`Skipping inactive folder: ${classFolder.name}`);
        continue;
      }

      const classification = parseClassification(classFolder.name);
      console.log(`Processing ${classFolder.name} (${classification.status})`);

      try {
        // List client folders within this classification
        const clientFolders = await listDropboxFolder(
          currentAccessToken!,
          classFolder.path_display,
          dropboxAppKey,
          dropboxAppSecret,
          dropboxRefreshToken
        );
        
        for (const clientFolder of clientFolders) {
          if (clientFolder[".tag"] !== "folder") continue;

          // Skip non-client folders
          const isNonClientFolder = nonClientFolders.some(nonClient =>
            clientFolder.name.toUpperCase().includes(nonClient.toUpperCase())
          );

          if (isNonClientFolder) {
            console.log(`Skipping non-client folder: ${clientFolder.name}`);
            continue;
          }

          try {
            const clientName = cleanClientName(clientFolder.name);
            const clientCode = extractClientCode(clientFolder.name);

            // Check if case already exists
            const { data: existingCase } = await supabase
              .from("cases")
              .select("id, dropbox_path")
              .eq("dropbox_path", clientFolder.path_display)
              .maybeSingle();

            if (existingCase) {
              // Update existing case
              await supabase
                .from("cases")
                .update({
                  client_name: clientName,
                  client_code: clientCode,
                  status: classification.status,
                  generation: classification.generation,
                  is_vip: classification.isVip,
                  dropbox_folder_id: clientFolder.id,
                  last_synced_at: new Date().toISOString(),
                })
                .eq("id", existingCase.id);

              console.log(`Updated case: ${clientName}`);
            } else {
              // Create new case
              const { data: newCase, error: caseError } = await supabase
                .from("cases")
                .insert({
                  client_name: clientName,
                  client_code: clientCode,
                  status: classification.status,
                  generation: classification.generation,
                  is_vip: classification.isVip,
                  dropbox_path: clientFolder.path_display,
                  dropbox_folder_id: clientFolder.id,
                  last_synced_at: new Date().toISOString(),
                })
                .select()
                .single();

              if (caseError) {
                console.error(`Failed to create case ${clientName}:`, caseError);
                failedCount++;
                continue;
              }

              console.log(`Created case: ${clientName}`);

              // List documents in the client folder
              const documents = await listDropboxFolder(
                currentAccessToken!,
                clientFolder.path_display,
                dropboxAppKey,
                dropboxAppSecret,
                dropboxRefreshToken
              );
              
              for (const doc of documents) {
                if (doc[".tag"] === "file") {
                  try {
                    const fileExtension = doc.name.split(".").pop()?.toLowerCase() || "";
                    
                    // Determine if document should be queued for OCR
                    const isOCRable = ["pdf", "jpg", "jpeg", "png", "gif", "tiff", "bmp"].includes(fileExtension);
                    const ocrStatus = isOCRable ? "queued" : null; // Changed from 'pending' to 'queued'
                    
                    await supabase.from("documents").insert({
                      case_id: newCase.id,
                      name: doc.name,
                      type: fileExtension === "pdf" ? "pdf" : "other",
                      file_extension: fileExtension,
                      dropbox_path: doc.path_display,
                      dropbox_file_id: doc.id,
                      ocr_status: ocrStatus,
                    });
                  } catch (docError) {
                    console.error(`Failed to create document ${doc.name}:`, docError);
                    failedCount++;
                  }
                }
              }
            }

            processedCount++;
          } catch (clientError) {
            console.error(`Failed to process client ${clientFolder.name}:`, clientError);
            failedCount++;
          }
        }
      } catch (classError) {
        console.error(`Failed to process classification ${classFolder.name}:`, classError);
        failedCount++;
      }
    }

    // No need to queue - documents are already created with 'queued' status
    console.log(`Documents created with OCR status already set to 'queued'`);

    // Update sync log
    await supabase
      .from("sync_logs")
      .update({
        status: "completed",
        items_processed: processedCount,
        items_failed: failedCount,
        metadata: {
          started_at: syncLog.created_at,
          completed_at: new Date().toISOString(),
          documents_queued_for_ocr: 0, // Documents are created with 'queued' status directly
        },
      })
      .eq("id", syncLog.id);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        failed: failedCount,
        message: `Sync completed: ${processedCount} cases processed, ${failedCount} failed`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
