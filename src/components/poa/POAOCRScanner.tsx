import { useState, useRef, useCallback } from "react";
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Loader2, RotateCw, Crop, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactCrop, { Crop as CropType, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  const [processing, setProcessing] = useState(false);
  const [passportResult, setPassportResult] = useState<OCRResult | null>(null);
  const [birthCertResult, setBirthCertResult] = useState<OCRResult | null>(null);
  const [step, setStep] = useState<'passport' | 'birthcert' | 'complete'>('passport');
  const passportInputRef = useRef<HTMLInputElement>(null);
  const birthCertInputRef = useRef<HTMLInputElement>(null);
  
  // Image preview & editing
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [birthCertPreview, setBirthCertPreview] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<'passport' | 'birthcert' | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'passport' | 'birthcert') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 20MB.");
        return;
      }

      // Validate file type
      const validTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/heic',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload an image, PDF, or document file.");
        return;
      }

      if (type === 'passport') {
        setPassportFile(file);
        // Create preview for image files
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPassportPreview(reader.result as string);
            setEditingImage('passport');
            setRotation(0);
            setScale(1);
            setCrop(undefined);
          };
          reader.readAsDataURL(file);
        }
      } else {
        setBirthCertFile(file);
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setBirthCertPreview(reader.result as string);
            setEditingImage('birthcert');
            setRotation(0);
            setScale(1);
            setCrop(undefined);
          };
          reader.readAsDataURL(file);
        }
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

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.save();
    
    // Rotate if needed
    if (rotation !== 0) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, []);

  const handleApplyEdits = useCallback(async () => {
    if (!imgRef.current || !editingImage) return;

    try {
      let processedBlob: Blob;

      if (completedCrop) {
        processedBlob = await getCroppedImg(imgRef.current, completedCrop, rotation);
      } else {
        // Just apply rotation if no crop
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');

        const img = imgRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.save();
        if (rotation !== 0) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
        }
        ctx.drawImage(img, 0, 0);
        ctx.restore();

        processedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/jpeg', 0.95);
        });
      }

      // Update file with processed image
      const processedFile = new File([processedBlob], 
        editingImage === 'passport' ? passportFile?.name || 'passport.jpg' : birthCertFile?.name || 'birth-cert.jpg',
        { type: 'image/jpeg' }
      );

      if (editingImage === 'passport') {
        setPassportFile(processedFile);
      } else {
        setBirthCertFile(processedFile);
      }

      setEditingImage(null);
      toast.success("Image adjusted successfully!");
    } catch (error) {
      console.error('Error applying edits:', error);
      toast.error("Failed to apply image edits");
    }
  }, [editingImage, completedCrop, rotation, passportFile, birthCertFile, getCroppedImg]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const processOCR = async (file: File, documentType: 'passport' | 'birth_certificate') => {
    try {
      const reader = new FileReader();
      
      return new Promise<OCRResult>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            
            const functionName = documentType === 'passport' ? 'ocr-passport' : 'ocr-universal';
            
            const { data, error } = await supabase.functions.invoke(functionName, {
              body: {
                imageBase64: base64,
                caseId,
                expectedType: documentType,
              },
            });

            if (error) throw error;

            if (data?.success) {
              resolve(data.data);
            } else {
              throw new Error('OCR processing failed');
            }
          } catch (err) {
            reject(err);
          }
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  };

  const handleProcessPassport = async () => {
    if (!passportFile) {
      toast.error("Please select a passport file");
      return;
    }

    setProcessing(true);
    try {
      const result = await processOCR(passportFile, 'passport');
      setPassportResult(result);
      
      if (result.confidence >= 0.85) {
        toast.success("Passport scanned successfully!");
        setStep('birthcert');
      } else {
        toast.warning("Low confidence scan - please review extracted data");
      }
      
      if (onDataExtracted) {
        onDataExtracted({ passport: result });
      }
    } catch (error) {
      console.error('Passport processing error:', error);
      toast.error("Failed to process passport");
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessBirthCert = async () => {
    if (!birthCertFile) {
      toast.error("Please select a birth certificate file");
      return;
    }

    setProcessing(true);
    try {
      const result = await processOCR(birthCertFile, 'birth_certificate');
      setBirthCertResult(result);
      
      if (result.confidence >= 0.80) {
        toast.success("Birth certificate scanned successfully!");
      } else {
        toast.warning("Low confidence scan - please review extracted data");
      }
      
      if (onDataExtracted) {
        onDataExtracted({ 
          passport: passportResult?.extracted_data,
          birthCert: result 
        });
      }
      
      setStep('complete');
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Birth certificate processing error:', error);
      toast.error("Failed to process birth certificate");
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipBirthCert = () => {
    setStep('complete');
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`flex items-center gap-2 ${step === 'passport' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            passportResult ? 'bg-green-500 text-white' : step === 'passport' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {passportResult ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <span className="text-sm font-medium">Passport</span>
        </div>
        
        <div className="w-12 h-0.5 bg-muted" />
        
        <div className={`flex items-center gap-2 ${step === 'birthcert' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            birthCertResult ? 'bg-green-500 text-white' : step === 'birthcert' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            {birthCertResult ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <span className="text-sm font-medium">Birth Cert</span>
        </div>
      </div>

      {/* Image Editor */}
      {editingImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crop className="w-5 h-5" />
              Adjust Image - {editingImage === 'passport' ? 'Passport' : 'Birth Certificate'}
            </CardTitle>
            <CardDescription>
              Crop, rotate, and zoom to improve scan quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={handleRotate} variant="outline" size="sm">
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate 90°
              </Button>
              <Button onClick={handleZoomIn} variant="outline" size="sm">
                <ZoomIn className="w-4 h-4 mr-2" />
                Zoom In
              </Button>
              <Button onClick={handleZoomOut} variant="outline" size="sm">
                <ZoomOut className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden bg-muted/50">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
              >
                <img
                  ref={imgRef}
                  src={editingImage === 'passport' ? passportPreview! : birthCertPreview!}
                  alt="Preview"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    maxWidth: '100%',
                    transformOrigin: 'center'
                  }}
                  onLoad={() => {
                    if (imgRef.current) {
                      const { width, height } = imgRef.current;
                      setCrop({
                        unit: '%',
                        width: 90,
                        height: 90,
                        x: 5,
                        y: 5
                      });
                    }
                  }}
                />
              </ReactCrop>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyEdits} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply & Continue
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingImage(null);
                  setRotation(0);
                  setScale(1);
                  setCrop(undefined);
                }}
                className="flex-1"
              >
                Skip Editing
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passport Scanner */}
      {step === 'passport' && !editingImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan Passport
            </CardTitle>
            <CardDescription>
              Upload passport photo, PDF, or scan. Supports all major file formats.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Passport File</Label>
              <Input
                ref={passportInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e, 'passport')}
                disabled={processing}
              />
              {passportFile && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {passportFile.name} ({(passportFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            <Button
              onClick={handleProcessPassport}
              disabled={!passportFile || processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Scan Passport
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Birth Certificate Scanner */}
      {step === 'birthcert' && !editingImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Scan Birth Certificate (Optional)
            </CardTitle>
            <CardDescription>
              Upload for parent data auto-fill. Skip if not needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Birth Certificate File</Label>
              <Input
                ref={birthCertInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e, 'birthcert')}
                disabled={processing}
              />
              {birthCertFile && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {birthCertFile.name} ({(birthCertFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleProcessBirthCert}
                disabled={!birthCertFile || processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Scan Birth Cert
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSkipBirthCert}
                disabled={processing}
                className="flex-1"
              >
                Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {passportResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Passport Data</span>
              <Badge className={passportResult.confidence >= 0.85 ? "bg-green-500" : "bg-yellow-500"}>
                {(passportResult.confidence * 100).toFixed(0)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(passportResult.extracted_data).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{key.replace(/_/g, ' ')}</div>
                  <div className="text-muted-foreground">{String(value)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {birthCertResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Birth Certificate Data</span>
              <Badge className={birthCertResult.confidence >= 0.80 ? "bg-green-500" : "bg-yellow-500"}>
                {(birthCertResult.confidence * 100).toFixed(0)}% Confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(birthCertResult.extracted_data).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{key.replace(/_/g, ' ')}</div>
                  <div className="text-muted-foreground">{String(value)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};