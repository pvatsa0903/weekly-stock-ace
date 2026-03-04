import { useMemo } from "react";
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
import { Activity } from "lucide-react";

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
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(0, 84%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
];

export const SentimentTrendlines = ({ data, tickers }: Props) => {
  const chartData = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {};
    data.forEach((d) => {
      if (!byDate[d.date]) byDate[d.date] = {};
      byDate[d.date][d.ticker] = d.sentiment_score;
    });

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, scores]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        ...scores,
      }));
  }, [data]);

  if (!tickers.length) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">7-Day Sentiment Trendlines</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5 font-mono">
        Tracking the 5 most volatile tickers over the past week
      </p>

      <ResponsiveContainer width="100%" height={280} className="sm:!h-[360px]">
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
          <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "var(--font-mono)" }} />
          {tickers.map((ticker, i) => (
            <Line
              key={ticker}
              type="monotone"
              dataKey={ticker}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
