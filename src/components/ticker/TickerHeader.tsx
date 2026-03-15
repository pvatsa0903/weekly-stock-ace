import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockData } from "@/hooks/useStockData";

interface TickerHeaderProps {
  data: StockData;
}

export const TickerHeader = ({ data }: TickerHeaderProps) => {
  const isPositive = data.change >= 0;
  const isPick = data.decision === "PICK";

  return (
    <div
      className={cn(
        "rounded-xl border p-6 relative overflow-hidden",
        isPick
          ? "bg-gradient-to-br from-emerald-50 to-card border-emerald-200/60"
          : "bg-gradient-to-br from-rose-50 to-card border-rose-200/60"
      )}
    >
      {/* Subtle accent glow */}
      <div
        className={cn(
          "absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20",
          isPick ? "bg-emerald-400" : "bg-rose-400"
        )}
      />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {data.logo && (
              <img
                src={data.logo}
                alt={data.name}
                className="w-12 h-12 rounded-xl object-contain bg-white shadow-sm border border-border p-1"
              />
            )}
            <span className="ticker-badge text-lg px-3 py-1.5">{data.ticker}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
          {data.industry && (
            <p className="text-sm text-muted-foreground mt-1">{data.industry}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono">${data.price.toFixed(2)}</p>
          <div
            className={cn(
              "flex items-center justify-end gap-1 text-lg font-mono font-semibold",
              isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {isPositive ? "+" : ""}{data.change.toFixed(2)} ({isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%)
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Prev Close: ${data.previousClose.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};
