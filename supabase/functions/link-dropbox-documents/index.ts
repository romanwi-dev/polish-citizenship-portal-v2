import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DropboxFile {
  name: string;
  link: string;
  bytes: number;
  icon: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { caseId, files, dropboxBasePath } = await req.json() as {
      caseId: string;
      files: DropboxFile[];
      dropboxBasePath: string;
    };

    if (!caseId || !files || files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'caseId and files are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Linking ${files.length} Dropbox files for case ${caseId}`);

    const linkedDocuments: any[] = [];
    const errors: any[] = [];

    // Process each file
    for (const file of files) {
      try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const dropboxPath = `${dropboxBasePath}/${file.name}`;

        // Check if document already exists
        const { data: existingDoc } = await supabase
          .from('documents')
          .select('id, version')
          .eq('case_id', caseId)
          .eq('name', file.name)
          .is('deleted_at', null)
          .single();

        let documentId: string;

        if (existingDoc) {
          // Update existing document - reset OCR status to reprocess
          const { data: updated, error: updateError } = await supabase
            .from('documents')
            .update({
              dropbox_path: dropboxPath,
              ocr_status: 'queued',
              ocr_retry_count: 0,
              ocr_error_message: null,
              version: existingDoc.version + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingDoc.id)
            .select()
            .single();

          if (updateError) {
            errors.push({ file: file.name, error: updateError.message });
            continue;
          }

          documentId = existingDoc.id;
          console.log(`Updated existing document: ${file.name}`);
        } else {
          // Create new document
          const { data: newDoc, error: createError } = await supabase
            .from('documents')
            .insert({
              case_id: caseId,
              name: file.name,
              dropbox_path: dropboxPath,
              file_extension: fileExtension,
              ocr_status: 'queued',
              version: 1
            })
            .select()
            .single();

          if (createError) {
            errors.push({ file: file.name, error: createError.message });
            continue;
          }

          documentId = newDoc.id;
          console.log(`Created new document: ${file.name}`);
        }

        linkedDocuments.push({ id: documentId, name: file.name });

      } catch (error) {
        errors.push({ 
          file: file.name, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    // Log the action
    await supabase.from('hac_logs').insert({
      case_id: caseId,
      action_type: 'dropbox_files_linked',
      action_description: `Linked ${linkedDocuments.length} files from Dropbox`,
      field_changed: 'documents',
      new_value: linkedDocuments.map(d => d.name).join(', ')
    });

    return new Response(
      JSON.stringify({
        success: true,
        linked_count: linkedDocuments.length,
        error_count: errors.length,
        documents: linkedDocuments,
        errors: errors
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
