import { useState, useCallback } from "react";
import { Camera, Upload, RotateCw, Check, AlertCircle, SkipForward, Loader2 } from "lucide-react";
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

type ProcessingStep = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'mapping' | 'complete';

interface POAOCRScannerProps {
  caseId: string;
  onDataExtracted?: (data: { passport?: any; birthCert?: any }) => void;
  onComplete?: () => void;
}

interface OCRResult {
  confidence: number;
  extracted_data: Record<string, any>;
  document_type: string;
}

export const POAOCRScanner = ({ caseId, onDataExtracted, onComplete }: POAOCRScannerProps) => {
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

  // Image editing
  const [editingImage, setEditingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePersonSelect = (personType: PersonType, docType: DocumentType) => {
    setSelectedPerson(personType);
    setSelectedDocType(docType);
  };

  const confirmPersonSelection = () => {
    if (!selectedPerson || !selectedDocType) {
      toast.error("Please select person and document type");
      return;
    }
    setStep(selectedDocType === 'passport' ? 'passport' : 'birthcert');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docType: 'passport' | 'birthcert') => {
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

    if (docType === 'passport') {
      setPassportFile(file);
    } else {
      setBirthCertFile(file);
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
      reader.readAsDataURL(file);
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('documentType', documentType);

    const { data, error } = await supabase.functions.invoke('upload-to-dropbox', {
      body: formData,
    });

    if (error) throw error;
    return data;
  };

  const processOCR = async (file: File, documentType: 'passport' | 'birth_certificate') => {
    setProcessingStep('extracting');
    
    // Check file type to determine processing method
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isPDF = file.type === 'application/pdf' || fileExtension === 'pdf';
    const isOfficeDoc = ['doc', 'docx', 'odt'].includes(fileExtension || '');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('personType', selectedPerson || 'AP');

    // Use document parser for PDFs and Office docs, regular OCR for images
    const functionName = (isPDF || isOfficeDoc) 
      ? 'parse-document-ocr'
      : (documentType === 'passport' ? 'ocr-passport' : 'ocr-universal');

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: formData,
    });

    if (error) {
      // Check for validation errors
      if (error.message?.includes('expired') || error.message?.includes('EXPIRED_PASSPORT')) {
        toast.error(error.message || "Passport has expired", {
          description: "Please provide a valid, non-expired passport for adults."
        });
        throw new Error("Expired passport");
      }
      if (error.message?.includes('Birth certificates are not accepted')) {
        toast.error(error.message);
        throw new Error("Invalid document type");
      }
      throw error;
    }
    
    // Show warnings if any
    if (data.warnings && data.warnings.length > 0) {
      data.warnings.forEach((warning: string) => {
        toast.warning(warning, {
          duration: 8000,
        });
      });
    }
    
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

  return (
    <Card className="glass-card hover-glow opacity-50">
      <CardHeader>
        <CardTitle>Scan Documents</CardTitle>
        <CardDescription>Upload and OCR your passport and birth certificate</CardDescription>
      </CardHeader>
<CardContent className="space-y-6">
        {/* Processing Progress */}
        {processing && processingStep !== 'idle' && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">
                {processingStep === 'uploading' && 'Step 1/4: Uploading to cloud storage...'}
                {processingStep === 'extracting' && 'Step 2/4: Extracting text from image...'}
                {processingStep === 'analyzing' && 'Step 3/4: Analyzing document structure...'}
                {processingStep === 'mapping' && 'Step 4/4: Mapping data to forms...'}
                {processingStep === 'complete' && 'Complete!'}
              </span>
            </div>
            <Progress 
              value={
                processingStep === 'uploading' ? 25 :
                processingStep === 'extracting' ? 50 :
                processingStep === 'analyzing' ? 75 :
                processingStep === 'mapping' ? 90 :
                100
              } 
            />
          </div>
        )}

        {/* Person Selection Step */}
        {step === 'select_person' && (
          <div className="space-y-4">
            <PersonTypeSelector
              onSelect={handlePersonSelect}
              selectedPerson={selectedPerson}
              selectedDocType={selectedDocType}
            />
            <Button 
              onClick={confirmPersonSelection}
              disabled={!selectedPerson || !selectedDocType}
              className="w-full"
            >
              Continue to Document Upload
            </Button>
          </div>
        )}

        {/* Passport Step */}
        {step === 'passport' && (
          <div className="space-y-4">
            {!passportFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.heic"
                  onChange={(e) => handleFileSelect(e, 'passport')}
                  className="hidden"
                  id="passport-upload"
                />
                <label htmlFor="passport-upload" className="cursor-pointer block">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload passport (image, PDF, HEIC, or document)
                  </p>
                  <div className="flex justify-center">
                    <Button type="button" variant="outline" size="sm" className="opacity-50" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Select Document
                      </span>
                    </Button>
                  </div>
                </label>
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
                    alt="Passport"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                </ReactCrop>
                <Button onClick={() => { setEditingImage(false); handleProcessPassport(); }} className="w-full">
                  Apply & Process
                </Button>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Birth Certificate Step */}
        {step === 'birthcert' && (
          <div className="space-y-4">
            {!birthCertFile ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.heic"
                  onChange={(e) => handleFileSelect(e, 'birthcert')}
                  className="hidden"
                  id="birthcert-upload"
                />
                <label htmlFor="birthcert-upload" className="cursor-pointer block">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload birth certificate (image, PDF, HEIC, or document)
                  </p>
                  <div className="flex justify-center">
                    <Button type="button" variant="outline" size="sm" className="opacity-50" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Select Document
                      </span>
                    </Button>
                  </div>
                </label>
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
      </CardContent>
    </Card>
  );
};
