// Document Workflow Type Definitions

export interface OCRDocument {
  id: string;
  ocr_text: string | null;
  confidence_score: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_data: Record<string, any> | null;
}

export interface Document {
  id: string;
  case_id: string;
  name: string;
  file_extension: string | null;
  dropbox_path: string | null;
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed' | null;
  ai_detected_type: string | null;
  is_verified_by_hac: boolean;
  needs_translation: boolean;
  data_applied_to_forms: boolean;
  created_at: string;
  ocr_documents?: any[]; // Use any[] for now to handle Supabase join types
}

export interface WorkflowInstance {
  id: string;
  workflow_type: string;
  case_id: string;
  source_table: string;
  source_id: string;
  current_stage: string;
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface UploadResult {
  documentId: string;
  success: boolean;
  error?: string;
  phase: 'upload' | 'workflow' | 'ocr';
}

export interface UploadProgress {
  total: number;
  completed: number;
  failed: number;
  uploading: number;
  errors: Array<{ file: string; error: string; phase: string }>;
}
