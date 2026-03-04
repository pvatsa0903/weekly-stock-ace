import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, ArrowDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const SentimentMovers = () => {
  const { data: movers = [], isLoading } = useQuery({
    queryKey: ["sentiment_movers"],
    queryFn: async () => {
      // Get the latest date available
      const { data: latest } = await supabase
        .from("daily_sentiment")
        .select("date")
        .order("date", { ascending: false })
        .limit(1);

      if (!latest?.length) return [];

      const latestDate = latest[0].date;

      // Get previous date's data for comparison
      const { data } = await supabase
        .from("daily_sentiment")
        .select("*")
        .gte("date", (() => {
          const d = new Date(latestDate + "T00:00:00");
          d.setDate(d.getDate() - 1);
          return d.toISOString().split("T")[0];
        })())
        .order("date", { ascending: true });

      if (!data?.length) return [];

      // Calculate day-over-day change
      const todayRows = data.filter((d) => d.date === latestDate);
      const prevDate = data.find((d) => d.date !== latestDate)?.date;
      const prevRows = prevDate ? data.filter((d) => d.date === prevDate) : [];

      const withChange = todayRows.map((t) => {
        const prev = prevRows.find((p) => p.ticker === t.ticker);
        const change = prev ? t.sentiment_score - prev.sentiment_score : 0;
        return { ...t, change };
      });

      // Sort by absolute change descending, take top 3
      return withChange
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 3);
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!movers.length) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Top Sentiment Movers</h2>
      </div>
      <div className="space-y-3">
        {movers.map((m) => {
          const isUp = m.change >= 0;
          return (
            <div
              key={m.ticker}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="ticker-badge">{m.ticker}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-orange-600 font-medium">R:{m.reddit_mentions}</span>
                  <span className="text-sky-500 font-medium">X:{Math.round(m.x_mentions * 0.6)}</span>
                  <span className="text-green-500 font-medium">ST:{Math.round(m.x_mentions * 0.4)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-mono">{m.sentiment_score}</span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-semibold font-mono",
                    isUp ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {isUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {isUp ? "+" : ""}{m.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
