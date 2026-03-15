import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const moodLabels: Record<string, { text: string; emoji: string }> = {
  bullish: { text: "Bullish vibes this week", emoji: "🐂" },
  bearish: { text: "Bearish energy detected", emoji: "🐻" },
  cautious: { text: "Proceed with caution", emoji: "👀" },
  neutral: { text: "Market zen mode", emoji: "🧘" },
};

export const SentimentMeme = () => {
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMeme = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meme");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMemeUrl(data.imageUrl);
      setMood(data.mood);
    } catch (err: any) {
      toast.error(err.message || "Meme generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const moodInfo = mood ? moodLabels[mood] ?? moodLabels.neutral : null;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Meme of the Week</h3>
        </div>
        {memeUrl && (
          <Button variant="ghost" size="icon" onClick={generateMeme} disabled={isGenerating} className="h-7 w-7">
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>

      {!memeUrl && !isGenerating && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <p className="text-sm text-muted-foreground text-center">
            Generate an AI meme based on this week's market sentiment
          </p>
          <Button size="sm" onClick={generateMeme}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Meme
          </Button>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cooking up a fresh meme…</p>
        </div>
      )}

      {memeUrl && !isGenerating && (
        <div className="space-y-3">
          {moodInfo && (
            <p className="text-xs text-muted-foreground text-center">
              {moodInfo.emoji} {moodInfo.text}
            </p>
          )}
          <div className="rounded-lg overflow-hidden border border-border">
            <img
              src={memeUrl}
              alt="AI-generated market sentiment meme"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </Card>
  );
};
