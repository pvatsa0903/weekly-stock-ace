import { useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, ArrowDown, Activity, Radio, Info, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getSentimentColor } from "@/lib/sentiment";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SourceTooltip = ({ label, fullName, description }: { label: ReactNode; fullName: string; description: string }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{label}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] text-xs">
        <span className="font-semibold">{fullName}</span> — {description}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const SentimentMovers = () => {
  const queryClient = useQueryClient();

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
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-xs">
              Stocks with the biggest sentiment score changes since yesterday. Score is 0–100 (bearish → bullish).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          Live
        </span>
        <Link to="/sentiment" className="text-sm text-primary hover:underline flex items-center gap-1 ml-2">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
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
                <div className="flex items-center gap-2 text-[10px] font-semibold">
                  <SourceTooltip
                    label={<><span className="text-orange-600">Reddit</span> <span className="text-muted-foreground font-mono">{m.reddit_mentions}</span></>}
                    fullName="Reddit"
                    description="mentions across investing subreddits"
                  />
                  <SourceTooltip
                    label={<><span className="text-sky-500">X</span> <span className="text-muted-foreground font-mono">{Math.round(m.x_mentions * 0.6)}</span></>}
                    fullName="X (Twitter)"
                    description="posts mentioning this ticker"
                  />
                  <SourceTooltip
                    label={<><span className="text-green-500">ST</span> <span className="text-muted-foreground font-mono">{Math.round(m.x_mentions * 0.4)}</span></>}
                    fullName="StockTwits"
                    description="messages from active traders"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn("text-sm font-mono font-semibold cursor-help", getSentimentColor(m.sentiment_score))}>{m.sentiment_score}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Sentiment score (0 = very bearish, 100 = very bullish)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
