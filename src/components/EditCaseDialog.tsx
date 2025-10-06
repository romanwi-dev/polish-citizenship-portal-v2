import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
  const [showOtherCountry, setShowOtherCountry] = useState(
    !["US", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "France", "Germany"].includes(caseData.country)
  );
  const [otherCountry, setOtherCountry] = useState(
    !["US", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "France", "Germany"].includes(caseData.country) 
      ? caseData.country 
      : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const countryValue = showOtherCountry ? otherCountry : formData.country;
      
      const { error } = await supabase
        .from("cases")
        .update({
          client_name: formData.client_name,
          client_code: formData.client_code || null,
          country: countryValue,
          status: formData.status as any,
          processing_mode: formData.generation || null as any,
          is_vip: formData.is_vip,
          notes: formData.notes,
          progress: formData.progress,
        })
        .eq("id", caseData.id);

      if (error) throw error;

      toast.success("Case updated successfully");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Case Details</DialogTitle>
          <DialogDescription>
            Update client information and case status
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
