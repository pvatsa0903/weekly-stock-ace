import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrendingUp, TrendingDown, Filter, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Decision {
  id: string;
  ticker: string;
  name: string;
  decision: "PICK" | "SKIP";
  date: string;
  week: string;
  sentiment: number;
  peRatio: number;
  entryPrice: number;
  currentPrice: number;
  confidence: number;
}

const decisions: Decision[] = [
  { id: "1", ticker: "NVDA", name: "NVIDIA Corporation", decision: "PICK", date: "2025-01-27", week: "Week 4", sentiment: 82, peRatio: 64.2, entryPrice: 875.28, currentPrice: 912.45, confidence: 87 },
  { id: "2", ticker: "TSLA", name: "Tesla Inc", decision: "SKIP", date: "2025-01-27", week: "Week 4", sentiment: 45, peRatio: 72.1, entryPrice: 248.50, currentPrice: 243.20, confidence: 72 },
  { id: "3", ticker: "META", name: "Meta Platforms", decision: "PICK", date: "2025-01-20", week: "Week 3", sentiment: 78, peRatio: 28.5, entryPrice: 580.20, currentPrice: 628.90, confidence: 85 },
  { id: "4", ticker: "AMD", name: "Advanced Micro Devices", decision: "SKIP", date: "2025-01-20", week: "Week 3", sentiment: 52, peRatio: 45.8, entryPrice: 148.90, currentPrice: 141.30, confidence: 68 },
  { id: "5", ticker: "GOOGL", name: "Alphabet Inc", decision: "PICK", date: "2025-01-13", week: "Week 2", sentiment: 75, peRatio: 24.2, entryPrice: 178.50, currentPrice: 192.45, confidence: 82 },
  { id: "6", ticker: "NFLX", name: "Netflix Inc", decision: "SKIP", date: "2025-01-13", week: "Week 2", sentiment: 48, peRatio: 52.3, entryPrice: 485.20, currentPrice: 478.10, confidence: 65 },
  { id: "7", ticker: "AMZN", name: "Amazon.com Inc", decision: "PICK", date: "2025-01-06", week: "Week 1", sentiment: 80, peRatio: 42.1, entryPrice: 185.30, currentPrice: 212.80, confidence: 88 },
  { id: "8", ticker: "AAPL", name: "Apple Inc", decision: "SKIP", date: "2025-01-06", week: "Week 1", sentiment: 55, peRatio: 31.2, entryPrice: 192.50, currentPrice: 189.30, confidence: 62 },
];

const Decisions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDecision, setFilterDecision] = useState<"ALL" | "PICK" | "SKIP">("ALL");

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch =
      d.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterDecision === "ALL" || d.decision === filterDecision;
    return matchesSearch && matchesFilter;
  });

  const getPerformance = (entry: number, current: number) => {
    return ((current - entry) / entry) * 100;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Weekly Decisions</h1>
            <p className="text-muted-foreground">Historical record of all picks and skips</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ticker or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "PICK", "SKIP"] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterDecision === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterDecision(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Decision</th>
                  <th>Week</th>
                  <th className="text-right">Sentiment</th>
                  <th className="text-right">P/E Ratio</th>
                  <th className="text-right">Entry</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">Return</th>
                  <th className="text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredDecisions.map((decision) => {
                  const perf = getPerformance(decision.entryPrice, decision.currentPrice);
                  const isPositive = perf >= 0;

                  return (
                    <tr key={decision.id}>
                      <td>
                        <Link to={`/ticker?symbol=${decision.ticker}`} className="flex items-center gap-2 hover:opacity-80">
                          <span className="ticker-badge">{decision.ticker}</span>
                          <span className="text-sm text-muted-foreground hidden sm:inline">
                            {decision.name}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full",
                            decision.decision === "PICK"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          )}
                        >
                          {decision.decision}
                        </span>
                      </td>
                      <td className="text-muted-foreground">{decision.week}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                decision.sentiment >= 70 ? "bg-emerald-500" :
                                decision.sentiment >= 50 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${decision.sentiment}%` }}
                            />
                          </div>
                          <span className="font-mono text-sm">{decision.sentiment}</span>
                        </div>
                      </td>
                      <td className="text-right font-mono">{decision.peRatio.toFixed(1)}</td>
                      <td className="text-right font-mono">${decision.entryPrice.toFixed(2)}</td>
                      <td className="text-right font-mono font-medium">${decision.currentPrice.toFixed(2)}</td>
                      <td className="text-right">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 font-mono font-medium",
                            isPositive ? "text-gain" : "text-loss"
                          )}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isPositive ? "+" : ""}{perf.toFixed(1)}%
                        </div>
                      </td>
                      <td className="text-right font-mono font-medium">{decision.confidence}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Decisions;
