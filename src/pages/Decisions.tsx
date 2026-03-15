import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Download, Search, Loader2, Radio, TrendingDown, Eye, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const Decisions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PICK" | "SKIP" | "SELL" | "WATCH">("ALL");
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("weekly_decisions_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "weekly_decisions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["weekly_decisions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: decisions = [], isLoading: decisionsLoading, error: decisionsError } = useQuery({
    queryKey: ["weekly_decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_decisions")
        .select("*")
        .order("week_ending", { ascending: false });
      if (error) throw error;
      return data as WeeklyDecision[];
    },
  });

  const { data: sellSignals = [], isLoading: signalsLoading } = useSellSignals(true);

  // Unify rows into a single list
  type UnifiedRow =
    | { type: "decision"; data: WeeklyDecision; sortDate: string }
    | { type: "signal"; data: SellSignal; sortDate: string };

  const unifiedRows: UnifiedRow[] = [
    ...decisions.map((d) => ({
      type: "decision" as const,
      data: d,
      sortDate: d.created_at,
    })),
    ...sellSignals.map((s) => ({
      type: "signal" as const,
      data: s,
      sortDate: s.created_at,
    })),
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  const filteredRows = unifiedRows.filter((row) => {
    const rowType = row.type === "decision" ? row.data.decision : (row.data as SellSignal).signal;

    // Filter match
    if (filterType !== "ALL" && rowType !== filterType) return false;

    // Search match
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (row.type === "decision") {
      const d = row.data as WeeklyDecision;
      return (
        (d.pick1 || "").toLowerCase().includes(q) ||
        (d.pick2 || "").toLowerCase().includes(q) ||
        d.eli5_summary.toLowerCase().includes(q)
      );
    } else {
      const s = row.data as SellSignal;
      return (
        s.ticker.toLowerCase().includes(q) ||
        s.reasoning.toLowerCase().includes(q) ||
        (s.fundamental_flags || "").toLowerCase().includes(q)
      );
    }
  });

  const isLoading = decisionsLoading || signalsLoading;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isCurrentWeek = (weekEndingStr: string) => {
    const end = new Date(weekEndingStr + "T00:00:00");
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now >= start && now <= end;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const typeBadge = (type: string) => {
    const config: Record<string, { bg: string; icon: React.ReactNode }> = {
      PICK: { bg: "bg-emerald-100 text-emerald-700", icon: null },
      SKIP: { bg: "bg-rose-100 text-rose-700", icon: null },
      SELL: { bg: "bg-rose-100 text-rose-700", icon: <TrendingDown className="w-3 h-3" /> },
      WATCH: { bg: "bg-amber-100 text-amber-700", icon: <Eye className="w-3 h-3" /> },
      HOLD: { bg: "bg-emerald-100 text-emerald-700", icon: <ShieldCheck className="w-3 h-3" /> },
    };
    const c = config[type] || config.SKIP;
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", c.bg)}>
        {c.icon} {type}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Weekly Decisions</h1>
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                <Radio className="w-3 h-3 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-muted-foreground">All picks, skips, and sell signals in one place</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickers or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["ALL", "PICK", "SKIP", "SELL", "WATCH"] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterType === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading / Error / Empty states */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {decisionsError && (
          <div className="text-center py-12 text-destructive">
            Failed to load decisions. Please try again.
          </div>
        )}

        {!isLoading && !decisionsError && filteredRows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {unifiedRows.length === 0 ? "No decisions recorded yet." : "No results match your filters."}
          </div>
        )}

        {/* Consolidated Table */}
        {!isLoading && !decisionsError && filteredRows.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Week / Date</th>
                    <th>Type</th>
                    <th>Tickers</th>
                    <th>Summary / Reasoning</th>
                    <th>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    if (row.type === "decision") {
                      const d = row.data as WeeklyDecision;
                      const currentWeek = isCurrentWeek(d.week_ending);
                      return (
                        <tr key={`d-${d.id}`}>
                          <td className="font-mono text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {currentWeek && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                              )}
                              <span>{formatDate(d.week_ending)}</span>
                            </div>
                            {currentWeek && (
                              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Current Week</span>
                            )}
                          </td>
                          <td>{typeBadge(d.decision)}</td>
                          <td>
                            <div className="flex flex-wrap gap-1.5">
                              {d.pick1 && (
                                <div className="flex items-center gap-1">
                                  <span className="ticker-badge">{d.pick1}</span>
                                  {d.pick1_confidence != null && (
                                    <span className="text-[10px] text-muted-foreground">{d.pick1_confidence}%</span>
                                  )}
                                </div>
                              )}
                              {d.pick2 && (
                                <div className="flex items-center gap-1">
                                  <span className="ticker-badge">{d.pick2}</span>
                                  {d.pick2_confidence != null && (
                                    <span className="text-[10px] text-muted-foreground">{d.pick2_confidence}%</span>
                                  )}
                                </div>
                              )}
                              {!d.pick1 && !d.pick2 && (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="text-sm text-muted-foreground whitespace-normal">{d.eli5_summary}</td>
                          <td className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(d.created_at)}</td>
                        </tr>
                      );
                    } else {
                      const s = row.data as SellSignal;
                      return (
                        <tr key={`s-${s.id}`}>
                          <td className="font-mono text-sm whitespace-nowrap">
                            {formatDate(s.created_at)}
                          </td>
                          <td>{typeBadge(s.signal)}</td>
                          <td>
                            <div className="flex items-center gap-1">
                              <span className="ticker-badge">{s.ticker}</span>
                              <span className="text-[10px] text-muted-foreground">{s.confidence}%</span>
                            </div>
                          </td>
                          <td className="text-sm text-muted-foreground whitespace-normal">
                            <p>{s.reasoning}</p>
                            {s.fundamental_flags && (
                              <p className="text-xs mt-1 text-muted-foreground/70">{s.fundamental_flags}</p>
                            )}
                          </td>
                          <td className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(s.created_at)}</td>
                        </tr>
                      );
                    }
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

export default Decisions;
