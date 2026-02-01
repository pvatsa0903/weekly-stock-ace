import { BarChart3, DollarSign, Building, TrendingUp, Users, Activity, ArrowUp, ArrowDown } from "lucide-react";

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

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="metric-card">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <p className="text-xl font-bold font-mono">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
