import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface PastPick {
  ticker: string;
  name: string;
  entryPrice: number;
  currentPrice: number;
  dateAdded: string;
  status: 'active' | 'closed-win' | 'closed-loss';
}

const pastPicks: PastPick[] = [
  { ticker: "META", name: "Meta Platforms", entryPrice: 485.20, currentPrice: 598.45, dateAdded: "Jan 19, 2025", status: 'active' },
  { ticker: "AMZN", name: "Amazon.com", entryPrice: 178.50, currentPrice: 225.12, dateAdded: "Jan 12, 2025", status: 'active' },
  { ticker: "COST", name: "Costco Wholesale", entryPrice: 702.30, currentPrice: 875.60, dateAdded: "Jan 5, 2025", status: 'closed-win' },
  { ticker: "GOOGL", name: "Alphabet Inc.", entryPrice: 142.80, currentPrice: 192.45, dateAdded: "Dec 29, 2024", status: 'closed-win' },
  { ticker: "AMD", name: "Advanced Micro Devices", entryPrice: 148.90, currentPrice: 125.30, dateAdded: "Dec 22, 2024", status: 'closed-loss' },
  { ticker: "MSFT", name: "Microsoft Corporation", entryPrice: 378.50, currentPrice: 442.80, dateAdded: "Dec 15, 2024", status: 'closed-win' },
];

export const PastPicks = () => {
  const getPerformance = (entry: number, current: number) => {
    return ((current - entry) / entry) * 100;
  };

  const stats = {
    totalPicks: pastPicks.length,
    winners: pastPicks.filter(p => getPerformance(p.entryPrice, p.currentPrice) > 0).length,
    avgReturn: pastPicks.reduce((acc, p) => acc + getPerformance(p.entryPrice, p.currentPrice), 0) / pastPicks.length,
  };

  return (
    <section className="py-20 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Track Record
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Full transparency on every pick we've made. See our winners and losers.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          <div className="glass-card p-6 text-center">
            <p className="text-3xl font-bold text-foreground font-mono">{stats.totalPicks}</p>
            <p className="text-sm text-muted-foreground">Total Picks</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-3xl font-bold text-gain font-mono">{Math.round((stats.winners / stats.totalPicks) * 100)}%</p>
            <p className="text-sm text-muted-foreground">Win Rate</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-3xl font-bold text-gradient-gain font-mono">+{stats.avgReturn.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Avg Return</p>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Stock</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Entry</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Current</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Return</th>
                  <th className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Date Added</th>
                  <th className="text-center p-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pastPicks.map((pick, index) => {
                  const perf = getPerformance(pick.entryPrice, pick.currentPrice);
                  const isPositive = perf >= 0;
                  
                  return (
                    <tr 
                      key={pick.ticker}
                      className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="ticker-badge text-xs">{pick.ticker}</span>
                          <span className="text-sm text-foreground font-medium hidden sm:inline">{pick.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-muted-foreground">
                        ${pick.entryPrice.toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-foreground font-medium">
                        ${pick.currentPrice.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <div className={`inline-flex items-center gap-1 ${isPositive ? 'text-gain' : 'text-loss'}`}>
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span className="font-mono text-sm font-medium">
                            {isPositive ? '+' : ''}{perf.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm text-muted-foreground">
                        {pick.dateAdded}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          pick.status === 'active' 
                            ? 'bg-primary/10 text-primary' 
                            : pick.status === 'closed-win'
                            ? 'bg-gain/10 text-gain'
                            : 'bg-loss/10 text-loss'
                        }`}>
                          {pick.status === 'active' ? 'Active' : pick.status === 'closed-win' ? 'Win' : 'Loss'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View Full History
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
