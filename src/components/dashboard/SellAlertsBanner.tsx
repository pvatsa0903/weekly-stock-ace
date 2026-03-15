import { AlertTriangle, TrendingDown, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSellSignals } from "@/hooks/useSellSignals";
import { Skeleton } from "@/components/ui/skeleton";

export const SellAlertsBanner = () => {
  const { data: signals = [], isLoading } = useSellSignals(true);

  const sellSignals = signals.filter((s) => s.signal === "SELL");
  const watchSignals = signals.filter((s) => s.signal === "WATCH");

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-xl" />;
  }

  if (sellSignals.length === 0 && watchSignals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Sell alerts */}
      {sellSignals.length > 0 && (
        <Link to="/signals" className="block">
          <div className="rounded-xl bg-gradient-to-r from-rose-500/10 to-rose-600/5 border border-rose-200 dark:border-rose-800 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {sellSignals.length} Sell {sellSignals.length === 1 ? "Signal" : "Signals"} Active
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sellSignals.map((s) => s.ticker).join(", ")} — Consider exiting
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </Link>
      )}

      {/* Watch alerts */}
      {watchSignals.length > 0 && (
        <Link to="/alerts" className="block">
          <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-200 dark:border-amber-800 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {watchSignals.length} on Watch
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {watchSignals.map((s) => s.ticker).join(", ")} — Monitor closely
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </Link>
      )}
    </div>
  );
};
