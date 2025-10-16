import { useState } from "react";
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

interface EditCaseDialogProps {
  caseData: {
    id: string;
    name: string;
    client_code?: string;
    country: string;
    status: string;
    generation?: string;
    is_vip: boolean;
    notes?: string;
    progress: number;
    client_photo_url?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const EditCaseDialog = ({ caseData, open, onOpenChange, onUpdate }: EditCaseDialogProps) => {
  const updateCaseMutation = useUpdateCase();
  const [formData, setFormData] = useState({
    client_name: caseData.name,
    client_code: caseData.client_code || "",
    country: caseData.country,
    status: caseData.status,
    generation: caseData.generation || "",
    is_vip: caseData.is_vip,
    notes: caseData.notes || "",
    progress: caseData.progress,
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const countryValue = showOtherCountry ? otherCountry : formData.country;
    
    let client_photo_url = caseData.client_photo_url;

    // Upload photo if new file selected
    if (photoFile) {
      setIsUploading(true);
      try {
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
      // Photo was removed
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
          generation: formData.generation as any,
          is_vip: formData.is_vip,
          notes: formData.notes,
          progress: formData.progress,
          client_photo_url,
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
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-2 border-primary/20">
        <DialogHeader className="space-y-3 pb-6 border-b border-border/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Edit Case Details
            </DialogTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-base px-4 py-2 bg-primary/20 border-primary/30">
                {activeFiltersCount} Active Filter{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <DialogDescription className="text-base text-muted-foreground">
            Update client information, case status, and apply advanced filters
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          {/* Client Photo Upload - Premium Style */}
          <div className="space-y-4 p-6 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
            <Label className="text-lg font-semibold text-foreground">Client Photo</Label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-primary/30 shadow-lg transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-xl">
                  <AvatarImage src={photoPreview || undefined} alt={formData.client_name} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/70 to-accent/70 text-2xl">
                    <Camera className="h-10 w-10 text-primary-foreground/80" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="cursor-pointer border-2 border-border/50 hover:border-primary/50 transition-colors bg-background/50 text-base h-12"
                  />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  JPG, PNG or WEBP (max 2MB)
                </p>
              </div>
              {photoPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleRemovePhoto}
                  className="border-2 border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                >
                  <X className="h-5 w-5 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Basic Information - Enhanced Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="client_name" className="text-base font-semibold text-foreground">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
                className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-background/50 text-base h-12"
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="client_code" className="text-base font-semibold text-foreground">Client Code</Label>
              <Select value={formData.client_code} onValueChange={(value) => setFormData({ ...formData, client_code: value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-background/50 text-base h-12">
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
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-background/50 text-base h-12">
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
                  className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-background/50 text-base h-12"
                />
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="status" className="text-base font-semibold text-foreground">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-background/50 text-base h-12">
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

          {/* Advanced Filters Section - Premium Design */}
          <div className="space-y-6 p-6 border-2 border-secondary/20 rounded-xl bg-gradient-to-br from-secondary/5 to-accent/5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Advanced Filters
              </h3>
              {activeFiltersCount > 0 && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="border-2 border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All ({activeFiltersCount})
                </Button>
              )}
            </div>
            
            {/* Processing Modes - Enhanced Grid */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">Processing Modes</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["standard", "expedited", "vip", "vip_plus"].map((mode) => (
                  <div 
                    key={mode} 
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedProcessingModes.includes(mode) 
                        ? 'bg-primary/10 border-primary/50' 
                        : 'bg-background/30 border-border/30 hover:border-border/50'
                    }`}
                    onClick={() => toggleProcessingMode(mode)}
                  >
                    <Checkbox
                      id={`mode-${mode}`}
                      checked={selectedProcessingModes.includes(mode)}
                      onCheckedChange={() => toggleProcessingMode(mode)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`mode-${mode}`} className="text-sm font-medium capitalize cursor-pointer flex-1">
                      {mode === "vip_plus" ? "VIP+" : mode}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status - Enhanced Grid */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">Status Filter</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["lead", "active", "on_hold", "suspended", "finished", "failed", "bad", "name_change", "other"].map((status) => (
                  <div 
                    key={status} 
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedStatuses.includes(status) 
                        ? 'bg-secondary/10 border-secondary/50' 
                        : 'bg-background/30 border-border/30 hover:border-border/50'
                    }`}
                    onClick={() => toggleStatus(status)}
                  >
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm font-medium capitalize cursor-pointer flex-1">
                      {status.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Schemes - Enhanced Grid */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">Push Schemes</Label>
              <div className="grid grid-cols-3 gap-4">
                {["PUSH", "NUDGE", "SIT-DOWN"].map((scheme) => (
                  <div 
                    key={scheme} 
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedSchemes.includes(scheme) 
                        ? 'bg-accent/10 border-accent/50' 
                        : 'bg-background/30 border-border/30 hover:border-border/50'
                    }`}
                    onClick={() => toggleScheme(scheme)}
                  >
                    <Checkbox
                      id={`scheme-${scheme}`}
                      checked={selectedSchemes.includes(scheme)}
                      onCheckedChange={() => toggleScheme(scheme)}
                      className="h-5 w-5"
                    />
                    <Label htmlFor={`scheme-${scheme}`} className="text-sm font-medium cursor-pointer flex-1">
                      {scheme}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sliders - Enhanced Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-4 rounded-lg bg-background/30 border border-border/30">
                <Label className="text-base font-semibold text-foreground">
                  Client Score: <span className="text-primary">{clientScoreRange[0]} - {clientScoreRange[1]}</span>
                </Label>
                <Slider
                  value={clientScoreRange}
                  onValueChange={(value) => setClientScoreRange(value as [number, number])}
                  min={0}
                  max={100}
                  step={5}
                  className="py-2"
                />
              </div>

              <div className="space-y-4 p-4 rounded-lg bg-background/30 border border-border/30">
                <Label className="text-base font-semibold text-foreground">
                  Progress: <span className="text-secondary">{progressRange[0]}% - {progressRange[1]}%</span>
                </Label>
                <Slider
                  value={progressRange}
                  onValueChange={(value) => setProgressRange(value as [number, number])}
                  min={0}
                  max={100}
                  step={10}
                  className="py-2"
                />
              </div>
            </div>

            {/* Case Age & Payment - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-foreground">Case Age</Label>
                <Select value={caseAgeFilter} onValueChange={setCaseAgeFilter}>
                  <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-background/50 text-base h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border z-50">
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="new">New (0-30 days)</SelectItem>
                    <SelectItem value="recent">Recent (31-90 days)</SelectItem>
                    <SelectItem value="medium">Medium (91-180 days)</SelectItem>
                    <SelectItem value="old">Old (180+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div 
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  paymentDueFilter 
                    ? 'bg-destructive/10 border-destructive/50' 
                    : 'bg-background/30 border-border/30 hover:border-border/50'
                }`}
                onClick={() => setPaymentDueFilter(!paymentDueFilter)}
              >
                <Checkbox
                  id="payment-due"
                  checked={paymentDueFilter}
                  onCheckedChange={(checked) => setPaymentDueFilter(checked as boolean)}
                  className="h-5 w-5"
                />
                <Label htmlFor="payment-due" className="text-base font-semibold cursor-pointer flex-1">
                  Payment Due
                </Label>
              </div>
            </div>

            {/* Active Filters Display - Premium Badges */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-border/30">
                {selectedProcessingModes.map(mode => (
                  <Badge key={mode} variant="secondary" className="px-4 py-2 text-sm border-2 border-primary/30 bg-primary/10 capitalize">
                    {mode === "vip_plus" ? "VIP+" : mode}
                    <X 
                      className="h-4 w-4 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={() => toggleProcessingMode(mode)}
                    />
                  </Badge>
                ))}
                {selectedStatuses.map(status => (
                  <Badge key={status} variant="secondary" className="px-4 py-2 text-sm border-2 border-secondary/30 bg-secondary/10 capitalize">
                    {status.replace("_", " ")}
                    <X 
                      className="h-4 w-4 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={() => toggleStatus(status)}
                    />
                  </Badge>
                ))}
                {selectedSchemes.map(scheme => (
                  <Badge key={scheme} variant="secondary" className="px-4 py-2 text-sm border-2 border-accent/30 bg-accent/10">
                    {scheme}
                    <X 
                      className="h-4 w-4 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={() => toggleScheme(scheme)}
                    />
                  </Badge>
                ))}
                {(clientScoreRange[0] !== 0 || clientScoreRange[1] !== 100) && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm border-2 border-primary/30 bg-primary/10">
                    Score: {clientScoreRange[0]}-{clientScoreRange[1]}
                    <X 
                      className="h-4 w-4 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={() => setClientScoreRange([0, 100])}
                    />
                  </Badge>
                )}
                {(progressRange[0] !== 0 || progressRange[1] !== 100) && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm border-2 border-secondary/30 bg-secondary/10">
                    Progress: {progressRange[0]}%-{progressRange[1]}%
                    <X 
                      className="h-4 w-4 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={() => setProgressRange([0, 100])}
                    />
                  </Badge>
                )}
                {caseAgeFilter !== "all" && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm border-2 border-accent/30 bg-accent/10">
                    Age: {caseAgeFilter}
                    <X 
                      className="h-4 w-4 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={() => setCaseAgeFilter("all")}
                    />
                  </Badge>
                )}
                {paymentDueFilter && (
                  <Badge variant="secondary" className="px-4 py-2 text-sm border-2 border-destructive/30 bg-destructive/10">
                    Payment Due
                    <X 
                      className="h-4 w-4 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                      onClick={() => setPaymentDueFilter(false)}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Additional Case Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="processing_mode" className="text-base font-semibold text-foreground">Processing Mode</Label>
              <Select value={formData.generation} onValueChange={(value) => setFormData({ ...formData, generation: value })}>
                <SelectTrigger className="border-2 border-border/50 hover:border-primary/50 bg-background/50 text-base h-12">
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
              <Label htmlFor="progress" className="text-base font-semibold text-foreground">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="border-2 border-border/50 hover:border-primary/50 focus:border-primary transition-colors bg-background/50 text-base h-12"
              />
            </div>
          </div>

          <div 
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
              formData.is_vip 
                ? 'bg-accent/10 border-accent/50' 
                : 'bg-background/30 border-border/30 hover:border-border/50'
            }`}
            onClick={() => setFormData({ ...formData, is_vip: !formData.is_vip })}
          >
            <input
              type="checkbox"
              id="is_vip"
              checked={formData.is_vip}
              onChange={(e) => setFormData({ ...formData, is_vip: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
            <Label htmlFor="is_vip" className="text-base font-semibold cursor-pointer flex-1">
              VIP Client
            </Label>
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
              size="lg"
              className="px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all text-base h-12"
            >
              {isUploading ? "Uploading Photo..." : updateCaseMutation.isPending ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
