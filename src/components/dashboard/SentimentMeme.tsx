import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSellSignals } from "@/hooks/useSellSignals";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface MemeEntry {
  src: string;
  caption: string;
}

const memes: Record<string, MemeEntry[]> = {
  bullish: [
    { src: "/memes/stonks.png", caption: "Portfolio looking real good rn 📈" },
    { src: "/memes/leo-pointing.png", caption: "Me seeing my picks go green 💚" },
  ],
  bearish: [
    { src: "/memes/this-is-fine.png", caption: "2 sell signals? This is fine. 🔥🐶" },
    { src: "/memes/not-stonks.png", caption: "When the market said sike 📉💀" },
    { src: "/memes/panic-sell.png", caption: "Checking the portfolio this morning 😱" },
  ],
  cautious: [
    { src: "/memes/suspicious-squint.png", caption: "Not sure if dip or cliff 🤔🧐" },
    { src: "/memes/nervous-sweating.png", caption: "Me watching my watchlist rn 😰💧" },
  ],
  neutral: [
    { src: "/memes/zen-trader.png", caption: "Market's flat? Time to chill 😎🧘" },
    { src: "/memes/suspicious-squint.png", caption: "Waiting for the market to pick a direction 🫠" },
  ],
};

const moodConfig = {
  bullish: { emoji: "🟢", label: "Feeling Good", bg: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/20", pulse: "bg-emerald-500" },
  bearish: { emoji: "🔴", label: "Uh Oh", bg: "from-rose-500/10 to-rose-500/5", border: "border-rose-500/20", pulse: "bg-rose-500" },
  cautious: { emoji: "🟡", label: "Eyes Open", bg: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/20", pulse: "bg-amber-500" },
  neutral: { emoji: "⚪", label: "Meh", bg: "from-slate-500/10 to-slate-500/5", border: "border-slate-500/20", pulse: "bg-slate-500" },
};

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const SentimentMeme = () => {
  const { data: sellSignals = [] } = useSellSignals(true);
  const { data: decision } = useQuery({
    queryKey: ["weekly_picks_meme"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_decisions")
        .select("decision")
        .order("week_ending", { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const sellCount = sellSignals.filter((s) => s.signal === "SELL").length;
  const watchCount = sellSignals.filter((s) => s.signal === "WATCH").length;

  let mood: keyof typeof moodConfig = "neutral";
  if (sellCount >= 2) mood = "bearish";
  else if (decision?.decision === "PICK" && sellCount === 0) mood = "bullish";
  else if (watchCount >= 2) mood = "cautious";

  const config = moodConfig[mood];

  const [currentMeme, setCurrentMeme] = useState<MemeEntry | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    setCurrentMeme(pickRandom(memes[mood]));
  }, [mood]);

  const shuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const pool = memes[mood];
      let next = pickRandom(pool);
      if (pool.length > 1) {
        while (next.src === currentMeme?.src) next = pickRandom(pool);
      }
      setCurrentMeme(next);
      setIsShuffling(false);
    }, 300);
  };

  if (!currentMeme) return null;

  return (
    <Card className={cn("overflow-hidden border", config.border)}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Vibe Check</h2>
            {/* Mood pill inline */}
            <span className="flex items-center gap-1.5 ml-1">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.pulse)} />
                <span className={cn("relative inline-flex rounded-full h-2 w-2", config.pulse)} />
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {config.label} {config.emoji}
              </span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={shuffle}
            className={cn("h-8 w-8 transition-transform", isShuffling && "animate-spin")}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Caption */}
        <p className={cn(
          "text-sm font-medium text-foreground/80 italic transition-opacity duration-300 leading-relaxed mb-3",
          isShuffling ? "opacity-0" : "opacity-100"
        )}>
          "{currentMeme.caption}"
        </p>

        {/* Meme image — full width, capped height */}
        <div className={cn(
          "rounded-lg overflow-hidden transition-all duration-300",
          isShuffling ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}>
          <img
            src={currentMeme.src}
            alt={currentMeme.caption}
            className="w-full h-auto max-h-80 object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </Card>
  );
};
