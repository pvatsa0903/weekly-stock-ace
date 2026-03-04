import { cn } from "@/lib/utils";

/**
 * Returns a Tailwind text color class based on sentiment score.
 * ≥65 = bullish (green), 40–64 = neutral (amber), <40 = bearish (red)
 */
export const getSentimentColor = (score: number) => {
  if (score >= 65) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-600";
};
