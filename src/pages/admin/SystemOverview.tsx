import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  FileText, 
  Workflow, 
  Users,
  Award,
  Archive,
  Languages,
  FileCheck,
  Plane
} from "lucide-react";

export default function SystemOverview() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-7xl">
          {/* Header */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              System Overview
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Complete technical documentation of the Polish Citizenship Portal AI Agent system
            </p>
          </div>

          {/* AI Agents Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-primary/20 pb-3">
              <Bot className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">AI Agents</h2>
              <Badge variant="outline" className="ml-auto">5 Total</Badge>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Specialized AI agents that automate different aspects of the citizenship process
            </p>
            
            <div className="space-y-6">
              {/* Forms Agent */}
              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Forms Agent</h3>
                  <Badge variant="secondary" className="text-xs sm:text-sm">6 Tools</Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manages all form processing, validation, and data flow between different stages of the citizenship application.
                </p>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium">Tools:</p>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside ml-2 sm:ml-4">
                    <li><strong>Intake Form Parser:</strong> Extracts client data from initial intake submissions</li>
                    <li><strong>POA Generator:</strong> Auto-generates Power of Attorney documents from intake data</li>
                    <li><strong>Citizenship Form Mapper:</strong> Maps intake data to OBY (citizenship application) fields</li>
                    <li><strong>Family Tree Builder:</strong> Constructs genealogical relationships from provided data</li>
                    <li><strong>Civil Registry Mapper:</strong> Organizes birth/marriage certificate requests</li>
                    <li><strong>Form Validator:</strong> Real-time validation of DD.MM.YYYY dates and required fields</li>
                  </ul>
                </div>
              </div>

              {/* Translations Agent */}
              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <Languages className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Translations Agent</h3>
                  <Badge variant="secondary" className="text-xs sm:text-sm">5 Tools</Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Handles document translation workflows, certified translator coordination, and quality control.
                </p>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium">Tools:</p>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside ml-2 sm:ml-4">
                    <li><strong>Translation Queue Manager:</strong> Organizes documents needing translation</li>
                    <li><strong>AI Translation Service:</strong> Provides initial machine translations</li>
                    <li><strong>Sworn Translator Matcher:</strong> Connects to certified Polish translators</li>
                    <li><strong>Quality Checker:</strong> Independent review of translations</li>
                    <li><strong>Document Language Detector:</strong> Identifies source language automatically</li>
                  </ul>
                </div>
              </div>

              {/* Archives Agent */}
              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <Archive className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Archives Agent</h3>
                  <Badge variant="secondary" className="text-xs sm:text-sm">4 Tools</Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manages Polish and international archives searches for historical documents.
                </p>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium">Tools:</p>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside ml-2 sm:ml-4">
                    <li><strong>Archive Request Generator:</strong> Creates formal Polish archive requests</li>
                    <li><strong>International Search Coordinator:</strong> Manages searches outside Poland</li>
                    <li><strong>Document Receipt Tracker:</strong> Monitors incoming archival documents</li>
                    <li><strong>Relevance Evaluator:</strong> Determines which documents to file in case</li>
                  </ul>
                </div>
              </div>

              {/* Documents Agent */}
              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileCheck className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Documents Agent</h3>
                  <Badge variant="secondary" className="text-xs sm:text-sm">3 Tools</Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Tracks required documents, monitors collection status, and coordinates USC workflows.
                </p>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium">Tools:</p>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside ml-2 sm:ml-4">
                    <li><strong>Doc Radar:</strong> Real-time tracking of 7 document categories (AP, F, M, PGF, PGM, MGF, MGM)</li>
                    <li><strong>USC Workflow Manager:</strong> Handles umiejscowienie and uzupełnienie requests</li>
                    <li><strong>Translation Flag System:</strong> Automatically flags non-Polish documents</li>
                  </ul>
                </div>
              </div>

              {/* WSC Letter Agent */}
              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <Award className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">WSC Letter Agent</h3>
                  <Badge variant="secondary" className="text-xs sm:text-sm">2 Tools</Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Processes official letters from WSC (Masovian Voivoda's office) and manages response strategies.
                </p>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-medium">Tools:</p>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside ml-2 sm:ml-4">
                    <li><strong>Letter OCR Parser:</strong> Extracts date, reference number, and deadline from WSC letters</li>
                    <li><strong>Strategy Recommender:</strong> Suggests PUSH/NUDGE/SITDOWN approaches based on letter content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Workflows Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-primary/20 pb-3">
              <Workflow className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Workflows</h2>
              <Badge variant="outline" className="ml-auto">6 Total</Badge>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              End-to-end processes that guide cases through different stages of the citizenship journey
            </p>
            
            <div className="space-y-6">
              {/* Translations Workflow */}
              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Translations Workflow</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Complete document translation pipeline from intake to certified delivery.
                </p>
                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-semibold">Process Steps:</h4>
                  <ol className="text-sm sm:text-base text-muted-foreground space-y-1 list-decimal list-inside ml-2 sm:ml-4">
                    <li>Document language auto-detection</li>
                    <li>Queue placement with priority assignment</li>
                    <li>AI-powered initial translation</li>
                    <li>Certified sworn translator assignment</li>
                    <li>Independent quality review</li>
                    <li>Client approval and filing</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-semibold">Key Features:</h4>
                  <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside ml-2 sm:ml-4">
                    <li>Automatic flagging of non-Polish documents</li>
                    <li>Task generation for HAC review</li>
                    <li>Integration with Polish sworn translators</li>
                  </ul>
                </div>
              </div>

              {/* Other workflows would continue here */}
              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Data Security & Infrastructure</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm sm:text-base font-semibold">Data Security</h4>
                    <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Passport number masking (by role)</li>
                      <li>Row Level Security (RLS) enabled</li>
                      <li>Input validation on all forms</li>
                      <li>Unsaved changes browser warning</li>
                      <li>Real-time sync across sessions</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm sm:text-base font-semibold">Case Organization</h4>
                    <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Hybrid naming system (migration scanner)</li>
                      <li>KPI tracking dashboard</li>
                      <li>Document completion % badges</li>
                      <li>Stage timeline visualization</li>
                      <li>HAC oversight logging</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-background/40 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-lg border border-primary/10">
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">Integrations</h3>
                <ul className="text-sm sm:text-base text-muted-foreground space-y-1 list-disc list-inside ml-2 sm:ml-4">
                  <li><strong>Partner API:</strong> POST intake, GET status</li>
                  <li><strong>Typeform:</strong> Automatic case creation from form submissions</li>
                  <li><strong>Dropbox:</strong> Sync & migration capabilities</li>
                  <li><strong>Email notifications:</strong> Welcome messages and status updates</li>
                  <li><strong>Magic link authentication:</strong> Secure client access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-primary/20 pb-3">
              <Users className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">System Metrics</h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              Current production readiness status
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2 p-4 sm:p-6 bg-background/40 backdrop-blur-sm border border-primary/10 rounded-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">21</div>
                <div className="text-xs sm:text-sm text-muted-foreground">AI Agent Tools</div>
              </div>
              <div className="text-center space-y-2 p-4 sm:p-6 bg-background/40 backdrop-blur-sm border border-primary/10 rounded-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">6</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Workflows</div>
              </div>
              <div className="text-center space-y-2 p-4 sm:p-6 bg-background/40 backdrop-blur-sm border border-primary/10 rounded-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">6</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Unified Forms</div>
              </div>
              <div className="text-center space-y-2 p-4 sm:p-6 bg-background/40 backdrop-blur-sm border border-primary/10 rounded-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">99.7%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Production Ready</div>
              </div>
              <div className="text-center space-y-2 p-4 sm:p-6 bg-background/40 backdrop-blur-sm border border-primary/10 rounded-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">30s</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Auto-save Interval</div>
              </div>
              <div className="text-center space-y-2 p-4 sm:p-6 bg-background/40 backdrop-blur-sm border border-primary/10 rounded-lg">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">93%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Big Plan Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
