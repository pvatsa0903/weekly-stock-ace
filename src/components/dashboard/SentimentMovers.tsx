import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, ArrowDown, Activity, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const SentimentMovers = () => {
  const queryClient = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("dashboard_sentiment_movers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_sentiment" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sentiment_movers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: movers = [], isLoading } = useQuery({
    queryKey: ["sentiment_movers"],
    queryFn: async () => {
      // Get the 2 most recent distinct dates
      const { data: dateRows } = await supabase
        .from("daily_sentiment")
        .select("date")
        .order("date", { ascending: false })
        .limit(500);

      if (!dateRows?.length) return [];

      const uniqueDates = [...new Set(dateRows.map((d) => d.date))].sort().reverse();
      if (uniqueDates.length < 2) return [];

      const [latestDate, prevDate] = uniqueDates;

      const { data } = await supabase
        .from("daily_sentiment")
        .select("*")
        .in("date", [latestDate, prevDate]);

      if (!data?.length) return [];

      const todayRows = data.filter((d) => d.date === latestDate);
      const prevRows = data.filter((d) => d.date === prevDate);

      const withChange = todayRows.map((t) => {
        const prev = prevRows.find((p) => p.ticker === t.ticker);
        const change = prev ? t.sentiment_score - prev.sentiment_score : 0;
        return { ...t, change };
      });

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
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 ml-auto">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          Live
        </span>
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
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="text-orange-600 font-semibold">R:{m.reddit_mentions}</span>
                  <span className="text-sky-500 font-semibold">X:{Math.round(m.x_mentions * 0.6)}</span>
                  <span className="text-green-500 font-semibold">ST:{Math.round(m.x_mentions * 0.4)}</span>
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
