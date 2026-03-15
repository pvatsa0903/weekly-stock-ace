import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot, Loader2, Radio, TrendingDown, Eye, ShieldCheck,
  Search, Download, LayoutGrid, Table2,
} from "lucide-react";
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

const filterTypes = ["ALL", "SELL", "PICK", "WATCH", "HOLD", "SKIP"] as const;
type FilterType = (typeof filterTypes)[number];

const signalConfig: Record<string, { dot: string; bg: string; icon: React.ReactNode }> = {
  SELL: { dot: "bg-loss", bg: "bg-loss/10 text-loss", icon: <TrendingDown className="w-3 h-3" /> },
  WATCH: { dot: "bg-warning", bg: "bg-warning/10 text-warning", icon: <Eye className="w-3 h-3" /> },
  HOLD: { dot: "bg-gain", bg: "bg-gain/10 text-gain", icon: <ShieldCheck className="w-3 h-3" /> },
  PICK: { dot: "bg-gain", bg: "bg-[hsl(var(--pick-badge-bg))] text-[hsl(var(--pick-badge-fg))]", icon: null },
  SKIP: { dot: "bg-loss", bg: "bg-[hsl(var(--sell-badge-bg))] text-[hsl(var(--sell-badge-fg))]", icon: null },
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

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const Signals = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const queryClient = useQueryClient();

  // Fetch all decisions
  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: ["signals_decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_decisions")
        .select("*")
        .order("week_ending", { ascending: false });
      if (error) throw error;
      return data as WeeklyDecision[];
    },
  });

  // Fetch all sell signals (active + history)
  const { data: sellSignals = [], isLoading: signalsLoading } = useSellSignals(false);

  // Realtime
  useEffect(() => {
    const ch1 = supabase
      .channel("signals_decisions_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_decisions" }, () => {
        queryClient.invalidateQueries({ queryKey: ["signals_decisions"] });
      })
      .subscribe();
    const ch2 = supabase
      .channel("signals_sell_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "sell_signals" }, () => {
        queryClient.invalidateQueries({ queryKey: ["sell_signals"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
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
      signal: s.signal as "SELL" | "WATCH" | "HOLD",
      ticker: s.ticker,
      confidence: s.confidence,
      summary: s.reasoning,
      sortDate: s.created_at,
    })),
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  // Deduplicate by ticker — keep highest priority (for card view)
  const priorityOrder: Record<string, number> = { SELL: 0, PICK: 1, WATCH: 2, HOLD: 3, SKIP: 4 };
  const deduped = unifiedRows.reduce<UnifiedRow[]>((acc, row) => {
    const key = row.ticker;
    if (!key) { acc.push(row); return acc; }
    const existing = acc.find((r) => r.ticker === key);
    if (!existing) acc.push(row);
    else if ((priorityOrder[row.signal] ?? 99) < (priorityOrder[existing.signal] ?? 99)) {
      acc[acc.indexOf(existing)] = row;
    }
    return acc;
  }, []);

  // For card view: deduplicated. For table view: all rows, sorted newest first.
  const baseRows = view === "table" ? [...unifiedRows] : [...deduped];
  baseRows.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  // Filter + search
  const filteredRows = baseRows.filter((row) => {
    if (filterType !== "ALL" && row.signal !== filterType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (row.type === "decision") {
      const d = row.data as WeeklyDecision;
      return (d.pick1 || "").toLowerCase().includes(q) || (d.pick2 || "").toLowerCase().includes(q) || d.eli5_summary.toLowerCase().includes(q);
    }
    const s = row.data as SellSignal;
    return s.ticker.toLowerCase().includes(q) || s.reasoning.toLowerCase().includes(q) || (s.fundamental_flags || "").toLowerCase().includes(q);
  });

  const isLoading = decisionsLoading || signalsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Signals</h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gain/10 text-gain">
                <Radio className="w-3 h-3 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-sm text-muted-foreground">All picks, skips, and sell signals in one place</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={runEvaluator} disabled={isRunning}>
              <Bot className={cn("w-4 h-4 mr-2", isRunning && "animate-pulse")} />
              {isRunning ? "Evaluating…" : "Run Evaluator"}
            </Button>
          </div>
        </div>

        {/* Toolbar: search + filters + view toggle */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickers or summary…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap flex-1">
            {filterTypes.map((f) => (
              <Button key={f} variant={filterType === f ? "default" : "outline"} size="sm" className="min-h-[44px] min-w-[44px]" onClick={() => setFilterType(f)}>
                {f}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setView("card")}
              className={cn("p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors", view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={cn("p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors", view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>
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
            <p className="text-muted-foreground mb-2">
              {deduped.length === 0 ? "No signals yet" : "No results match your filters"}
            </p>
            {deduped.length === 0 && (
              <Button onClick={runEvaluator} disabled={isRunning} className="mt-2">
                <Bot className="w-4 h-4 mr-2" /> Run Evaluator
              </Button>
            )}
          </div>
        )}

        {/* Card View */}
        {!isLoading && filteredRows.length > 0 && view === "card" && (
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
                                    className={cn("h-full rounded-full", row.signal === "SELL" ? "bg-loss" : row.signal === "WATCH" ? "bg-warning" : "bg-gain")}
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

        {/* Table View */}
        {!isLoading && filteredRows.length > 0 && view === "table" && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Tickers</th>
                    <th>Confidence</th>
                    <th>Summary / Reasoning</th>
                    <th>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const cfg = signalConfig[row.signal];
                    if (row.type === "decision") {
                      const d = row.data as WeeklyDecision;
                      return (
                        <tr key={`d-${d.id}`}>
                          <td className="font-mono text-sm whitespace-nowrap">{formatDate(d.week_ending)}</td>
                          <td>
                            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", cfg.bg)}>
                              {cfg.icon} {d.decision}
                            </span>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1.5">
                              {d.pick1 && <span className="ticker-badge">{d.pick1}</span>}
                              {d.pick2 && <span className="ticker-badge">{d.pick2}</span>}
                              {!d.pick1 && !d.pick2 && <span className="text-muted-foreground">—</span>}
                            </div>
                          </td>
                          <td className="font-mono text-sm">
                            {d.pick1_confidence != null ? `${d.pick1_confidence}%` : "—"}
                          </td>
                          <td className="text-sm text-muted-foreground whitespace-normal">{d.eli5_summary}</td>
                          <td className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(d.created_at)}</td>
                        </tr>
                      );
                    }
                    const s = row.data as SellSignal;
                    return (
                      <tr key={`s-${s.id}`}>
                        <td className="font-mono text-sm whitespace-nowrap">{formatDate(s.created_at)}</td>
                        <td>
                          <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", cfg.bg)}>
                            {cfg.icon} {s.signal}
                          </span>
                        </td>
                        <td><span className="ticker-badge">{s.ticker}</span></td>
                        <td className="font-mono text-sm">{s.confidence}%</td>
                        <td className="text-sm text-muted-foreground whitespace-normal">
                          <p>{s.reasoning}</p>
                          {s.fundamental_flags && <p className="text-xs mt-1 text-muted-foreground/70">{s.fundamental_flags}</p>}
                        </td>
                        <td className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(s.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Signals;
