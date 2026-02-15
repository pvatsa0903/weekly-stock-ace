import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface SentimentRow {
  date: string;
  ticker: string;
  sentiment_score: number;
  reddit_sentiment_score: number | null;
  x_sentiment_score: number | null;
}

interface Props {
  data: SentimentRow[];
  tickers: string[];
}

const COLORS = [
  "hsl(221, 83%, 53%)",   // primary blue
  "hsl(142, 71%, 45%)",   // green
  "hsl(0, 84%, 60%)",     // red
  "hsl(38, 92%, 50%)",    // amber
  "hsl(280, 65%, 60%)",   // purple
  "hsl(190, 80%, 45%)",   // teal
  "hsl(330, 70%, 55%)",   // pink
];

export const SentimentTrendlines = ({ data, tickers }: Props) => {
  const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set(tickers.slice(0, 4)));

  const toggleTicker = (ticker: string) => {
    setSelectedTickers((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else {
        next.add(ticker);
      }
      return next;
    });
  };

  // Pivot data for Recharts: { date, NVDA, PLTR, ... }
  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {};
    data.forEach((d) => {
      if (!selectedTickers.has(d.ticker)) return;
      if (!byDate[d.date]) byDate[d.date] = {};
      byDate[d.date][d.ticker] = d.sentiment_score;
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scores]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...scores,
      }));
  }, [data, selectedTickers]);

  const activeTickers = tickers.filter((t) => selectedTickers.has(t));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Sentiment Trendlines</h2>
        <div className="flex flex-wrap gap-2">
          {tickers.map((ticker, i) => (
            <button
              key={ticker}
              onClick={() => toggleTicker(ticker)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-mono font-semibold border transition-all",
                selectedTickers.has(ticker)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              )}
              style={
                selectedTickers.has(ticker)
                  ? { borderColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length], backgroundColor: `${COLORS[i % COLORS.length]}15` }
                  : undefined
              }
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        {activeTickers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Select at least one ticker to view trendlines.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
              />
              {activeTickers.map((ticker, i) => {
                const colorIndex = tickers.indexOf(ticker);
                return (
                  <Line
                    key={ticker}
                    type="monotone"
                    dataKey={ticker}
                    stroke={COLORS[colorIndex % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
