import { ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyBannerProps {
  ticker: string;
  decision: "PICK" | "SKIP";
  eli5: string;
  confidence: number;
}

export const WeeklyBanner = ({ ticker, decision, eli5, confidence }: WeeklyBannerProps) => {
  const isPick = decision === "PICK";

  return (
    <div
      className={cn(
        "rounded-2xl p-6 text-white relative overflow-hidden",
        isPick ? "pick-banner" : "skip-banner"
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20" />
        <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-white/20" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">This Week's Decision</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold font-mono">{ticker}</span>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg",
                  isPick ? "bg-white/20" : "bg-white/20"
                )}
              >
                {isPick ? (
                  <ThumbsUp className="w-5 h-5" />
                ) : (
                  <ThumbsDown className="w-5 h-5" />
                )}
                {decision}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm opacity-90">Confidence</p>
            <p className="text-3xl font-bold font-mono">{confidence}%</p>
          </div>
        </div>

        {/* ELI5 Explanation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">ELI5 (Explain Like I'm 5)</p>
              <p className="text-sm opacity-90 leading-relaxed">{eli5}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
