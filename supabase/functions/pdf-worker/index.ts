import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1';

const TEMPLATE_VERSION = Deno.env.get('TEMPLATE_VERSION') ?? '2025.11.03';

function nowIso() {
  return new Date().toISOString();
}

// Helper to get nested values from data object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, part) => current?.[part], obj);
}

// Format date to DD.MM.YYYY
function formatDate(value: any): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// PDF field mappings (imported from existing fill-pdf logic)
const POA_ADULT_PDF_MAP: Record<string, string> = {
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'poa_date': 'poa_date_filed',
};

const POA_MINOR_PDF_MAP: Record<string, string> = {
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'minor_given_names': 'child_1_first_name',
  'minor_surname': 'child_1_last_name',
  'poa_date': 'poa_date_filed',
};

const POA_SPOUSES_PDF_MAP: Record<string, string> = {
  'imie_nazwisko_wniosko': 'applicant_first_name|applicant_last_name',
  'applicant_given_names': 'applicant_first_name',
  'applicant_surname': 'applicant_last_name',
  'passport_number': 'applicant_passport_number',
  'nr_dok_tozsamosci': 'applicant_passport_number',
  'spouse_given_names': 'spouse_first_name',
  'spouse_surname': 'spouse_last_name',
  'spouse_passport_number': 'spouse_passport_number',
  'husband_surname': 'husband_last_name_after_marriage',
  'wife_surname': 'wife_last_name_after_marriage',
  'minor_surname': 'child_1_last_name',
  'imie_nazwisko_dziecka': 'child_1_first_name|child_1_last_name',
  'data_pelnomocnictwa': 'poa_date_filed',
  'poa_date': 'poa_date_filed',
};

function getFieldMap(templateType: string): Record<string, string> {
  switch (templateType) {
    case 'poa-adult': return POA_ADULT_PDF_MAP;
    case 'poa-minor': return POA_MINOR_PDF_MAP;
    case 'poa-spouses': return POA_SPOUSES_PDF_MAP;
    default: return {};
  }
}

async function fillPDF(
  templateBytes: Uint8Array,
  data: any,
  fieldMap: Record<string, string>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  console.log('[PDF-WORKER] Filling PDF fields...');

  for (const [pdfFieldName, dataFieldPath] of Object.entries(fieldMap)) {
    try {
      // Handle pipe-separated concatenation
      if (dataFieldPath.includes('|')) {
        const parts = dataFieldPath.split('|').map(p => p.trim());
        const nameParts = parts
          .map(p => getNestedValue(data, p))
          .filter(v => v && String(v).trim());
        
        if (nameParts.length > 0) {
          const fullName = nameParts.join(' ');
          const field = form.getTextField(pdfFieldName);
          if (field) {
            field.setText(fullName);
            console.log(`[PDF-WORKER] ✓ ${pdfFieldName} = "${fullName}"`);
          }
        }
        continue;
      }

      let rawValue = getNestedValue(data, dataFieldPath);

      // Auto-inject today's date for POA date fields if empty
      if ((pdfFieldName === 'poa_date' || pdfFieldName === 'data_pelnomocnictwa') && 
          (!rawValue || String(rawValue).trim() === '')) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        rawValue = `${dd}.${mm}.${yyyy}`;
        console.log(`[PDF-WORKER] Auto-injected date: ${rawValue}`);
      }

      if (rawValue === null || rawValue === undefined || rawValue === '') {
        continue;
      }

      // Format dates
      const formattedValue = dataFieldPath.includes('date') || dataFieldPath.includes('dob')
        ? formatDate(rawValue)
        : String(rawValue);

      const field = form.getTextField(pdfFieldName);
      if (field) {
        field.setText(formattedValue);
        console.log(`[PDF-WORKER] ✓ ${pdfFieldName} = "${formattedValue}"`);
      }
    } catch (err) {
      console.error(`[PDF-WORKER] Error filling ${pdfFieldName}:`, err);
    }
  }

  return await pdfDoc.save();
}

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!url || !key) {
    console.error('[PDF-WORKER] Missing env vars');
    return new Response('config-error', { status: 500 });
  }

  const sb = createClient(url, key);

  // Pick one queued job
  const { data: jobs } = await sb
    .from('pdf_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(1);

  const job = jobs?.[0];
  if (!job) {
    console.log('[PDF-WORKER] No jobs in queue');
    return new Response('idle');
  }

  console.log(`[PDF-WORKER] Processing job ${job.id} for ${job.case_id}/${job.template_type}`);

  // Mark as running
  await sb
    .from('pdf_jobs')
    .update({ status: 'running', updated_at: nowIso() })
    .eq('id', job.id);

  try {
    // Fetch case data
    const { data: masterData } = await sb
      .from('master_table')
      .select('*')
      .eq('case_id', job.case_id)
      .single();

    if (!masterData) {
      throw new Error('Case data not found');
    }

    // Get template
    const templateName = `${job.template_type}.pdf`;
    const { data: templateData, error: downloadError } = await sb.storage
      .from('pdf-templates')
      .download(templateName);

    if (downloadError || !templateData) {
      throw new Error(`Template download failed: ${downloadError?.message}`);
    }

    const templateBytes = new Uint8Array(await templateData.arrayBuffer());
    const fieldMap = getFieldMap(job.template_type);

    // Fill PDF
    const filledPdfBytes = await fillPDF(templateBytes, masterData, fieldMap);

    // Upload to storage
    const path = `${job.case_id}/${job.template_type}-${Date.now()}.pdf`;
    const { error: uploadError } = await sb.storage
      .from('generated-pdfs')
      .upload(path, filledPdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const size_bytes = filledPdfBytes.byteLength ?? filledPdfBytes.length ?? 0;

    // Create artifact
    await sb.from('pdf_artifacts').insert({
      artifact_key: job.artifact_key,
      path,
      size_bytes,
    });

    // Mark job as succeeded
    await sb
      .from('pdf_jobs')
      .update({ status: 'succeeded', updated_at: nowIso() })
      .eq('id', job.id);

    console.log(`[PDF-WORKER] ✓ Job ${job.id} completed successfully`);
    return new Response('ok');
  } catch (e: unknown) {
    const error = e as Error;
    const attempts = (job.attempts ?? 0) + 1;
    const failed = attempts >= 5;
    const errorMsg = String(error?.message ?? error);

    console.error(`[PDF-WORKER] Job ${job.id} failed (attempt ${attempts}):`, errorMsg);

    await sb.from('pdf_jobs').update({
      status: failed ? 'failed' : 'queued',
      attempts,
      last_error: errorMsg,
      updated_at: nowIso(),
    }).eq('id', job.id);

    if (failed) {
      await sb.from('pdf_dead_letters').insert({
        job_id: job.id,
        artifact_key: job.artifact_key,
        last_error: errorMsg,
        payload: job,
      });
    }

    return new Response('error', { status: 500 });
  }
});
