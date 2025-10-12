import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RequiredDocumentsSection, DocumentItem } from "@/components/RequiredDocumentsSection";
import { MinimalistCardsDocuments } from "@/components/docs/MinimalistCardsDocuments";
import { KanbanBoardDocuments } from "@/components/docs/KanbanBoardDocuments";
import { TimelineDocuments } from "@/components/docs/TimelineDocuments";
import { GridMatrixDocuments } from "@/components/docs/GridMatrixDocuments";
import { AccordionDocuments } from "@/components/docs/AccordionDocuments";
import { TwoColumnClassic } from "@/components/docs/TwoColumnClassic";
import { TwoColumnModern } from "@/components/docs/TwoColumnModern";
import { TwoColumnCompact } from "@/components/docs/TwoColumnCompact";
import { TwoColumnElegant } from "@/components/docs/TwoColumnElegant";
import { TwoColumnBold } from "@/components/docs/TwoColumnBold";
import { FlippableCards3D } from "@/components/docs/FlippableCards3D";
import { FlippableCardsGradient } from "@/components/docs/FlippableCardsGradient";
import { FlippableCardsMinimal } from "@/components/docs/FlippableCardsMinimal";
import { FlippableCardsBold } from "@/components/docs/FlippableCardsBold";
import { FlippableCardsElegant } from "@/components/docs/FlippableCardsElegant";
import { FlippableCardsNeon } from "@/components/docs/FlippableCardsNeon";
import { FlippableCardsGlass } from "@/components/docs/FlippableCardsGlass";
import { FlippableCardsRetro } from "@/components/docs/FlippableCardsRetro";
import { FlippableCardsFuturistic } from "@/components/docs/FlippableCardsFuturistic";
import { FlippableCardsNeumorphic } from "@/components/docs/FlippableCardsNeumorphic";
import { FlippableCardsDarkGlow } from "@/components/docs/FlippableCardsDarkGlow";
import { FlippableCardsMidnight } from "@/components/docs/FlippableCardsMidnight";
import { FlippableCardsShadow } from "@/components/docs/FlippableCardsShadow";
import { FlippableCardsAura } from "@/components/docs/FlippableCardsAura";
import { FlippableCardsDeep } from "@/components/docs/FlippableCardsDeep";

export default function IntakeDemo() {
  const navigate = useNavigate();
  
  // Required Documents section state
  const initialDocuments: DocumentItem[] = [
    { id: "polish-docs", label: "Polish Documents", checked: false },
    { id: "passport", label: "Passport Copy", checked: false },
    { id: "birth-cert", label: "Birth Certificate", checked: false },
    { id: "marriage-cert", label: "Marriage Certificate", checked: false },
    { id: "naturalization", label: "Naturalization Certificate", checked: false },
    { id: "military", label: "Military Service Record", checked: false },
    { id: "foreign-docs", label: "Foreign Documents", checked: false },
    { id: "additional", label: "Additional Documents", checked: false },
  ];

  const [docsVariant1, setDocsVariant1] = useState(initialDocuments);
  const [docsVariant2, setDocsVariant2] = useState(initialDocuments);
  const [docsVariant3, setDocsVariant3] = useState(initialDocuments);
  const [docsVariant4, setDocsVariant4] = useState(initialDocuments);
  const [docsVariant5, setDocsVariant5] = useState(initialDocuments);
  const [docsVariant6, setDocsVariant6] = useState(initialDocuments);
  const [docsVariant7, setDocsVariant7] = useState(initialDocuments);
  const [docsVariant8, setDocsVariant8] = useState(initialDocuments);
  const [docsVariant9, setDocsVariant9] = useState(initialDocuments);
  const [docsVariant10, setDocsVariant10] = useState(initialDocuments);
  const [docsFlipNeon, setDocsFlipNeon] = useState(initialDocuments);
  const [docsFlipGlass, setDocsFlipGlass] = useState(initialDocuments);
  const [docsFlipRetro, setDocsFlipRetro] = useState(initialDocuments);
  const [docsFlipFuturistic, setDocsFlipFuturistic] = useState(initialDocuments);
  const [docsFlipNeumorphic, setDocsFlipNeumorphic] = useState(initialDocuments);
  const [docsDarkGlow, setDocsDarkGlow] = useState(initialDocuments);
  const [docsMidnight, setDocsMidnight] = useState(initialDocuments);
  const [docsShadow, setDocsShadow] = useState(initialDocuments);
  const [docsAura, setDocsAura] = useState(initialDocuments);
  const [docsDeep, setDocsDeep] = useState(initialDocuments);

  const handleDocChange = (
    variant: number,
    id: string,
    checked: boolean
  ) => {
    const setters = [
      setDocsVariant1, setDocsVariant2, setDocsVariant3, setDocsVariant4, setDocsVariant5,
      setDocsVariant6, setDocsVariant7, setDocsVariant8, setDocsVariant9, setDocsVariant10
    ];
    const setter = setters[variant - 1];
    setter((prev) => prev.map((doc) => (doc.id === id ? { ...doc, checked } : doc)));
  };

  const toggleAllDocs = (variant: number) => {
    const getters = [
      docsVariant1, docsVariant2, docsVariant3, docsVariant4, docsVariant5,
      docsVariant6, docsVariant7, docsVariant8, docsVariant9, docsVariant10
    ];
    const setters = [
      setDocsVariant1, setDocsVariant2, setDocsVariant3, setDocsVariant4, setDocsVariant5,
      setDocsVariant6, setDocsVariant7, setDocsVariant8, setDocsVariant9, setDocsVariant10
    ];
    const current = getters[variant - 1];
    const setter = setters[variant - 1];
    const allChecked = current.every(doc => doc.checked);
    setter(current.map(doc => ({ ...doc, checked: !allChecked })));
  };

  const [values1, setValues1] = useState({ gender: "", status: "", children: "" });
  const [values2, setValues2] = useState({ gender: "", status: "", children: "" });
  const [values3, setValues3] = useState({ gender: "", status: "", children: "" });
  const [values4, setValues4] = useState({ gender: "", status: "", children: "" });
  const [values5, setValues5] = useState({ gender: "", status: "", children: "" });
  const [values6, setValues6] = useState({ gender: "", status: "", children: "" });
  const [values7, setValues7] = useState({ gender: "", status: "", children: "" });
  const [values8, setValues8] = useState({ gender: "", status: "", children: "" });
  const [values9, setValues9] = useState({ gender: "", status: "", children: "" });
  const [values10, setValues10] = useState({ gender: "", status: "", children: "" });
  const [values11, setValues11] = useState({ gender: "", status: "", children: "" });
  const [values12, setValues12] = useState({ gender: "", status: "", children: "" });
  const [values13, setValues13] = useState({ gender: "", status: "", children: "" });
  const [values14, setValues14] = useState({ gender: "", status: "", children: "" });
  const [values15, setValues15] = useState({ gender: "", status: "", children: "" });
  const [values16, setValues16] = useState({ gender: "", status: "", children: "" });
  const [values17, setValues17] = useState({ gender: "", status: "", children: "" });
  const [values18, setValues18] = useState({ gender: "", status: "", children: "" });
  const [values19, setValues19] = useState({ gender: "", status: "", children: "" });
  const [values20, setValues20] = useState({ gender: "", status: "", children: "" });
  const [values21, setValues21] = useState({ gender: "", status: "", children: "" });
  const [values22, setValues22] = useState({ gender: "", status: "", children: "" });
  const [values23, setValues23] = useState({ gender: "", status: "", children: "" });
  const [values24, setValues24] = useState({ gender: "", status: "", children: "" });
  const [values25, setValues25] = useState({ gender: "", status: "", children: "" });

  // Color scheme test inputs
  const [childrenInputs, setChildrenInputs] = useState({ field1: "", field2: "" });
  const [applicantInputs, setApplicantInputs] = useState({ field1: "", field2: "" });
  const [parentsInputs, setParentsInputs] = useState({ field1: "", field2: "" });
  const [grandparentsInputs, setGrandparentsInputs] = useState({ field1: "", field2: "" });
  const [greatGrandparentsInputs, setGreatGrandparentsInputs] = useState({ field1: "", field2: "" });
  const [poaInputs, setPoaInputs] = useState({ field1: "", field2: "" });
  const [citizenshipInputs, setCitizenshipInputs] = useState({ field1: "", field2: "" });
  const [civilRegistryInputs, setCivilRegistryInputs] = useState({ field1: "", field2: "" });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/admin/intake')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Intake Form
        </Button>

      {/* INPUT FIELD COLORS ONLY */}
      <div className="mb-12 p-6 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-bold mb-6">INPUT FIELD COLORS</h2>
        <div className="space-y-4">
          
          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">CHILDREN (Cyan):</label>
            <Input
              value={childrenInputs.field1}
              onChange={(e) => setChildrenInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-400/50 dark:border-cyan-600/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px rgba(6,182,212,0.25)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px rgba(6,182,212,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(6,182,212,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px rgba(6,182,212,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(6,182,212,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">APPLICANT (Blue):</label>
            <Input
              value={applicantInputs.field1}
              onChange={(e) => setApplicantInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-blue-50/45 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px hsla(221, 83%, 53%, 0.15)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px hsla(221, 83%, 53%, 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px hsla(221, 83%, 53%, 0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px hsla(221, 83%, 53%, 0.15)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">PARENTS (Green):</label>
            <Input
              value={parentsInputs.field1}
              onChange={(e) => setParentsInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-green-50/50 dark:bg-green-950/30 border border-green-400/50 dark:border-green-600/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px rgba(34,197,94,0.25)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px rgba(34,197,94,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(34,197,94,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px rgba(34,197,94,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(34,197,94,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">GRANDPARENTS (Red):</label>
            <Input
              value={grandparentsInputs.field1}
              onChange={(e) => setGrandparentsInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-red-50/50 dark:bg-red-950/30 border border-red-400/50 dark:border-red-600/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px rgba(239,68,68,0.25)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px rgba(239,68,68,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(239,68,68,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px rgba(239,68,68,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(239,68,68,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">GGP (Gray):</label>
            <Input
              value={greatGrandparentsInputs.field1}
              onChange={(e) => setGreatGrandparentsInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-400/50 dark:border-slate-600/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px rgba(100,116,139,0.25)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px rgba(100,116,139,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(100,116,139,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px rgba(100,116,139,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(100,116,139,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">POA (Violet):</label>
            <Input
              value={poaInputs.field1}
              onChange={(e) => setPoaInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-violet-50/50 dark:bg-violet-950/30 border border-violet-400/50 dark:border-violet-600/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px rgba(139,92,246,0.25)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px rgba(139,92,246,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(139,92,246,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px rgba(139,92,246,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(139,92,246,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">CITIZENSHIP (Amber):</label>
            <Input
              value={citizenshipInputs.field1}
              onChange={(e) => setCitizenshipInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-400/50 dark:border-amber-600/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px rgba(245,158,11,0.25)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px rgba(245,158,11,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(245,158,11,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px rgba(245,158,11,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(245,158,11,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="w-48 font-semibold">CIVIL REG (Teal):</label>
            <Input
              value={civilRegistryInputs.field1}
              onChange={(e) => setCivilRegistryInputs(prev => ({ ...prev, field1: e.target.value }))}
              className="h-16 bg-teal-50/50 dark:bg-teal-950/30 border border-teal-400/50 dark:border-teal-600/50 hover:border-transparent focus:border-transparent transition-all duration-300"
              style={{
                boxShadow: "0 0 30px rgba(20,184,166,0.25)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 50px rgba(20,184,166,0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(20,184,166,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 60px rgba(20,184,166,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = "0 0 30px rgba(20,184,166,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            />
          </div>

        </div>
      </div>

      {/* NEW: 5 Completely Different Document Section Designs */}
        <div className="space-y-8 border-2 border-primary/20 p-6 rounded-lg bg-card/50">
          <div>
            <h2 className="text-4xl font-bold mb-3 text-primary">NEW: 5 Revolutionary Document Section Designs</h2>
            <p className="text-muted-foreground text-lg">
              Each design offers a completely unique approach to document management with different UX patterns, animations, and visual styles.
            </p>
          </div>

          {/* Design 1: Minimalist Cards with Progress Ring */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">1. Minimalist Cards with Circular Progress</h3>
            <p className="text-sm text-muted-foreground mb-4">Clean floating cards with animated circular progress ring and smooth transitions</p>
            <MinimalistCardsDocuments
              title="Required Documents"
              documents={docsVariant1}
              onChange={(id, checked) => handleDocChange(1, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 2: Kanban Board Style */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">2. Kanban Board with Pending/Completed Columns</h3>
            <p className="text-sm text-muted-foreground mb-4">Two-column layout that visually moves documents from pending to completed</p>
            <KanbanBoardDocuments
              title="Document Collection Status"
              documents={docsVariant2}
              onChange={(id, checked) => handleDocChange(2, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 3: Timeline Checklist */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">3. Progressive Timeline Checklist</h3>
            <p className="text-sm text-muted-foreground mb-4">Vertical timeline that fills progressively with gradient effects and step-by-step completion</p>
            <TimelineDocuments
              title="Document Collection Timeline"
              documents={docsVariant3}
              onChange={(id, checked) => handleDocChange(3, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 4: Grid Matrix with Status Icons */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">4. Dense Grid Matrix with Live Statistics</h3>
            <p className="text-sm text-muted-foreground mb-4">Compact 3-column grid with status icons, statistics dashboard, and hover effects</p>
            <GridMatrixDocuments
              title="Document Matrix"
              documents={docsVariant4}
              onChange={(id, checked) => handleDocChange(4, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 5: Expandable Accordion */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">5. Collapsible Accordion with Categorized Folders</h3>
            <p className="text-sm text-muted-foreground mb-4">Multi-level accordion with folder categories, completion tracking per section</p>
            <AccordionDocuments
              title="Document Collection Center"
              documents={docsVariant5}
              onChange={(id, checked) => handleDocChange(5, id, checked)}
            />
          </div>
        </div>

        {/* NEW: 5 Two-Column Designs with Dark Green Completion */}
        <div className="space-y-8 border-2 border-primary/20 p-6 rounded-lg bg-card/50">
          <div>
            <h2 className="text-4xl font-bold mb-3 text-primary">NEW: Two-Column Layouts with Dark Green Completion</h2>
            <p className="text-muted-foreground text-lg">
              All designs feature 2 documents per row and transform to dark green background when completed.
            </p>
          </div>

          {/* Design 6: Classic Two-Column */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">6. Classic Two-Column with Master Checkbox</h3>
            <p className="text-sm text-muted-foreground mb-4">Clean and straightforward design with dark green completion state</p>
            <TwoColumnClassic
              title="Required Documents"
              documents={docsVariant6}
              onChange={(id, checked) => handleDocChange(6, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 7: Modern Two-Column */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">7. Modern Two-Column with Gradient Effects</h3>
            <p className="text-sm text-muted-foreground mb-4">Gradient backgrounds and smooth animations with emerald completion glow</p>
            <TwoColumnModern
              title="Document Checklist"
              documents={docsVariant7}
              onChange={(id, checked) => handleDocChange(7, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 8: Compact Two-Column */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">8. Compact Two-Column with Progress Badge</h3>
            <p className="text-sm text-muted-foreground mb-4">Space-efficient design with completion counter and dark green success state</p>
            <TwoColumnCompact
              title="Documents Required"
              documents={docsVariant8}
              onChange={(id, checked) => handleDocChange(8, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* FLIPPABLE CARD DESIGNS */}
          <div className="text-center space-y-2 my-12">
            <h2 className="text-4xl font-bold mb-3 text-primary">FLIPPABLE CARD DESIGNS - Timeline Style</h2>
            <p className="text-muted-foreground text-lg">
              Interactive flip cards with document details on back, inspired by timeline section
            </p>
          </div>

          {/* Design 1: 3D Flippable Cards */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">1. 3D Flippable Cards</h3>
            <p className="text-sm text-muted-foreground mb-4">Classic 3D flip effect with perspective transform</p>
            <FlippableCards3D
              title="Required Documents"
              documents={docsVariant9}
              onChange={(updated) => setDocsVariant9(updated)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 2: Gradient Flippable Cards */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">2. Gradient Flippable Cards</h3>
            <p className="text-sm text-muted-foreground mb-4">Vibrant gradients with smooth flip animations</p>
            <FlippableCardsGradient
              title="Required Documents"
              documents={docsVariant9}
              onChange={(updated) => setDocsVariant9(updated)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 3: Minimal Flippable Cards */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">3. Minimal Flippable Cards</h3>
            <p className="text-sm text-muted-foreground mb-4">Clean minimal design with subtle transitions</p>
            <FlippableCardsMinimal
              title="Required Documents"
              documents={docsVariant9}
              onChange={(updated) => setDocsVariant9(updated)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 4: Bold Flippable Cards */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">4. Bold Flippable Cards</h3>
            <p className="text-sm text-muted-foreground mb-4">Strong typography with completion counter</p>
            <FlippableCardsBold
              title="Required Documents"
              documents={docsVariant9}
              onChange={(updated) => setDocsVariant9(updated)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 5: Elegant Flippable Cards */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">5. Elegant Flippable Cards</h3>
            <p className="text-sm text-muted-foreground mb-4">Sophisticated with decorative elements and serif fonts</p>
            <FlippableCardsElegant
              title="Required Documents"
              documents={docsVariant9}
              onChange={(updated) => setDocsVariant9(updated)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 9: Elegant Two-Column */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">9. Elegant Two-Column with Decorative Effects</h3>
            <p className="text-sm text-muted-foreground mb-4">Sophisticated design with radial gradients and green emerald completion</p>
            <TwoColumnElegant
              title="Documentation Center"
              documents={docsVariant9}
              onChange={(id, checked) => handleDocChange(9, id, checked)}
            />
          </div>

          <div className="border-t border-border my-8" />

          {/* Design 10: Bold Two-Column */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-primary/90">10. Bold Two-Column with Achievement Style</h3>
            <p className="text-sm text-muted-foreground mb-4">Strong typography with progress bar and bold green completion with award icon</p>
            <TwoColumnBold
              title="Document Collection"
              documents={docsVariant10}
              onChange={(id, checked) => handleDocChange(10, id, checked)}
            />
          </div>
        </div>

        {/* OLD: Required Documents Design Comparison */}
        <div className="space-y-6 border-2 border-muted/20 p-6 rounded-lg bg-muted/5">
          <div>
            <h2 className="text-2xl font-bold mb-2 opacity-60">OLD: Previous Document Section Designs</h2>
            <p className="text-muted-foreground text-sm">
              Original design comparisons (kept for reference)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Design 2.1: Slate Gray */}
            <RequiredDocumentsSection
              title="Design 2.1: Slate Gray"
              documents={docsVariant2}
              onChange={(id, checked) => handleDocChange(2, id, checked)}
              colorScheme="slate"
            />

            {/* Design 2.2: Ocean Blue */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="completed-ocean-blue"
                  checked={docsVariant3.every(doc => doc.checked)}
                  onCheckedChange={(checked) => toggleAllDocs(3)}
                  className="h-5 w-5 shrink-0"
                />
                <label
                  htmlFor="completed-ocean-blue"
                  className="text-sm font-light tracking-[0.15em] cursor-pointer text-foreground/60"
                >
                  Completed
                </label>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-light tracking-[0.15em] text-foreground/60 mb-4">
                  DOCUMENTS REQUIRED
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {docsVariant3.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={doc.id}
                        checked={doc.checked}
                        onCheckedChange={(checked) => handleDocChange(3, doc.id, checked as boolean)}
                        className="h-5 w-5 shrink-0"
                      />
                      <label
                        htmlFor={doc.id}
                        className="text-sm font-light tracking-[0.15em] cursor-pointer text-foreground/60"
                      >
                        {doc.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Design 2.3: Warm Amber */}
            <RequiredDocumentsSection
              title="Design 2.3: Warm Amber"
              documents={docsVariant4}
              onChange={(id, checked) => handleDocChange(4, id, checked)}
              colorScheme="amber"
            />

            {/* Design 2.4: Fresh Green */}
            <RequiredDocumentsSection
              title="Design 2.4: Fresh Green"
              documents={docsVariant5}
              onChange={(id, checked) => handleDocChange(5, id, checked)}
              colorScheme="green"
            />

            {/* Design 2.5: Royal Purple */}
            <RequiredDocumentsSection
              title="Design 2.5: Royal Purple"
              documents={docsVariant6}
              onChange={(id, checked) => handleDocChange(6, id, checked)}
              colorScheme="purple"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold">Label Typography Comparison</h1>
        <p className="text-muted-foreground">Choose your preferred font style for form labels</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {/* OPTION 1: Classic Serif */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 1: Classic Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Elegant & traditional - Georgia/serif font family</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-1"
                  className="text-lg font-serif font-normal tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Gender
                </Label>
                <Select value={values1.gender} onValueChange={(v) => setValues1({...values1, gender: v})}>
                  <SelectTrigger id="gender-1" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-1"
                  className="text-lg font-serif font-normal tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values1.status} onValueChange={(v) => setValues1({...values1, status: v})}>
                  <SelectTrigger id="status-1" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-1"
                  className="text-lg font-serif font-normal tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values1.children} onValueChange={(v) => setValues1({...values1, children: v})}>
                  <SelectTrigger id="children-1" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 2: Modern Sans-Serif */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Option 2: Modern Sans-Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Clean & contemporary - System UI font stack</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-2"
                  className="text-base font-medium tracking-tight"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  Gender
                </Label>
                <Select value={values2.gender} onValueChange={(v) => setValues2({...values2, gender: v})}>
                  <SelectTrigger id="gender-2" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-2"
                  className="text-base font-medium tracking-tight"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values2.status} onValueChange={(v) => setValues2({...values2, status: v})}>
                  <SelectTrigger id="status-2" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-2"
                  className="text-base font-medium tracking-tight"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values2.children} onValueChange={(v) => setValues2({...values2, children: v})}>
                  <SelectTrigger id="children-2" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 3: Relaxed Rounded */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 3: Relaxed Rounded</CardTitle>
              <p className="text-sm text-muted-foreground">Friendly & approachable - Rounded sans-serif</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-3"
                  className="text-lg font-normal tracking-wider"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                >
                  Gender
                </Label>
                <Select value={values3.gender} onValueChange={(v) => setValues3({...values3, gender: v})}>
                  <SelectTrigger id="gender-3" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-3"
                  className="text-lg font-normal tracking-wider"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values3.status} onValueChange={(v) => setValues3({...values3, status: v})}>
                  <SelectTrigger id="status-3" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-3"
                  className="text-lg font-normal tracking-wider"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values3.children} onValueChange={(v) => setValues3({...values3, children: v})}>
                  <SelectTrigger id="children-3" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 4: Professional Serif (from website) */}
          <Card className="border-2 border-primary/30 bg-primary/10">
            <CardHeader>
              <CardTitle>Option 4: Professional Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Website style - Professional & trustworthy</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-4"
                  className="text-base font-normal tracking-normal"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Gender
                </Label>
                <Select value={values4.gender} onValueChange={(v) => setValues4({...values4, gender: v})}>
                  <SelectTrigger id="gender-4" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-4"
                  className="text-base font-normal tracking-normal"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values4.status} onValueChange={(v) => setValues4({...values4, status: v})}>
                  <SelectTrigger id="status-4" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-4"
                  className="text-base font-normal tracking-normal"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values4.children} onValueChange={(v) => setValues4({...values4, children: v})}>
                  <SelectTrigger id="children-4" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 5: Clean Muted Sans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 5: Clean Muted Sans</CardTitle>
              <p className="text-sm text-muted-foreground">Subtle & readable - Light sans-serif</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-5"
                  className="text-base font-normal tracking-normal text-muted-foreground"
                >
                  Gender
                </Label>
                <Select value={values5.gender} onValueChange={(v) => setValues5({...values5, gender: v})}>
                  <SelectTrigger id="gender-5" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-5"
                  className="text-base font-normal tracking-normal text-muted-foreground"
                >
                  Civil Status
                </Label>
                <Select value={values5.status} onValueChange={(v) => setValues5({...values5, status: v})}>
                  <SelectTrigger id="status-5" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-5"
                  className="text-base font-normal tracking-normal text-muted-foreground"
                >
                  Number of Children
                </Label>
                <Select value={values5.children} onValueChange={(v) => setValues5({...values5, children: v})}>
                  <SelectTrigger id="children-5" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 6: Bold Sans Uppercase */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 6: Bold Sans Uppercase</CardTitle>
              <p className="text-sm text-muted-foreground">Strong & commanding</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-6" className="text-sm font-bold uppercase tracking-widest">
                  Gender
                </Label>
                <Select value={values6.gender} onValueChange={(v) => setValues6({...values6, gender: v})}>
                  <SelectTrigger id="gender-6" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-6" className="text-sm font-bold uppercase tracking-widest">
                  Civil Status
                </Label>
                <Select value={values6.status} onValueChange={(v) => setValues6({...values6, status: v})}>
                  <SelectTrigger id="status-6" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-6" className="text-sm font-bold uppercase tracking-widest">
                  Number of Children
                </Label>
                <Select value={values6.children} onValueChange={(v) => setValues6({...values6, children: v})}>
                  <SelectTrigger id="children-6" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 7: Light Airy Sans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 7: Light Airy Sans</CardTitle>
              <p className="text-sm text-muted-foreground">Minimal & spacious</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-7" className="text-lg font-light tracking-wide text-foreground/70">
                  Gender
                </Label>
                <Select value={values7.gender} onValueChange={(v) => setValues7({...values7, gender: v})}>
                  <SelectTrigger id="gender-7" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-7" className="text-lg font-light tracking-wide text-foreground/70">
                  Civil Status
                </Label>
                <Select value={values7.status} onValueChange={(v) => setValues7({...values7, status: v})}>
                  <SelectTrigger id="status-7" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-7" className="text-lg font-light tracking-wide text-foreground/70">
                  Number of Children
                </Label>
                <Select value={values7.children} onValueChange={(v) => setValues7({...values7, children: v})}>
                  <SelectTrigger id="children-7" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 8: Monospace Technical */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 8: Monospace Technical</CardTitle>
              <p className="text-sm text-muted-foreground">Precise & structured</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-8" className="text-sm font-mono font-medium tracking-tight">
                  Gender
                </Label>
                <Select value={values8.gender} onValueChange={(v) => setValues8({...values8, gender: v})}>
                  <SelectTrigger id="gender-8" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-8" className="text-sm font-mono font-medium tracking-tight">
                  Civil Status
                </Label>
                <Select value={values8.status} onValueChange={(v) => setValues8({...values8, status: v})}>
                  <SelectTrigger id="status-8" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-8" className="text-sm font-mono font-medium tracking-tight">
                  Number of Children
                </Label>
                <Select value={values8.children} onValueChange={(v) => setValues8({...values8, children: v})}>
                  <SelectTrigger id="children-8" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 9: Semibold Tight */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 9: Semibold Tight</CardTitle>
              <p className="text-sm text-muted-foreground">Compact & confident</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-9" className="text-base font-semibold tracking-tight">
                  Gender
                </Label>
                <Select value={values9.gender} onValueChange={(v) => setValues9({...values9, gender: v})}>
                  <SelectTrigger id="gender-9" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-9" className="text-base font-semibold tracking-tight">
                  Civil Status
                </Label>
                <Select value={values9.status} onValueChange={(v) => setValues9({...values9, status: v})}>
                  <SelectTrigger id="status-9" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-9" className="text-base font-semibold tracking-tight">
                  Number of Children
                </Label>
                <Select value={values9.children} onValueChange={(v) => setValues9({...values9, children: v})}>
                  <SelectTrigger id="children-9" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 10: Elegant Serif Italic */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 10: Elegant Serif Italic</CardTitle>
              <p className="text-sm text-muted-foreground">Sophisticated & distinctive</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-10" className="text-lg font-serif italic font-normal tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Gender
                </Label>
                <Select value={values10.gender} onValueChange={(v) => setValues10({...values10, gender: v})}>
                  <SelectTrigger id="gender-10" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-10" className="text-lg font-serif italic font-normal tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Civil Status
                </Label>
                <Select value={values10.status} onValueChange={(v) => setValues10({...values10, status: v})}>
                  <SelectTrigger id="status-10" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-10" className="text-lg font-serif italic font-normal tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Number of Children
                </Label>
                <Select value={values10.children} onValueChange={(v) => setValues10({...values10, children: v})}>
                  <SelectTrigger id="children-10" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 11: Small Caps Formal */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 11: Small Caps Formal</CardTitle>
              <p className="text-sm text-muted-foreground">Classic & refined</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-11" className="text-sm font-medium tracking-wider" style={{ fontVariant: 'small-caps' }}>
                  Gender
                </Label>
                <Select value={values11.gender} onValueChange={(v) => setValues11({...values11, gender: v})}>
                  <SelectTrigger id="gender-11" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-11" className="text-sm font-medium tracking-wider" style={{ fontVariant: 'small-caps' }}>
                  Civil Status
                </Label>
                <Select value={values11.status} onValueChange={(v) => setValues11({...values11, status: v})}>
                  <SelectTrigger id="status-11" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-11" className="text-sm font-medium tracking-wider" style={{ fontVariant: 'small-caps' }}>
                  Number of Children
                </Label>
                <Select value={values11.children} onValueChange={(v) => setValues11({...values11, children: v})}>
                  <SelectTrigger id="children-11" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 12: Extra Large Bold */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 12: Extra Large Bold</CardTitle>
              <p className="text-sm text-muted-foreground">Maximum visibility</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-12" className="text-xl font-bold tracking-normal">
                  Gender
                </Label>
                <Select value={values12.gender} onValueChange={(v) => setValues12({...values12, gender: v})}>
                  <SelectTrigger id="gender-12" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-12" className="text-xl font-bold tracking-normal">
                  Civil Status
                </Label>
                <Select value={values12.status} onValueChange={(v) => setValues12({...values12, status: v})}>
                  <SelectTrigger id="status-12" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-12" className="text-xl font-bold tracking-normal">
                  Number of Children
                </Label>
                <Select value={values12.children} onValueChange={(v) => setValues12({...values12, children: v})}>
                  <SelectTrigger id="children-12" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 13: Condensed Sans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 13: Condensed Sans</CardTitle>
              <p className="text-sm text-muted-foreground">Efficient & modern</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-13" className="text-base font-medium tracking-tighter" style={{ fontStretch: 'condensed' }}>
                  Gender
                </Label>
                <Select value={values13.gender} onValueChange={(v) => setValues13({...values13, gender: v})}>
                  <SelectTrigger id="gender-13" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-13" className="text-base font-medium tracking-tighter" style={{ fontStretch: 'condensed' }}>
                  Civil Status
                </Label>
                <Select value={values13.status} onValueChange={(v) => setValues13({...values13, status: v})}>
                  <SelectTrigger id="status-13" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-13" className="text-base font-medium tracking-tighter" style={{ fontStretch: 'condensed' }}>
                  Number of Children
                </Label>
                <Select value={values13.children} onValueChange={(v) => setValues13({...values13, children: v})}>
                  <SelectTrigger id="children-13" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 14: Muted Medium Serif */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 14: Muted Medium Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Understated & professional</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-14" className="text-base font-medium tracking-normal text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                  Gender
                </Label>
                <Select value={values14.gender} onValueChange={(v) => setValues14({...values14, gender: v})}>
                  <SelectTrigger id="gender-14" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-14" className="text-base font-medium tracking-normal text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                  Civil Status
                </Label>
                <Select value={values14.status} onValueChange={(v) => setValues14({...values14, status: v})}>
                  <SelectTrigger id="status-14" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-14" className="text-base font-medium tracking-normal text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                  Number of Children
                </Label>
                <Select value={values14.children} onValueChange={(v) => setValues14({...values14, children: v})}>
                  <SelectTrigger id="children-14" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 15: Soft Wide Spacing */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 15: Soft Wide Spacing</CardTitle>
              <p className="text-sm text-muted-foreground">Gentle & breathing room</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-15" className="text-base font-normal tracking-widest text-foreground/75">
                  Gender
                </Label>
                <Select value={values15.gender} onValueChange={(v) => setValues15({...values15, gender: v})}>
                  <SelectTrigger id="gender-15" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-15" className="text-base font-normal tracking-widest text-foreground/75">
                  Civil Status
                </Label>
                <Select value={values15.status} onValueChange={(v) => setValues15({...values15, status: v})}>
                  <SelectTrigger id="status-15" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-15" className="text-base font-normal tracking-widest text-foreground/75">
                  Number of Children
                </Label>
                <Select value={values15.children} onValueChange={(v) => setValues15({...values15, children: v})}>
                  <SelectTrigger id="children-15" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 16: Extra Bold Condensed */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 16: Extra Bold Condensed</CardTitle>
              <p className="text-sm text-muted-foreground">Powerful & space-efficient</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-16" className="text-base font-extrabold tracking-tighter">
                  Gender
                </Label>
                <Select value={values16.gender} onValueChange={(v) => setValues16({...values16, gender: v})}>
                  <SelectTrigger id="gender-16" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-16" className="text-base font-extrabold tracking-tighter">
                  Civil Status
                </Label>
                <Select value={values16.status} onValueChange={(v) => setValues16({...values16, status: v})}>
                  <SelectTrigger id="status-16" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-16" className="text-base font-extrabold tracking-tighter">
                  Number of Children
                </Label>
                <Select value={values16.children} onValueChange={(v) => setValues16({...values16, children: v})}>
                  <SelectTrigger id="children-16" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 17: Thin Elegant */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 17: Thin Elegant</CardTitle>
              <p className="text-sm text-muted-foreground">Delicate & sophisticated</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-17" className="text-xl font-thin tracking-wide text-foreground/85">
                  Gender
                </Label>
                <Select value={values17.gender} onValueChange={(v) => setValues17({...values17, gender: v})}>
                  <SelectTrigger id="gender-17" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-17" className="text-xl font-thin tracking-wide text-foreground/85">
                  Civil Status
                </Label>
                <Select value={values17.status} onValueChange={(v) => setValues17({...values17, status: v})}>
                  <SelectTrigger id="status-17" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-17" className="text-xl font-thin tracking-wide text-foreground/85">
                  Number of Children
                </Label>
                <Select value={values17.children} onValueChange={(v) => setValues17({...values17, children: v})}>
                  <SelectTrigger id="children-17" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 18: All Caps Light */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 18: All Caps Light</CardTitle>
              <p className="text-sm text-muted-foreground">Structured & airy</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-18" className="text-xs font-light uppercase tracking-[0.2em]">
                  Gender
                </Label>
                <Select value={values18.gender} onValueChange={(v) => setValues18({...values18, gender: v})}>
                  <SelectTrigger id="gender-18" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-18" className="text-xs font-light uppercase tracking-[0.2em]">
                  Civil Status
                </Label>
                <Select value={values18.status} onValueChange={(v) => setValues18({...values18, status: v})}>
                  <SelectTrigger id="status-18" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-18" className="text-xs font-light uppercase tracking-[0.2em]">
                  Number of Children
                </Label>
                <Select value={values18.children} onValueChange={(v) => setValues18({...values18, children: v})}>
                  <SelectTrigger id="children-18" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 19: Serif Bold Large */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 19: Serif Bold Large</CardTitle>
              <p className="text-sm text-muted-foreground">Traditional & prominent</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-19" className="text-xl font-bold tracking-normal" style={{ fontFamily: 'Georgia, serif' }}>
                  Gender
                </Label>
                <Select value={values19.gender} onValueChange={(v) => setValues19({...values19, gender: v})}>
                  <SelectTrigger id="gender-19" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-19" className="text-xl font-bold tracking-normal" style={{ fontFamily: 'Georgia, serif' }}>
                  Civil Status
                </Label>
                <Select value={values19.status} onValueChange={(v) => setValues19({...values19, status: v})}>
                  <SelectTrigger id="status-19" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-19" className="text-xl font-bold tracking-normal" style={{ fontFamily: 'Georgia, serif' }}>
                  Number of Children
                </Label>
                <Select value={values19.children} onValueChange={(v) => setValues19({...values19, children: v})}>
                  <SelectTrigger id="children-19" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 20: Sans Medium Primary Accent */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 20: Sans Medium Primary</CardTitle>
              <p className="text-sm text-muted-foreground">Modern with color accent</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-20" className="text-base font-medium tracking-normal text-primary">
                  Gender
                </Label>
                <Select value={values20.gender} onValueChange={(v) => setValues20({...values20, gender: v})}>
                  <SelectTrigger id="gender-20" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-20" className="text-base font-medium tracking-normal text-primary">
                  Civil Status
                </Label>
                <Select value={values20.status} onValueChange={(v) => setValues20({...values20, status: v})}>
                  <SelectTrigger id="status-20" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-20" className="text-base font-medium tracking-normal text-primary">
                  Number of Children
                </Label>
                <Select value={values20.children} onValueChange={(v) => setValues20({...values20, children: v})}>
                  <SelectTrigger id="children-20" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 21: Large Relaxed Sans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 21: Large Relaxed Sans</CardTitle>
              <p className="text-sm text-muted-foreground">Spacious & comfortable</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-21" className="text-2xl font-normal tracking-wide">
                  Gender
                </Label>
                <Select value={values21.gender} onValueChange={(v) => setValues21({...values21, gender: v})}>
                  <SelectTrigger id="gender-21" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-21" className="text-2xl font-normal tracking-wide">
                  Civil Status
                </Label>
                <Select value={values21.status} onValueChange={(v) => setValues21({...values21, status: v})}>
                  <SelectTrigger id="status-21" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-21" className="text-2xl font-normal tracking-wide">
                  Number of Children
                </Label>
                <Select value={values21.children} onValueChange={(v) => setValues21({...values21, children: v})}>
                  <SelectTrigger id="children-21" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 22: Small Tight Modern */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 22: Small Tight Modern</CardTitle>
              <p className="text-sm text-muted-foreground">Compact & efficient</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-22" className="text-xs font-semibold tracking-tight uppercase">
                  Gender
                </Label>
                <Select value={values22.gender} onValueChange={(v) => setValues22({...values22, gender: v})}>
                  <SelectTrigger id="gender-22" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-22" className="text-xs font-semibold tracking-tight uppercase">
                  Civil Status
                </Label>
                <Select value={values22.status} onValueChange={(v) => setValues22({...values22, status: v})}>
                  <SelectTrigger id="status-22" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-22" className="text-xs font-semibold tracking-tight uppercase">
                  Number of Children
                </Label>
                <Select value={values22.children} onValueChange={(v) => setValues22({...values22, children: v})}>
                  <SelectTrigger id="children-22" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 23: Rounded Font Medium */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 23: Rounded Medium</CardTitle>
              <p className="text-sm text-muted-foreground">Friendly & approachable</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-23" className="text-base font-medium tracking-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Gender
                </Label>
                <Select value={values23.gender} onValueChange={(v) => setValues23({...values23, gender: v})}>
                  <SelectTrigger id="gender-23" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-23" className="text-base font-medium tracking-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Civil Status
                </Label>
                <Select value={values23.status} onValueChange={(v) => setValues23({...values23, status: v})}>
                  <SelectTrigger id="status-23" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-23" className="text-base font-medium tracking-normal" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Number of Children
                </Label>
                <Select value={values23.children} onValueChange={(v) => setValues23({...values23, children: v})}>
                  <SelectTrigger id="children-23" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 24: Ultra Wide Spacing */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 24: Ultra Wide Spacing</CardTitle>
              <p className="text-sm text-muted-foreground">Dramatic letter spacing</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-24" className="text-sm font-semibold uppercase tracking-[0.3em]">
                  Gender
                </Label>
                <Select value={values24.gender} onValueChange={(v) => setValues24({...values24, gender: v})}>
                  <SelectTrigger id="gender-24" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-24" className="text-sm font-semibold uppercase tracking-[0.3em]">
                  Civil Status
                </Label>
                <Select value={values24.status} onValueChange={(v) => setValues24({...values24, status: v})}>
                  <SelectTrigger id="status-24" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-24" className="text-sm font-semibold uppercase tracking-[0.3em]">
                  Number of Children
                </Label>
                <Select value={values24.children} onValueChange={(v) => setValues24({...values24, children: v})}>
                  <SelectTrigger id="children-24" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 25: Balanced Sans Medium */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Option 25: Balanced Sans Medium</CardTitle>
              <p className="text-sm text-muted-foreground">Perfect all-around choice</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-25" className="text-base font-medium tracking-normal">
                  Gender
                </Label>
                <Select value={values25.gender} onValueChange={(v) => setValues25({...values25, gender: v})}>
                  <SelectTrigger id="gender-25" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-25" className="text-base font-medium tracking-normal">
                  Civil Status
                </Label>
                <Select value={values25.status} onValueChange={(v) => setValues25({...values25, status: v})}>
                  <SelectTrigger id="status-25" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="children-25" className="text-base font-medium tracking-normal">
                  Number of Children
                </Label>
                <Select value={values25.children} onValueChange={(v) => setValues25({...values25, children: v})}>
                  <SelectTrigger id="children-25" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* NEW SECTION: Documents Required Font Testing */}
          <div className="col-span-full pt-8 border-t-4 border-primary/30">
            <h2 className="text-2xl font-bold mb-2">"Documents Required" Font Tests</h2>
            <p className="text-muted-foreground mb-6">Testing different darkness and transparency levels - same size</p>
          </div>

          {/* Test 1: Light - 50% opacity */}
          <Card className="border-2 border-cyan-500/30 bg-cyan-500/5">
            <CardHeader>
              <CardTitle>Test 1: Light (50% opacity)</CardTitle>
              <p className="text-sm text-muted-foreground">Very subtle and light</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pt-4">
                <h3 className="font-light text-foreground/50 text-sm mb-4">Documents required</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Birth certificate</span>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Marriage certificate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test 2: Medium Light - 60% opacity */}
          <Card className="border-2 border-cyan-500/30 bg-cyan-500/5">
            <CardHeader>
              <CardTitle>Test 2: Medium Light (60% opacity)</CardTitle>
              <p className="text-sm text-muted-foreground">Slightly more visible</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pt-4">
                <h3 className="font-light text-foreground/60 text-sm mb-4">Documents required</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Birth certificate</span>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Marriage certificate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test 3: Medium - 70% opacity */}
          <Card className="border-2 border-primary/30 bg-primary/10">
            <CardHeader>
              <CardTitle>Test 3: Medium (70% opacity)</CardTitle>
              <p className="text-sm text-muted-foreground">Balanced visibility - RECOMMENDED</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pt-4">
                <h3 className="font-light text-foreground/70 text-sm mb-4">Documents required</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Birth certificate</span>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Marriage certificate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test 4: Medium Dark - 80% opacity */}
          <Card className="border-2 border-cyan-500/30 bg-cyan-500/5">
            <CardHeader>
              <CardTitle>Test 4: Medium Dark (80% opacity)</CardTitle>
              <p className="text-sm text-muted-foreground">More prominent</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pt-4">
                <h3 className="font-light text-foreground/80 text-sm mb-4">Documents required</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Birth certificate</span>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Marriage certificate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test 5: Current/Full - 90% opacity */}
          <Card className="border-2 border-cyan-500/30 bg-cyan-500/5">
            <CardHeader>
              <CardTitle>Test 5: Current Style (90% opacity)</CardTitle>
              <p className="text-sm text-muted-foreground">Existing style for comparison</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pt-4">
                <h3 className="font-light text-foreground/90 text-sm mb-4">Documents required</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Birth certificate</span>
                  </div>
                  <div className="flex items-center space-x-4 p-5 rounded-xl border-2 border-border/50 bg-card/30 backdrop-blur">
                    <div className="w-6 h-6 rounded border-2 border-primary/50" />
                    <span className="text-sm">Marriage certificate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DOCUMENTS REQUIRED SECTION VARIATIONS */}
        <div className="space-y-6">
          <div className="text-center space-y-4 py-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Documents Required Section - 10 Outstanding Designs
            </h2>
            <p className="text-lg text-muted-foreground">
              Compare 10 different approaches to make the documents section stand out
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Design 1: Amber Highlight Panel */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 1: Amber Highlight Panel</CardTitle>
                <p className="text-sm text-muted-foreground">Left accent bar with amber tint</p>
              </CardHeader>
              <CardContent>
                <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-lg">
                  <h3 className="text-amber-600 dark:text-amber-400 font-medium text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-amber-50/20 dark:bg-amber-950/10 border border-amber-400/30">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-amber-50/20 dark:bg-amber-950/10 border border-amber-400/30">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 2: Emerald Bordered Section */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 2: Emerald Bordered Section</CardTitle>
                <p className="text-sm text-muted-foreground">Full border enclosure with emerald theme</p>
              </CardHeader>
              <CardContent>
                <div className="bg-emerald-50/30 dark:bg-emerald-950/20 border-2 border-emerald-400/50 p-6 rounded-lg">
                  <h3 className="text-emerald-700 dark:text-emerald-300 font-semibold text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-emerald-100/30 dark:bg-emerald-900/20 border border-emerald-400/40">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-emerald-100/30 dark:bg-emerald-900/20 border border-emerald-400/40">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 3: Purple Gradient Banner */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 3: Purple Gradient Banner</CardTitle>
                <p className="text-sm text-muted-foreground">Gradient background with top border accent</p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-t-4 border-purple-500 p-6 rounded-lg">
                  <h3 className="text-purple-700 dark:text-purple-300 font-bold text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-purple-50/20 dark:bg-purple-950/20 border border-purple-400/30">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-purple-50/20 dark:bg-purple-950/20 border border-purple-400/30">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 4: Cyan Elevated Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 4: Cyan Elevated Card</CardTitle>
                <p className="text-sm text-muted-foreground">Elevated with shadow and cyan accents</p>
              </CardHeader>
              <CardContent>
                <div className="bg-cyan-500/5 border border-cyan-400/30 p-6 rounded-xl shadow-lg shadow-cyan-500/20">
                  <h3 className="text-cyan-600 dark:text-cyan-400 font-semibold uppercase text-xs tracking-wider mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-cyan-50/20 dark:bg-cyan-950/20 border border-cyan-400/30">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-cyan-50/20 dark:bg-cyan-950/20 border border-cyan-400/30">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 5: Rose Accent Strip */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 5: Rose Accent Strip</CardTitle>
                <p className="text-sm text-muted-foreground">Horizontal emphasis with top & bottom borders</p>
              </CardHeader>
              <CardContent>
                <div className="bg-rose-50/40 dark:bg-rose-950/30 border-y-2 border-rose-400/60 p-6">
                  <h3 className="text-rose-700 dark:text-rose-300 font-bold text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-rose-100/30 dark:bg-rose-900/20 border border-rose-400/40">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-rose-100/30 dark:bg-rose-900/20 border border-rose-400/40">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 6: Indigo Frosted Panel */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 6: Indigo Frosted Panel</CardTitle>
                <p className="text-sm text-muted-foreground">Frosted glass effect with indigo theme</p>
              </CardHeader>
              <CardContent>
                <div className="bg-indigo-500/15 backdrop-blur-sm border-2 border-indigo-300/40 dark:border-indigo-600/40 p-6 rounded-lg">
                  <h3 className="text-indigo-800 dark:text-indigo-200 font-semibold text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-400/30">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-400/30">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 7: Teal Corner Accent */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 7: Teal Corner Accent</CardTitle>
                <p className="text-sm text-muted-foreground">Unique corner decoration with teal</p>
              </CardHeader>
              <CardContent>
                <div className="bg-teal-500/8 border-l-4 border-t-4 border-teal-500 p-6 rounded-tl-lg">
                  <h3 className="text-teal-700 dark:text-teal-300 font-bold text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-teal-50/20 dark:bg-teal-950/20 border border-teal-400/30">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-teal-50/20 dark:bg-teal-950/20 border border-teal-400/30">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 8: Orange Glow Box */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 8: Orange Glow Box</CardTitle>
                <p className="text-sm text-muted-foreground">Subtle glow effect with orange accents</p>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-500/10 border-2 border-orange-400/50 p-6 rounded-lg shadow-md shadow-orange-500/30">
                  <h3 className="text-orange-700 dark:text-orange-300 font-bold text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-orange-50/20 dark:bg-orange-950/20 border border-orange-400/30">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-orange-50/20 dark:bg-orange-950/20 border border-orange-400/30">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 9: Violet Double Border */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 9: Violet Double Border</CardTitle>
                <p className="text-sm text-muted-foreground">Double border creates depth</p>
              </CardHeader>
              <CardContent>
                <div className="bg-violet-500/5 border-4 border-violet-300/30 dark:border-violet-700/30 p-4 rounded-lg">
                  <div className="p-2">
                    <h3 className="text-violet-700 dark:text-violet-300 font-bold text-base mb-4">Documents required</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center space-x-4 p-4 rounded-lg bg-violet-50/20 dark:bg-violet-950/20 border border-violet-400/30">
                        <Checkbox />
                        <span className="text-sm">Birth certificate</span>
                      </div>
                      <div className="flex items-center space-x-4 p-4 rounded-lg bg-violet-50/20 dark:bg-violet-950/20 border border-violet-400/30">
                        <Checkbox />
                        <span className="text-sm">Marriage certificate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design 10: Sky Blue Island */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Design 10: Sky Blue Island</CardTitle>
                <p className="text-sm text-muted-foreground">"Island" effect with generous spacing</p>
              </CardHeader>
              <CardContent>
                <div className="bg-sky-100/50 dark:bg-sky-900/20 border-2 border-sky-400/60 p-6 rounded-2xl">
                  <h3 className="text-sky-700 dark:text-sky-300 font-bold uppercase tracking-wide text-base mb-4">Documents required</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-sky-50/30 dark:bg-sky-950/20 border border-sky-400/40">
                      <Checkbox />
                      <span className="text-sm">Birth certificate</span>
                    </div>
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-sky-50/30 dark:bg-sky-950/20 border border-sky-400/40">
                      <Checkbox />
                      <span className="text-sm">Marriage certificate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* INPUT FIELD DESIGN VARIATIONS */}
        <div className="space-y-6">
          <div className="text-center space-y-4 py-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Input Field Design Variations (Darker Shades)
            </h2>
            <p className="text-lg text-muted-foreground">
              Compare 10 different input field styles with slightly darker backgrounds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Style 1: Subtle Gray - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 1: Subtle Gray (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Light gray, 45% opacity - slightly more visible</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-muted/45 border-2 border-border/40 hover:border-border/60 focus:border-primary/60"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-muted/45 border-2 border-border/40 hover:border-border/60 focus:border-primary/60"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-muted/45 border-2 border-border/40 px-3 py-2 text-lg hover:border-border/60 focus:border-primary/60 focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 2: Medium Gray - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 2: Medium Gray (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Medium gray, 70% opacity - stronger contrast</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-muted/70 border-2 border-border/60 hover:border-border/80 focus:border-primary"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-muted/70 border-2 border-border/60 hover:border-border/80 focus:border-primary"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-muted/70 border-2 border-border/60 px-3 py-2 text-lg hover:border-border/80 focus:border-primary focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 3: Dark Slate - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 3: Dark Slate (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Dark slate, 50% opacity - more sophisticated</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-slate-900/50 border-2 border-slate-700/50 hover:border-slate-600/60 focus:border-primary backdrop-blur"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-slate-900/50 border-2 border-slate-700/50 hover:border-slate-600/60 focus:border-primary backdrop-blur"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-slate-900/50 border-2 border-slate-700/50 px-3 py-2 text-lg hover:border-slate-600/60 focus:border-primary focus:outline-none backdrop-blur">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 4: Warm Beige - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 4: Warm Beige (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Warm tone, 35% opacity - warmer appearance</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-amber-50/35 dark:bg-amber-950/30 border-2 border-amber-200/40 dark:border-amber-800/40 hover:border-amber-300/60 dark:hover:border-amber-700/60 focus:border-amber-500"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-amber-50/35 dark:bg-amber-950/30 border-2 border-amber-200/40 dark:border-amber-800/40 hover:border-amber-300/60 dark:hover:border-amber-700/60 focus:border-amber-500"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-amber-50/35 dark:bg-amber-950/30 border-2 border-amber-200/40 dark:border-amber-800/40 px-3 py-2 text-lg hover:border-amber-300/60 dark:hover:border-amber-700/60 focus:border-amber-500 focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 5: Cool Blue Tint - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 5: Cool Blue Tint (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Cool blue, 45% opacity - professional tech-feel</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-blue-50/45 dark:bg-blue-950/40 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300/70 dark:hover:border-blue-700/70 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-blue-50/45 dark:bg-blue-950/40 border-2 border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300/70 dark:hover:border-blue-700/70 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-blue-50/45 dark:bg-blue-950/40 border-2 border-blue-200/50 dark:border-blue-800/50 px-3 py-2 text-lg hover:border-blue-300/70 dark:hover:border-blue-700/70 focus:border-blue-500 focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 6: Elevated Card - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 6: Elevated Card (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Material design, 95% opacity - raised fields</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-card/95 border border-border shadow-md hover:shadow-lg focus:shadow-xl transition-shadow"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-card/95 border border-border shadow-md hover:shadow-lg focus:shadow-xl transition-shadow"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-card/95 border border-border shadow-md px-3 py-2 text-lg hover:shadow-lg focus:shadow-xl focus:outline-none transition-shadow">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 7: Frosted Glass Dark - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 7: Frosted Glass (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Modern frosted, 85% opacity - darker glass</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-background/85 border-2 border-primary/20 backdrop-blur-xl hover:border-primary/40 focus:border-primary/60"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-background/85 border-2 border-primary/20 backdrop-blur-xl hover:border-primary/40 focus:border-primary/60"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-background/85 border-2 border-primary/20 backdrop-blur-xl px-3 py-2 text-lg hover:border-primary/40 focus:border-primary/60 focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 8: Gradient Border - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 8: Gradient Border (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Modern gradient, 80% opacity - eye-catching</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Enter your name" 
                      className="h-16 text-lg bg-card/80 border-2 border-transparent bg-gradient-to-r from-primary/30 to-accent/30 hover:from-primary/50 hover:to-accent/50 focus:from-primary focus:to-accent"
                    />
                  </div>
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-card/80 border-2 border-transparent bg-gradient-to-r from-primary/30 to-accent/30 hover:from-primary/50 hover:to-accent/50 focus:from-primary focus:to-accent"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-card/80 border-2 border-transparent bg-gradient-to-r from-primary/30 to-accent/30 px-3 py-2 text-lg hover:from-primary/50 hover:to-accent/50 focus:from-primary focus:to-accent focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 9: Solid Contrast - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 9: Solid Contrast (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">High contrast, 95% opacity - very visible</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-secondary opacity-95 border-2 border-secondary-foreground/20 hover:border-secondary-foreground/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-secondary opacity-95 border-2 border-secondary-foreground/20 hover:border-secondary-foreground/40 focus:border-primary"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full rounded-md bg-secondary opacity-95 border-2 border-secondary-foreground/20 px-3 py-2 text-lg hover:border-secondary-foreground/40 focus:border-primary focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Style 10: Minimal Underline - Darker */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Style 10: Minimal Underline (Darker)</CardTitle>
                <p className="text-sm text-muted-foreground">Clean minimal, 10% bg - subtle depth</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    className="h-16 text-lg bg-background/10 border-0 border-b-2 border-border rounded-none hover:border-primary/60 focus:border-primary px-0"
                  />
                </div>
                <div>
                  <Label>Birth Date</Label>
                  <Input 
                    type="text" 
                    placeholder="DD.MM.YYYY" 
                    className="h-16 text-lg bg-background/10 border-0 border-b-2 border-border rounded-none hover:border-primary/60 focus:border-primary px-0"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select className="flex h-16 w-full bg-background/10 border-0 border-b-2 border-border rounded-none px-0 py-2 text-lg hover:border-primary/60 focus:border-primary focus:outline-none">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
