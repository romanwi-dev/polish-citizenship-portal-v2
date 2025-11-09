/**
 * Mobile-First Image Compression Utility
 * Handles format-aware compression with transparency preservation
 */

export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0-1
  preserveTransparency: boolean;
}

interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
}

/**
 * Check if browser supports WebP
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    return false;
  }
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Check if image has transparency
 */
async function hasTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        
        // Check a few pixels for alpha channel
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image with format-aware logic
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {
    maxWidth: 1200,
    maxHeight: 1600,
    quality: 0.85,
    preserveTransparency: true
  }
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const img = new Image();
      
      img.onload = async () => {
        // Calculate new dimensions (maintain aspect ratio)
        let { width, height } = img;
        if (width > options.maxWidth) {
          height = (height * options.maxWidth) / width;
          width = options.maxWidth;
        }
        if (height > options.maxHeight) {
          width = (width * options.maxHeight) / height;
          height = options.maxHeight;
        }

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format
        let targetFormat = 'image/jpeg';
        let quality = options.quality;
        
        if (file.type === 'image/png' && options.preserveTransparency) {
          const transparent = await hasTransparency(file);
          if (transparent) {
            targetFormat = supportsWebP() ? 'image/webp' : 'image/png';
            console.log('Preserving transparency:', targetFormat);
          }
        } else if (supportsWebP() && file.type !== 'image/png') {
          targetFormat = 'image/webp';
          quality = options.quality * 0.9; // WebP is more efficient
        }

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            
            const extension = targetFormat.split('/')[1];
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, `.${extension}`),
              { type: targetFormat }
            );
            
            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const compressionRatio = ((1 - (compressedSize / originalSize)) * 100).toFixed(1);
            
            console.log(`Compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(compressedSize / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`);
            
            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressionRatio: parseFloat(compressionRatio),
              format: targetFormat
            });
          },
          targetFormat,
          quality
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}
