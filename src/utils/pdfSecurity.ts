/**
 * PDF Security Utilities
 * 
 * Provides validation and security checks for PDF files
 * to prevent malicious content and ensure file integrity.
 */

const PDF_SIGNATURE = '%PDF-';
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * PDF File Validation Result
 */
export interface PDFValidationResult {
  valid: boolean;
  error?: string;
  fileSize?: number;
  isPDF?: boolean;
}

/**
 * Validate PDF file signature
 * Checks if file starts with %PDF- header
 */
export async function validatePDFSignature(file: File | Blob): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 5).arrayBuffer();
    const signature = new TextDecoder().decode(buffer);
    return signature === PDF_SIGNATURE;
  } catch {
    return false;
  }
}

/**
 * Comprehensive PDF file validation
 * 
 * Security checks:
 * - File size limit (10MB)
 * - Content-Type validation
 * - PDF signature verification
 * - File extension check (if File object)
 */
export async function validatePDFFile(file: File | Blob): Promise<PDFValidationResult> {
  // Check file size
  if (file.size > MAX_PDF_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_PDF_SIZE / 1024 / 1024}MB`,
      fileSize: file.size,
    };
  }

  // Check minimum size (empty PDFs are suspicious)
  if (file.size < 100) {
    return {
      valid: false,
      error: 'File is too small to be a valid PDF',
      fileSize: file.size,
    };
  }

  // Check Content-Type if available
  if (file.type && file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Invalid file type. Expected application/pdf',
      fileSize: file.size,
    };
  }

  // Check file extension if File object
  if (file instanceof File) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf') {
      return {
        valid: false,
        error: 'Invalid file extension. Expected .pdf',
        fileSize: file.size,
      };
    }
  }

  // Validate PDF signature
  const isPDF = await validatePDFSignature(file);
  if (!isPDF) {
    return {
      valid: false,
      error: 'File is not a valid PDF (invalid signature)',
      fileSize: file.size,
      isPDF: false,
    };
  }

  return {
    valid: true,
    fileSize: file.size,
    isPDF: true,
  };
}

/**
 * Validate PDF URL
 * Ensures URL is properly formatted and points to expected storage
 */
export function validatePDFUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Must be HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }

    // Should be from Supabase storage
    const validHosts = [
      'storage.googleapis.com',
      '.supabase.co',
      '.supabase.com',
    ];

    const isValidHost = validHosts.some(host => 
      parsed.hostname.includes(host)
    );

    if (!isValidHost) {
      return false;
    }

    // Path should contain poa-documents bucket
    if (!parsed.pathname.includes('poa-documents')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate secure signed URL parameters
 * Returns consistent expiration time (45 minutes)
 */
export function getSignedURLExpiration(): number {
  return 45 * 60; // 45 minutes in seconds
}

/**
 * Sanitize filename for safe storage
 * Prevents path traversal and special characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_.]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/_+/g, '_')
    .slice(0, 255); // Max filename length
}

/**
 * Generate secure POA filename
 */
export function generateSecurePOAFilename(
  caseId: string,
  poaType: string,
  timestamp?: Date
): string {
  const date = timestamp || new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.getTime();
  
  return sanitizeFilename(
    `POA_${poaType}_${caseId.slice(0, 8)}_${dateStr}_${timeStr}.pdf`
  );
}

/**
 * Validate POA storage path
 * Ensures path follows expected structure: {caseId}/poa/{filename}.pdf
 */
export function validatePOAStoragePath(path: string, caseId: string): boolean {
  const pathRegex = new RegExp(`^${caseId}/poa/[a-zA-Z0-9_\\-\\.]+\\.pdf$`);
  return pathRegex.test(path) && !path.includes('..');
}

/**
 * Extract case ID from storage path
 */
export function extractCaseIdFromPath(path: string): string | null {
  const match = path.match(/^([a-f0-9\-]{36})\//);
  return match ? match[1] : null;
}

/**
 * Check if PDF is locked based on metadata
 */
export function isPDFLocked(metadata?: Record<string, any>): boolean {
  return metadata?.locked === 'true' || metadata?.locked === true;
}

/**
 * Create secure metadata for POA storage
 */
export function createPOAMetadata(
  caseId: string,
  poaType: string,
  userId: string,
  isLocked = false
): Record<string, string> {
  return {
    caseId,
    poaType,
    uploadedBy: userId,
    uploadedAt: new Date().toISOString(),
    locked: isLocked.toString(),
    version: '1',
  };
}
