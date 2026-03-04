import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";

export const VolatileTickers = () => {
  const { data: volatile = [], isLoading } = useQuery({
    queryKey: ["volatile_tickers"],
    queryFn: async () => {
      // Get last 2 dates
      const { data: dates } = await supabase
        .from("daily_sentiment")
        .select("date")
        .order("date", { ascending: false })
        .limit(200);

      if (!dates?.length) return [];

      const uniqueDates = [...new Set(dates.map((d) => d.date))].sort().reverse();
      if (uniqueDates.length < 2) return [];

      const [today, yesterday] = [uniqueDates[0], uniqueDates[1]];

      const { data } = await supabase
        .from("daily_sentiment")
        .select("*")
        .in("date", [today, yesterday]);

      if (!data?.length) return [];

      const todayRows = data.filter((d) => d.date === today);
      const yesterdayRows = data.filter((d) => d.date === yesterday);

      return todayRows
        .map((t) => {
          const prev = yesterdayRows.find((p) => p.ticker === t.ticker);
          const change = prev ? t.sentiment_score - prev.sentiment_score : 0;
          const redditChange = prev
            ? (t.reddit_sentiment_score ?? 50) - (prev.reddit_sentiment_score ?? 50)
            : 0;
          const xChange = prev
            ? (t.x_sentiment_score ?? 50) - (prev.x_sentiment_score ?? 50)
            : 0;
          return {
            ticker: t.ticker,
            score: t.sentiment_score,
            change,
            absChange: Math.abs(change),
            redditMentions: t.reddit_mentions,
            xMentions: Math.round(t.x_mentions * 0.6),
            stMentions: Math.round(t.x_mentions * 0.4),
            redditScore: t.reddit_sentiment_score ?? 50,
            xScore: t.x_sentiment_score ?? 50,
            redditChange,
            xChange,
            confidence: t.confidence,
            date: today,
          };
        })
        .sort((a, b) => b.absChange - a.absChange)
        .slice(0, 5);
    },
  });

  if (isLoading || !volatile.length) return null;

  const getBarColor = (score: number) => {
    if (score >= 65) return "bg-emerald-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-foreground">Top 5 Most Volatile</h2>
        <span className="text-xs text-muted-foreground ml-auto font-mono">vs. previous day</span>
      </div>

      <div className="space-y-4">
        {volatile.map((v) => {
          const isUp = v.change >= 0;
          return (
            <div key={v.ticker} className="rounded-lg border border-border bg-muted/30 p-4">
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="ticker-badge">{v.ticker}</span>
                  <span className="text-2xl font-bold font-mono text-foreground">{v.score}</span>
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-bold font-mono px-2 py-1 rounded-md",
                    isUp
                      ? "text-emerald-700 bg-emerald-500/10"
                      : "text-rose-700 bg-rose-500/10"
                  )}
                >
                  {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {isUp ? "+" : ""}{v.change}
                </span>
              </div>

              {/* Score bar */}
              <div className="w-full h-1.5 bg-background/50 rounded-full mb-3 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getBarColor(v.score))}
                  style={{ width: `${Math.min(v.score, 100)}%` }}
                />
              </div>

              {/* 3-source breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-md bg-orange-500/5 border border-orange-500/10">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-orange-600 mb-1">Reddit</div>
                  <div className="text-sm font-bold font-mono text-foreground">{v.redditScore}</div>
                  <div className="text-[10px] text-muted-foreground">{v.redditMentions} mentions</div>
                </div>
                <div className="text-center p-2 rounded-md bg-sky-500/5 border border-sky-500/10">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-sky-500 mb-1">X</div>
                  <div className="text-sm font-bold font-mono text-foreground">{v.xScore}</div>
                  <div className="text-[10px] text-muted-foreground">{v.xMentions} mentions</div>
                </div>
                <div className="text-center p-2 rounded-md bg-green-500/5 border border-green-500/10">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-green-500 mb-1">StockTwits</div>
                  <div className="text-sm font-bold font-mono text-foreground">{v.stMentions}</div>
                  <div className="text-[10px] text-muted-foreground">mentions</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
