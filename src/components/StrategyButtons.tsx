import { useState } from "react";
import { Zap, Bell, Users, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface StrategyButtonsProps {
  caseId: string;
  wscId?: string;
}

type StrategyType = "PUSH" | "NUDGE" | "SITDOWN" | "SLOW";

const STRATEGY_CONFIG = {
  PUSH: {
    icon: Zap,
    label: "PUSH",
    description: "Aggressive follow-up with multiple channels",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    hoverColor: "hover:bg-red-500/30",
  },
  NUDGE: {
    icon: Bell,
    label: "NUDGE",
    description: "Regular reminders and status checks",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    hoverColor: "hover:bg-yellow-500/30",
  },
  SITDOWN: {
    icon: Users,
    label: "SIT-DOWN",
    description: "Schedule formal meeting with authorities",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    hoverColor: "hover:bg-blue-500/30",
  },
  SLOW: {
    icon: Clock,
    label: "SLOW",
    description: "Standard processing - client declined paid schemes",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    hoverColor: "hover:bg-gray-500/30",
  },
};

export const StrategyButtons = ({ caseId, wscId }: StrategyButtonsProps) => {
  const { user } = useAuth();
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleStrategySelect = (strategy: StrategyType) => {
    setSelectedStrategy(strategy);
    setNotes("");
  };

  const handleConfirmStrategy = async () => {
    if (!selectedStrategy || !user) return;

    setSubmitting(true);
    try {
      // Update WSC letter with strategy
      if (wscId) {
        const { error: wscError } = await supabase
          .from("wsc_letters")
          .update({
            strategy: selectedStrategy,
            strategy_notes: notes,
            strategy_set_by: user.id,
            strategy_set_at: new Date().toISOString(),
          })
          .eq("id", wscId);

        if (wscError) throw wscError;
      }

      // Log HAC action
      const { error: logError } = await supabase
        .from("hac_logs")
        .insert({
          case_id: caseId,
          performed_by: user.id,
          action_type: "strategy_set",
          action_details: `${selectedStrategy} strategy applied`,
          related_wsc_id: wscId || null,
          metadata: { notes, strategy: selectedStrategy },
        });

      if (logError) throw logError;

      toast.success(`${selectedStrategy} strategy activated`);
      setSelectedStrategy(null);
      setNotes("");
    } catch (error) {
      console.error("Strategy error:", error);
      toast.error("Failed to set strategy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Strategy</CardTitle>
        <CardDescription>
          Choose how to follow up with authorities - or mark as SLOW if client declined paid schemes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(STRATEGY_CONFIG) as StrategyType[]).map((strategy) => {
            const config = STRATEGY_CONFIG[strategy];
            const Icon = config.icon;
            const isSelected = selectedStrategy === strategy;

            return (
              <Button
                key={strategy}
                variant="outline"
                className={`flex flex-col items-center gap-2 h-auto py-4 ${
                  isSelected 
                    ? `${config.color} border-2` 
                    : "border-border"
                } ${config.hoverColor}`}
                onClick={() => handleStrategySelect(strategy)}
              >
                <Icon className="w-6 h-6" />
                <span className="font-bold">{config.label}</span>
                <span className="text-xs text-center opacity-80">
                  {config.description}
                </span>
              </Button>
            );
          })}
        </div>

        {selectedStrategy && (
          <div className="space-y-3 p-4 border border-border rounded-lg bg-background/50">
            <div className="flex items-center justify-between">
              <Badge className={STRATEGY_CONFIG[selectedStrategy].color}>
                {selectedStrategy} Selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStrategy(null)}
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Strategy Notes</label>
              <Textarea
                placeholder={`Describe the ${selectedStrategy} approach...`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleConfirmStrategy}
              disabled={submitting || !notes.trim()}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Activate {selectedStrategy}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
