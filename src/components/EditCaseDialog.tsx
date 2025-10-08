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
import { X } from "lucide-react";
import { useUpdateCase } from "@/hooks/useCases";

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
  const [showOtherCountry, setShowOtherCountry] = useState(
    !["US", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "France", "Germany"].includes(caseData.country)
  );
  const [otherCountry, setOtherCountry] = useState(
    !["US", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "France", "Germany"].includes(caseData.country) 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const countryValue = showOtherCountry ? otherCountry : formData.country;
    
    updateCaseMutation.mutate(
      {
        caseId: caseData.id,
        updates: {
          client_name: formData.client_name,
          client_code: formData.client_code || null,
          country: countryValue,
          status: formData.status as any,
          processing_mode: formData.generation || null as any,
          is_vip: formData.is_vip,
          notes: formData.notes,
          progress: formData.progress,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Case Details & Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} Active Filter{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Update client information, case status, and apply filters
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_code">Client Code</Label>
              <Select value={formData.client_code} onValueChange={(value) => setFormData({ ...formData, client_code: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client code" />
                </SelectTrigger>
                <SelectContent>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
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
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">US</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="Venezuela">Venezuela</SelectItem>
                  <SelectItem value="Israel">Israel</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {showOtherCountry && (
                <Input
                  placeholder="Enter country"
                  value={otherCountry}
                  onChange={(e) => setOtherCountry(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

          <div className="space-y-4 p-4 border border-border rounded-lg bg-background/50">
            <h3 className="font-semibold text-sm">Case Filters</h3>
            
            {/* Processing Modes - Multi-select */}
            <div className="space-y-2">
              <Label>Processing Modes (Multi-select)</Label>
              <div className="grid grid-cols-2 gap-2">
                {["standard", "expedited", "vip", "vip_plus"].map((mode) => (
                  <div key={mode} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mode-${mode}`}
                      checked={selectedProcessingModes.includes(mode)}
                      onCheckedChange={() => toggleProcessingMode(mode)}
                    />
                    <Label htmlFor={`mode-${mode}`} className="text-sm font-normal capitalize cursor-pointer">
                      {mode === "vip_plus" ? "VIP+" : mode}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status - Multi-select */}
            <div className="space-y-2">
              <Label>Status (Multi-select)</Label>
              <div className="grid grid-cols-2 gap-2">
                {["lead", "active", "on_hold", "suspended", "finished", "failed", "bad", "name_change", "other"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm font-normal capitalize cursor-pointer">
                      {status.replace("_", " ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Schemes from Client Card - Multi-select */}
            <div className="space-y-2">
              <Label>Schemes (Multi-select)</Label>
              <div className="grid grid-cols-2 gap-2">
                {["PUSH", "NUDGE", "SIT-DOWN"].map((scheme) => (
                  <div key={scheme} className="flex items-center space-x-2">
                    <Checkbox
                      id={`scheme-${scheme}`}
                      checked={selectedSchemes.includes(scheme)}
                      onCheckedChange={() => toggleScheme(scheme)}
                    />
                    <Label htmlFor={`scheme-${scheme}`} className="text-sm font-normal cursor-pointer">
                      {scheme}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Score Range */}
            <div className="space-y-2">
              <Label>Client Score Range: {clientScoreRange[0]} - {clientScoreRange[1]}</Label>
              <Slider
                value={clientScoreRange}
                onValueChange={(value) => setClientScoreRange(value as [number, number])}
                min={0}
                max={100}
                step={5}
              />
            </div>

            {/* Progress Range */}
            <div className="space-y-2">
              <Label>Progress Range: {progressRange[0]}% - {progressRange[1]}%</Label>
              <Slider
                value={progressRange}
                onValueChange={(value) => setProgressRange(value as [number, number])}
                min={0}
                max={100}
                step={10}
              />
            </div>

            {/* Case Age */}
            <div className="space-y-2">
              <Label>Case Age</Label>
              <Select value={caseAgeFilter} onValueChange={setCaseAgeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="new">New (0-30 days)</SelectItem>
                  <SelectItem value="recent">Recent (31-90 days)</SelectItem>
                  <SelectItem value="medium">Medium (91-180 days)</SelectItem>
                  <SelectItem value="old">Old (180+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Due */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="payment-due"
                checked={paymentDueFilter}
                onCheckedChange={(checked) => setPaymentDueFilter(checked as boolean)}
              />
              <Label htmlFor="payment-due" className="text-sm font-normal cursor-pointer">
                Payment Due
              </Label>
            </div>

            {/* Clear All Filters */}
            {activeFiltersCount > 0 && (
              <Button 
                type="button"
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters ({activeFiltersCount})
              </Button>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {selectedProcessingModes.map(mode => (
                  <Badge key={mode} variant="secondary" className="capitalize">
                    {mode === "vip_plus" ? "VIP+" : mode}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleProcessingMode(mode)}
                    />
                  </Badge>
                ))}
                {selectedStatuses.map(status => (
                  <Badge key={status} variant="secondary" className="capitalize">
                    {status.replace("_", " ")}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleStatus(status)}
                    />
                  </Badge>
                ))}
                {selectedSchemes.map(scheme => (
                  <Badge key={scheme} variant="secondary">
                    {scheme}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleScheme(scheme)}
                    />
                  </Badge>
                ))}
                {(clientScoreRange[0] !== 0 || clientScoreRange[1] !== 100) && (
                  <Badge variant="secondary">
                    Score: {clientScoreRange[0]}-{clientScoreRange[1]}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setClientScoreRange([0, 100])}
                    />
                  </Badge>
                )}
                {(progressRange[0] !== 0 || progressRange[1] !== 100) && (
                  <Badge variant="secondary">
                    Progress: {progressRange[0]}%-{progressRange[1]}%
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setProgressRange([0, 100])}
                    />
                  </Badge>
                )}
                {caseAgeFilter !== "all" && (
                  <Badge variant="secondary">
                    Age: {caseAgeFilter}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setCaseAgeFilter("all")}
                    />
                  </Badge>
                )}
                {paymentDueFilter && (
                  <Badge variant="secondary">
                    Payment Due
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setPaymentDueFilter(false)}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processing_mode">Processing Mode</Label>
              <Select value={formData.generation} onValueChange={(value) => setFormData({ ...formData, generation: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select processing mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="expedited">Expedited</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="vip_plus">VIP+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_vip" className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_vip"
                checked={formData.is_vip}
                onChange={(e) => setFormData({ ...formData, is_vip: e.target.checked })}
                className="w-4 h-4"
              />
              VIP Client
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Add any additional notes about this case..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCaseMutation.isPending}>
              {updateCaseMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
