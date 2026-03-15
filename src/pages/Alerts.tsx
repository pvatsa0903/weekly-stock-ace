import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Radio, History, TrendingDown, Eye, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useSellSignals, type SellSignal } from "@/hooks/useSellSignals";

interface WeeklyDecision {
  id: string;
  week_ending: string;
  decision: "PICK" | "SKIP";
  pick1: string | null;
  pick2: string | null;
  pick1_confidence: number | null;
  pick2_confidence: number | null;
  eli5_summary: string;
  why_summary: string;
  created_at: string;
}

type UnifiedRow =
  | { type: "decision"; data: WeeklyDecision; signal: "PICK" | "SKIP"; ticker: string | null; confidence: number | null; summary: string; sortDate: string }
  | { type: "signal"; data: SellSignal; signal: "SELL" | "WATCH" | "HOLD"; ticker: string; confidence: number; summary: string; sortDate: string };

const filterTypes = ["ALL", "PICK", "SKIP", "SELL", "WATCH", "HOLD"] as const;
type FilterType = (typeof filterTypes)[number];

const Alerts = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const queryClient = useQueryClient();

  const { data: sellSignals = [], isLoading: signalsLoading } = useSellSignals(!showHistory);

  // Fetch current week decisions
  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: ["weekly_decisions_alerts", showHistory],
    queryFn: async () => {
      let query = supabase
        .from("weekly_decisions")
        .select("*")
        .order("week_ending", { ascending: false });

      if (!showHistory) {
        // Current week only
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const fmt = (d: Date) => d.toISOString().split("T")[0];
        query = query.gte("week_ending", fmt(startOfWeek)).lte("week_ending", fmt(endOfWeek));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WeeklyDecision[];
    },
  });

  // Realtime for decisions
  useEffect(() => {
    const channel = supabase
      .channel("alerts_decisions_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_decisions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["weekly_decisions_alerts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

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

  // Unify rows
  const unifiedRows: UnifiedRow[] = [
    ...decisions.map((d) => ({
      type: "decision" as const,
      data: d,
      signal: d.decision as "PICK" | "SKIP",
      ticker: d.pick1 || d.pick2 || null,
      confidence: d.pick1_confidence,
      summary: d.eli5_summary,
      sortDate: d.created_at,
    })),
    ...sellSignals.map((s) => ({
      type: "signal" as const,
      data: s,
      signal: s.signal,
      ticker: s.ticker,
      confidence: s.confidence,
      summary: s.reasoning,
      sortDate: s.created_at,
    })),
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  // Deduplicate by ticker — keep highest priority signal per ticker
  const priorityOrder: Record<string, number> = { SELL: 0, PICK: 1, WATCH: 2, HOLD: 3, SKIP: 4 };
  const deduped = unifiedRows.reduce<UnifiedRow[]>((acc, row) => {
    const key = row.ticker;
    if (!key) { acc.push(row); return acc; }
    const existing = acc.find((r) => r.ticker === key);
    if (!existing) { acc.push(row); }
    else if ((priorityOrder[row.signal] ?? 99) < (priorityOrder[existing.signal] ?? 99)) {
      acc[acc.indexOf(existing)] = row;
    }
    return acc;
  }, []);

  const filteredRows = filterType === "ALL" ? deduped : deduped.filter((r) => r.signal === filterType);

  const isLoading = signalsLoading || decisionsLoading;

  const signalConfig: Record<string, { dot: string; bg: string; icon: React.ReactNode }> = {
    SELL: { dot: "bg-rose-500", bg: "bg-rose-500/10 text-rose-500", icon: <TrendingDown className="w-3 h-3" /> },
    WATCH: { dot: "bg-amber-500", bg: "bg-amber-500/10 text-amber-500", icon: <Eye className="w-3 h-3" /> },
    HOLD: { dot: "bg-emerald-500", bg: "bg-emerald-500/10 text-emerald-500", icon: <ShieldCheck className="w-3 h-3" /> },
    PICK: { dot: "bg-emerald-500", bg: "bg-emerald-500/10 text-emerald-500", icon: null },
    SKIP: { dot: "bg-rose-500", bg: "bg-rose-500/10 text-rose-500", icon: null },
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Weekly Alerts</h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <Radio className="w-3 h-3 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-muted-foreground">
              {(() => {
                const now = new Date();
                const day = now.getDay();
                const monday = new Date(now);
                monday.setDate(now.getDate() - ((day + 6) % 7));
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
              })()}{" "}
              · All picks, skips, and sell signals
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="w-4 h-4 mr-2" />
              {showHistory ? "This Week" : "All History"}
            </Button>
            <Button size="sm" onClick={runEvaluator} disabled={isRunning}>
              <Bot className={cn("w-4 h-4 mr-2", isRunning && "animate-pulse")} />
              {isRunning ? "Evaluating…" : "Run Evaluator"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filterTypes.map((f) => (
            <Button key={f} variant={filterType === f ? "default" : "outline"} size="sm" onClick={() => setFilterType(f)}>
              {f}
            </Button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredRows.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">No alerts yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Run the evaluator or wait for weekly picks to appear here
            </p>
            <Button onClick={runEvaluator} disabled={isRunning}>
              <Bot className="w-4 h-4 mr-2" />
              Run Evaluator
            </Button>
          </div>
        )}

        {/* Grouped Cards */}
        {!isLoading && filteredRows.length > 0 && (
          <div className="space-y-8">
            {(["SELL", "PICK", "WATCH", "HOLD", "SKIP"] as const)
              .filter((group) => filterType === "ALL" || filterType === group)
              .map((group) => {
                const groupRows = filteredRows.filter((r) => r.signal === group);
                if (groupRows.length === 0) return null;
                const gcfg = signalConfig[group];
                return (
                  <div key={group} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2.5 h-2.5 rounded-full", gcfg.dot)} />
                      <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">{group}</h2>
                      <span className="text-xs text-muted-foreground">({groupRows.length})</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {groupRows.map((row) => {
                        const cfg = signalConfig[row.signal];
                        const isDecision = row.type === "decision";
                        const d = isDecision ? (row.data as WeeklyDecision) : null;
                        const s = !isDecision ? (row.data as SellSignal) : null;

                        return (
                          <div key={`${row.type}-${isDecision ? d!.id : s!.id}`} className="bg-card rounded-xl border border-border p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", cfg.bg)}>
                                  {cfg.icon} {row.signal}
                                </span>
                                {row.ticker && <span className="ticker-badge">{row.ticker}</span>}
                                {isDecision && d?.pick2 && <span className="ticker-badge">{d.pick2}</span>}
                              </div>
                              <span className="text-xs text-muted-foreground">{timeAgo(row.sortDate)}</span>
                            </div>

                            {row.confidence != null && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={cn("h-full rounded-full", row.signal === "SELL" ? "bg-rose-500" : row.signal === "WATCH" ? "bg-amber-500" : "bg-emerald-500")}
                                    style={{ width: `${row.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">{row.confidence}%</span>
                              </div>
                            )}

                            <p className="text-sm text-muted-foreground">{row.summary}</p>

                            {isDecision && d?.why_summary && (
                              <p className="text-xs text-muted-foreground/70 border-t border-border pt-2">{d.why_summary}</p>
                            )}
                            {!isDecision && s?.fundamental_flags && (
                              <p className="text-xs text-muted-foreground/70 border-t border-border pt-2">{s.fundamental_flags}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
