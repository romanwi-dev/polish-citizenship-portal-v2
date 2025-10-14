import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  generateArchiveRequest,
  getArchiveRequestFilename,
  POLISH_ARCHIVES,
  ArchiveRequestData,
} from "@/utils/archiveRequestGenerator";

export const ArchiveRequestGenerator = () => {
  const [formData, setFormData] = useState<Partial<ArchiveRequestData>>({
    requestType: 'birth',
    archiveName: POLISH_ARCHIVES[0].name,
    archiveAddress: POLISH_ARCHIVES[0].address,
    archiveCity: POLISH_ARCHIVES[0].city,
    archivePostalCode: POLISH_ARCHIVES[0].postalCode,
  });

  const handleArchiveChange = (archiveName: string) => {
    const archive = POLISH_ARCHIVES.find(a => a.name === archiveName);
    if (archive) {
      setFormData({
        ...formData,
        archiveName: archive.name,
        archiveAddress: archive.address,
        archiveCity: archive.city,
        archivePostalCode: archive.postalCode,
      });
    }
  };

  const handleGenerate = () => {
    // Validate required fields
    if (!formData.personFirstName || !formData.personLastName || !formData.applicantName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const letter = generateArchiveRequest(formData as ArchiveRequestData);
      const filename = getArchiveRequestFilename(formData as ArchiveRequestData);
      
      // Create downloadable file
      const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Archive request letter generated!');
    } catch (error) {
      console.error('Error generating letter');
      toast.error('Failed to generate letter');
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Polish Archive Request Generator</CardTitle>
        <CardDescription>
          Generate official Polish letters to request civil documents from archives
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Request Type */}
        <div className="space-y-2">
          <Label>Request Type</Label>
          <Select
            value={formData.requestType}
            onValueChange={(value) => setFormData({ ...formData, requestType: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birth">Birth Certificate (Akt urodzenia)</SelectItem>
              <SelectItem value="marriage">Marriage Certificate (Akt małżeństwa)</SelectItem>
              <SelectItem value="death">Death Certificate (Akt zgonu)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Person Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Person's First Name *</Label>
            <Input
              value={formData.personFirstName || ''}
              onChange={(e) => setFormData({ ...formData, personFirstName: e.target.value })}
              placeholder="Jan"
            />
          </div>
          <div className="space-y-2">
            <Label>Person's Last Name *</Label>
            <Input
              value={formData.personLastName || ''}
              onChange={(e) => setFormData({ ...formData, personLastName: e.target.value })}
              placeholder="Kowalski"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date of Birth (optional)</Label>
            <Input
              type="text"
              value={formData.personDateOfBirth || ''}
              onChange={(e) => setFormData({ ...formData, personDateOfBirth: e.target.value })}
              placeholder="15.03.1950"
            />
          </div>
          <div className="space-y-2">
            <Label>Place of Birth (optional)</Label>
            <Input
              value={formData.personPlaceOfBirth || ''}
              onChange={(e) => setFormData({ ...formData, personPlaceOfBirth: e.target.value })}
              placeholder="Warszawa"
            />
          </div>
        </div>

        {/* Archive Selection */}
        <div className="space-y-2">
          <Label>Polish Archive</Label>
          <Select value={formData.archiveName} onValueChange={handleArchiveChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POLISH_ARCHIVES.map((archive) => (
                <SelectItem key={archive.name} value={archive.name}>
                  {archive.name} - {archive.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Applicant Details */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Your Contact Information</h3>
          
          <div className="space-y-2">
            <Label>Your Full Name *</Label>
            <Input
              value={formData.applicantName || ''}
              onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
              placeholder="John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label>Your Address</Label>
            <Textarea
              value={formData.applicantAddress || ''}
              onChange={(e) => setFormData({ ...formData, applicantAddress: e.target.value })}
              placeholder="123 Main Street, City, State, ZIP, Country"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Your Email</Label>
              <Input
                type="email"
                value={formData.applicantEmail || ''}
                onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Your Phone</Label>
              <Input
                type="tel"
                value={formData.applicantPhone || ''}
                onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleGenerate} className="flex-1 gap-2">
            <FileDown className="w-4 h-4" />
            Generate & Download Letter
          </Button>
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
