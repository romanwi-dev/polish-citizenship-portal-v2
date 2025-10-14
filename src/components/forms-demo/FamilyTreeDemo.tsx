import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyTreeInteractive } from "@/components/FamilyTreeInteractive";

const dummyData = {
  applicant_sex: "M",
  applicant_is_married: true,
  minor_children_count: 2,
  applicant_first_name: "Jan",
  applicant_last_name: "Kowalski",
  applicant_dob: "15.05.1985",
  applicant_pob: "Warsaw, Poland",
  spouse_first_name: "Maria",
  spouse_last_name: "Kowalska",
  spouse_maiden_name: "Nowak",
  spouse_dob: "20.07.1987",
  father_first_name: "Andrzej",
  father_last_name: "Kowalski",
  father_dob: "10.03.1960",
  mother_first_name: "Anna",
  mother_last_name: "Kowalska",
  mother_maiden_name: "Lewandowska",
  mother_dob: "15.01.1962",
  pgf_first_name: "Józef",
  pgf_last_name: "Kowalski",
  pgm_first_name: "Helena",
  pgm_last_name: "Kowalska",
  mgf_first_name: "Stefan",
  mgf_last_name: "Lewandowski",
  mgm_first_name: "Zofia",
  mgm_last_name: "Lewandowska",
};

interface FamilyTreeDemoProps {
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function FamilyTreeDemo({ onClose, isExpanded, onToggleExpand }: FamilyTreeDemoProps) {
  const [formData, setFormData] = useState(dummyData);
  const [isLargeFonts, setIsLargeFonts] = useState(false);
  const [activeTab, setActiveTab] = useState("tree-view");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const mapPersonData = (prefix: string) => ({
    firstName: formData[`${prefix}_first_name`] || "",
    lastName: formData[`${prefix}_last_name`] || "",
    maidenName: formData[`${prefix}_maiden_name`],
    dateOfBirth: formData[`${prefix}_dob`],
    placeOfBirth: formData[`${prefix}_pob`],
  });

  return (
    <div className={`relative min-h-full ${isLargeFonts ? 'text-lg' : ''}`}>
      {/* Checkered grid background - matching footer */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
            Polish Family Tree
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={onToggleExpand} variant="ghost" size="icon" title="Toggle fullscreen">
              <Maximize2 className="h-6 w-6" />
            </Button>
            <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts">
              <Type className="h-6 w-6" />
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-0 z-50 border-b border-border/50 pb-2 pt-2 -mx-4 md:-mx-6 px-4 md:px-6">
            <TabsList className="w-full flex gap-0.5 overflow-x-auto md:overflow-visible md:justify-between scrollbar-hide bg-transparent p-0">
              <TabsTrigger value="tree-view" className="flex-shrink-0 md:flex-1">
                <span className="text-blue-600 dark:text-blue-400">Tree View</span>
              </TabsTrigger>
              <TabsTrigger value="applicant" className="flex-shrink-0 md:flex-1">
                <span className="text-blue-600 dark:text-blue-400">Applicant</span>
              </TabsTrigger>
              <TabsTrigger value="spouse" className="flex-shrink-0 md:flex-1">
                <span className="text-blue-600 dark:text-blue-400">Spouse</span>
              </TabsTrigger>
              <TabsTrigger value="children" className="flex-shrink-0 md:flex-1">
                <span className="text-cyan-600 dark:text-cyan-400">Children</span>
              </TabsTrigger>
              <TabsTrigger value="parents" className="flex-shrink-0 md:flex-1">
                <span className="text-teal-600 dark:text-teal-400">Parents</span>
              </TabsTrigger>
              <TabsTrigger value="grandparents" className="flex-shrink-0 md:flex-1">
                <span className="text-red-600 dark:text-red-400">Grandparents</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tree-view" className="mt-0">
            <FamilyTreeInteractive
              clientData={{
                ...mapPersonData('applicant'),
                sex: formData.applicant_sex
              }}
              spouse={formData.applicant_is_married ? mapPersonData('spouse') : undefined}
              father={mapPersonData('father')}
              mother={mapPersonData('mother')}
              paternalGrandfather={mapPersonData('pgf')}
              paternalGrandmother={mapPersonData('pgm')}
              maternalGrandfather={mapPersonData('mgf')}
              maternalGrandmother={mapPersonData('mgm')}
              onEdit={(relation) => {
                const tabMap: Record<string, string> = {
                  'client': 'applicant',
                  'spouse': 'spouse',
                  'father': 'parents',
                  'mother': 'parents',
                  'pgf': 'grandparents',
                  'pgm': 'grandparents',
                  'mgf': 'grandparents',
                  'mgm': 'grandparents',
                };
                setActiveTab(tabMap[relation] || 'applicant');
              }}
            />
          </TabsContent>

          <TabsContent value="applicant" className="mt-0 p-6">
            <div className="space-y-4">
              <div>
                <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                <Input
                  value={formData.applicant_first_name}
                  onChange={(e) => handleInputChange('applicant_first_name', e.target.value)}
                  className={isLargeFonts ? 'text-xl h-12' : ''}
                />
              </div>
              <div>
                <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                <Input
                  value={formData.applicant_last_name}
                  onChange={(e) => handleInputChange('applicant_last_name', e.target.value)}
                  className={isLargeFonts ? 'text-xl h-12' : ''}
                />
              </div>
              <div>
                <Label className={isLargeFonts ? 'text-xl' : ''}>Date of Birth</Label>
                <Input
                  value={formData.applicant_dob}
                  onChange={(e) => handleInputChange('applicant_dob', e.target.value)}
                  placeholder="DD.MM.YYYY"
                  className={isLargeFonts ? 'text-xl h-12' : ''}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="spouse" className="mt-0 p-6">
            <div className="space-y-4">
              <div>
                <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                <Input
                  value={formData.spouse_first_name}
                  onChange={(e) => handleInputChange('spouse_first_name', e.target.value)}
                  className={isLargeFonts ? 'text-xl h-12' : ''}
                />
              </div>
              <div>
                <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                <Input
                  value={formData.spouse_last_name}
                  onChange={(e) => handleInputChange('spouse_last_name', e.target.value)}
                  className={isLargeFonts ? 'text-xl h-12' : ''}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="children" className="mt-0 p-6">
            <div className="space-y-6">
              <div>
                <h3 className={`font-semibold mb-4 ${isLargeFonts ? 'text-2xl' : 'text-lg'}`}>Child 1</h3>
                <div className="space-y-4">
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                    <Input
                      value=""
                      onChange={(e) => {}}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                      placeholder="Enter child's first name"
                    />
                  </div>
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                    <Input
                      value=""
                      onChange={(e) => {}}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                      placeholder="Enter child's last name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parents" className="mt-0 p-6">
            <div className="space-y-6">
              <div>
                <h3 className={`font-semibold mb-4 ${isLargeFonts ? 'text-2xl' : 'text-lg'}`}>Father</h3>
                <div className="space-y-4">
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                    <Input
                      value={formData.father_first_name}
                      onChange={(e) => handleInputChange('father_first_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                    <Input
                      value={formData.father_last_name}
                      onChange={(e) => handleInputChange('father_last_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-4 ${isLargeFonts ? 'text-2xl' : 'text-lg'}`}>Mother</h3>
                <div className="space-y-4">
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                    <Input
                      value={formData.mother_first_name}
                      onChange={(e) => handleInputChange('mother_first_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                    <Input
                      value={formData.mother_last_name}
                      onChange={(e) => handleInputChange('mother_last_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grandparents" className="mt-0 p-6">
            <div className="space-y-6">
              <div>
                <h3 className={`font-semibold mb-4 ${isLargeFonts ? 'text-2xl' : 'text-lg'}`}>Paternal Grandfather</h3>
                <div className="space-y-4">
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                    <Input
                      value={formData.pgf_first_name}
                      onChange={(e) => handleInputChange('pgf_first_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                    <Input
                      value={formData.pgf_last_name}
                      onChange={(e) => handleInputChange('pgf_last_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-4 ${isLargeFonts ? 'text-2xl' : 'text-lg'}`}>Paternal Grandmother</h3>
                <div className="space-y-4">
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                    <Input
                      value={formData.pgm_first_name}
                      onChange={(e) => handleInputChange('pgm_first_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                    <Input
                      value={formData.pgm_last_name}
                      onChange={(e) => handleInputChange('pgm_last_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-4 ${isLargeFonts ? 'text-2xl' : 'text-lg'}`}>Maternal Grandfather</h3>
                <div className="space-y-4">
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                    <Input
                      value={formData.mgf_first_name}
                      onChange={(e) => handleInputChange('mgf_first_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                    <Input
                      value={formData.mgf_last_name}
                      onChange={(e) => handleInputChange('mgf_last_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`font-semibold mb-4 ${isLargeFonts ? 'text-2xl' : 'text-lg'}`}>Maternal Grandmother</h3>
                <div className="space-y-4">
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>First Name</Label>
                    <Input
                      value={formData.mgm_first_name}
                      onChange={(e) => handleInputChange('mgm_first_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                  <div>
                    <Label className={isLargeFonts ? 'text-xl' : ''}>Last Name</Label>
                    <Input
                      value={formData.mgm_last_name}
                      onChange={(e) => handleInputChange('mgm_last_name', e.target.value)}
                      className={isLargeFonts ? 'text-xl h-12' : ''}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
