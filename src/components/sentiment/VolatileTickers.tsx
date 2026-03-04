import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";

interface VolatileEntry {
  ticker: string;
  score: number;
  change: number;
  absChange: number;
  redditMentions: number;
  xMentions: number;
  stMentions: number;
  redditScore: number;
  xScore: number;
  confidence: number;
  latestDate: string;
  previousDate: string;
}

interface Props {
  data: VolatileEntry[];
}

export const VolatileTickers = ({ data }: Props) => {
  if (!data.length) return null;

  const getBarColor = (score: number) => {
    if (score >= 65) return "bg-emerald-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-foreground">Top 5 Most Volatile</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 font-mono">
        {formatDate(data[0]?.previousDate)} → {formatDate(data[0]?.latestDate)} · sentiment swing ranking
      </p>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {data.map((v, i) => {
          const isUp = v.change >= 0;
          return (
            <div key={v.ticker} className="rounded-lg border border-border bg-muted/30 p-4">
              {/* Rank + Ticker */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground font-mono w-5">#{i + 1}</span>
                  <span className="ticker-badge">{v.ticker}</span>
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm font-bold font-mono px-2 py-1 rounded-md",
                    isUp
                      ? "text-emerald-700 bg-emerald-500/10"
                      : "text-rose-700 bg-rose-500/10"
                  )}
                >
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isUp ? "+" : ""}{v.change}
                </span>
              </div>

              {/* Score */}
              <div className="text-2xl font-bold font-mono text-foreground mb-2">{v.score}</div>

              {/* Score bar */}
              <div className="w-full h-1.5 bg-background/50 rounded-full mb-3 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", getBarColor(v.score))}
                  style={{ width: `${Math.min(v.score, 100)}%` }}
                />
              </div>

              {/* 3-source breakdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="uppercase tracking-wider font-semibold text-orange-600">Reddit</span>
                  <span className="font-mono text-foreground">{v.redditScore} · {v.redditMentions}m</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="uppercase tracking-wider font-semibold text-sky-500">X</span>
                  <span className="font-mono text-foreground">{v.xScore} · {v.xMentions}m</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="uppercase tracking-wider font-semibold text-green-500">StockTwits</span>
                  <span className="font-mono text-foreground">{v.stMentions}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
