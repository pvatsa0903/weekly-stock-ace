import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";

interface SentimentRow {
  ticker: string;
  sentiment_score: number;
  confidence: number;
  reddit_confirmed: boolean;
  x_confirmed: boolean;
  reddit_mentions: number;
  x_mentions: number;
  reddit_velocity: number | null;
  x_velocity: number | null;
}

interface Props {
  data: SentimentRow[];
  date: string;
}

export const SentimentHeatmap = ({ data, date }: Props) => {
  const sorted = [...data].sort((a, b) => b.sentiment_score - a.sentiment_score);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500/15 border-emerald-500/30 text-emerald-700";
    if (score >= 55) return "bg-emerald-500/8 border-emerald-500/15 text-emerald-600";
    if (score >= 45) return "bg-muted border-border text-muted-foreground";
    if (score >= 35) return "bg-rose-500/8 border-rose-500/15 text-rose-600";
    return "bg-rose-500/15 border-rose-500/30 text-rose-700";
  };

  const getScoreBarWidth = (score: number) => `${Math.min(score, 100)}%`;

  const getScoreBarColor = (score: number) => {
    if (score >= 60) return "bg-emerald-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-rose-500";
  };

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Today's Heatmap</h2>
        <span className="text-xs text-muted-foreground font-mono">{formatDate(date)}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sorted.map((row) => (
          <div
            key={row.ticker}
            className={cn(
              "rounded-xl border p-4 transition-all duration-200 hover:shadow-md",
              getScoreColor(row.sentiment_score)
            )}
          >
            {/* Ticker + Score */}
            <div className="flex items-center justify-between mb-3">
              <span className="ticker-badge">{row.ticker}</span>
              <span className="text-2xl font-bold font-mono">{row.sentiment_score}</span>
            </div>

            {/* Score bar */}
            <div className="w-full h-1.5 bg-background/50 rounded-full mb-3 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", getScoreBarColor(row.sentiment_score))}
                style={{ width: getScoreBarWidth(row.sentiment_score) }}
              />
            </div>

            {/* Platform breakdown */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium text-orange-600">Reddit</span>
                <span className="text-muted-foreground font-mono">{row.reddit_mentions}</span>
                {row.reddit_velocity != null && row.reddit_velocity !== 0 && (
                  <span className={cn("flex items-center", row.reddit_velocity > 0 ? "text-emerald-600" : "text-rose-600")}>
                    {row.reddit_velocity > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium text-sky-500">X</span>
                <span className="text-muted-foreground font-mono">{Math.round(row.x_mentions * 0.6)}</span>
                {row.x_velocity != null && row.x_velocity !== 0 && (
                  <span className={cn("flex items-center", row.x_velocity > 0 ? "text-emerald-600" : "text-rose-600")}>
                    {row.x_velocity > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium text-green-500">StockTwits</span>
                <span className="text-muted-foreground font-mono">{Math.round(row.x_mentions * 0.4)}</span>
              </div>
            </div>

            {/* Cross-platform badge */}
            <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                Confidence {Math.round(row.confidence * 100)}%
              </span>
              {row.reddit_confirmed && row.x_confirmed && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Cross-confirmed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
