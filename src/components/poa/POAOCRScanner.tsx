import { useState, useCallback, useEffect } from "react";
import { Camera, Upload, RotateCw, Check, AlertCircle, SkipForward, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useRef } from "react";
import { PersonTypeSelector, PersonType, DocumentType } from "./PersonTypeSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OCRDataPreview } from "./OCRDataPreview";
import { fixImageOrientation } from "@/utils/exifRotation";
import { compressImage } from "@/utils/imageCompression";
import { uploadFile, UploadProgress } from "@/utils/chunkedUpload";

type ProcessingStep = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'mapping' | 'complete';

interface POAOCRScannerProps {
  caseId: string;
  onDataExtracted?: (data: { passport?: any; birthCert?: any }) => void;
  onComplete?: () => void;
  childrenCount?: number;
}

interface OCRResult {
  confidence: number;
  extracted_data: Record<string, any>;
  document_type: string;
}

export const POAOCRScanner = ({ caseId, onDataExtracted, onComplete, childrenCount = 0 }: POAOCRScannerProps) => {
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null);
  const [passportResult, setPassportResult] = useState<OCRResult | null>(null);
  const [birthCertResult, setBirthCertResult] = useState<OCRResult | null>(null);
  const [step, setStep] = useState<'select_person' | 'passport' | 'birthcert' | 'complete'>('select_person');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  
  // Person type selection
  const [selectedPerson, setSelectedPerson] = useState<PersonType>();
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>();

  // OCR Data Preview
  const [ocrPreviewData, setOcrPreviewData] = useState<any>(null);
  const [ocrConfidence, setOcrConfidence] = useState<number | undefined>();
  const [ocrWarnings, setOcrWarnings] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);

  // Image editing
  const [editingImage, setEditingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // NEW: Persistent preview states
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadETA, setUploadETA] = useState(0);


  const handlePersonSelect = (personType: PersonType, docType: DocumentType) => {
    setSelectedPerson(personType);
    setSelectedDocType(docType);
    setOcrPreviewData(null);
    setOcrWarnings([]);
    setRetryCount(0);
  };

  const confirmPersonSelection = () => {
    if (!selectedPerson || !selectedDocType) {
      toast.error("Please select person and document type");
      return;
    }
    setStep(selectedDocType === 'passport' ? 'passport' : 'birthcert');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'passport' | 'birthcert') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large. Maximum 20MB.");
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isPDF = file.type === 'application/pdf' || fileExtension === 'pdf';
    const isOfficeDoc = ['doc', 'docx', 'odt'].includes(fileExtension || '');
    const isImage = file.type.startsWith('image/');

    let processedFile = file;

    // Apply EXIF orientation fix + compression for images
    if (isImage) {
      try {
        toast.info("📸 Optimizing image...");
        
        // Step 1: Fix EXIF orientation (strips GPS/camera metadata for privacy)
        const orientedFile = await fixImageOrientation(file);
        
        // Step 2: Compress image (PNG transparency preserved, WebP when supported)
        const compressionResult = await compressImage(orientedFile, {
          maxWidth: 1200,
          maxHeight: 1600,
          quality: 0.85,
          preserveTransparency: true
        });
        
        processedFile = compressionResult.file;
        
        toast.success(`✅ Image optimized: ${compressionResult.compressionRatio}% smaller`, {
          description: `${(compressionResult.originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressionResult.compressedSize / 1024 / 1024).toFixed(2)}MB`
        });
      } catch (error) {
        console.warn('Image optimization failed, using original:', error);
        toast.warning("Using original image (optimization failed)");
      }
    }

    if (docType === 'passport') {
      setPassportFile(processedFile);
    } else {
      setBirthCertFile(processedFile);
    }

    // Show editor only for images (not for PDFs/docs)
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setEditingImage(true);
        setRotation(0);
        setCrop(undefined);
      };
      reader.readAsDataURL(processedFile);
    } else if (isPDF || isOfficeDoc) {
      // For PDFs and Office docs, skip image editing
      setEditingImage(false);
      setImagePreview(null);
      toast.info(`${isPDF ? 'PDF' : 'Office document'} uploaded. Ready to process.`);
    } else {
      toast.error("Unsupported file type. Please upload image, PDF, or Office document.");
      if (docType === 'passport') {
        setPassportFile(null);
      } else {
        setBirthCertFile(null);
      }
    }
  };

  const getCroppedImg = useCallback(async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
    rotation: number
  ): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');

    const rotRad = (rotation * Math.PI) / 180;
    const { width, height } = pixelCrop;
    
    // Calculate canvas size after rotation
    const sin = Math.abs(Math.sin(rotRad));
    const cos = Math.abs(Math.cos(rotRad));
    const newWidth = width * cos + height * sin;
    const newHeight = width * sin + height * cos;

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Apply transformations in correct order: translate, rotate, then draw
    ctx.save();
    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-width / 2, -height / 2);

    // Draw the cropped portion
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      width,
      height
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const uploadToDropbox = async (file: File, documentType: string) => {
    setProcessingStep('uploading');
    setUploadProgress(0);
    setUploadSpeed(0);
    setUploadETA(0);

    try {
      // Real chunked upload with progress tracking
      const uploadUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-dropbox`;
      const authToken = (await supabase.auth.getSession()).data.session?.access_token || '';

      const path = await uploadFile(
        file,
        uploadUrl,
        authToken,
        { caseId, documentType },
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage);
          setUploadSpeed(progress.speed);
          setUploadETA(progress.eta);
        }
      );

      // Show upload success
      toast.success("✅ Document uploaded to cloud storage", {
        description: `File: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`
      });
      
      return { dropboxPath: path, filename: file.name };
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const processOCR = async (file: File, documentType: 'passport' | 'birth_certificate', isRetry: boolean = false) => {
    if (isRetry) {
      toast.info(`Retry attempt ${retryCount + 1}/3...`);
    }
    
    setProcessingStep('extracting');
    
    // Check file type to determine processing method
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isPDF = file.type === 'application/pdf' || fileExtension === 'pdf';
    const isOfficeDoc = ['doc', 'docx', 'odt'].includes(fileExtension || '');
    
    // FIXED OCR: Convert file to base64 for ocr-passport, FormData for others
    const functionName = (isPDF || isOfficeDoc) 
      ? 'parse-document-ocr'
      : (documentType === 'passport' ? 'ocr-passport' : 'ocr-universal');

    console.log('[POAOCRScanner] processOCR:', { 
      functionName, 
      documentType, 
      personType: selectedPerson,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    let requestBody: any;
    
    if (functionName === 'ocr-passport') {
      // For passport OCR, convert to base64 as expected by the edge function
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const imageBase64 = await base64Promise;
      requestBody = {
        imageBase64,
        caseId,
        personType: selectedPerson || 'AP',
        documentType
      };
      
      console.log('[POAOCRScanner] Sending base64 request to ocr-passport:', {
        hasBase64: !!imageBase64,
        base64Length: imageBase64.length,
        caseId,
        personType: selectedPerson,
        documentType
      });
    } else {
      // For other OCR functions, use FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('personType', selectedPerson || 'AP');
      requestBody = formData;
      
      console.log('[POAOCRScanner] Sending FormData request to', functionName);
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: requestBody,
    });
    
    console.log('[POAOCRScanner] OCR Response:', { 
      functionName, 
      hasData: !!data, 
      hasError: !!error,
      error: error?.message,
      data: data ? Object.keys(data) : null
    });

    if (error) {
      // Enhanced error messages
      let errorMsg = error.message || 'OCR processing failed';
      
      if (errorMsg.includes('expired') || errorMsg.includes('EXPIRED_PASSPORT')) {
        errorMsg = `❌ Passport Expired: ${errorMsg}. Please use a valid passport or contact support.`;
      } else if (errorMsg.includes('Birth certificates are not accepted')) {
        errorMsg = `❌ Invalid Document: ${errorMsg}`;
      } else if (errorMsg.includes('Invalid date format')) {
        errorMsg = `❌ Date Format Error: Could not read dates from the document. Please ensure the document is clear and readable.`;
      } else if (errorMsg.includes('confidence')) {
        errorMsg = `⚠️ Low Quality Scan: ${errorMsg}. Try uploading a clearer image or PDF.`;
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        errorMsg = `🌐 Network Error: ${errorMsg}. Please check your connection and try again.`;
      }
      
      toast.error(errorMsg, {
        description: "Please provide a valid, non-expired passport for adults."
      });
      
      // Auto-retry logic (max 3 attempts)
      if (retryCount < 3 && !isRetry) {
        setRetryCount(prev => prev + 1);
      }
      
      throw new Error(errorMsg);
    }
    
    // Collect warnings
    const warnings: string[] = [];
    if (data.warnings && Array.isArray(data.warnings)) {
      warnings.push(...data.warnings);
    } else if (data.warning) {
      warnings.push(data.warning);
    }
    if (data.confidence && data.confidence < 0.7) {
      warnings.push(`Low confidence score: ${(data.confidence * 100).toFixed(0)}%. Please verify the extracted data carefully.`);
    }
    
    // Show warnings
    warnings.forEach((warning: string) => {
      toast.warning(warning, {
        duration: 8000,
      });
    });
    
    setOcrWarnings(warnings);
    setOcrConfidence(data.confidence);
    setOcrPreviewData(data.extracted_data || data);
    setRetryCount(0);
    
    setProcessingStep('analyzing');
    return data;
  };

  const createDocumentRecord = async (
    uploadResult: any,
    ocrResult: any,
    documentType: string
  ) => {
    const { data: doc, error } = await supabase
      .from('documents')
      .insert({
        case_id: caseId,
        name: uploadResult.filename || `${documentType}_${Date.now()}`,
        dropbox_path: uploadResult.dropboxPath,
        file_extension: uploadResult.filename?.split('.').pop() || 'jpg',
        document_type: documentType,
        person_type: 'AP',
        ocr_data: ocrResult.extracted_data || ocrResult,
        ocr_confidence: ocrResult.confidence,
        ocr_status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;
    return doc;
  };

  const applyOCRToForms = async (documentId: string) => {
    setProcessingStep('mapping');
    const { data, error } = await supabase.functions.invoke('apply-ocr-to-forms', {
      body: {
        documentId,
        caseId,
        overwriteManual: false,
      },
    });

    if (error) throw error;
    setProcessingStep('complete');
    return data;
  };

  const handleProcessPassport = async () => {
    if (!passportFile) return;

    setProcessing(true);
    setProcessingStep('idle');
    try {
      let fileToProcess = passportFile;

      // Apply crop/rotation if editing
      if (editingImage && imgRef.current && completedCrop) {
        const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, rotation);
        fileToProcess = new File([croppedBlob], passportFile.name, { type: 'image/jpeg' });
      }

      // 1. Upload to Dropbox
      const uploadResult = await uploadToDropbox(fileToProcess, 'passport');

      // 2. Process OCR
      const ocrResult = await processOCR(fileToProcess, 'passport');

      // 3. Create document record
      const doc = await createDocumentRecord(uploadResult, ocrResult, 'passport');

      // 4. Apply OCR data to master_table
      await applyOCRToForms(doc.id);

      setPassportResult(ocrResult);
      
      if (onDataExtracted) {
        onDataExtracted({ passport: ocrResult });
      }

      toast.success(`Passport scanned! Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%`);
      setStep('birthcert');
      setEditingImage(false);
      setProcessingStep('idle');
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error("Failed to process passport");
      setProcessingStep('idle');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessBirthCert = async () => {
    if (!birthCertFile) return;

    setProcessing(true);
    setProcessingStep('idle');
    try {
      let fileToProcess = birthCertFile;

      // Apply crop/rotation if editing
      if (editingImage && imgRef.current && completedCrop) {
        const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, rotation);
        fileToProcess = new File([croppedBlob], birthCertFile.name, { type: 'image/jpeg' });
      }

      // 1. Upload to Dropbox
      const uploadResult = await uploadToDropbox(fileToProcess, 'birth_certificate');

      // 2. Process OCR
      const ocrResult = await processOCR(fileToProcess, 'birth_certificate');

      // 3. Create document record
      const doc = await createDocumentRecord(uploadResult, ocrResult, 'birth_certificate');

      // 4. Apply OCR data to master_table
      await applyOCRToForms(doc.id);

      setBirthCertResult(ocrResult);
      
      if (onDataExtracted) {
        onDataExtracted({ birthCert: ocrResult });
      }

      toast.success(`Birth certificate scanned! Confidence: ${(ocrResult.confidence * 100).toFixed(0)}%`);
      setStep('complete');
      setEditingImage(false);
      setProcessingStep('idle');

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error("Failed to process birth certificate");
      setProcessingStep('idle');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipPassport = () => {
    toast.info('Passport OCR skipped - please enter data manually');
    setStep('birthcert');
    setPassportFile(null);
    setEditingImage(false);
  };

  const handleSkipBirthCert = () => {
    toast.info('Birth certificate OCR skipped - proceeding to next step');
    setStep('complete');
    setBirthCertFile(null);
    setEditingImage(false);
    if (onComplete) {
      onComplete();
    }
  };

  // NEW: Retry functionality
  const handleRetry = (docType: 'passport' | 'birthcert') => {
    if (docType === 'passport') {
      setPassportFile(null);
      setPassportResult(null);
      setImagePreview(null);
      setUploadedPreview(null);
      setEditingImage(false);
      setOcrPreviewData(null);
      toast.info("Ready to scan passport again");
    } else {
      setBirthCertFile(null);
      setBirthCertResult(null);
      setImagePreview(null);
      setUploadedPreview(null);
      setEditingImage(false);
      setOcrPreviewData(null);
      toast.info("Ready to scan birth certificate again");
    }
  };

  // NEW: Go back to person selection
  const handleBackToPersonSelection = () => {
    setStep('select_person');
    setSelectedPerson(undefined);
    setSelectedDocType(undefined);
    setPassportFile(null);
    setBirthCertFile(null);
    setImagePreview(null);
    setEditingImage(false);
    setOcrPreviewData(null);
    setPassportResult(null);
    setBirthCertResult(null);
    toast.info("Starting over - select person and document type");
  };

  // NEW: Close and reset everything
  const handleClose = () => {
    if (window.confirm("Are you sure you want to close? All progress will be lost.")) {
      handleBackToPersonSelection();
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      {step !== 'select_person' && (
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <Button variant="ghost" size="sm" onClick={handleBackToPersonSelection}>
            ← Back to Person Selection
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-destructive">
            ✕ Close OCR
          </Button>
        </div>
      )}

      {/* Processing Progress */}
      {processing && processingStep !== 'idle' && (
        <div className="space-y-3 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">
              {processingStep === 'uploading' && `Step 1/5: Uploading to cloud storage... ${uploadProgress}%`}
              {processingStep === 'extracting' && 'Step 2/5: Extracting text from document...'}
              {processingStep === 'analyzing' && 'Step 3/5: Analyzing document structure...'}
              {processingStep === 'mapping' && 'Step 4/5: Mapping data to forms...'}
              {processingStep === 'complete' && 'Step 5/5: Complete!'}
            </span>
          </div>
          {processingStep === 'uploading' && uploadSpeed > 0 && (
            <div className="text-xs text-muted-foreground">
              {(uploadSpeed / 1024 / 1024).toFixed(2)} MB/s • ETA: {uploadETA}s
            </div>
          )}
          <Progress 
            value={
              processingStep === 'uploading' ? uploadProgress / 5 :
              processingStep === 'extracting' ? 40 :
              processingStep === 'analyzing' ? 60 :
              processingStep === 'mapping' ? 80 :
              100
            } 
          />
        </div>
      )}

      {/* Person Selection Step */}
      {step === 'select_person' && (
        <div className="px-4 py-2 md:py-4">
          <div className="pb-2 mb-2">
            <h3 className="text-lg md:text-xl font-heading font-bold opacity-30 text-blue-600 dark:text-blue-400">
              Select Person & Document Type
            </h3>
          </div>
          <div className="space-y-3">
            <PersonTypeSelector 
              onSelect={handlePersonSelect}
              selectedPerson={selectedPerson}
              selectedDocType={selectedDocType}
              childrenCount={childrenCount}
            />
            <Button 
              onClick={confirmPersonSelection}
              disabled={!selectedPerson || !selectedDocType}
              className="w-full h-16 mt-8 text-base"
            >
              Continue to Document Upload
            </Button>
          </div>
        </div>
      )}

      {/* OCR Data Preview */}
      {ocrPreviewData && (
        <OCRDataPreview 
          data={ocrPreviewData} 
          confidence={ocrConfidence}
          warnings={ocrWarnings}
        />
      )}

      {/* Passport Step */}
      {step === 'passport' && (
        <div className="space-y-4">
          {!passportFile ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload passport (image, PDF, HEIC, or document)
              </p>
              
              {/* Mobile Camera & File Upload Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <label htmlFor="passport-camera" className="cursor-pointer">
                  <Button variant="outline" size="lg" className="w-full h-16" asChild>
                    <span className="opacity-80">
                      <Camera className="w-5 h-5 mr-2" />
                      Take Photo
                    </span>
                  </Button>
                </label>
                
                <label htmlFor="passport-upload" className="cursor-pointer">
                  <Button variant="outline" size="lg" className="w-full h-16" asChild>
                    <span className="opacity-80">
                      <Upload className="w-5 h-5 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e, 'passport')}
                className="hidden"
                id="passport-camera"
              />
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.heic"
                onChange={(e) => handleFileSelect(e, 'passport')}
                className="hidden"
                id="passport-upload"
              />
            </div>
          ) : imagePreview && editingImage ? (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="border rounded-lg overflow-hidden bg-muted">
                <img src={imagePreview} alt="Document preview" className="w-full h-auto" loading="lazy" />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => setRotation((r) => (r + 90) % 360)} variant="outline" size="sm">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate
                </Button>
              </div>
              <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop}>
                <img
                  ref={imgRef}
                  src={imagePreview!}
                  alt="Passport"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </ReactCrop>
              <Button onClick={() => { setEditingImage(false); handleProcessPassport(); }} className="w-full">
                Apply & Process
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Persistent Image/PDF Preview */}
              {imagePreview && (
                <div className="border rounded-lg overflow-hidden bg-muted">
                  <img src={imagePreview} alt="Document preview" className="w-full h-auto" loading="lazy" />
                </div>
              )}
              
              {passportFile && passportFile.type === 'application/pdf' && (
                <div className="border rounded p-4 bg-muted">
                  <p className="text-sm mb-2 font-medium">PDF uploaded: {passportFile.name}</p>
                  <embed 
                    src={URL.createObjectURL(passportFile)} 
                    type="application/pdf" 
                    className="w-full h-96 rounded"
                  />
                </div>
              )}
              
              {!passportResult ? (
                <div className="flex gap-2">
                  <Button onClick={handleProcessPassport} disabled={processing} className="flex-1">
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Process Passport
                      </>
                    )}
                  </Button>
                  <Button onClick={handleSkipPassport} disabled={processing} variant="outline">
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip & Enter Manually
                  </Button>
                </div>
              ) : (
                /* Side-by-Side Preview After OCR */
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Document Verification</CardTitle>
                    <CardDescription>Review the uploaded document and extracted data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Document Image */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Uploaded Document</h4>
                        {imagePreview && (
                          <img src={imagePreview} alt="Uploaded passport" className="w-full rounded border" loading="lazy" />
                        )}
                        {passportFile && passportFile.type === 'application/pdf' && (
                          <div className="border rounded p-2 bg-muted text-sm">
                            PDF: {passportFile.name}
                          </div>
                        )}
                      </div>
                      
                      {/* Extracted Data */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Extracted Data</h4>
                        <OCRDataPreview 
                          data={passportResult.extracted_data}
                          confidence={passportResult.confidence}
                          warnings={ocrWarnings}
                        />
                      </div>
                    </div>
                    
                    {/* Quality Warning */}
                    {passportResult.confidence < 0.75 && (
                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Low quality scan detected ({(passportResult.confidence * 100).toFixed(0)}% confidence). 
                          Consider re-scanning with better lighting or a clearer image.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Button variant="outline" onClick={() => handleRetry('passport')}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Different File
                      </Button>
                      <Button variant="outline" onClick={() => handleProcessPassport()}>
                        <RotateCw className="w-4 h-4 mr-2" />
                        Re-run OCR
                      </Button>
                      <Button variant="default" onClick={() => setStep('birthcert')}>
                        <Check className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

        {/* Birth Certificate Step */}
        {step === 'birthcert' && (
          <div className="space-y-4">
            {!birthCertFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload birth certificate (image, PDF, HEIC, or document)
                </p>
                
                {/* Mobile Camera & File Upload Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <label htmlFor="birthcert-camera" className="cursor-pointer">
                    <Button variant="outline" size="lg" className="w-full h-16" asChild>
                      <span className="opacity-80">
                        <Camera className="w-5 h-5 mr-2" />
                        Take Photo
                      </span>
                    </Button>
                  </label>
                  
                  <label htmlFor="birthcert-upload" className="cursor-pointer">
                    <Button variant="outline" size="lg" className="w-full h-16" asChild>
                      <span className="opacity-80">
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </label>
                </div>

                {/* Hidden file inputs */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileSelect(e, 'birthcert')}
                  className="hidden"
                  id="birthcert-camera"
                />
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.heic"
                  onChange={(e) => handleFileSelect(e, 'birthcert')}
                  className="hidden"
                  id="birthcert-upload"
                />
              </div>
            ) : editingImage ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setRotation((r) => (r + 90) % 360)} variant="outline" size="sm">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </Button>
                </div>
                <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop}>
                  <img
                    ref={imgRef}
                    src={imagePreview!}
                    alt="Birth Certificate"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                </ReactCrop>
                <Button onClick={() => { setEditingImage(false); handleProcessBirthCert(); }} className="w-full">
                  Apply & Process
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Persistent Image/PDF Preview */}
                {imagePreview && (
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    <img src={imagePreview} alt="Birth certificate preview" className="w-full h-auto" loading="lazy" />
                  </div>
                )}
                
                {birthCertFile && birthCertFile.type === 'application/pdf' && (
                  <div className="border rounded p-4 bg-muted">
                    <p className="text-sm mb-2 font-medium">PDF uploaded: {birthCertFile.name}</p>
                    <embed 
                      src={URL.createObjectURL(birthCertFile)} 
                      type="application/pdf" 
                      className="w-full h-96 rounded"
                    />
                  </div>
                )}
                
                {!birthCertResult ? (
                  <div className="flex gap-2">
                    <Button onClick={handleProcessBirthCert} disabled={processing} className="flex-1">
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Process Birth Certificate
                        </>
                      )}
                    </Button>
                    <Button onClick={handleSkipBirthCert} disabled={processing} variant="outline">
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip
                    </Button>
                  </div>
                ) : (
                  /* Side-by-Side Preview After OCR */
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Document Verification</CardTitle>
                      <CardDescription>Review the uploaded document and extracted data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Document Image */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Uploaded Document</h4>
                          {imagePreview && (
                            <img src={imagePreview} alt="Uploaded birth certificate" className="w-full rounded border" loading="lazy" />
                          )}
                          {birthCertFile && birthCertFile.type === 'application/pdf' && (
                            <div className="border rounded p-2 bg-muted text-sm">
                              PDF: {birthCertFile.name}
                            </div>
                          )}
                        </div>
                        
                        {/* Extracted Data */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Extracted Data</h4>
                          <OCRDataPreview 
                            data={birthCertResult.extracted_data}
                            confidence={birthCertResult.confidence}
                            warnings={ocrWarnings}
                          />
                        </div>
                      </div>
                      
                      {/* Quality Warning */}
                      {birthCertResult.confidence < 0.75 && (
                        <Alert variant="destructive">
                          <AlertCircle className="w-4 h-4" />
                          <AlertDescription>
                            Low quality scan detected ({(birthCertResult.confidence * 100).toFixed(0)}% confidence). 
                            Consider re-scanning with better lighting or a clearer image.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Button variant="outline" onClick={() => handleRetry('birthcert')}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Different File
                        </Button>
                        <Button variant="outline" onClick={() => handleProcessBirthCert()}>
                          <RotateCw className="w-4 h-4 mr-2" />
                          Re-run OCR
                        </Button>
                        <Button variant="default" onClick={() => { setStep('complete'); if (onComplete) onComplete(); }}>
                          <Check className="w-4 h-4 mr-2" />
                          Looks Good - Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Complete */}
      {step === 'complete' && (
        <div className="text-center p-8">
          <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium">OCR Complete!</p>
          <p className="text-sm text-muted-foreground">Data extracted and applied to forms</p>
        </div>
      )}
    </div>
  );
};
