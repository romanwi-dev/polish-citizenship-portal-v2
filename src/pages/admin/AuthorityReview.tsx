import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WSCLetterUpload } from "@/components/WSCLetterUpload";
import { StrategyButtons } from "@/components/StrategyButtons";
import { FileText, AlertCircle, Calendar, Hash, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WSCLetter {
  id: string;
  letter_date: string | null;
  reference_number: string | null;
  deadline: string | null;
  hac_reviewed: boolean;
  hac_notes: string | null;
  strategy: string | null;
  strategy_notes: string | null;
  created_at: string;
}

export default function AuthorityReview() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [wscLetters, setWSCLetters] = useState<WSCLetter[]>([]);
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [caseRes, wscRes] = await Promise.all([
        supabase.from("cases").select("*").eq("id", id).single(),
        supabase.from("wsc_letters").select("*").eq("case_id", id).order("created_at", { ascending: false }),
      ]);

      if (caseRes.error) throw caseRes.error;
      setCaseData(caseRes.data);
      setWSCLetters(wscRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load authority review data");
    } finally {
      setLoading(false);
    }
  };

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return { label: "OVERDUE", color: "bg-red-500/20 text-red-400 border-red-500/30" };
    } else if (daysLeft <= 7) {
      return { label: `${daysLeft}d left - URGENT`, color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    } else if (daysLeft <= 30) {
      return { label: `${daysLeft}d left`, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    } else {
      return { label: `${daysLeft}d left`, color: "bg-green-500/20 text-green-400 border-green-500/30" };
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Authority Review</h1>
            <p className="text-muted-foreground">
              WSC Letters & Response Strategy for {caseData?.client_name}
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {caseData?.client_code}
          </Badge>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Letter</TabsTrigger>
            <TabsTrigger value="letters">
              Letters History
              {wscLetters.length > 0 && (
                <Badge className="ml-2">{wscLetters.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <WSCLetterUpload caseId={id!} onUploadComplete={loadData} />
          </TabsContent>

          <TabsContent value="letters" className="space-y-4">
            {wscLetters.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No WSC letters uploaded yet</p>
                </CardContent>
              </Card>
            ) : (
              wscLetters.map((letter) => {
                const deadlineStatus = getDeadlineStatus(letter.deadline);
                
                return (
                  <Card key={letter.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            WSC Letter
                          </CardTitle>
                          <CardDescription>
                            Uploaded {new Date(letter.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {letter.hac_reviewed && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              HAC Reviewed
                            </Badge>
                          )}
                          {letter.strategy && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {letter.strategy}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {letter.letter_date && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              Letter Date
                            </div>
                            <p className="font-medium">
                              {new Date(letter.letter_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        {letter.reference_number && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Hash className="w-4 h-4" />
                              Reference
                            </div>
                            <p className="font-mono font-medium text-sm">
                              {letter.reference_number}
                            </p>
                          </div>
                        )}
                        
                        {deadlineStatus && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              Deadline
                            </div>
                            <Badge className={deadlineStatus.color}>
                              {deadlineStatus.label}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {letter.hac_notes && (
                        <div className="space-y-2 p-3 bg-background/50 rounded-lg border border-border">
                          <p className="text-sm font-medium text-muted-foreground">HAC Notes</p>
                          <p className="text-sm">{letter.hac_notes}</p>
                        </div>
                      )}

                      {letter.strategy_notes && (
                        <div className="space-y-2 p-3 bg-background/50 rounded-lg border border-border">
                          <p className="text-sm font-medium text-muted-foreground">Strategy Notes</p>
                          <p className="text-sm">{letter.strategy_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4">
            <StrategyButtons 
              caseId={id!} 
              wscId={wscLetters[0]?.id}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Strategy Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-400">🔥 PUSH Strategy</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                    <li>• Multiple follow-up channels (phone, email, in-person)</li>
                    <li>• Weekly status updates demanded</li>
                    <li>• Escalation to supervisor if no response</li>
                    <li>• Best for: Urgent deadlines, high-priority cases</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-400">🔔 NUDGE Strategy</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                    <li>• Bi-weekly courtesy reminders</li>
                    <li>• Professional tone, no pressure</li>
                    <li>• Document all communications</li>
                    <li>• Best for: Standard cases, moderate timelines</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-400">👥 SIT-DOWN Strategy</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                    <li>• Schedule formal in-person meeting</li>
                    <li>• Prepare comprehensive case summary</li>
                    <li>• Bring all supporting documentation</li>
                    <li>• Best for: Complex cases, disputes, clarifications needed</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
