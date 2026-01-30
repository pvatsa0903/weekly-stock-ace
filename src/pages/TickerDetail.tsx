import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  TrendingUp, TrendingDown, MessageSquare, BarChart3, 
  DollarSign, Users, Building, Newspaper, ThumbsUp, ThumbsDown, Minus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TickerData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  decision: "PICK" | "SKIP";
  sentiment: {
    overall: number;
    social: number;
    news: number;
    analyst: number;
  };
  fundamentals: {
    peRatio: number;
    marketCap: string;
    revenue: string;
    eps: number;
    dividend: number;
    beta: number;
  };
  recentNews: {
    title: string;
    sentiment: "positive" | "negative" | "neutral";
    date: string;
  }[];
}

const tickerDatabase: Record<string, TickerData> = {
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 912.45,
    change: 37.17,
    changePercent: 4.24,
    decision: "PICK",
    sentiment: {
      overall: 82,
      social: 88,
      news: 79,
      analyst: 85,
    },
    fundamentals: {
      peRatio: 64.2,
      marketCap: "$2.25T",
      revenue: "$60.9B",
      eps: 14.21,
      dividend: 0.04,
      beta: 1.72,
    },
    recentNews: [
      { title: "NVIDIA announces new Blackwell architecture for AI training", sentiment: "positive", date: "Jan 26" },
      { title: "Data center revenue exceeds expectations in Q4", sentiment: "positive", date: "Jan 24" },
      { title: "Analysts raise price targets following earnings beat", sentiment: "positive", date: "Jan 23" },
    ],
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla Inc",
    price: 243.20,
    change: -5.30,
    changePercent: -2.13,
    decision: "SKIP",
    sentiment: {
      overall: 45,
      social: 52,
      news: 38,
      analyst: 42,
    },
    fundamentals: {
      peRatio: 72.1,
      marketCap: "$772B",
      revenue: "$96.8B",
      eps: 3.37,
      dividend: 0,
      beta: 2.31,
    },
    recentNews: [
      { title: "Tesla faces increased competition in China EV market", sentiment: "negative", date: "Jan 26" },
      { title: "Q4 deliveries miss analyst expectations", sentiment: "negative", date: "Jan 24" },
      { title: "Cybertruck production ramps up at Gigafactory Texas", sentiment: "neutral", date: "Jan 22" },
    ],
  },
};

const TickerDetail = () => {
  const [searchParams] = useSearchParams();
  const [inputTicker, setInputTicker] = useState(searchParams.get("symbol") || "NVDA");
  const [activeTicker, setActiveTicker] = useState(searchParams.get("symbol") || "NVDA");

  const data = tickerDatabase[activeTicker.toUpperCase()];

  const handleSearch = () => {
    if (tickerDatabase[inputTicker.toUpperCase()]) {
      setActiveTicker(inputTicker.toUpperCase());
    }
  };

  const getSentimentIcon = (sentiment: "positive" | "negative" | "neutral") => {
    if (sentiment === "positive") return <ThumbsUp className="w-3 h-3 text-emerald-600" />;
    if (sentiment === "negative") return <ThumbsDown className="w-3 h-3 text-rose-600" />;
    return <Minus className="w-3 h-3 text-amber-600" />;
  };

  if (!data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex gap-3 max-w-md">
            <Input
              placeholder="Enter ticker (e.g., NVDA)"
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground">Ticker not found. Try NVDA or TSLA for demo.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Search */}
        <div className="flex gap-3 max-w-md">
          <Input
            placeholder="Enter ticker (e.g., NVDA)"
            value={inputTicker}
            onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="font-mono"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Ticker Header */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="ticker-badge text-lg px-3 py-1.5">{data.ticker}</span>
                <span
                  className={cn(
                    "text-sm font-semibold px-3 py-1 rounded-full",
                    data.decision === "PICK"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  )}
                >
                  {data.decision}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold font-mono">${data.price.toFixed(2)}</p>
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-lg font-mono font-medium",
                  isPositive ? "text-gain" : "text-loss"
                )}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? "+" : ""}{data.change.toFixed(2)} ({isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sentiment Analysis */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Sentiment Analysis</h2>
            </div>

            <div className="space-y-5">
              {[
                { label: "Overall Score", value: data.sentiment.overall },
                { label: "Social Media", value: data.sentiment.social },
                { label: "News Coverage", value: data.sentiment.news },
                { label: "Analyst Rating", value: data.sentiment.analyst },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className={cn(
                      "text-sm font-semibold font-mono",
                      item.value >= 70 ? "text-emerald-600" :
                      item.value >= 50 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {item.value}/100
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        item.value >= 70 ? "bg-emerald-500" :
                        item.value >= 50 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fundamentals */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Fundamentals</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="metric-card">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">P/E Ratio</span>
                </div>
                <p className="text-xl font-bold font-mono">{data.fundamentals.peRatio}</p>
              </div>
              <div className="metric-card">
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Market Cap</span>
                </div>
                <p className="text-xl font-bold">{data.fundamentals.marketCap}</p>
              </div>
              <div className="metric-card">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Revenue (TTM)</span>
                </div>
                <p className="text-xl font-bold">{data.fundamentals.revenue}</p>
              </div>
              <div className="metric-card">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">EPS</span>
                </div>
                <p className="text-xl font-bold font-mono">${data.fundamentals.eps}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Recent News</h2>
          </div>

          <div className="space-y-3">
            {data.recentNews.map((news, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">{getSentimentIcon(news.sentiment)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{news.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{news.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TickerDetail;
