import { useState, useRef } from "react";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadFABProps {
  caseId: string;
  onUploadComplete?: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function DocumentUploadFAB({ caseId, onUploadComplete }: DocumentUploadFABProps) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadSingleFile = async (file: File, retryCount = 0): Promise<void> => {
    const MAX_RETRIES = 3;
    const fileId = crypto.randomUUID();
    
    setUploadingFiles(prev => [...prev, {
      id: fileId,
      file,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      // Phase 1: Validate with timeout
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 20 } : f
      ));

      const validationResponse = await supabase.functions.invoke('validate-file-upload', {
        body: formData,
      });

      if (validationResponse.error || !validationResponse.data?.valid) {
        throw new Error(validationResponse.data?.error || 'File validation failed');
      }

      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 40 } : f
      ));

      // Phase 2: Upload to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${caseId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 70 } : f
      ));

      // Phase 3: Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          name: file.name,
          file_extension: fileExt,
          dropbox_path: filePath,
          ocr_status: 'pending',
        });

      if (dbError) throw dbError;

      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 100, status: 'success' } : f
      ));

      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
        onUploadComplete?.();
      }, 2000);

    } catch (error: any) {
      console.error(`Upload error for ${file.name}:`, error);
      
      // Retry logic for transient errors
      if (retryCount < MAX_RETRIES && 
          (error.message?.includes('Version conflict') || 
           error.message?.includes('network') ||
           error.message?.includes('timeout'))) {
        console.log(`Retrying ${file.name} (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
        return uploadSingleFile(file, retryCount + 1);
      }

      setUploadingFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'error', error: error.message } : f
      ));

      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds 20MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add files to uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading',
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
    setIsExpanded(true);

    // Upload each file
    newUploadingFiles.forEach(uploadingFile => {
      uploadFile(uploadingFile);
    });
  };

  const uploadFile = async (uploadingFile: UploadingFile, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000; // 1 second base delay
    const MAX_TOTAL_RETRIES_TIME_MS = 30000; // 30 seconds max total retry time
    const startTime = Date.now();
    
    try {
      const { file } = uploadingFile;
      
      // Phase 1: Validate file with timeout
      updateFileProgress(uploadingFile.id, 20);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const validationResponse = await supabase.functions.invoke('validate-file-upload', {
        body: formData,
      });

      if (validationResponse.error || !validationResponse.data?.valid) {
        throw new Error(validationResponse.data?.error || 'File validation failed');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${caseId}/${fileName}`;

      // Update progress to 30% (starting upload)
      updateFileProgress(uploadingFile.id, 30);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Update progress to 60% (file uploaded)
      updateFileProgress(uploadingFile.id, 60);

      // Get the dropbox_path from case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('dropbox_path')
        .eq('id', caseId)
        .single();

      if (caseError) throw caseError;

      // Update progress to 80% (creating database record)
      updateFileProgress(uploadingFile.id, 80);

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          name: file.name,
          dropbox_path: `${caseData.dropbox_path || ''}/${file.name}`,
          file_extension: fileExt,
          file_size: file.size,
          ocr_status: 'pending',
        });

      if (dbError) throw dbError;

      // Update progress to 100% (complete)
      updateFileProgress(uploadingFile.id, 100);
      updateFileStatus(uploadingFile.id, 'success');

      toast({
        title: "Upload successful",
        description: `${file.name} uploaded successfully`,
      });

      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      updateFileStatus(uploadingFile.id, 'error', error instanceof Error ? error.message : 'Upload failed');
      
      toast({
        title: "Upload failed",
        description: uploadingFile.file.name,
        variant: "destructive",
      });
    }
  };

  const updateFileProgress = (id: string, progress: number) => {
    setUploadingFiles(prev =>
      prev.map(f => f.id === id ? { ...f, progress } : f)
    );
  };

  const updateFileStatus = (id: string, status: 'uploading' | 'success' | 'error', error?: string) => {
    setUploadingFiles(prev =>
      prev.map(f => f.id === id ? { ...f, status, error } : f)
    );
  };

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
            "bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
            "hover:scale-110 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]",
            uploadingFiles.length > 0 && "ring-4 ring-primary/20"
          )}
        >
          <Upload className="h-7 w-7 text-white" />
        </Button>

        {/* Upload count badge */}
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shadow-lg"
          >
            {uploadingFiles.length}
          </motion.div>
        )}
      </motion.div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress Panel */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-28 right-8 z-50 w-96 max-h-96 overflow-hidden rounded-lg border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Uploading Files</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'))}
              >
                Clear
              </Button>
            </div>

            {/* File list */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-3">
              {uploadingFiles.map(uploadingFile => (
                <motion.div
                  key={uploadingFile.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <File className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {uploadingFile.status === 'uploading' && (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
                      {uploadingFile.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {uploadingFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    {uploadingFile.status !== 'uploading' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadingFile.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {uploadingFile.status === 'uploading' && (
                    <Progress value={uploadingFile.progress} className="h-1" />
                  )}

                  {uploadingFile.error && (
                    <p className="text-xs text-destructive">{uploadingFile.error}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <div className="rounded-lg border-2 border-dashed border-primary bg-primary/5 p-12 text-center">
              <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
              <p className="text-2xl font-semibold text-primary">Drop files here</p>
              <p className="text-muted-foreground mt-2">Upload documents to this case</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
