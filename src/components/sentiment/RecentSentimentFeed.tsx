import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

const platformConfig: Record<string, { label: string; color: string; bg: string }> = {
  news: { label: "News", color: "text-amber-600", bg: "bg-amber-500/10" },
  stocktwits: { label: "StockTwits", color: "text-green-500", bg: "bg-green-500/10" },
  reddit: { label: "Reddit", color: "text-orange-600", bg: "bg-orange-500/10" },
  x: { label: "X", color: "text-sky-500", bg: "bg-sky-500/10" },
};

export const RecentSentimentFeed = () => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["recent_sentiment_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sentiment_items")
        .select("*")
        .order("week_ending", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !items.length) return null;

  const getSentimentStyle = (label: string) => {
    if (label === "bullish") return "text-emerald-600 bg-emerald-500/10";
    if (label === "bearish") return "text-rose-600 bg-rose-500/10";
    return "text-muted-foreground bg-muted";
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Recent Sentiment Feed</h2>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {items.map((item) => {
          const platform = platformConfig[item.platform] || platformConfig.news;
          return (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="ticker-badge text-xs">{item.ticker}</span>
                <span className={cn("text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full", platform.bg, platform.color)}>
                  {platform.label}
                </span>
                <span className={cn("text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full", getSentimentStyle(item.sentiment_label))}>
                  {item.sentiment_label}
                </span>
                {item.engagement > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                    {item.engagement} eng.
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {item.snippet}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
