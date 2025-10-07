import { useParams } from "react-router-dom";
import { useMasterData, useUpdateMasterData } from "@/hooks/useMasterData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Loader2, Save, FileText, Users, Baby, Heart, Calendar } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MasterDataTable() {
  const { id: caseId } = useParams();
  const { data: masterData, isLoading } = useMasterData(caseId);
  const updateMutation = useUpdateMasterData();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (masterData) {
      setFormData(masterData);
    }
  }, [masterData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!caseId) return;
    updateMutation.mutate({ caseId, updates: formData });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Data Table</h1>
          <p className="text-muted-foreground">Complete family tree and document tracking for PDF generation</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="applicant" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="applicant">
            <FileText className="mr-2 h-4 w-4" />
            Applicant
          </TabsTrigger>
          <TabsTrigger value="spouse">
            <Heart className="mr-2 h-4 w-4" />
            Spouse
          </TabsTrigger>
          <TabsTrigger value="children">
            <Baby className="mr-2 h-4 w-4" />
            Children
          </TabsTrigger>
          <TabsTrigger value="parents">
            <Users className="mr-2 h-4 w-4" />
            Parents
          </TabsTrigger>
          <TabsTrigger value="grandparents">
            <Users className="mr-2 h-4 w-4" />
            Grandparents
          </TabsTrigger>
          <TabsTrigger value="great-grandparents">
            <Calendar className="mr-2 h-4 w-4" />
            Great-GP
          </TabsTrigger>
        </TabsList>

        {/* APPLICANT TAB */}
        <TabsContent value="applicant">
          <ScrollArea className="h-[600px] pr-4">
            <Card>
              <CardHeader>
                <CardTitle>Applicant Information</CardTitle>
                <CardDescription>Main applicant personal data - maps to OBY-A-* fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>First Name(s)</Label>
                    <Input
                      value={formData.applicant_first_name || ""}
                      onChange={(e) => handleInputChange("applicant_first_name", e.target.value)}
                      placeholder="OBY-A-GN"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.applicant_last_name || ""}
                      onChange={(e) => handleInputChange("applicant_last_name", e.target.value)}
                      placeholder="OBY-A-SN"
                    />
                  </div>
                  <div>
                    <Label>Maiden Name</Label>
                    <Input
                      value={formData.applicant_maiden_name || ""}
                      onChange={(e) => handleInputChange("applicant_maiden_name", e.target.value)}
                      placeholder="OBY-A-MAIDEN-NAME"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Sex</Label>
                    <Input
                      value={formData.applicant_sex || ""}
                      onChange={(e) => handleInputChange("applicant_sex", e.target.value)}
                      placeholder="OBY-A-GENDER"
                    />
                  </div>
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.applicant_dob || ""}
                      onChange={(e) => handleInputChange("applicant_dob", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Place of Birth</Label>
                    <Input
                      value={formData.applicant_pob || ""}
                      onChange={(e) => handleInputChange("applicant_pob", e.target.value)}
                      placeholder="OBY-A-BP"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.applicant_email || ""}
                      onChange={(e) => handleInputChange("applicant_email", e.target.value)}
                      placeholder="OBY-A-EMAIL"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.applicant_phone || ""}
                      onChange={(e) => handleInputChange("applicant_phone", e.target.value)}
                      placeholder="OBY-A-PHONE"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Passport Number</Label>
                    <Input
                      value={formData.applicant_passport_number || ""}
                      onChange={(e) => handleInputChange("applicant_passport_number", e.target.value)}
                      placeholder="OBY-A-PASSPORT"
                    />
                  </div>
                  <div>
                    <Label>Passport Issue Date</Label>
                    <Input
                      type="date"
                      value={formData.applicant_passport_issue_date || ""}
                      onChange={(e) => handleInputChange("applicant_passport_issue_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Passport Expiry Date</Label>
                    <Input
                      type="date"
                      value={formData.applicant_passport_expiry_date || ""}
                      onChange={(e) => handleInputChange("applicant_passport_expiry_date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Emigration</Label>
                    <Input
                      type="date"
                      value={formData.applicant_date_of_emigration || ""}
                      onChange={(e) => handleInputChange("applicant_date_of_emigration", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Date of Naturalization</Label>
                    <Input
                      type="date"
                      value={formData.applicant_date_of_naturalization || ""}
                      onChange={(e) => handleInputChange("applicant_date_of_naturalization", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Document Flags</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.applicant_has_birth_cert || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_birth_cert", checked)}
                      />
                      <Label>Birth Certificate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.applicant_has_marriage_cert || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_marriage_cert", checked)}
                      />
                      <Label>Marriage Certificate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.applicant_has_passport || false}
                        onCheckedChange={(checked) => handleInputChange("applicant_has_passport", checked)}
                      />
                      <Label>Passport</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.applicant_notes || ""}
                    onChange={(e) => handleInputChange("applicant_notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* SPOUSE TAB */}
        <TabsContent value="spouse">
          <ScrollArea className="h-[600px] pr-4">
            <Card>
              <CardHeader>
                <CardTitle>Spouse Information</CardTitle>
                <CardDescription>Spouse data - maps to OBY-SPOUSE-* fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>First Name(s)</Label>
                    <Input
                      value={formData.spouse_first_name || ""}
                      onChange={(e) => handleInputChange("spouse_first_name", e.target.value)}
                      placeholder="OBY-SPOUSE-GN"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.spouse_last_name || ""}
                      onChange={(e) => handleInputChange("spouse_last_name", e.target.value)}
                      placeholder="OBY-SPOUSE-SN"
                    />
                  </div>
                  <div>
                    <Label>Maiden Name</Label>
                    <Input
                      value={formData.spouse_maiden_name || ""}
                      onChange={(e) => handleInputChange("spouse_maiden_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.spouse_dob || ""}
                      onChange={(e) => handleInputChange("spouse_dob", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Place of Birth</Label>
                    <Input
                      value={formData.spouse_pob || ""}
                      onChange={(e) => handleInputChange("spouse_pob", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sex</Label>
                    <Input
                      value={formData.spouse_sex || ""}
                      onChange={(e) => handleInputChange("spouse_sex", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Marriage</Label>
                    <Input
                      type="date"
                      value={formData.date_of_marriage || ""}
                      onChange={(e) => handleInputChange("date_of_marriage", e.target.value)}
                      placeholder="OBY-MARRIAGE-DATE"
                    />
                  </div>
                  <div>
                    <Label>Place of Marriage</Label>
                    <Input
                      value={formData.place_of_marriage || ""}
                      onChange={(e) => handleInputChange("place_of_marriage", e.target.value)}
                      placeholder="OBY-MARRIAGE-PLACE"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Document Flags</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.spouse_has_birth_cert || false}
                        onCheckedChange={(checked) => handleInputChange("spouse_has_birth_cert", checked)}
                      />
                      <Label>Birth Certificate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.spouse_has_marriage_cert || false}
                        onCheckedChange={(checked) => handleInputChange("spouse_has_marriage_cert", checked)}
                      />
                      <Label>Marriage Certificate</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.spouse_notes || ""}
                    onChange={(e) => handleInputChange("spouse_notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {/* CHILDREN TAB */}
        <TabsContent value="children">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Children Information</CardTitle>
                  <CardDescription>Up to 10 children - maps to OBY-CHILD* fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label>Number of Children</Label>
                    <Input
                      type="number"
                      value={formData.children_count || 0}
                      onChange={(e) => handleInputChange("children_count", parseInt(e.target.value) || 0)}
                      min={0}
                      max={10}
                    />
                  </div>
                </CardContent>
              </Card>

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Card key={num}>
                  <CardHeader>
                    <CardTitle>Child {num}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={formData[`child_${num}_first_name`] || ""}
                          onChange={(e) => handleInputChange(`child_${num}_first_name`, e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={formData[`child_${num}_last_name`] || ""}
                          onChange={(e) => handleInputChange(`child_${num}_last_name`, e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Sex</Label>
                        <Input
                          value={formData[`child_${num}_sex`] || ""}
                          onChange={(e) => handleInputChange(`child_${num}_sex`, e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={formData[`child_${num}_dob`] || ""}
                          onChange={(e) => handleInputChange(`child_${num}_dob`, e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Place of Birth</Label>
                        <Input
                          value={formData[`child_${num}_pob`] || ""}
                          onChange={(e) => handleInputChange(`child_${num}_pob`, e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* PARENTS TAB */}
        <TabsContent value="parents">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Father Information</CardTitle>
                  <CardDescription>Father data - maps to OBY-F-* fields</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name(s)</Label>
                      <Input
                        value={formData.father_first_name || ""}
                        onChange={(e) => handleInputChange("father_first_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.father_last_name || ""}
                        onChange={(e) => handleInputChange("father_last_name", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.father_dob || ""}
                        onChange={(e) => handleInputChange("father_dob", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Place of Birth</Label>
                      <Input
                        value={formData.father_pob || ""}
                        onChange={(e) => handleInputChange("father_pob", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Emigration</Label>
                      <Input
                        type="date"
                        value={formData.father_date_of_emigration || ""}
                        onChange={(e) => handleInputChange("father_date_of_emigration", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Date of Naturalization</Label>
                      <Input
                        type="date"
                        value={formData.father_date_of_naturalization || ""}
                        onChange={(e) => handleInputChange("father_date_of_naturalization", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.father_is_alive || false}
                      onCheckedChange={(checked) => handleInputChange("father_is_alive", checked)}
                    />
                    <Label>Is Alive</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mother Information</CardTitle>
                  <CardDescription>Mother data - maps to OBY-M-* fields</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>First Name(s)</Label>
                      <Input
                        value={formData.mother_first_name || ""}
                        onChange={(e) => handleInputChange("mother_first_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={formData.mother_last_name || ""}
                        onChange={(e) => handleInputChange("mother_last_name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Maiden Name</Label>
                      <Input
                        value={formData.mother_maiden_name || ""}
                        onChange={(e) => handleInputChange("mother_maiden_name", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.mother_dob || ""}
                        onChange={(e) => handleInputChange("mother_dob", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Place of Birth</Label>
                      <Input
                        value={formData.mother_pob || ""}
                        onChange={(e) => handleInputChange("mother_pob", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.mother_is_alive || false}
                      onCheckedChange={(checked) => handleInputChange("mother_is_alive", checked)}
                    />
                    <Label>Is Alive</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* GRANDPARENTS TAB */}
        <TabsContent value="grandparents">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {["pgf", "pgm", "mgf", "mgm"].map((prefix) => {
                const titles = {
                  pgf: "Paternal Grandfather",
                  pgm: "Paternal Grandmother",
                  mgf: "Maternal Grandfather",
                  mgm: "Maternal Grandmother",
                };
                const hasMaiden = prefix.includes("gm");
                
                return (
                  <Card key={prefix}>
                    <CardHeader>
                      <CardTitle>{titles[prefix as keyof typeof titles]}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className={`grid ${hasMaiden ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                        <div>
                          <Label>First Name(s)</Label>
                          <Input
                            value={formData[`${prefix}_first_name`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_first_name`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={formData[`${prefix}_last_name`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_last_name`, e.target.value)}
                          />
                        </div>
                        {hasMaiden && (
                          <div>
                            <Label>Maiden Name</Label>
                            <Input
                              value={formData[`${prefix}_maiden_name`] || ""}
                              onChange={(e) => handleInputChange(`${prefix}_maiden_name`, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date of Birth</Label>
                          <Input
                            type="date"
                            value={formData[`${prefix}_dob`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_dob`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Place of Birth</Label>
                          <Input
                            value={formData[`${prefix}_pob`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_pob`, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date of Emigration</Label>
                          <Input
                            type="date"
                            value={formData[`${prefix}_date_of_emigration`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_date_of_emigration`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Date of Naturalization</Label>
                          <Input
                            type="date"
                            value={formData[`${prefix}_date_of_naturalization`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_date_of_naturalization`, e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* GREAT-GRANDPARENTS TAB */}
        <TabsContent value="great-grandparents">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {["pggf", "pggm", "mggf", "mggm"].map((prefix) => {
                const titles = {
                  pggf: "Paternal Great-Grandfather",
                  pggm: "Paternal Great-Grandmother",
                  mggf: "Maternal Great-Grandfather",
                  mggm: "Maternal Great-Grandmother",
                };
                const hasMaiden = prefix.includes("gm");
                
                return (
                  <Card key={prefix}>
                    <CardHeader>
                      <CardTitle>{titles[prefix as keyof typeof titles]}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className={`grid ${hasMaiden ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                        <div>
                          <Label>First Name(s)</Label>
                          <Input
                            value={formData[`${prefix}_first_name`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_first_name`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={formData[`${prefix}_last_name`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_last_name`, e.target.value)}
                          />
                        </div>
                        {hasMaiden && (
                          <div>
                            <Label>Maiden Name</Label>
                            <Input
                              value={formData[`${prefix}_maiden_name`] || ""}
                              onChange={(e) => handleInputChange(`${prefix}_maiden_name`, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date of Birth</Label>
                          <Input
                            type="date"
                            value={formData[`${prefix}_dob`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_dob`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Place of Birth</Label>
                          <Input
                            value={formData[`${prefix}_pob`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_pob`, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date of Emigration</Label>
                          <Input
                            type="date"
                            value={formData[`${prefix}_date_of_emigration`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_date_of_emigration`, e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Date of Naturalization</Label>
                          <Input
                            type="date"
                            value={formData[`${prefix}_date_of_naturalization`] || ""}
                            onChange={(e) => handleInputChange(`${prefix}_date_of_naturalization`, e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
