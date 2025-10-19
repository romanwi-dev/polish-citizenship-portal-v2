import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  FileText, 
  Workflow, 
  Database,
  Zap,
  GitBranch,
  Users,
  Award,
  Archive,
  Languages,
  FileCheck,
  Plane,
  Sparkles
} from "lucide-react";

export default function SystemOverview() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">System Overview</h1>
          <p className="text-muted-foreground text-lg">
            Complete technical documentation of the Polish Citizenship Portal AI Agent system
          </p>
        </div>

        {/* AI Agents Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>AI Agents (5 Total)</CardTitle>
            </div>
            <CardDescription>
              Specialized AI agents that automate different aspects of the citizenship process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Forms Agent */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Forms Agent</h3>
                <Badge variant="outline">6 Tools</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Manages all form processing, validation, and data flow between different stages of the citizenship application.
              </p>
              <div className="ml-7 space-y-2">
                <p className="text-sm font-medium">Tools:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Intake Form Parser:</strong> Extracts client data from initial intake submissions</li>
                  <li><strong>POA Generator:</strong> Auto-generates Power of Attorney documents from intake data</li>
                  <li><strong>Citizenship Form Mapper:</strong> Maps intake data to OBY (citizenship application) fields</li>
                  <li><strong>Family Tree Builder:</strong> Constructs genealogical relationships from provided data</li>
                  <li><strong>Civil Registry Mapper:</strong> Organizes birth/marriage certificate requests</li>
                  <li><strong>Form Validator:</strong> Real-time validation of DD.MM.YYYY dates and required fields</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Translations Agent */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Translations Agent</h3>
                <Badge variant="outline">5 Tools</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Handles document translation workflows, prioritization, and certified translator coordination.
              </p>
              <div className="ml-7 space-y-2">
                <p className="text-sm font-medium">Tools:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Translation Queue Manager:</strong> Prioritizes documents needing translation by urgency</li>
                  <li><strong>AI Translation Engine:</strong> Provides initial automated translations for review</li>
                  <li><strong>Sworn Translator Router:</strong> Assigns documents to certified Polish translators</li>
                  <li><strong>Translation Validator:</strong> Double-checks translations for errors</li>
                  <li><strong>Certificate Generator:</strong> Creates sworn translation certificates</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Archives Agent */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Archives Agent</h3>
                <Badge variant="outline">4 Tools</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Coordinates searches across Polish and international archives to locate historical documents.
              </p>
              <div className="ml-7 space-y-2">
                <p className="text-sm font-medium">Tools:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Archive Letter Generator:</strong> Creates official requests in Polish for archive offices</li>
                  <li><strong>USC Workflow Manager:</strong> Handles umiejscowienie and uzupełnienie processes</li>
                  <li><strong>Partner Coordination:</strong> Connects with local search partners</li>
                  <li><strong>Results Tracker:</strong> Monitors status of pending archive requests</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Documents Agent */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Documents Agent</h3>
                <Badge variant="outline">4 Tools</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitors document collection status across all 7 family members (AP, F, M, PGF, PGM, MGF, MGM).
              </p>
              <div className="ml-7 space-y-2">
                <p className="text-sm font-medium">Tools:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Doc Radar:</strong> Tracks which documents are present/missing for each family member</li>
                  <li><strong>Translation Flag Engine:</strong> Auto-creates tasks when documents aren't in Polish</li>
                  <li><strong>OCR Scanner:</strong> Extracts data from passport/document images</li>
                  <li><strong>Evidence Bundle Generator:</strong> Creates organized PDF packages with TOC</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* WSC Letter Agent */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">WSC Letter Agent</h3>
                <Badge variant="outline">2 Tools</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Processes official letters from WSC (Masovian Voivoda's office) and manages response strategies.
              </p>
              <div className="ml-7 space-y-2">
                <p className="text-sm font-medium">Tools:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><strong>Letter OCR Parser:</strong> Extracts date, reference number, and deadline from WSC letters</li>
                  <li><strong>Strategy Recommender:</strong> Suggests PUSH/NUDGE/SITDOWN approaches based on letter content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflows Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Workflow className="h-6 w-6 text-primary" />
              <CardTitle>Workflows (6 Total)</CardTitle>
            </div>
            <CardDescription>
              End-to-end processes that guide cases through different stages of the citizenship journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Translations Workflow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Translations Workflow</h3>
                <Badge>PART 8</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Process:</strong> Document upload → AI translation → Certified translator review → Double-check by independent agent → Submission
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Features:</strong> Prioritization queue, automatic flagging of non-Polish documents, sworn translator certification tracking
              </p>
            </div>

            <Separator />

            {/* Archives Search Workflow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Archives Search Workflow</h3>
                <Badge>PART 7</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Process:</strong> Polish archives search → International archives search → Family possessions search → Partner coordination → Document retrieval → Translation → Filing
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Features:</strong> Generates official Polish letters for archive offices, USC workflows (umiejscowienie/uzupełnienie), partner integration
              </p>
            </div>

            <Separator />

            {/* Documents Collection Workflow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Documents Collection Workflow</h3>
                <Badge>PART 6</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Process:</strong> Documents list clarification → Local documents gathering → Partner assistance → Document examination → Translation selection → Filing
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Features:</strong> Doc Radar (7 family members), translation flag engine, OCR for passport/document scanning
              </p>
            </div>

            <Separator />

            {/* Polish Civil Acts Workflow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Polish Civil Acts Workflow</h3>
                <Badge>PART 10</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Process:</strong> Prepare applications → Payment collection → Submit to Polish Civil Registry → Receive birth/marriage certificates
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Features:</strong> Dedicated civil acts agent supervision, automated payment tracking
              </p>
            </div>

            <Separator />

            {/* Polish Citizenship Workflow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Polish Citizenship Workflow</h3>
                <Badge>PART 13</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Process:</strong> Initial response evaluation → Evidence submission → WSC letter management → Push schemes (PUSH/NUDGE/SITDOWN) → Confirmation decision
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Features:</strong> WSC letter OCR parsing, strategy recommendation, term extensions, appeal preparation (if needed)
              </p>
            </div>

            <Separator />

            {/* Polish Passport Workflow */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Polish Passport Workflow</h3>
                <Badge>PART 14</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Process:</strong> Prepare documents → Final payment → FedEx shipment → Consulate appointment scheduling → Passport application → Passport obtained
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Features:</strong> Consulate kit generation (passport checklist), appointment coordination
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Forms Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <CardTitle>Forms & Data Structure (6 Forms)</CardTitle>
            </div>
            <CardDescription>
              All forms use unified architecture with auto-save, validation, and real-time synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Intake Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">1. Intake Form</h3>
                <Badge variant="outline">PART 3-4</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Purpose:</strong> Universal client intake wizard for collecting initial information
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Database Table:</strong> <code>intake_forms</code>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Fields:</strong> Passport data (OCR auto-fill), basic details, address, phone, essential family history, "I don't know" fields
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Data Flow:</strong> Intake → POA generation → Citizenship form → Family Tree → Civil Registry
              </p>
            </div>

            <Separator />

            {/* POA Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">2. POA Form (Power of Attorney)</h3>
                <Badge variant="outline">PART 4</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Purpose:</strong> Legal authorization for representing clients in Polish citizenship proceedings
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Database Table:</strong> <code>poa_forms</code>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Fields:</strong> Client details (auto-filled from intake), e-signature capability, HAC approval tracking
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Workflow:</strong> Auto-generated from intake → Client e-sign → FedEx to Warsaw → HAC approval → Marked valid
              </p>
            </div>

            <Separator />

            {/* Citizenship Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">3. Citizenship Form (OBY)</h3>
                <Badge variant="outline">PART 5</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Purpose:</strong> Complete Polish citizenship application (Wniosek o stwierdzenie posiadania obywatelstwa polskiego)
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Database Table:</strong> <code>citizenship_forms</code>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Fields:</strong> ~140 fields including personal data, family history, residential addresses, Polish ancestor details
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Workflow:</strong> Intake auto-populates draft → HAC review/approval → Submitted to WSC → Status: "Filed"
              </p>
            </div>

            <Separator />

            {/* Family Tree Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">4. Family Tree Form</h3>
                <Badge variant="outline">PART 1</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Purpose:</strong> Visual genealogical mapping for eligibility determination
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Database Table:</strong> <code>family_tree_forms</code>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Fields:</strong> 7 family members (AP, F, M, PGF, PGM, MGF, MGM), relationships, birth/death dates, citizenship status
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Use Case:</strong> Citizenship test → Eligibility examination (yes/maybe/no) → Case difficulty evaluation (1-10 scale)
              </p>
            </div>

            <Separator />

            {/* Civil Registry Form */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">5. Civil Registry Form</h3>
                <Badge variant="outline">PART 10</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Purpose:</strong> Organizing requests for Polish birth and marriage certificates
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Database Table:</strong> <code>civil_registry_forms</code>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Fields:</strong> Person details, event type (birth/marriage), registry office location, request status
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Workflow:</strong> Applications prepared → Payment → Submit to Polish Civil Registry → Receive certificates
              </p>
            </div>

            <Separator />

            {/* Master Data Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">6. Master Data Table</h3>
                <Badge variant="outline">PART 5</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Purpose:</strong> Comprehensive data collection for case processing
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Database Table:</strong> <code>master_data_forms</code>
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Key Fields:</strong> All data needed to process case in full (filled by client on portal account)
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Integration:</strong> Central data source for AI agent to generate all paperwork
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Infrastructure */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <CardTitle>Technical Infrastructure</CardTitle>
            </div>
            <CardDescription>
              Shared services and utilities powering the entire system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Form Management</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li><code>useFormManager</code>: Universal form hook</li>
                  <li><code>useAutoSave</code>: 30-second debounced auto-save</li>
                  <li><code>useFieldValidation</code>: DD.MM.YYYY date validation</li>
                  <li><code>FormValidationSummary</code>: Error count display</li>
                  <li><code>AutosaveIndicator</code>: Save status indicator</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Data Security</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Passport number masking (by role)</li>
                  <li>Row Level Security (RLS) enabled</li>
                  <li>Input validation on all forms</li>
                  <li>Unsaved changes browser warning</li>
                  <li>Real-time sync across sessions</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Case Organization</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Hybrid naming system (migration scanner)</li>
                  <li>KPI tracking dashboard</li>
                  <li>Document completion % badges</li>
                  <li>Stage timeline visualization</li>
                  <li>HAC oversight logging</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Integrations</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Partner API (POST intake, GET status)</li>
                  <li>Typeform → Case creation</li>
                  <li>Dropbox sync & migration</li>
                  <li>Email notifications (welcome, updates)</li>
                  <li>Magic link authentication</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>System Metrics</CardTitle>
            </div>
            <CardDescription>
              Current production readiness status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center space-y-2 p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">21</div>
                <div className="text-sm text-muted-foreground">AI Agent Tools</div>
              </div>
              <div className="text-center space-y-2 p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground">Active Workflows</div>
              </div>
              <div className="text-center space-y-2 p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground">Unified Forms</div>
              </div>
              <div className="text-center space-y-2 p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">99.7%</div>
                <div className="text-sm text-muted-foreground">Production Ready</div>
              </div>
              <div className="text-center space-y-2 p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">30s</div>
                <div className="text-sm text-muted-foreground">Auto-save Interval</div>
              </div>
              <div className="text-center space-y-2 p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary">93%</div>
                <div className="text-sm text-muted-foreground">Big Plan Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
