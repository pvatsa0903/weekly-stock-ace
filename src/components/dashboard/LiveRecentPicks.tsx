import { TrendingUp, TrendingDown, ArrowRight, RefreshCw, Eye, ShieldCheck } from "lucide-react";
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
  confidence?: number;
}

const signalStyle: Record<string, { bg: string; icon?: React.ReactNode }> = {
  SELL: { bg: "bg-rose-100 text-rose-700", icon: <TrendingDown className="w-3 h-3" /> },
  PICK: { bg: "bg-emerald-100 text-emerald-700" },
  WATCH: { bg: "bg-amber-100 text-amber-700", icon: <Eye className="w-3 h-3" /> },
  HOLD: { bg: "bg-emerald-100 text-emerald-700", icon: <ShieldCheck className="w-3 h-3" /> },
  SKIP: { bg: "bg-rose-100 text-rose-700" },
};

export const LiveRecentPicks = () => {
  // Fetch latest weekly decision
  const { data: weeklyPicks } = useQuery({
    queryKey: ["market_watch_decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_decisions")
        .select("pick1, pick2, decision, pick1_confidence, pick2_confidence")
        .order("week_ending", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch active sell signals
  const { data: sellSignals = [] } = useSellSignals(true);

  // Build unified watch list, dedupe by ticker, prioritize SELL > PICK > WATCH > HOLD > SKIP
  const priorityMap: Record<string, number> = { SELL: 1, PICK: 2, WATCH: 3, HOLD: 4, SKIP: 5 };
  const items: WatchItem[] = [];

  sellSignals.forEach((s) => {
    items.push({ ticker: s.ticker, signal: s.signal as WatchItem["signal"], confidence: s.confidence });
  });

  if (weeklyPicks) {
    if (weeklyPicks.pick1) {
      items.push({ ticker: weeklyPicks.pick1, signal: weeklyPicks.decision as WatchItem["signal"], confidence: weeklyPicks.pick1_confidence ?? undefined });
    }
    if (weeklyPicks.pick2) {
      items.push({ ticker: weeklyPicks.pick2, signal: weeklyPicks.decision as WatchItem["signal"], confidence: weeklyPicks.pick2_confidence ?? undefined });
    }
  }

  // Dedupe
  const seen = new Set<string>();
  const uniqueItems = items
    .sort((a, b) => (priorityMap[a.signal] ?? 5) - (priorityMap[b.signal] ?? 5))
    .filter((item) => {
      if (seen.has(item.ticker)) return false;
      seen.add(item.ticker);
      return true;
    })
    .slice(0, 8);

  const tickers = uniqueItems.map((i) => i.ticker);
  const { data: stocksData, isLoading, refetch } = useMultipleStocks(tickers);

  // Map stock data by ticker for easy lookup
  const stockMap = new Map<string, any>();
  stocksData?.forEach((s) => {
    if (s.data) stockMap.set(s.data.ticker, s.data);
  });

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Market Watch</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/signals"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border">
        {tickers.length === 0 && !isLoading && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No active signals or picks yet
          </div>
        )}
        {isLoading
          ? Array.from({ length: Math.max(tickers.length, 3) }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16 rounded" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          : uniqueItems.map((item) => {
              const stock = stockMap.get(item.ticker);
              const style = signalStyle[item.signal] || signalStyle.SKIP;

              if (!stock) {
                return (
                  <div
                    key={item.ticker}
                    className="p-4 flex items-center justify-between text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <span className="ticker-badge opacity-50">{item.ticker}</span>
                      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full", style.bg)}>
                        {style.icon} {item.signal}
                      </span>
                    </div>
                    <span className="text-sm">Loading…</span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.ticker}
                  to={`/ticker?symbol=${item.ticker}`}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors block"
                >
                  <div className="flex items-center gap-3">
                    <span className="ticker-badge">{item.ticker}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{stock.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        ${stock.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", style.bg)}>
                      {style.icon} {item.signal}
                    </span>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-mono font-medium",
                        stock.change >= 0 ? "text-gain" : "text-loss"
                      )}
                    >
                      {stock.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stock.change >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </div>
  );
};
