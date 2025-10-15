import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Upload, FileText, Award, Languages } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DocumentRequirementsListProps {
  caseId?: string;
}

export const DocumentRequirementsList = ({ caseId }: DocumentRequirementsListProps) => {
  const [selectedCase, setSelectedCase] = useState<string>(caseId || "");
  const queryClient = useQueryClient();

  const { data: cases } = useQuery({
    queryKey: ["cases-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, client_name, client_code")
        .order("client_name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: requirements, isLoading } = useQuery({
    queryKey: ["document-requirements", selectedCase],
    queryFn: async () => {
      if (!selectedCase) return [];
      
      const { data, error } = await supabase
        .from("document_requirements" as any)
        .select("*")
        .eq("case_id", selectedCase)
        .order("document_type");
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedCase,
  });

  const updateRequirement = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("document_requirements" as any)
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-requirements"] });
      toast.success("Requirement updated");
    },
  });

  const getStatusIcon = (requirement: any) => {
    if (requirement.is_certified) return <Award className="h-4 w-4 text-green-600" />;
    if (requirement.is_translated) return <FileText className="h-4 w-4 text-blue-600" />;
    if (requirement.is_uploaded) return <Upload className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedCase} onValueChange={setSelectedCase}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case..." />
              </SelectTrigger>
              <SelectContent>
                {cases?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.client_name} ({c.client_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCase && (
              <div className="space-y-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Loading requirements...
                  </p>
                ) : requirements && requirements.length > 0 ? (
                  requirements.map((req: any) => (
                    <Card key={req.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getStatusIcon(req)}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">
                              {req.document_type}
                            </p>
                            {req.person_type && (
                              <p className="text-xs text-muted-foreground">
                                For: {req.person_type}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {req.requires_translation && (
                            <Badge variant="outline" className="text-xs">
                              <Languages className="h-3 w-3 mr-1" />
                              Translation
                            </Badge>
                          )}
                          {req.requires_sworn_certification && (
                            <Badge variant="outline" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Certification
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={req.is_uploaded}
                            onCheckedChange={(checked) =>
                              updateRequirement.mutate({
                                id: req.id,
                                updates: { is_uploaded: checked },
                              })
                            }
                          />
                          <span className="text-xs">Uploaded</span>
                        </div>

                        {req.requires_translation && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={req.is_translated}
                              onCheckedChange={(checked) =>
                                updateRequirement.mutate({
                                  id: req.id,
                                  updates: { is_translated: checked },
                                })
                              }
                            />
                            <span className="text-xs">Translated</span>
                          </div>
                        )}

                        {req.requires_sworn_certification && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={req.is_certified}
                              onCheckedChange={(checked) =>
                                updateRequirement.mutate({
                                  id: req.id,
                                  updates: { is_certified: checked },
                                })
                              }
                            />
                            <span className="text-xs">Certified</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No document requirements set for this case
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
