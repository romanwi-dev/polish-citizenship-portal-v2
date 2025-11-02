import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrganizeRequest {
  documentId: string;
  caseId: string;
  clientCode: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { documentId, caseId, clientCode }: OrganizeRequest = await req.json();

    if (!documentId || !caseId || !clientCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error('Document not found');
    }

    // If already organized, skip
    if (document.folder_category && document.subfolder_path) {
      console.log(`Document ${documentId} already organized`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Document already organized',
          folder: document.folder_category,
          subfolder: document.subfolder_path
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine organization based on OCR data
    const folderCategory = document.folder_category || determineFolderCategory(document);
    const subfolderPath = document.subfolder_path || determineSubfolderPath(document);
    
    // Generate new Dropbox path
    const currentPath = document.dropbox_path;
    const filename = document.ai_generated_name || currentPath.split('/').pop();
    const newPath = `/CASES/${clientCode}/${folderCategory}${subfolderPath}${filename}`;

    console.log(`Organizing document: ${currentPath} → ${newPath}`);

    // In a real implementation, you would:
    // 1. Create folder structure in Dropbox if it doesn't exist
    // 2. Move file from old path to new path
    // 3. Update database with new path
    
    // For now, we'll just update the database with the organizational metadata
    // The actual Dropbox move would require the Dropbox API integration
    
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        folder_category: folderCategory,
        subfolder_path: subfolderPath,
        // dropbox_path: newPath, // Uncomment when Dropbox move is implemented
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Document ${documentId} organized successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        folder: folderCategory,
        subfolder: subfolderPath,
        newPath: newPath,
        message: 'Document organized (path update pending Dropbox integration)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Document organization failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Organization failed'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function determineFolderCategory(document: any): string {
  const docType = document.document_type || document.ai_detected_type;
  
  // Archive documents (from Polish/Russian archives)
  if (document.category === 'archive' || 
      document.language === 'OLD_RUSSIAN' ||
      (document.ocr_data?.detected_era && document.ocr_data.detected_era.includes('pre_1918'))) {
    return '02_archive_documents';
  }
  
  // Local documents (from client's country)
  if (docType === 'naturalization' || 
      document.language === 'EN' ||
      (document.ocr_data?.detected_language === 'ENGLISH')) {
    return '03_local_documents';
  }
  
  // Government correspondence
  if (docType === 'wsc_letter' || document.category === 'government') {
    return '06_government_correspondence';
  }
  
  // Generated forms
  if (docType === 'poa' || docType === 'oby_application') {
    return '05_generated_forms';
  }
  
  // Translations
  if (document.is_translated || document.category === 'translation') {
    return '04_translations';
  }
  
  // Default: Family documents
  return '01_family_docs';
}

function determineSubfolderPath(document: any): string {
  const personType = document.person_type || document.ai_detected_person;
  const folderCategory = document.folder_category || determineFolderCategory(document);
  
  // For family documents, organize by person
  if (folderCategory === '01_family_docs') {
    const personFolders: Record<string, string> = {
      'AP': 'AP_applicant/',
      'SPOUSE': 'SPOUSE/',
      'F': 'F_father/',
      'M': 'M_mother/',
      'PGF': 'PGF_paternal_grandfather/',
      'PGM': 'PGM_paternal_grandmother/',
      'MGF': 'MGF_maternal_grandfather/',
      'MGM': 'MGM_maternal_grandmother/'
    };
    
    const personFolder = personFolders[personType] || 'other/';
    
    // Determine if it's original, translation, or certified copy
    if (document.is_translated) {
      return `${personFolder}translations/`;
    } else if (document.category === 'certified_copy') {
      return `${personFolder}certified_copies/`;
    } else {
      return `${personFolder}originals/`;
    }
  }
  
  // For archive documents, organize by country
  if (folderCategory === '02_archive_documents') {
    if (document.language === 'POLISH' || document.language === 'OLD_POLISH') {
      return 'polish_archives/';
    } else if (document.language === 'OLD_RUSSIAN' || document.language === 'RUSSIAN') {
      return 'russian_archives/';
    } else if (document.language === 'UKRAINIAN') {
      return 'ukrainian_archives/';
    }
    return 'other_archives/';
  }
  
  // For local documents, organize by country
  if (folderCategory === '03_local_documents') {
    // Extract country from OCR data if available
    const country = document.ocr_data?.extracted_data?.issuing_country || 'USA';
    return `${country}/`;
  }
  
  // For translations, organize by target language
  if (folderCategory === '04_translations') {
    return document.language === 'PL' ? 'to_polish/' : 'to_english/';
  }
  
  // For generated forms
  if (folderCategory === '05_generated_forms') {
    const docType = document.document_type || document.ai_detected_type;
    if (docType === 'poa') return 'POAs/';
    if (docType === 'oby_application') return 'OBY_applications/';
    return 'other/';
  }
  
  // For government correspondence
  if (folderCategory === '06_government_correspondence') {
    return document.document_type === 'wsc_letter' ? 'WSC_letters/' : 'responses/';
  }
  
  return '';
}
