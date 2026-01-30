import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Pick {
  ticker: string;
  name: string;
  decision: "PICK" | "SKIP";
  date: string;
  performance?: number;
}

const recentPicks: Pick[] = [
  { ticker: "NVDA", name: "NVIDIA Corp", decision: "PICK", date: "Jan 27", performance: 4.2 },
  { ticker: "TSLA", name: "Tesla Inc", decision: "SKIP", date: "Jan 27", performance: -2.1 },
  { ticker: "META", name: "Meta Platforms", decision: "PICK", date: "Jan 20", performance: 8.5 },
  { ticker: "AMD", name: "AMD Inc", decision: "SKIP", date: "Jan 20", performance: -5.3 },
];

export const RecentPicks = () => {
  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Recent Decisions</h3>
        <Link
          to="/decisions"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {recentPicks.map((pick) => (
          <div
            key={`${pick.ticker}-${pick.date}`}
            className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="ticker-badge">{pick.ticker}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{pick.name}</p>
                <p className="text-xs text-muted-foreground">{pick.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  pick.decision === "PICK"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                )}
              >
                {pick.decision}
              </span>
              {pick.performance !== undefined && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-mono font-medium",
                    pick.performance >= 0 ? "text-gain" : "text-loss"
                  )}
                >
                  {pick.performance >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {pick.performance >= 0 ? "+" : ""}
                  {pick.performance}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
