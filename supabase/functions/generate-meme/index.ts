import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get latest weekly decision
    const { data: decision } = await supabase
      .from("weekly_decisions")
      .select("decision, pick1, pick2, eli5_summary")
      .order("week_ending", { ascending: false })
      .limit(1)
      .single();

    // Get active sell signals
    const { data: signals } = await supabase
      .from("sell_signals")
      .select("ticker, signal")
      .eq("is_active", true);

    const sellCount = signals?.filter((s) => s.signal === "SELL").length ?? 0;
    const watchCount = signals?.filter((s) => s.signal === "WATCH").length ?? 0;
    const holdCount = signals?.filter((s) => s.signal === "HOLD").length ?? 0;

    // Determine overall mood
    let mood = "neutral";
    if (sellCount >= 2) mood = "bearish";
    else if (decision?.decision === "PICK" && sellCount === 0) mood = "bullish";
    else if (watchCount >= 2) mood = "cautious";

    const picks = [decision?.pick1, decision?.pick2].filter(Boolean).join(" and ");

    const memePrompts: Record<string, string> = {
      bullish: `Create a funny stock market meme image. A happy bull wearing sunglasses and a suit, celebrating with confetti, with a green stock chart going up in the background. Style: cartoon/comic, bold colors, humorous. Include visual text overlay: "WHEN YOUR PICKS ARE ${picks || "PRINTING"}" at the top and "BEARS IN SHAMBLES" at the bottom. Meme format.`,
      bearish: `Create a funny stock market meme image. A worried investor looking at multiple red screens with charts going down, sweating nervously. Style: cartoon/comic, dramatic lighting, humorous. Include visual text overlay: "PORTFOLIO THIS WEEK" at the top and "${sellCount} SELL SIGNALS?! THIS IS FINE 🔥" at the bottom. Meme format.`,
      cautious: `Create a funny stock market meme image. A person squinting suspiciously at a stock chart that keeps going sideways, with a magnifying glass. Style: cartoon/comic, humorous. Include visual text overlay: "ME WATCHING ${watchCount} STOCKS ON WATCH LIST" at the top and "MAKE A MOVE ALREADY" at the bottom. Meme format.`,
      neutral: `Create a funny stock market meme image. A zen master meditating peacefully while stock tickers fly around chaotically. Style: cartoon/comic, humorous contrast. Include visual text overlay: "THE MARKET THIS WEEK" at the top and "PERFECTLY BALANCED, AS ALL THINGS SHOULD BE" at the bottom. Meme format.`,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: memePrompts[mood],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    // Upload to storage
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    
    const fileName = `meme-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("memes")
      .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

    if (uploadError) {
      // If bucket doesn't exist, return the base64 directly
      return new Response(JSON.stringify({ imageUrl, mood }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrl } = supabase.storage.from("memes").getPublicUrl(fileName);

    return new Response(JSON.stringify({ imageUrl: publicUrl.publicUrl, mood }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Meme generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
