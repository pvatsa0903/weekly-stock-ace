import { TrendingUp, TrendingDown, ArrowRight, Eye, ShieldCheck, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMultipleStocks } from "@/hooks/useStockData";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSellSignals } from "@/hooks/useSellSignals";

interface WatchItem {
  ticker: string;
  signal: "PICK" | "SKIP" | "SELL" | "WATCH" | "HOLD";
}

const signalStyle: Record<string, { bg: string; icon?: React.ReactNode }> = {
  SELL: { bg: "bg-[hsl(var(--sell-badge-bg))] text-[hsl(var(--sell-badge-fg))]", icon: <TrendingDown className="w-3 h-3" /> },
  PICK: { bg: "bg-[hsl(var(--pick-badge-bg))] text-[hsl(var(--pick-badge-fg))]" },
  WATCH: { bg: "bg-[hsl(var(--watch-badge-bg))] text-[hsl(var(--watch-badge-fg))]", icon: <Eye className="w-3 h-3" /> },
  HOLD: { bg: "bg-[hsl(var(--hold-badge-bg))] text-[hsl(var(--hold-badge-fg))]", icon: <ShieldCheck className="w-3 h-3" /> },
  SKIP: { bg: "bg-[hsl(var(--sell-badge-bg))] text-[hsl(var(--sell-badge-fg))]" },
};

const MAX_ITEMS = 4;

export const LiveRecentPicks = () => {
  const { data: weeklyPicks } = useQuery({
    queryKey: ["market_watch_decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_decisions")
        .select("pick1, pick2, decision")
        .order("week_ending", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: sellSignals = [] } = useSellSignals(true);

  // Build list, dedupe, take top items
  const priorityMap: Record<string, number> = { SELL: 1, PICK: 2, WATCH: 3, HOLD: 4, SKIP: 5 };
  const items: WatchItem[] = [];

  sellSignals.forEach((s) => items.push({ ticker: s.ticker, signal: s.signal as WatchItem["signal"] }));
  if (weeklyPicks?.pick1) items.push({ ticker: weeklyPicks.pick1, signal: weeklyPicks.decision as WatchItem["signal"] });
  if (weeklyPicks?.pick2) items.push({ ticker: weeklyPicks.pick2, signal: weeklyPicks.decision as WatchItem["signal"] });

  const seen = new Set<string>();
  const topItems = items
    .sort((a, b) => (priorityMap[a.signal] ?? 5) - (priorityMap[b.signal] ?? 5))
    .filter((item) => { if (seen.has(item.ticker)) return false; seen.add(item.ticker); return true; })
    .slice(0, MAX_ITEMS);

  const tickers = topItems.map((i) => i.ticker);
  const { data: stocksData, isLoading } = useMultipleStocks(tickers);

  const stockMap = new Map<string, any>();
  stocksData?.forEach((s) => { if (s.data) stockMap.set(s.data.ticker, s.data); });

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Market Watch</h3>
        </div>
        <Link to="/signals" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {tickers.length === 0 && !isLoading && (
          <div className="p-6 text-center text-sm text-muted-foreground">No active signals or picks yet</div>
        )}
        {isLoading
          ? Array.from({ length: MAX_ITEMS }).map((_, i) => (
              <div key={i} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-14 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))
          : topItems.map((item) => {
              const stock = stockMap.get(item.ticker);
              const style = signalStyle[item.signal] || signalStyle.SKIP;
              return (
                <Link
                  key={item.ticker}
                  to={`/ticker?symbol=${item.ticker}`}
                  className="p-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors block"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="ticker-badge text-xs">{item.ticker}</span>
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full", style.bg)}>
                      {style.icon} {item.signal}
                    </span>
                  </div>
                  {stock && (
                    <div className={cn("flex items-center gap-1 text-sm font-mono font-medium", stock.change >= 0 ? "text-gain" : "text-loss")}>
                      {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                    </div>
                  )}
                </Link>
              );
            })}
      </div>
    </div>
  );
};
