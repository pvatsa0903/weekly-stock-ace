import { AlertTriangle, ShieldCheck, Eye, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SellSignal } from "@/hooks/useSellSignals";

interface SellSignalCardProps {
  signal: SellSignal;
}

const signalConfig = {
  SELL: {
    icon: TrendingDown,
    label: "Sell Signal",
    gradient: "from-rose-500 to-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    iconColor: "text-rose-500",
  },
  WATCH: {
    icon: Eye,
    label: "Watch Signal",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    iconColor: "text-amber-500",
  },
  HOLD: {
    icon: ShieldCheck,
    label: "Hold — No Action",
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    iconColor: "text-emerald-500",
  },
};

export const SellSignalCard = ({ signal }: SellSignalCardProps) => {
  const config = signalConfig[signal.signal];
  const Icon = config.icon;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className={cn("rounded-xl border p-5 transition-all", config.bg, config.border)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white", config.gradient)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-foreground">{signal.ticker}</span>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", config.badge)}>
                {signal.signal}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Hold Signal · {config.label}</p>
          </div>
        </div>

        {/* Confidence meter */}
        <div className="text-right">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-border" />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${(signal.confidence / 100) * 88} 88`}
                className={config.iconColor}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono">
              {signal.confidence}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed mb-3">{signal.reasoning}</p>

      {/* Risk flags */}
      {signal.fundamental_flags && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {signal.fundamental_flags.split(",").map((flag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
            >
              <AlertTriangle className="w-2.5 h-2.5" />
              {flag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {signal.price_at_signal != null && (
            <span>Price: ${Number(signal.price_at_signal).toFixed(2)}</span>
          )}
          {signal.sentiment_change != null && (
            <span className={cn(
              Number(signal.sentiment_change) >= 0 ? "text-emerald-600" : "text-rose-600"
            )}>
              Sentiment: {Number(signal.sentiment_change) >= 0 ? "+" : ""}{Number(signal.sentiment_change).toFixed(1)}
            </span>
          )}
        </div>
        <span>{timeAgo(signal.created_at)}</span>
      </div>
    </div>
  );
};
