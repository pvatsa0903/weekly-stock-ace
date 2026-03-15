import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceChartProps {
  candles: { date: string; close: number }[];
  signalDate?: string; // ISO date string, e.g. "2026-03-10"
  signalType?: string;
}

export const PriceChart = ({ candles, signalDate, signalType }: PriceChartProps) => {
  const formatted = useMemo(
    () =>
      candles.map((c) => ({
        ...c,
        label: new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
    [candles]
  );

  if (formatted.length < 2) return null;

  const prices = formatted.map((c) => c.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const padding = (max - min) * 0.1 || 1;
  const isUp = prices[prices.length - 1] >= prices[0];

  // Find the closest candle date to the signal date for the reference line
  const signalLabel = signalDate
    ? formatted.find((c) => c.date === signalDate)?.label ||
      formatted.find((c) => c.date >= signalDate)?.label
    : undefined;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">30-Day Price</h3>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full ml-auto",
            isUp
              ? "bg-[hsl(var(--pick-badge-bg))] text-[hsl(var(--pick-badge-fg))]"
              : "bg-[hsl(var(--sell-badge-bg))] text-[hsl(var(--sell-badge-fg))]"
          )}
        >
          {isUp ? "+" : ""}
          {(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100).toFixed(1)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"} stopOpacity={0.25} />
              <stop offset="100%" stopColor={isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Close"]}
            labelFormatter={(label: string) => label}
          />
          {signalLabel && (
            <ReferenceLine
              x={signalLabel}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: signalType ? `${signalType} Signal` : "Signal",
                position: "top",
                fill: "hsl(var(--primary))",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="close"
            stroke={isFlat ? "hsl(var(--muted-foreground))" : isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
