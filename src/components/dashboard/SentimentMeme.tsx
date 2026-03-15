import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSellSignals } from "@/hooks/useSellSignals";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MemeEntry {
  src: string;
  caption: string;
}

const memes: Record<string, MemeEntry[]> = {
  bullish: [
    { src: "/memes/stonks.png", caption: "Portfolio looking real good rn 📈" },
    { src: "/memes/leo-pointing.png", caption: "Me seeing my picks go green" },
  ],
  bearish: [
    { src: "/memes/this-is-fine.png", caption: "2 sell signals? This is fine. 🔥" },
    { src: "/memes/not-stonks.png", caption: "When the market said sike" },
    { src: "/memes/panic-sell.png", caption: "Checking the portfolio this morning" },
  ],
  cautious: [
    { src: "/memes/suspicious-squint.png", caption: "Not sure if dip or cliff 🤔" },
    { src: "/memes/nervous-sweating.png", caption: "Me watching my watchlist" },
  ],
  neutral: [
    { src: "/memes/zen-trader.png", caption: "Market's flat? Time to chill 😎" },
    { src: "/memes/suspicious-squint.png", caption: "Waiting for the market to pick a direction" },
  ],
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

  let mood = "neutral";
  if (sellCount >= 2) mood = "bearish";
  else if (decision?.decision === "PICK" && sellCount === 0) mood = "bullish";
  else if (watchCount >= 2) mood = "cautious";

  const [currentMeme, setCurrentMeme] = useState<MemeEntry | null>(null);

  useEffect(() => {
    setCurrentMeme(pickRandom(memes[mood]));
  }, [mood]);

  const shuffle = () => {
    const pool = memes[mood];
    let next = pickRandom(pool);
    // Avoid showing the same meme twice in a row
    if (pool.length > 1) {
      while (next.src === currentMeme?.src) next = pickRandom(pool);
    }
    setCurrentMeme(next);
  };

  if (!currentMeme) return null;

  return (
    <Card className="p-5 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Vibe Check 📊</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={shuffle} className="min-h-[44px] min-w-[44px]">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground italic text-center">{currentMeme.caption}</p>

      <div className="rounded-lg overflow-hidden border border-border">
        <img
          src={currentMeme.src}
          alt={currentMeme.caption}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
    </Card>
  );
};
