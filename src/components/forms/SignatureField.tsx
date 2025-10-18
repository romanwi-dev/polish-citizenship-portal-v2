import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Save } from 'lucide-react';

interface SignatureFieldProps {
  onSave: (signature: string) => void;
  label?: string;
  required?: boolean;
}

export function SignatureField({ onSave, label = 'Signature', required = false }: SignatureFieldProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      return;
    }
    
    const signature = sigCanvas.current?.toDataURL('image/png');
    if (signature) {
      onSave(signature);
      setIsEmpty(false);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              className: 'w-full h-40 cursor-crosshair',
              style: { touchAction: 'none' }
            }}
            onBegin={handleBegin}
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={clear}
            disabled={isEmpty}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={isEmpty}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Signature
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Draw your signature using your mouse or touchscreen
        </p>
      </CardContent>
    </Card>
  );
}
