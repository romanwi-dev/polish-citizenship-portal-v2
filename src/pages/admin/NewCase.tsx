import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LoadingState } from "@/components/LoadingState";
import { ArrowLeft, User, FileText, Mail, Key, Folder } from "lucide-react";
import { generateHybridCaseName } from "@/utils/hybridCaseNaming";

export default function NewCase() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(true);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    country: "",
    status: "lead" as const,
    generation: null as string | null,
    is_vip: false,
    notes: "",
    processing_mode: "standard" as const,
    client_score: 0,
    auto_generate_code: true,
    auto_create_dropbox_folder: true,
    send_welcome_email: true,
    generate_magic_link: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateClientCode = (name: string): string => {
    const cleaned = name.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const initials = cleaned.slice(0, 3).padEnd(3, 'X');
    const timestamp = Date.now().toString().slice(-4);
    return `${initials}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Extract first and last name
      const nameParts = formData.client_name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Client';
      const lastName = nameParts.slice(1).join(' ') || 'Name';
      
      // Step 2: Generate hybrid case name (e.g., USA001_John_Smith)
      const hybridCaseName = await generateHybridCaseName(
        formData.country || null,
        firstName,
        lastName
      );

      // Step 3: Prepare Dropbox path using hybrid name
      const dropboxPath = formData.auto_create_dropbox_folder
        ? `/CASES/${hybridCaseName}`
        : `/CASES/${formData.client_name.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Step 4: Create case in database with hybrid client_code
      const caseInsert: any = {
        client_name: formData.client_name.trim(),
        client_code: hybridCaseName, // Hybrid format
        dropbox_path: dropboxPath,
        start_date: new Date().toISOString().split('T')[0],
      };
      
      if (formData.country) caseInsert.country = formData.country;
      if (formData.status) caseInsert.status = formData.status;
      if (formData.generation) caseInsert.generation = formData.generation;
      if (formData.is_vip) caseInsert.is_vip = formData.is_vip;
      if (formData.notes) caseInsert.notes = formData.notes;
      if (formData.processing_mode) caseInsert.processing_mode = formData.processing_mode;
      if (formData.client_score) caseInsert.client_score = formData.client_score;

      const { data: newCase, error: caseError } = await supabase
        .from("cases")
        .insert(caseInsert)
        .select()
        .single();

      if (caseError) throw caseError;

      toast({
        title: "Case Created",
        description: `Created case: ${hybridCaseName}`,
      });

      // Step 4: Create Dropbox folder (background task)
      if (formData.auto_create_dropbox_folder) {
        supabase.functions
          .invoke("dropbox-sync", {
            body: { 
              action: "create_folder", 
              path: dropboxPath,
              case_id: newCase.id 
            },
          })
          .then(() => {
            toast({
              title: "Dropbox Folder Created",
              description: `Folder created at ${dropboxPath}`,
            });
          })
          .catch(err => {
            console.error("Dropbox folder creation failed:", err);
            toast({
              title: "Dropbox Warning",
              description: "Could not create Dropbox folder. You can create it manually.",
              variant: "destructive",
            });
          });
      }

      // Step 5: Generate magic link and send welcome email
      if (formData.generate_magic_link && formData.client_email) {
        const magicToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiration

        const { error: accessError } = await supabase
          .from("client_portal_access")
          .insert({
            case_id: newCase.id,
            user_id: user?.id || null,
            magic_link_token: magicToken,
            magic_link_expires_at: expiresAt.toISOString(),
          });

        if (accessError) {
          console.error("Magic link creation failed:", accessError);
        } else {
          const magicLink = `${window.location.origin}/client/login?token=${magicToken}`;
          
          // Send welcome email (if enabled)
          if (formData.send_welcome_email) {
            // TODO: Implement welcome email sending via edge function
            toast({
              title: "Magic Link Generated",
              description: "Copy the link below to send to your client",
            });
            console.log("Magic Link:", magicLink);
            
            // Copy to clipboard
            navigator.clipboard.writeText(magicLink).catch(() => {});
          }
        }
      }

      // Navigate to the new case
      navigate(`/admin/cases/${newCase.id}`);

    } catch (error: any) {
      console.error("Error creating case:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create case",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <LoadingState message="Creating case..." className="h-screen" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/cases")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create New Case
              </CardTitle>
              <CardDescription>
                Add a new client case with automatic setup and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Client Information
                  </h3>
                  
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="client_name">Client Name *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) => handleChange("client_name", e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="client_email">Client Email</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => handleChange("client_email", e.target.value)}
                        placeholder="client@example.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for magic link and welcome email
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        placeholder="United States"
                      />
                    </div>
                  </div>
                </div>

                {/* Case Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Case Configuration
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Initial Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange("status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="processing_mode">Processing Mode</Label>
                      <Select
                        value={formData.processing_mode}
                        onValueChange={(value) => handleChange("processing_mode", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="push">Push</SelectItem>
                          <SelectItem value="nudge">Nudge</SelectItem>
                          <SelectItem value="sitdown">Sit-Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="generation">Generation</Label>
                      <Select
                        value={formData.generation || ""}
                        onValueChange={(value) => handleChange("generation", value || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select generation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="G1">G1</SelectItem>
                          <SelectItem value="G2">G2</SelectItem>
                          <SelectItem value="G3">G3</SelectItem>
                          <SelectItem value="G4">G4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="client_score">Client Score (0-100)</Label>
                      <Input
                        id="client_score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.client_score}
                        onChange={(e) => handleChange("client_score", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>VIP Client</Label>
                      <p className="text-xs text-muted-foreground">
                        Mark as high-priority client
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_vip}
                      onCheckedChange={(checked) => handleChange("is_vip", checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      placeholder="Additional case notes..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Automation Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Automation Options
                  </h3>

                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hybrid Case Naming (Automatic)</Label>
                        <p className="text-xs text-muted-foreground">
                          Format: COUNTRY###_FirstName_LastName (e.g., USA001_John_Smith)
                        </p>
                      </div>
                      <Switch
                        checked={true}
                        disabled={true}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          Create Dropbox Folder
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Auto-create folder in /CASES
                        </p>
                      </div>
                      <Switch
                        checked={formData.auto_create_dropbox_folder}
                        onCheckedChange={(checked) => handleChange("auto_create_dropbox_folder", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-1">
                          <Key className="h-3 w-3" />
                          Generate Magic Link
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Create portal access link (30-day expiry)
                        </p>
                      </div>
                      <Switch
                        checked={formData.generate_magic_link}
                        onCheckedChange={(checked) => handleChange("generate_magic_link", checked)}
                        disabled={!formData.client_email}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Send Welcome Email
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Email magic link to client
                        </p>
                      </div>
                      <Switch
                        checked={formData.send_welcome_email}
                        onCheckedChange={(checked) => handleChange("send_welcome_email", checked)}
                        disabled={!formData.client_email || !formData.generate_magic_link}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/cases")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    Create Case
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
