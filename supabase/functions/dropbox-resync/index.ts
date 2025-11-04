import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateAccessToken } from "../_shared/dropbox-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DropboxEntry {
  ".tag": string;
  name: string;
  path_lower?: string;
  path_display?: string;
}

interface DropboxListResult {
  entries: DropboxEntry[];
  cursor: string;
  has_more: boolean;
}

/**
 * Extracts surname from Dropbox folder name
 * Examples:
 * - "GALARDA (v) BR (4)" → "GALARDA"
 * - "SMITH - notes" → "SMITH"
 * - "KOWALSKI" → "KOWALSKI"
 */
function extractSurname(folderName: string): string {
  // Split on space, parenthesis, or hyphen and take first part
  const surname = folderName.split(/[\s(-]/)[0].trim().toUpperCase();
  return surname;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const dropboxAppKey = Deno.env.get('DROPBOX_APP_KEY')!;
    const dropboxAppSecret = Deno.env.get('DROPBOX_APP_SECRET')!;
    const dropboxRefreshToken = Deno.env.get('DROPBOX_REFRESH_TOKEN')!;

    console.log('🔄 Starting complete Dropbox resync from scratch...');

    // Generate access token
    const accessToken = await generateAccessToken(
      dropboxAppKey,
      dropboxAppSecret,
      dropboxRefreshToken
    );

    console.log('🔍 Discovering ALL active categories from /CASES...');

    // Scan /CASES root to find EVERY category folder (excluding archived ###)
    const rootListResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '/CASES' }),
    });

    if (!rootListResponse.ok) {
      throw new Error(`Failed to list /CASES: ${await rootListResponse.text()}`);
    }

    const rootListData: DropboxListResult = await rootListResponse.json();
    const allCategories = rootListData.entries
      .filter(entry => entry[".tag"] === "folder")
      .map(entry => entry.name);

    // Filter OUT archived categories (starting with ###)
    const categoriesToProcess = allCategories.filter(cat => !cat.startsWith('###'));
    const skippedCategories = allCategories.filter(cat => cat.startsWith('###'));

    console.log(`📂 Found ${categoriesToProcess.length} active categories to sync:`, categoriesToProcess);
    if (skippedCategories.length > 0) {
      console.log(`⏭️  Skipping ${skippedCategories.length} archived categories:`, skippedCategories);
    }

    let totalCasesUpdated = 0;
    let totalDocumentsUpdated = 0;
    let casesNotFound: string[] = [];

    // Process each category
    for (const category of categoriesToProcess) {
      console.log(`\n📁 Processing category: ${category}`);
      
      // List client folders in this category
      const categoryPath = `/CASES/${category}`;
      const listResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: categoryPath }),
      });

      if (!listResponse.ok) {
        console.error(`Failed to list folder ${categoryPath}:`, await listResponse.text());
        continue;
      }

      const listData: DropboxListResult = await listResponse.json();
      const clientFolders = listData.entries.filter(entry => entry[".tag"] === "folder");

      console.log(`Found ${clientFolders.length} client folders in ${category}`);

      // Process each client folder
      for (const clientFolder of clientFolders) {
        const clientFolderName = clientFolder.name;
        const surname = extractSurname(clientFolderName);
        const newDropboxPath = `${categoryPath}/${clientFolderName}/`;

        console.log(`  Processing client: ${clientFolderName} → Surname: ${surname}`);

        // Try to find matching case by surname only
        const { data: matchingCases, error: caseError } = await supabase
          .from('cases')
          .select('id, client_code, client_name, dropbox_path')
          .or(`client_code.ilike.${surname},client_name.ilike.%${surname}%`);

        if (caseError || !matchingCases || matchingCases.length === 0) {
          console.log(`  ⚠️ No matching case found for ${clientFolderName} (surname: ${surname})`);
          casesNotFound.push(clientFolderName);
          continue;
        }

        // Prefer exact surname match on client_code, then client_name, then first match
        const matchedCase = matchingCases.find(c => 
          c.client_code?.toUpperCase() === surname ||
          c.client_name?.toUpperCase() === surname
        ) || matchingCases.find(c =>
          c.client_name?.toUpperCase().includes(surname)
        ) || matchingCases[0];

        console.log(`  ✅ Matched "${clientFolderName}" (surname: ${surname}) to case: ${matchedCase.client_name} (${matchedCase.client_code})`);

        // Update case dropbox_path
        const { error: updateCaseError } = await supabase
          .from('cases')
          .update({ dropbox_path: newDropboxPath })
          .eq('id', matchedCase.id);

        if (updateCaseError) {
          console.error(`  ❌ Failed to update case ${matchedCase.id}:`, updateCaseError);
          continue;
        }

        totalCasesUpdated++;

        // Update all documents for this case
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('id, name, dropbox_path')
          .eq('case_id', matchedCase.id);

        if (!docsError && documents) {
          for (const doc of documents) {
            // Extract the relative path from old dropbox_path
            const oldPath = doc.dropbox_path;
            let newDocPath = newDropboxPath;

            // Try to preserve subfolder structure (DOKUMENTY, POA, WNIOSKI, etc.)
            const pathParts = oldPath.split('/');
            if (pathParts.length > 3) {
              // Has subfolder structure
              const subfolder = pathParts[pathParts.length - 2];
              const filename = pathParts[pathParts.length - 1];
              newDocPath = `${newDropboxPath}${subfolder}/${filename}`;
            } else {
              // Direct file in case folder
              const filename = pathParts[pathParts.length - 1];
              newDocPath = `${newDropboxPath}${filename}`;
            }

            const { error: updateDocError } = await supabase
              .from('documents')
              .update({ 
                dropbox_path: newDocPath,
                // Reset OCR status if it was failed/queued/processing
                ocr_status: doc.dropbox_path.includes('failed') || doc.dropbox_path.includes('queued') 
                  ? 'queued' 
                  : undefined
              })
              .eq('id', doc.id);

            if (!updateDocError) {
              totalDocumentsUpdated++;
            }
          }
        }
      }
    }

    console.log('\n✨ Resync complete!');
    console.log(`📊 Cases updated: ${totalCasesUpdated}`);
    console.log(`📄 Documents updated: ${totalDocumentsUpdated}`);
    if (casesNotFound.length > 0) {
      console.log(`⚠️ Client folders not matched: ${casesNotFound.length}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        casesUpdated: totalCasesUpdated,
        documentsUpdated: totalDocumentsUpdated,
        casesNotFound: casesNotFound,
        message: 'Complete resync finished successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Resync error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
