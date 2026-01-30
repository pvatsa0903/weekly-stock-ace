import { Calendar } from "lucide-react";
import { StockCard } from "./StockCard";

const thisWeeksPicks = [
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 875.28,
    change: 12.45,
    changePercent: 1.44,
    targetPrice: 1050.00,
    rationale: "Dominant AI chip position with expanding data center revenue. New Blackwell architecture launching Q2 positions them for next-gen AI training demand. Strong moat with CUDA ecosystem lock-in.",
    sector: "Technology",
    marketCap: "$2.16T",
    peRatio: 64.2,
    featured: true,
  },
  {
    ticker: "LLY",
    name: "Eli Lilly and Company",
    price: 752.30,
    change: 8.92,
    changePercent: 1.20,
    targetPrice: 920.00,
    rationale: "GLP-1 drug franchise (Mounjaro, Zepbound) creating a multi-year growth runway. Manufacturing expansion addressing supply constraints. Pipeline optionality with Alzheimer's drug donanemab.",
    sector: "Healthcare",
    marketCap: "$715B",
    peRatio: 118.4,
    featured: false,
  },
];

export const WeeklyPicks = () => {
  const currentDate = new Date();
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  
  const formattedDate = weekStart.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <section id="picks" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              This Week's Picks
            </h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Week of {formattedDate}</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gain/10 border border-gain/20">
            <span className="w-2 h-2 rounded-full bg-gain animate-pulse" />
            <span className="text-sm font-medium text-gain">Market Open</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {thisWeeksPicks.map((stock, index) => (
            <div 
              key={stock.ticker}
              className="animate-slide-up relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <StockCard {...stock} />
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 glass-card">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Disclaimer:</strong> This is not financial advice. Always do your own research and consider your risk tolerance before investing. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </section>
  );
};
