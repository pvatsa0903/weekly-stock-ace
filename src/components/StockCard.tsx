import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

interface StockCardProps {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  targetPrice: number;
  rationale: string;
  sector: string;
  marketCap: string;
  peRatio: number;
  featured?: boolean;
}

export const StockCard = ({
  ticker,
  name,
  price,
  change,
  changePercent,
  targetPrice,
  rationale,
  sector,
  marketCap,
  peRatio,
  featured = false,
}: StockCardProps) => {
  const isPositive = change >= 0;
  const upside = ((targetPrice - price) / price) * 100;

  return (
    <div className={`stock-card group ${featured ? 'border-gold/30' : ''}`}>
      {featured && (
        <div className="absolute -top-3 left-6">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-gold to-gold-muted text-accent-foreground rounded-full">
            Top Pick
          </span>
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="ticker-badge text-foreground">{ticker}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{sector}</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
        </div>
        
        <button className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="metric-label">Current Price</p>
          <p className="metric-value">${price.toFixed(2)}</p>
          <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-gain' : 'text-loss'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="text-sm font-mono font-medium">
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div>
          <p className="metric-label">Target Price</p>
          <p className="metric-value text-gradient-gain">${targetPrice.toFixed(2)}</p>
          <p className="text-sm text-gain mt-1 font-medium">+{upside.toFixed(1)}% upside</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-t border-b border-border/50">
        <div>
          <p className="metric-label">Market Cap</p>
          <p className="text-sm font-semibold text-foreground">{marketCap}</p>
        </div>
        <div>
          <p className="metric-label">P/E Ratio</p>
          <p className="text-sm font-semibold text-foreground font-mono">{peRatio.toFixed(1)}</p>
        </div>
      </div>

      <div>
        <p className="metric-label mb-2">Why We Like It</p>
        <p className="text-sm text-secondary-foreground leading-relaxed">{rationale}</p>
      </div>
    </div>
  );
};
