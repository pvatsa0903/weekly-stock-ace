import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch top tickers by dollar volume
    const { data: tickers, error: tickersErr } = await supabase
      .from("tickers")
      .select("*")
      .order("avg_dollar_volume", { ascending: false })
      .limit(50);
    if (tickersErr) throw new Error(`Failed to fetch tickers: ${tickersErr.message}`);

    // 2. Fetch latest sentiment data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: sentiment, error: sentimentErr } = await supabase
      .from("daily_sentiment")
      .select("*")
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });
    if (sentimentErr) throw new Error(`Failed to fetch sentiment: ${sentimentErr.message}`);

    // 3. Fetch latest fundamentals
    const { data: fundamentals, error: fundErr } = await supabase
      .from("fundamentals_snapshot")
      .select("*")
      .order("week_ending", { ascending: false })
      .limit(100);
    if (fundErr) throw new Error(`Failed to fetch fundamentals: ${fundErr.message}`);

    // 4. Fetch recent sentiment items (social posts)
    const { data: sentimentItems, error: itemsErr } = await supabase
      .from("sentiment_items")
      .select("*")
      .order("week_ending", { ascending: false })
      .limit(200);
    if (itemsErr) throw new Error(`Failed to fetch sentiment items: ${itemsErr.message}`);

    // 5. Build context for AI
    const tickerSummaries = (tickers || []).map((t) => {
      const tickerSentiment = (sentiment || []).filter((s) => s.ticker === t.ticker);
      const tickerFundamentals = (fundamentals || []).find((f) => f.ticker === t.ticker);
      const tickerPosts = (sentimentItems || []).filter((si) => si.ticker === t.ticker);

      const avgSentiment = tickerSentiment.length > 0
        ? (tickerSentiment.reduce((sum, s) => sum + s.sentiment_score, 0) / tickerSentiment.length).toFixed(2)
        : "N/A";
      const avgConfidence = tickerSentiment.length > 0
        ? (tickerSentiment.reduce((sum, s) => sum + s.confidence, 0) / tickerSentiment.length).toFixed(2)
        : "N/A";
      const totalRedditMentions = tickerSentiment.reduce((sum, s) => sum + s.reddit_mentions, 0);
      const totalXMentions = tickerSentiment.reduce((sum, s) => sum + s.x_mentions, 0);
      const totalEngagement = tickerSentiment.reduce(
        (sum, s) => sum + s.reddit_engagement + s.x_engagement,
        0
      );

      return {
        ticker: t.ticker,
        company: t.company_name,
        sector: t.sector,
        price: t.price,
        marketCap: t.market_cap,
        sentiment: {
          avg_score: avgSentiment,
          avg_confidence: avgConfidence,
          reddit_mentions_7d: totalRedditMentions,
          x_mentions_7d: totalXMentions,
          total_engagement_7d: totalEngagement,
        },
        fundamentals: tickerFundamentals
          ? {
              pe: tickerFundamentals.pe,
              rev_yoy: tickerFundamentals.rev_yoy,
              rev_cagr_3y: tickerFundamentals.rev_cagr_3y,
              op_margin: tickerFundamentals.op_margin,
              net_margin: tickerFundamentals.net_margin,
              fcf: tickerFundamentals.fcf,
              ev_sales: tickerFundamentals.ev_sales,
              cash: tickerFundamentals.cash,
              debt: tickerFundamentals.debt,
              risk_flags: tickerFundamentals.risk_flags,
            }
          : null,
        recent_posts: tickerPosts.slice(0, 5).map((p) => ({
          platform: p.platform,
          sentiment: p.sentiment_label,
          snippet: p.snippet.substring(0, 150),
          engagement: p.engagement,
        })),
      };
    });

    const today = new Date();
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()));
    const weekEnding = nextSunday.toISOString().split("T")[0];

    const systemPrompt = `You are an intelligent investment analyst. You monitor social sentiment from Reddit (r/stocks, r/investing, r/wallstreetbets), X (Twitter), StockTwits, and Yahoo News. Your job is to analyze all this context in one place and recommend stocks worth picking up or skipping.

CRITICAL RULES:
- Only recommend when ALL THREE layers align: sustained sentiment + fundamental confirmation + consistent engagement
- If the three layers do NOT align for any stock, respond with zero picks
- You must return EXACTLY this JSON structure, no other text

ANALYSIS LAYERS:
1. SENTIMENT: Look for sustained positive/negative sentiment across Reddit, X, and news — not just a one-day spike
2. FUNDAMENTALS: Revenue growth, margins, valuation (P/E, EV/Sales), cash position, debt levels, risk flags
3. ENGAGEMENT: Consistent mention volume and engagement over 7 days, not just viral moments

OUTPUT FORMAT (strict JSON only):
{
  "pick_count": 0 | 1 | 2,
  "pick1": {
    "ticker": "AAAA",
    "decision": "PICK" | "SKIP",
    "confidence": 65-95,
    "eli5": "A 2-3 sentence explanation using words and analogies an actual 5-year-old would understand — use playground metaphors, toys, candy, lemonade stands, allowance money, recess, etc. Keep it fun and silly!",
    "why": "A 2-3 sentence technical rationale covering sentiment + fundamentals + engagement alignment"
  },
  "pick2": {
    "ticker": "BBBB",
    "decision": "PICK" | "SKIP",
    "confidence": 65-95,
    "eli5": "...",
    "why": "..."
  },
  "overall_summary": "A 2-3 sentence weekly market summary"
}

If zero picks: set pick_count to 0, pick1 and pick2 to null, and explain why in overall_summary.
If only one strong pick: set pick_count to 1, pick2 to null.
Always return valid JSON only — no markdown, no code fences, no explanation outside the JSON.`;

    const userPrompt = `Here is this week's data for the top 50 stocks by dollar volume. Analyze all three layers (sentiment, fundamentals, engagement) and give me your recommendations.

DATA:
${JSON.stringify(tickerSummaries, null, 2)}

Remember: Only PICK when ALL THREE layers align. Otherwise, zero picks this week.`;

    console.log("Sending data to AI gateway...");

    // 6. Call AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Add credits to workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error [${aiResponse.status}]: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("No content returned from AI");

    console.log("AI raw response:", rawContent);

    // 7. Parse AI response (strip code fences if present)
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(cleanJson);

    // 8. Determine decision type for the weekly_decisions record
    const pickCount = result.pick_count || 0;
    const decision = pickCount > 0 ? "PICK" : "SKIP";
    const pick1 = result.pick1?.ticker || null;
    const pick2 = result.pick2?.ticker || null;
    const pick1Confidence = result.pick1?.confidence || null;
    const pick2Confidence = result.pick2?.confidence || null;
    const eli5Summary = pickCount > 0
      ? [result.pick1?.eli5, result.pick2?.eli5].filter(Boolean).join(" | ")
      : result.overall_summary || "No strong picks this week — layers did not align.";
    const whySummary = pickCount > 0
      ? [result.pick1?.why, result.pick2?.why].filter(Boolean).join(" | ")
      : result.overall_summary || "Sentiment, fundamentals, and engagement did not converge on any stock.";

    // 9. Upsert into weekly_decisions
    const { error: upsertErr } = await supabase
      .from("weekly_decisions")
      .upsert(
        {
          week_ending: weekEnding,
          decision,
          pick1,
          pick2,
          pick1_confidence: pick1Confidence,
          pick2_confidence: pick2Confidence,
          eli5_summary: eli5Summary,
          why_summary: whySummary,
        },
        { onConflict: "week_ending" }
      );

    if (upsertErr) {
      console.error("Failed to save decision:", upsertErr);
      const { error: insertErr } = await supabase.from("weekly_decisions").insert({
        week_ending: weekEnding,
        decision,
        pick1,
        pick2,
        pick1_confidence: pick1Confidence,
        pick2_confidence: pick2Confidence,
        eli5_summary: eli5Summary,
        why_summary: whySummary,
      });
      if (insertErr) throw new Error(`Failed to save decision: ${insertErr.message}`);
    }

    console.log(`Weekly decision saved: ${decision}, picks: ${pick1}(${pick1Confidence}%), ${pick2}(${pick2Confidence}%)`);

    return new Response(
      JSON.stringify({
        success: true,
        decision,
        pick1,
        pick2,
        eli5_summary: eli5Summary,
        why_summary: whySummary,
        ai_result: result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("AI stock picker error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
