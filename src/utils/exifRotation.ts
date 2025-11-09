/**
 * EXIF Orientation Handler with Privacy Protection
 * Fixes image orientation while stripping sensitive metadata
 */

export async function fixImageOrientation(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const view = new DataView(arrayBuffer);
      
      // Check for JPEG marker
      if (view.getUint16(0, false) !== 0xFFD8) {
        console.log('Not a JPEG, skipping EXIF processing');
        resolve(file);
        return;
      }

      // Find EXIF orientation
      let orientation = 1;
      let offset = 2;
      
      try {
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          
          if (marker === 0xFFE1) { // APP1 marker (EXIF)
            const exifOffset = offset + 10;
            
            // Check bounds
            if (exifOffset + 8 >= view.byteLength) break;
            
            const little = view.getUint16(exifOffset, false) === 0x4949;
            const tags = view.getUint16(exifOffset + 8, little);
            
            for (let i = 0; i < tags; i++) {
              const tagOffset = exifOffset + 10 + (i * 12);
              
              if (tagOffset + 10 >= view.byteLength) break;
              
              const tag = view.getUint16(tagOffset, little);
              
              if (tag === 0x0112) { // Orientation tag
                orientation = view.getUint16(tagOffset + 8, little);
                console.log('Found EXIF orientation:', orientation);
                break;
              }
            }
            break;
          } else {
            const length = view.getUint16(offset, false);
            offset += length;
          }
        }
      } catch (err) {
        console.warn('EXIF parsing error:', err);
        // Continue with orientation = 1 (no rotation)
      }

      // No rotation needed
      if (orientation === 1) {
        // Still strip EXIF for privacy
        stripEXIFAndResolve(file, resolve);
        return;
      }

      // Rotate image based on orientation
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Set canvas size based on rotation
        if (orientation > 4 && orientation < 9) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Apply rotation transform
        switch (orientation) {
          case 2:
            ctx.transform(-1, 0, 0, 1, img.width, 0);
            break;
          case 3:
            ctx.transform(-1, 0, 0, -1, img.width, img.height);
            break;
          case 4:
            ctx.transform(1, 0, 0, -1, 0, img.height);
            break;
          case 5:
            ctx.transform(0, 1, 1, 0, 0, 0);
            break;
          case 6:
            ctx.transform(0, 1, -1, 0, img.height, 0);
            break;
          case 7:
            ctx.transform(0, -1, -1, 0, img.height, img.width);
            break;
          case 8:
            ctx.transform(0, -1, 1, 0, 0, img.width);
            break;
        }

        ctx.drawImage(img, 0, 0);

        // Convert to blob (automatically strips EXIF)
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error('Blob conversion failed');
            resolve(file);
            return;
          }
          
          const rotatedFile = new File([blob!], file.name, { 
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          console.log('Image rotated and EXIF stripped (privacy protected)');
          resolve(rotatedFile);
        }, 'image/jpeg', 0.95);
      };

      img.onerror = () => {
        console.error('Image load failed for rotation');
        resolve(file);
      };

      img.src = URL.createObjectURL(file);
    };

    reader.onerror = () => {
      console.error('File read failed');
      resolve(file);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Strip EXIF metadata for privacy
 * Removes GPS, camera model, and other sensitive data
 */
function stripEXIFAndResolve(file: File, resolve: (file: File) => void) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(file);
        return;
      }
      
      const cleanFile = new File([blob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      console.log('EXIF metadata stripped for privacy');
      resolve(cleanFile);
    }, 'image/jpeg', 0.95);
  };
  
  img.onerror = () => resolve(file);
  img.src = URL.createObjectURL(file);
}
