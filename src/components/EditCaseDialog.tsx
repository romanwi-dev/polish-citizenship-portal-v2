import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Camera } from "lucide-react";
import { useUpdateCase } from "@/hooks/useCases";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFormAutoSave } from "@/hooks/useFormAutoSave";

interface EditCaseDialogProps {
  caseData: {
    id: string;
    name: string;
    client_code?: string;
    country: string;
    status: string;
    generation?: string;
    push_scheme?: string | null;
    payment_status?: string | null;
    is_vip: boolean;
    notes?: string;
    progress: number;
    client_photo_url?: string | null;
    start_date?: string | null;
    kpi_docs_percentage?: number;
    client_score?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const EditCaseDialog = ({ caseData, open, onOpenChange, onUpdate }: EditCaseDialogProps) => {
  const updateCaseMutation = useUpdateCase();
  
  // Convert YYYY-MM-DD to DD.MM.YYYY for display
  const formatDateForDisplay = (dateStr: string | null): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };
  
  // Convert DD.MM.YYYY to YYYY-MM-DD for database
  const formatDateForDatabase = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const parts = dateStr.split(".");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  
  const [formData, setFormData] = useState({
    client_name: caseData.name,
    client_code: caseData.client_code || "",
    country: caseData.country,
    status: caseData.status,
    processing_mode: caseData.generation || "standard",
    push_scheme: caseData.push_scheme || "NONE",
    payment_status: caseData.payment_status || "pay",
    is_vip: caseData.is_vip,
    notes: caseData.notes || "",
    progress: caseData.progress,
    start_date: formatDateForDisplay(caseData.start_date),
    kpi_docs_percentage: caseData.kpi_docs_percentage || 0,
    client_score: caseData.client_score || 0,
  });

  // Reset form data when caseData changes (when dialog reopens with different case)
  useEffect(() => {
    if (open) {
      setFormData({
        client_name: caseData.name,
        client_code: caseData.client_code || "",
        country: caseData.country,
        status: caseData.status,
        processing_mode: caseData.generation || "standard",
        push_scheme: caseData.push_scheme || "NONE",
        payment_status: caseData.payment_status || "pay",
        is_vip: caseData.is_vip,
        notes: caseData.notes || "",
        progress: caseData.progress,
        start_date: formatDateForDisplay(caseData.start_date),
        kpi_docs_percentage: caseData.kpi_docs_percentage || 0,
        client_score: caseData.client_score || 0,
      });
    }
  }, [open, caseData]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(caseData.client_photo_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showOtherCountry, setShowOtherCountry] = useState(
    !["USA", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France"].includes(caseData.country)
  );
  const [otherCountry, setOtherCountry] = useState(
    !["USA", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France"].includes(caseData.country) 
      ? caseData.country 
      : ""
  );

  // Multi-select processing modes
  const [selectedProcessingModes, setSelectedProcessingModes] = useState<string[]>([]);
  const [clientScoreRange, setClientScoreRange] = useState<[number, number]>([0, 100]);
  const [progressRange, setProgressRange] = useState<[number, number]>([0, 100]);
  const [caseAgeFilter, setCaseAgeFilter] = useState("all");
  const [paymentDueFilter, setPaymentDueFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSchemes, setSelectedSchemes] = useState<string[]>([]);

  const toggleProcessingMode = (mode: string) => {
    setSelectedProcessingModes(prev => 
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleScheme = (scheme: string) => {
    setSelectedSchemes(prev => 
      prev.includes(scheme) ? prev.filter(s => s !== scheme) : [...prev, scheme]
    );
  };

  const clearAllFilters = () => {
    setSelectedProcessingModes([]);
    setClientScoreRange([0, 100]);
    setProgressRange([0, 100]);
    setCaseAgeFilter("all");
    setPaymentDueFilter(false);
    setSelectedStatuses([]);
    setSelectedSchemes([]);
  };

  const activeFiltersCount = 
    selectedProcessingModes.length + 
    selectedStatuses.length + 
    selectedSchemes.length +
    (clientScoreRange[0] !== 0 || clientScoreRange[1] !== 100 ? 1 : 0) +
    (progressRange[0] !== 0 || progressRange[1] !== 100 ? 1 : 0) +
    (caseAgeFilter !== "all" ? 1 : 0) +
    (paymentDueFilter ? 1 : 0);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Photo must be less than 2MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Auto-save disabled - was causing too many issues
  // Users will use manual save instead


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const countryValue = showOtherCountry ? otherCountry : formData.country;
    
    // Validate processing_mode - must not be empty
    if (!formData.processing_mode || formData.processing_mode.trim() === '') {
      toast.error("Processing mode cannot be empty");
      return;
    }
    
    let client_photo_url = caseData.client_photo_url;

    // Upload photo if new file selected
    if (photoFile) {
      setIsUploading(true);
      try {
        // Delete old photo first (if exists)
        if (caseData.client_photo_url) {
          try {
            const oldPath = caseData.client_photo_url.split('/').pop();
            if (oldPath) {
              await supabase.storage
                .from('client-photos')
                .remove([oldPath]);
            }
          } catch (err) {
            // Photo deletion failed (non-critical)
          }
        }
        
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${caseData.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('client-photos')
          .upload(filePath, photoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('client-photos')
          .getPublicUrl(filePath);

        client_photo_url = publicUrl;
        toast.success("Photo uploaded successfully");
      } catch (error) {
        console.error("Photo upload error:", error);
        toast.error("Failed to upload photo");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else if (photoPreview === null && caseData.client_photo_url) {
      // Photo was removed - delete from storage
      try {
        const oldPath = caseData.client_photo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('client-photos')
            .remove([oldPath]);
        }
      } catch (err) {
        // Photo deletion failed (non-critical)
      }
      client_photo_url = null;
    }
    
    updateCaseMutation.mutate(
      {
        caseId: caseData.id,
        updates: {
          client_name: formData.client_name,
          client_code: formData.client_code || null,
          country: countryValue,
          status: formData.status as any,
          processing_mode: formData.processing_mode as any,
          push_scheme: formData.push_scheme === "NONE" ? null : formData.push_scheme,
          payment_status: formData.payment_status as any,
          is_vip: formData.is_vip,
          notes: formData.notes,
          progress: formData.progress,
          client_photo_url,
          start_date: formatDateForDatabase(formData.start_date),
          kpi_docs_percentage: formData.kpi_docs_percentage,
          client_score: formData.client_score,
        },
      },
      {
        onSuccess: () => {
          onUpdate();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto scrollbar-hide bg-background/95 backdrop-blur-xl border-2 border-primary/20">
        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          {/* Basic Information - Enhanced Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="client_name" className="text-base font-semibold text-foreground">Client</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
                className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-blue-950/80 text-base h-12"
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="start_date" className="text-base font-semibold text-foreground">Start</Label>
              <Input
                id="start_date"
                type="text"
                placeholder="DD.MM.YYYY"
                value={formData.start_date}
                onChange={(e) => {
                  const value = e.target.value;
                  const filtered = value.replace(/[^\d.]/g, '');
                  setFormData({ ...formData, start_date: filtered });
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!value) return;
                  
                  const parts = value.split('.');
                  if (parts.length === 3) {
                    const [day, month, year] = parts;
                    const dayNum = parseInt(day);
                    const monthNum = parseInt(month);
                    const yearNum = parseInt(year);
                    
                    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum > 2030) {
                      toast.error("Invalid date format. Use DD.MM.YYYY (day ≤ 31, month ≤ 12, year ≤ 2030)");
                      setFormData({ ...formData, start_date: "" });
                    }
                  } else if (value.length > 0) {
                    toast.error("Invalid date format. Use DD.MM.YYYY");
                    setFormData({ ...formData, start_date: "" });
                  }
                }}
                className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-blue-950/80 text-base h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="client_code" className="text-base font-semibold text-foreground">Code</Label>
              <Select value={formData.client_code} onValueChange={(value) => setFormData({ ...formData, client_code: value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-blue-950/80 text-base h-12">
                  <SelectValue placeholder="Select client code" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border z-50">
                  <SelectItem value="Bad">Bad</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Topp">Topp</SelectItem>
                  <SelectItem value="ExTopFr">ExTopFr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="payment_status" className="text-base font-semibold text-foreground">Payment</Label>
              <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-blue-950/80 text-base h-12">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border z-50">
                  <SelectItem value="pay">Pay</SelectItem>
                  <SelectItem value="clear">Clear</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="country" className="text-base font-semibold text-foreground">Country</Label>
              <Select 
                value={showOtherCountry ? "Other" : formData.country} 
                onValueChange={(value) => {
                  if (value === "Other") {
                    setShowOtherCountry(true);
                    setFormData({ ...formData, country: "" });
                  } else {
                    setShowOtherCountry(false);
                    setOtherCountry("");
                    setFormData({ ...formData, country: value });
                  }
                }}
              >
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-blue-950/80 text-base h-12">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border z-50">
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="Venezuela">Venezuela</SelectItem>
                  <SelectItem value="Israel">Israel</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {showOtherCountry && (
                <Input
                  placeholder="Enter country name"
                  value={otherCountry}
                  onChange={(e) => setOtherCountry(e.target.value)}
                  className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-blue-950/80 text-base h-12"
                />
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="status" className="text-base font-semibold text-foreground">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-blue-950/80 text-base h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border z-50">
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="bad">Bad</SelectItem>
                  <SelectItem value="name_change">Name Change</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Case Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="processing_mode" className="text-base font-semibold text-foreground">Mode</Label>
              <Select value={formData.processing_mode} onValueChange={(value) => setFormData({ ...formData, processing_mode: value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-blue-950/80 text-base h-12">
                  <SelectValue placeholder="Select processing mode" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border z-50">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="expedited">Expedited</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="vip_plus">VIP+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="push_scheme" className="text-base font-semibold text-foreground">Schemes</Label>
              <Select value={formData.push_scheme || "NONE"} onValueChange={(value) => setFormData({ ...formData, push_scheme: value === "NONE" ? null : value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-blue-950/80 text-base h-12">
                  <SelectValue placeholder="Select push scheme" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border z-50">
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="PUSH">PUSH - Aggressive follow-up</SelectItem>
                  <SelectItem value="NUDGE">NUDGE - Regular reminders</SelectItem>
                  <SelectItem value="SITDOWN">SITDOWN - Formal meeting</SelectItem>
                  <SelectItem value="SLOW">SLOW - Standard pace</SelectItem>
                  <SelectItem value="ALL SCHEMES">ALL SCHEMES - All strategies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="progress" className="text-base font-semibold text-foreground">Progress</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData({ ...formData, progress: 0 });
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setFormData({ ...formData, progress: num });
                    }
                  }
                }}
                className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-green-950/80 text-base h-12"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="kpi_docs_percentage" className="text-base font-semibold text-foreground">Documents</Label>
              <Input
                id="kpi_docs_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.kpi_docs_percentage ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData({ ...formData, kpi_docs_percentage: 0 });
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setFormData({ ...formData, kpi_docs_percentage: num });
                    }
                  }
                }}
                className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-green-950/80 text-base h-12"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="client_score" className="text-base font-semibold text-foreground">Score</Label>
              <Input
                id="client_score"
                type="number"
                min="0"
                max="100"
                value={formData.client_score ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setFormData({ ...formData, client_score: 0 });
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setFormData({ ...formData, client_score: num });
                    }
                  }
                }}
                className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-green-950/80 text-base h-12"
              />
            </div>
          </div>


          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-semibold text-foreground">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={5}
              placeholder="Add any additional notes about this case..."
              className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-background/50 text-base resize-none"
            />
          </div>

          {/* Action Buttons - Premium Design */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-border/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              size="lg"
              className="px-8 border-2 border-border/50 hover:border-destructive/50 hover:bg-destructive/10 text-base h-12"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateCaseMutation.isPending || isUploading}
              variant="outline"
              size="lg"
              className="px-8 border-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 text-base h-12"
            >
              {isUploading ? "Uploading..." : updateCaseMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
