import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ClientPhotoUploadProps {
  caseId: string;
  currentPhotoUrl: string | null;
  clientName: string;
  onPhotoUpdated: (photoUrl: string | null) => void;
}

export function ClientPhotoUpload({ 
  caseId, 
  currentPhotoUrl, 
  clientName,
  onPhotoUpdated 
}: ClientPhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Delete old photo if exists
      if (currentPhotoUrl) {
        const oldPath = currentPhotoUrl.split('/client-photos/')[1];
        if (oldPath) {
          await supabase.storage.from('client-photos').remove([oldPath]);
        }
      }

      // Upload new photo
      const fileExt = file.name.split('.').pop();
      const fileName = `${caseId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('client-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('client-photos')
        .getPublicUrl(filePath);

      // Update case record
      const { error: updateError } = await supabase
        .from('cases')
        .update({ client_photo_url: publicUrl })
        .eq('id', caseId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      onPhotoUpdated(publicUrl);
      toast.success('Client photo updated successfully');
      setIsOpen(false);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload photo: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);

    try {
      // Delete from storage
      if (currentPhotoUrl) {
        const oldPath = currentPhotoUrl.split('/client-photos/')[1];
        if (oldPath) {
          await supabase.storage.from('client-photos').remove([oldPath]);
        }
      }

      // Update case record
      const { error } = await supabase
        .from('cases')
        .update({ client_photo_url: null })
        .eq('id', caseId);

      if (error) throw error;

      setPreviewUrl(null);
      onPhotoUpdated(null);
      toast.success('Client photo removed');
      setIsOpen(false);

    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error(`Failed to remove photo: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={previewUrl || undefined} alt={clientName} />
            <AvatarFallback className="bg-gradient-to-br from-primary/60 to-accent/60">
              <Camera className="w-6 h-6 text-primary-foreground/70" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Client Photo</DialogTitle>
          <DialogDescription>
            Upload a photo for {clientName}. JPG, PNG, or WebP (max 5MB)
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={previewUrl || undefined} alt={clientName} />
            <AvatarFallback className="bg-gradient-to-br from-primary/60 to-accent/60">
              <Camera className="w-16 h-16 text-primary-foreground/70" />
            </AvatarFallback>
          </Avatar>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex gap-2 w-full">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </>
              )}
            </Button>

            {previewUrl && (
              <Button
                onClick={handleRemovePhoto}
                disabled={isUploading}
                variant="destructive"
                size="icon"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
