import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentCardProps {
  sentiment: {
    overall: number;
    social: number;
    news: number;
    analyst: number;
  };
}

export const SentimentCard = ({ sentiment }: SentimentCardProps) => {
  const items = [
    { label: "Overall Score", value: sentiment.overall },
    { label: "Social Media", value: sentiment.social },
    { label: "News Coverage", value: sentiment.news },
    { label: "Analyst Rating", value: sentiment.analyst },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Sentiment Analysis</h2>
      </div>

      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span
                className={cn(
                  "text-sm font-semibold font-mono",
                  item.value >= 70
                    ? "text-emerald-600"
                    : item.value >= 50
                    ? "text-amber-600"
                    : "text-rose-600"
                )}
              >
                {item.value}/100
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  item.value >= 70
                    ? "bg-emerald-500"
                    : item.value >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                )}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
