import { ThumbsUp, ThumbsDown, Lightbulb, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStockData } from "@/hooks/useStockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

interface LiveWeeklyBannerProps {
  ticker: string;
  aiDecision?: "PICK" | "SKIP";
  aiConfidence?: number;
  aiEli5?: string;
}

export const LiveWeeklyBanner = ({ ticker, aiDecision, aiConfidence, aiEli5 }: LiveWeeklyBannerProps) => {
  const { data, isLoading, error, refetch } = useStockData(ticker);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 bg-muted/50 border border-border">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl p-6 bg-muted/30 border border-border text-center">
        <p className="text-muted-foreground mb-2">Failed to load {ticker}</p>
        <button
          onClick={() => refetch()}
          className="text-primary hover:underline text-sm flex items-center gap-1 mx-auto"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  // Use AI-stored values if available, otherwise fall back to Finnhub
  const decision = aiDecision ?? data.decision;
  const confidence = aiConfidence ?? data.confidence;
  const eli5 = aiEli5 ?? data.eli5;
  const isPick = decision === "PICK";

  return (
    <Link to={`/ticker?symbol=${data.ticker}`} className="block">
      <div
        className={cn(
          "rounded-2xl p-6 text-white relative overflow-hidden transition-transform hover:scale-[1.02]",
          isPick ? "pick-banner" : "skip-banner"
        )}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20" />
          <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-white/20" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">This Week's Decision</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold font-mono">{data.ticker}</span>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg bg-white/20">
                  {isPick ? (
                    <ThumbsUp className="w-5 h-5" />
                  ) : (
                    <ThumbsDown className="w-5 h-5" />
                  )}
                  {decision}
                </div>
              </div>
              <p className="text-sm opacity-80 mt-1">{data.name}</p>
            </div>

            <div className="text-right">
              <p className="text-sm opacity-90">Confidence</p>
              <p className="text-3xl font-bold font-mono">{confidence}%</p>
              <p className="text-sm font-mono mt-1 opacity-90">
                ${data.price.toFixed(2)} ({data.change >= 0 ? "+" : ""}{data.changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>

          {/* ELI5 Explanation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">ELI5 (Explain Like I'm 5)</p>
                <p className="text-sm opacity-90 leading-relaxed">{eli5}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
