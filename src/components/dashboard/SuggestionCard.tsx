import { useState } from "react";
import { ThumbsUp, ThumbsDown, TrendingDown, Eye, ShieldCheck, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStockData } from "@/hooks/useStockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export type SuggestionType = "PICK" | "SKIP" | "SELL" | "WATCH" | "HOLD";

interface SuggestionCardProps {
  ticker: string;
  type: SuggestionType;
  confidence?: number;
  why?: string;
  eli5?: string;
}

const typeConfig: Record<SuggestionType, {
  gradient: string;
  expandBg: string;
  icon: typeof ThumbsUp;
  label: string;
}> = {
  PICK: { gradient: "from-emerald-500 to-emerald-600", expandBg: "bg-emerald-700", icon: ThumbsUp, label: "Buy Signal" },
  SKIP: { gradient: "from-slate-500 to-slate-600", expandBg: "bg-slate-700", icon: ThumbsDown, label: "Skip — No Action" },
  SELL: { gradient: "from-rose-500 to-rose-600", expandBg: "bg-rose-700", icon: TrendingDown, label: "Sell Signal" },
  WATCH: { gradient: "from-amber-500 to-orange-500", expandBg: "bg-amber-700", icon: Eye, label: "Watch — Monitor" },
  HOLD: { gradient: "from-sky-500 to-sky-600", expandBg: "bg-sky-700", icon: ShieldCheck, label: "Hold — Stay In" },
};

export const SuggestionCard = ({ ticker, type, confidence, why, eli5 }: SuggestionCardProps) => {
  const { data, isLoading, error, refetch } = useStockData(ticker);
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 bg-muted/50 border border-border">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl p-6 bg-muted/30 border border-border text-center">
        <p className="text-muted-foreground mb-2">Failed to load {ticker}</p>
        <button onClick={() => refetch()} className="text-primary hover:underline text-sm">
          Retry
        </button>
      </div>
    );
  }

  const displayConfidence = confidence ?? data.confidence ?? 50;

  return (
    <div className="rounded-2xl overflow-hidden">
      <Link to={`/ticker?symbol=${data.ticker}`} className="block">
        <div className={cn("p-6 text-white relative overflow-hidden transition-transform hover:scale-[1.01] bg-gradient-to-r", config.gradient)}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20" />
            <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-white/20" />
          </div>

          <div className="relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-medium opacity-80 mb-1 uppercase tracking-wider">{config.label}</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-bold font-mono">{data.ticker}</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm bg-white/20">
                    <Icon className="w-4 h-4" />
                    {type}
                  </div>
                </div>
                <p className="text-sm opacity-80 mt-1">{data.name}</p>
              </div>

              {/* Confidence ring */}
              <div className="text-right flex flex-col items-end">
                <p className="text-[10px] opacity-80 uppercase tracking-wider mb-1">Confidence</p>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.5"
                      fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${(displayConfidence / 100) * 97.4} 97.4`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg font-bold font-mono">
                    {displayConfidence}%
                  </span>
                </div>
              </div>
            </div>

            {/* Price line */}
            <p className="text-sm font-mono opacity-90 mb-3">
              ${data.price.toFixed(2)}{" "}
              <span className={data.change >= 0 ? "text-white/90" : "text-white/70"}>
                ({data.change >= 0 ? "+" : ""}{data.changePercent.toFixed(2)}%)
              </span>
            </p>

            {/* Why section (primary) */}
            {why && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1 opacity-90">Why this decision?</p>
                    <p className="text-sm opacity-85 leading-relaxed">{why}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* ELI5 expandable */}
      {eli5 && (
        <div className={cn("border-t border-white/10 rounded-b-2xl", config.expandBg)}>
          <button
            onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
            className="w-full flex items-center justify-between px-6 py-2.5 text-white/90 hover:text-white transition-colors text-sm font-medium min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">🧒</span>
              ELI5 (Explain Like I'm 5)
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded && (
            <div className="px-6 pb-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <p className="text-white/90 text-sm leading-relaxed tracking-wide">{eli5}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
