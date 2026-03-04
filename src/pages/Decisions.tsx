import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Download, Search, Loader2, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [filterDecision, setFilterDecision] = useState<"ALL" | "PICK" | "SKIP">("ALL");
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

  const { data: decisions = [], isLoading, error } = useQuery({
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

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch =
      (d.pick1 || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.pick2 || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.eli5_summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterDecision === "ALL" || d.decision === filterDecision;
    return matchesSearch && matchesFilter;
  });

  const formatWeekRange = (weekEndingStr: string) => {
    const end = new Date(weekEndingStr + "T00:00:00");
    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const isCurrentWeek = now >= start && now <= end;

    return { range: `${fmt(start)} – ${fmt(end)}`, isCurrentWeek };
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
            <p className="text-muted-foreground">Historical record of all picks and skips — updates in real time</p>
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
              placeholder="Search picks or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "PICK", "SKIP"] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterDecision === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterDecision(filter)}
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

        {error && (
          <div className="text-center py-12 text-destructive">
            Failed to load decisions. Please try again.
          </div>
        )}

        {!isLoading && !error && filteredDecisions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {decisions.length === 0 ? "No decisions recorded yet." : "No results match your filters."}
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && filteredDecisions.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Decision</th>
                    <th>Pick 1</th>
                    <th>Pick 2</th>
                    <th>ELI5 Summary</th>
                    <th>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDecisions.map((d) => {
                    const { range, isCurrentWeek } = formatWeekRange(d.week_ending);
                    return (
                      <tr key={d.id}>
                        <td className="font-mono text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isCurrentWeek && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                            )}
                            <span>{range}</span>
                          </div>
                          {isCurrentWeek && (
                            <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Current Week</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={cn(
                              "text-xs font-semibold px-2 py-1 rounded-full",
                              d.decision === "PICK"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            )}
                          >
                            {d.decision}
                          </span>
                        </td>
                        <td>
                          {d.pick1 ? (
                            <div>
                              <span className="ticker-badge">{d.pick1}</span>
                              {d.pick1_confidence != null && (
                                <span className="text-[10px] text-muted-foreground ml-1">{d.pick1_confidence}%</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td>
                          {d.pick2 ? (
                            <div>
                              <span className="ticker-badge">{d.pick2}</span>
                              {d.pick2_confidence != null && (
                                <span className="text-[10px] text-muted-foreground ml-1">{d.pick2_confidence}%</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="max-w-xs truncate text-sm text-muted-foreground">{d.eli5_summary}</td>
                        <td className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(d.created_at)}</td>
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

export default Decisions;
