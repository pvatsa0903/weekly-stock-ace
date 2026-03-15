import { Newspaper, ThumbsUp, ThumbsDown, Minus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

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

// Map common news sources to their favicon URLs
const getSourceLogo = (source: string): string => {
  const domain = source.toLowerCase().trim();
  const domainMap: Record<string, string> = {
    "yahoo": "finance.yahoo.com",
    "yahoo finance": "finance.yahoo.com",
    "reuters": "www.reuters.com",
    "bloomberg": "www.bloomberg.com",
    "cnbc": "www.cnbc.com",
    "marketwatch": "www.marketwatch.com",
    "seeking alpha": "seekingalpha.com",
    "seekingalpha": "seekingalpha.com",
    "benzinga": "www.benzinga.com",
    "the motley fool": "www.fool.com",
    "motley fool": "www.fool.com",
    "barron's": "www.barrons.com",
    "barrons": "www.barrons.com",
    "investopedia": "www.investopedia.com",
    "wsj": "www.wsj.com",
    "wall street journal": "www.wsj.com",
    "the wall street journal": "www.wsj.com",
    "financial times": "www.ft.com",
    "ft": "www.ft.com",
    "forbes": "www.forbes.com",
    "business insider": "www.businessinsider.com",
    "insider": "www.businessinsider.com",
    "cnn": "www.cnn.com",
    "cnn business": "www.cnn.com",
    "thestreet": "www.thestreet.com",
    "the street": "www.thestreet.com",
    "investor's business daily": "www.investors.com",
    "ibd": "www.investors.com",
    "zacks": "www.zacks.com",
    "tipranks": "www.tipranks.com",
    "the verge": "www.theverge.com",
    "techcrunch": "techcrunch.com",
    "ars technica": "arstechnica.com",
    "wired": "www.wired.com",
    "ap": "apnews.com",
    "associated press": "apnews.com",
  };

  const mapped = domainMap[domain];
  if (mapped) return `https://www.google.com/s2/favicons?domain=${mapped}&sz=32`;
  
  // Try extracting domain directly from source name
  return `https://www.google.com/s2/favicons?domain=${domain.replace(/\s+/g, "")}.com&sz=32`;
};

const getSentimentStyle = (sentiment: "positive" | "negative" | "neutral") => {
  if (sentiment === "positive") return {
    icon: <ThumbsUp className="w-3.5 h-3.5" />,
    bg: "bg-emerald-50 border-emerald-200/60",
    text: "text-emerald-600",
    label: "Bullish",
  };
  if (sentiment === "negative") return {
    icon: <ThumbsDown className="w-3.5 h-3.5" />,
    bg: "bg-rose-50 border-rose-200/60",
    text: "text-rose-600",
    label: "Bearish",
  };
  return {
    icon: <Minus className="w-3.5 h-3.5" />,
    bg: "bg-amber-50 border-amber-200/60",
    text: "text-amber-600",
    label: "Neutral",
  };
};

export const NewsCard = ({ news }: NewsCardProps) => {
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
        <span className="text-xs text-muted-foreground ml-auto">{news.length} articles</span>
      </div>

      <div className="divide-y divide-border">
        {news.map((item, index) => {
          const sentiment = getSentimentStyle(item.sentiment);
          return (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 py-3.5 px-1 transition-colors group hover:bg-muted/30 first:pt-0 last:pb-0"
            >
              {/* Source logo */}
              <img
                src={getSourceLogo(item.source)}
                alt={item.source}
                className="w-5 h-5 rounded mt-0.5 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{item.source}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className={cn("inline-flex items-center gap-1 text-[11px]", sentiment.text)}>
                    {sentiment.icon}
                    {sentiment.label}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
