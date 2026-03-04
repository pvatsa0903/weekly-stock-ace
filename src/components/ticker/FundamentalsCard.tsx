import { BarChart3, DollarSign, Building, TrendingUp, Users, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FundamentalsCardProps {
  fundamentals: {
    peRatio: string;
    marketCap: string;
    eps: string;
    dividend: string;
    beta: string;
    high52w: string;
    low52w: string;
  };
}

const metricColors: Record<string, string> = {
  "P/E Ratio": "from-violet-500/10 to-violet-500/5 border-violet-200/50",
  "Market Cap": "from-blue-500/10 to-blue-500/5 border-blue-200/50",
  "EPS": "from-emerald-500/10 to-emerald-500/5 border-emerald-200/50",
  "Dividend Yield": "from-amber-500/10 to-amber-500/5 border-amber-200/50",
  "Beta": "from-orange-500/10 to-orange-500/5 border-orange-200/50",
  "52W High": "from-cyan-500/10 to-cyan-500/5 border-cyan-200/50",
  "52W Low": "from-rose-500/10 to-rose-500/5 border-rose-200/50",
};

const metricIconColors: Record<string, string> = {
  "P/E Ratio": "text-violet-500",
  "Market Cap": "text-blue-500",
  "EPS": "text-emerald-500",
  "Dividend Yield": "text-amber-500",
  "Beta": "text-orange-500",
  "52W High": "text-cyan-500",
  "52W Low": "text-rose-500",
};

export const FundamentalsCard = ({ fundamentals }: FundamentalsCardProps) => {
  const metrics = [
    { label: "P/E Ratio", value: fundamentals.peRatio, icon: DollarSign },
    { label: "Market Cap", value: fundamentals.marketCap, icon: Building },
    { label: "EPS", value: fundamentals.eps !== "N/A" ? `$${fundamentals.eps}` : "N/A", icon: TrendingUp },
    { label: "Dividend Yield", value: fundamentals.dividend !== "0" ? `${fundamentals.dividend}%` : "N/A", icon: Users },
    { label: "Beta", value: fundamentals.beta, icon: Activity },
    { label: "52W High", value: fundamentals.high52w !== "N/A" ? `$${fundamentals.high52w}` : "N/A", icon: ArrowUp },
    { label: "52W Low", value: fundamentals.low52w !== "N/A" ? `$${fundamentals.low52w}` : "N/A", icon: ArrowDown },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Fundamentals</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={cn(
                "rounded-lg border p-4 bg-gradient-to-br transition-shadow hover:shadow-sm",
                metricColors[metric.label] || "bg-muted/30 border-border"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={cn("w-4 h-4", metricIconColors[metric.label] || "text-muted-foreground")} />
                <span className="text-xs text-muted-foreground font-medium">{metric.label}</span>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
