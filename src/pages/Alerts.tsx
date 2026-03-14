import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SellSignalCard } from "@/components/ticker/SellSignalCard";
import { useSellSignals } from "@/hooks/useSellSignals";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Radio, History } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const Alerts = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const queryClient = useQueryClient();

  const { data: signals = [], isLoading, error } = useSellSignals(!showHistory);

  const runEvaluator = async () => {
    setIsRunning(true);
    toast.info("Evaluating sell signals…");
    try {
      const { data, error } = await supabase.functions.invoke("sell-signal-evaluator");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const sellCount = (data.signals || []).filter((s: any) => s.signal === "SELL").length;
      const watchCount = (data.signals || []).filter((s: any) => s.signal === "WATCH").length;
      toast.success(`Done — ${sellCount} sell, ${watchCount} watch, ${(data.signals || []).length - sellCount - watchCount} hold`);
      queryClient.invalidateQueries({ queryKey: ["sell_signals"] });
    } catch (err: any) {
      toast.error(err.message || "Evaluator failed");
    } finally {
      setIsRunning(false);
    }
  };

  const sellSignals = signals.filter((s) => s.signal === "SELL");
  const watchSignals = signals.filter((s) => s.signal === "WATCH");
  const holdSignals = signals.filter((s) => s.signal === "HOLD");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Sell Alerts</h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <Radio className="w-3 h-3 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-muted-foreground">
              AI-evaluated sell/hold signals for previously picked stocks
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? "Active Only" : "Show History"}
            </Button>
            <Button size="sm" onClick={runEvaluator} disabled={isRunning}>
              <Bot className={cn("w-4 h-4 mr-2", isRunning && "animate-pulse")} />
              {isRunning ? "Evaluating…" : "Run Evaluator"}
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12 text-destructive">
            Failed to load signals. Please try again.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && signals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No sell signals yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Run the evaluator to analyze your picked stocks for sell/hold signals
            </p>
            <Button onClick={runEvaluator} disabled={isRunning}>
              <Bot className="w-4 h-4 mr-2" />
              Run Evaluator
            </Button>
          </div>
        )}

        {/* Sell signals */}
        {!isLoading && !error && sellSignals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Sell ({sellSignals.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {sellSignals.map((s) => (
                <SellSignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>
        )}

        {/* Watch signals */}
        {!isLoading && !error && watchSignals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Watch ({watchSignals.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {watchSignals.map((s) => (
                <SellSignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>
        )}

        {/* Hold signals */}
        {!isLoading && !error && holdSignals.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Hold ({holdSignals.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {holdSignals.map((s) => (
                <SellSignalCard key={s.id} signal={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
