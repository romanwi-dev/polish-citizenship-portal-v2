import { useState } from 'react';
import { removeBackground, loadImage } from '@/utils/removeBackground';
import pragueSkyline from '@/assets/prague-skyline.png';

export default function ImageProcessor() {
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      // Fetch the image
      const response = await fetch(pragueSkyline);
      const blob = await response.blob();
      
      // Load as HTMLImageElement
      const img = await loadImage(blob);
      
      // Remove background
      const resultBlob = await removeBackground(img);
      
      // Create URL for preview
      const url = URL.createObjectURL(resultBlob);
      setProcessedImage(url);
      
      // Download the image
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prague-skyline-no-bg.png';
      link.click();
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Background Remover</h1>
        
        <div className="space-y-4">
          <button
            onClick={processImage}
            disabled={processing}
            className="px-6 py-3 bg-primary text-white rounded-lg disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Remove Background from Prague Skyline'}
          </button>
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Original</h2>
              <img src={pragueSkyline} alt="Original Prague skyline" className="w-full border" />
            </div>
            
            {processedImage && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Processed (Background Removed)</h2>
                <img src={processedImage} alt="Processed Prague skyline" className="w-full border" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
