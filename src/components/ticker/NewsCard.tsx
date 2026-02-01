import { Newspaper, ThumbsUp, ThumbsDown, Minus, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  date: string;
  url: string;
  source: string;
}

interface NewsCardProps {
  news: NewsItem[];
}

export const NewsCard = ({ news }: NewsCardProps) => {
  const getSentimentIcon = (sentiment: "positive" | "negative" | "neutral") => {
    if (sentiment === "positive") return <ThumbsUp className="w-3 h-3 text-emerald-600" />;
    if (sentiment === "negative") return <ThumbsDown className="w-3 h-3 text-rose-600" />;
    return <Minus className="w-3 h-3 text-amber-600" />;
  };

  if (!news || news.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent News</h2>
        </div>
        <p className="text-muted-foreground text-sm">No recent news available.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Recent News</h2>
      </div>

      <div className="space-y-3">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
          >
            <div className="mt-1">{getSentimentIcon(item.sentiment)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">{item.source}</p>
                <span className="text-muted-foreground">•</span>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
