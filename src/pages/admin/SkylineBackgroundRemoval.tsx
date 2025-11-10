import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";
import { toast } from "sonner";

// Import skyline images
import budapestLineart from "@/assets/budapest-lineart.png";
import berlinLineart from "@/assets/berlin-lineart.png";
import parisLineart from "@/assets/paris-lineart.png";
import athensLineart from "@/assets/athens-lineart.png";
import madridLineart from "@/assets/madrid-lineart.png";
import romeLineart from "@/assets/rome-lineart.png";
import brusselsLineart from "@/assets/brussels-lineart.png";
import europeanSkylineLineart from "@/assets/european-skyline-lineart.png";
import warsawLineart from "@/assets/warsaw-lineart.png";

interface SkylineImage {
  id: string;
  name: string;
  src: string;
}

const skylineImages: SkylineImage[] = [
  { id: "budapest", name: "Budapest", src: budapestLineart },
  { id: "berlin", name: "Berlin", src: berlinLineart },
  { id: "paris", name: "Paris", src: parisLineart },
  { id: "athens", name: "Athens", src: athensLineart },
  { id: "madrid", name: "Madrid", src: madridLineart },
  { id: "rome", name: "Rome", src: romeLineart },
  { id: "brussels", name: "Brussels", src: brusselsLineart },
  { id: "european", name: "European Skyline", src: europeanSkylineLineart },
  { id: "warsaw", name: "Warsaw", src: warsawLineart },
];

export default function SkylineBackgroundRemoval() {
  const [processedImages, setProcessedImages] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const handleRemoveBackground = async (image: SkylineImage) => {
    try {
      setProcessing((prev) => ({ ...prev, [image.id]: true }));
      toast.info(`Processing ${image.name}...`);

      const imgElement = await loadImage(image.src);
      const resultBlob = await removeBackground(imgElement);
      const resultUrl = URL.createObjectURL(resultBlob);

      setProcessedImages((prev) => ({ ...prev, [image.id]: resultUrl }));
      toast.success(`${image.name} background removed successfully!`);
    } catch (error) {
      console.error("Background removal failed:", error);
      toast.error(`Failed to process ${image.name}`);
    } finally {
      setProcessing((prev) => ({ ...prev, [image.id]: false }));
    }
  };

  const handleDownload = (image: SkylineImage) => {
    const url = processedImages[image.id];
    if (!url) return;

    const a = document.createElement("a");
    a.href = url;
    a.download = `${image.id}-no-bg.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`${image.name} downloaded!`);
  };

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Skyline Background Removal
          </h1>
          <p className="text-muted-foreground text-lg">
            Using Hugging Face Transformers to remove backgrounds from European skyline images
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skylineImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 space-y-4">
                <h3 className="font-semibold text-lg">{image.name}</h3>
                
                {/* Original Image */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Original</p>
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Processed Image */}
                {processedImages[image.id] && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
                          backgroundSize: "20px 20px",
                          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                        }}
                      />
                      <img
                        src={processedImages[image.id]}
                        alt={`${image.name} - no background`}
                        className="relative w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRemoveBackground(image)}
                    disabled={processing[image.id]}
                    className="flex-1"
                    variant="default"
                  >
                    {processing[image.id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ImageOff className="mr-2 h-4 w-4" />
                        Remove Background
                      </>
                    )}
                  </Button>

                  {processedImages[image.id] && (
                    <Button
                      onClick={() => handleDownload(image)}
                      variant="outline"
                      size="icon"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
