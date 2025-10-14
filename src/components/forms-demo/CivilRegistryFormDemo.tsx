import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CivilRegistryFormDemoProps {
  onClose: () => void;
}

export default function CivilRegistryFormDemo({ onClose }: CivilRegistryFormDemoProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Civil Registry
        </h2>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Civil Registry Form</CardTitle>
          <CardDescription>
            Civil registry applications and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg">Form coming soon...</p>
            <p className="text-sm mt-2">Civil registry form will be implemented with full field validation</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
