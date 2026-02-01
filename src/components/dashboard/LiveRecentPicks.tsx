import { TrendingUp, TrendingDown, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMultipleStocks } from "@/hooks/useStockData";
import { Skeleton } from "@/components/ui/skeleton";

const WATCH_TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN"];

export const LiveRecentPicks = () => {
  const { data: stocksData, isLoading, refetch } = useMultipleStocks(WATCH_TICKERS);

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
            to="/decisions"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
        ) : (
          stocksData?.map((stock) => {
            if (!stock.data) {
              return (
                <div
                  key={stock.symbol}
                  className="p-4 flex items-center justify-between text-muted-foreground"
                >
                  <span className="ticker-badge opacity-50">{stock.symbol}</span>
                  <span className="text-sm">Failed to load</span>
                </div>
              );
            }

            const { data } = stock;
            return (
              <Link
                key={data.ticker}
                to={`/ticker?symbol=${data.ticker}`}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <span className="ticker-badge">{data.ticker}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{data.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ${data.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-1 rounded-full",
                      data.decision === "PICK"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    )}
                  >
                    {data.decision}
                  </span>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-mono font-medium",
                      data.change >= 0 ? "text-gain" : "text-loss"
                    )}
                  >
                    {data.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {data.change >= 0 ? "+" : ""}
                    {data.changePercent.toFixed(2)}%
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
