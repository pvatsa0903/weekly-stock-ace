import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StockData } from "@/hooks/useStockData";

interface TickerHeaderProps {
  data: StockData;
}

export const TickerHeader = ({ data }: TickerHeaderProps) => {
  const isPositive = data.change >= 0;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {data.logo && (
              <img 
                src={data.logo} 
                alt={data.name} 
                className="w-10 h-10 rounded-lg object-contain bg-white"
              />
            )}
            <span className="ticker-badge text-lg px-3 py-1.5">{data.ticker}</span>
            <span
              className={cn(
                "text-sm font-semibold px-3 py-1 rounded-full",
                data.decision === "PICK"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              )}
            >
              {data.decision}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {data.confidence}% confidence
            </span>
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
              "flex items-center justify-end gap-1 text-lg font-mono font-medium",
              isPositive ? "text-gain" : "text-loss"
            )}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
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
