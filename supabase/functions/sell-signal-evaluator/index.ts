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

    // 1. Get all previously picked tickers (active positions)
    const { data: decisions, error: decErr } = await supabase
      .from("weekly_decisions")
      .select("pick1, pick2, week_ending")
      .eq("decision", "PICK")
      .order("week_ending", { ascending: false });
    if (decErr) throw new Error(`Failed to fetch decisions: ${decErr.message}`);

    // Collect unique picked tickers
    const pickedTickers = new Set<string>();
    (decisions || []).forEach((d) => {
      if (d.pick1) pickedTickers.add(d.pick1);
      if (d.pick2) pickedTickers.add(d.pick2);
    });

    if (pickedTickers.size === 0) {
      return new Response(
        JSON.stringify({ message: "No picked tickers to evaluate", signals: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tickerList = Array.from(pickedTickers);

    // 2. Fetch sentiment data (last 14 days for trend)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const { data: sentiment } = await supabase
      .from("daily_sentiment")
      .select("*")
      .in("ticker", tickerList)
      .gte("date", fourteenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    // 3. Fetch fundamentals
    const { data: fundamentals } = await supabase
      .from("fundamentals_snapshot")
      .select("*")
      .in("ticker", tickerList)
      .order("week_ending", { ascending: false });

    // 4. Fetch ticker info
    const { data: tickers } = await supabase
      .from("tickers")
      .select("*")
      .in("ticker", tickerList);

    // 5. Fetch recent sentiment items
    const { data: sentimentItems } = await supabase
      .from("sentiment_items")
      .select("*")
      .in("ticker", tickerList)
      .order("week_ending", { ascending: false })
      .limit(200);

    // 6. Fetch pick performance (entry prices)
    const { data: performance } = await supabase
      .from("pick_performance")
      .select("*")
      .in("ticker", tickerList);

    // 7. Build context per ticker
    const tickerContexts = tickerList.map((ticker) => {
      const tickerSentiment = (sentiment || []).filter((s) => s.ticker === ticker);
      const tickerFund = (fundamentals || []).find((f) => f.ticker === ticker);
      const tickerInfo = (tickers || []).find((t) => t.ticker === ticker);
      const tickerPosts = (sentimentItems || []).filter((si) => si.ticker === ticker);
      const tickerPerf = (performance || []).filter((p) => p.ticker === ticker);

      // Calculate sentiment trend (first 7 days vs last 7 days)
      const midPoint = tickerSentiment.length > 1 ? Math.floor(tickerSentiment.length / 2) : 0;
      const firstHalf = tickerSentiment.slice(0, midPoint);
      const secondHalf = tickerSentiment.slice(midPoint);
      const avgFirst = firstHalf.length > 0
        ? firstHalf.reduce((s, d) => s + d.sentiment_score, 0) / firstHalf.length
        : 0;
      const avgSecond = secondHalf.length > 0
        ? secondHalf.reduce((s, d) => s + d.sentiment_score, 0) / secondHalf.length
        : 0;
      const sentimentChange = avgSecond - avgFirst;

      return {
        ticker,
        company: tickerInfo?.company_name || ticker,
        sector: tickerInfo?.sector || "Unknown",
        currentPrice: tickerInfo?.price || 0,
        sentiment: {
          current_score: avgSecond.toFixed(2),
          previous_score: avgFirst.toFixed(2),
          change: sentimentChange.toFixed(2),
          data_points: tickerSentiment.length,
          recent_reddit_mentions: tickerSentiment.slice(-7).reduce((s, d) => s + d.reddit_mentions, 0),
          recent_x_mentions: tickerSentiment.slice(-7).reduce((s, d) => s + d.x_mentions, 0),
        },
        fundamentals: tickerFund
          ? {
              pe: tickerFund.pe,
              rev_yoy: tickerFund.rev_yoy,
              op_margin: tickerFund.op_margin,
              net_margin: tickerFund.net_margin,
              fcf: tickerFund.fcf,
              ev_sales: tickerFund.ev_sales,
              debt: tickerFund.debt,
              cash: tickerFund.cash,
              risk_flags: tickerFund.risk_flags,
            }
          : null,
        recent_posts: tickerPosts.slice(0, 5).map((p) => ({
          platform: p.platform,
          sentiment: p.sentiment_label,
          snippet: p.snippet.substring(0, 120),
          engagement: p.engagement,
        })),
        performance: tickerPerf.map((p) => ({
          week: p.week_ending,
          entry: p.entry_price,
          exit: p.exit_price,
          return_pct: p.return_pct,
          is_win: p.is_win,
        })),
      };
    });

    // 8. Call AI for sell signal evaluation
    const systemPrompt = `You are a risk-focused investment analyst. Your job is to evaluate stocks that were previously PICKED and determine if any should now be SOLD, put on WATCH, or continue to HOLD.

EVALUATION CRITERIA:
1. SENTIMENT DETERIORATION: Is sentiment trending downward? Are mentions declining? Is social buzz turning negative?
2. FUNDAMENTAL RED FLAGS: Margin compression, revenue deceleration, high debt-to-cash, elevated valuation (P/E, EV/Sales), risk flags
3. MOMENTUM LOSS: Declining engagement, bearish shift in recent posts, price weakness

SIGNAL TYPES:
- SELL: Strong evidence across 2+ criteria that the stock should be exited. Confidence 70-95.
- WATCH: Early warning signs but not conclusive. Monitor closely. Confidence 50-70.
- HOLD: Position looks healthy, no action needed. Confidence 60-90.

OUTPUT FORMAT (strict JSON only):
{
  "signals": [
    {
      "ticker": "AAAA",
      "signal": "SELL" | "WATCH" | "HOLD",
      "confidence": 50-95,
      "reasoning": "2-3 sentence explanation of why this signal was triggered, referencing specific data points",
      "key_risks": "Comma-separated list of specific risk factors (e.g. 'Sentiment -15% WoW, P/E stretched at 45x, declining Reddit mentions')"
    }
  ]
}

Always return valid JSON only — no markdown, no code fences.
Return a signal for EVERY ticker provided.`;

    const userPrompt = `Evaluate these previously-picked stocks for sell signals:

${JSON.stringify(tickerContexts, null, 2)}

For each ticker, determine: SELL, WATCH, or HOLD. Reference specific numbers from the data.`;

    console.log(`Evaluating ${tickerList.length} tickers for sell signals...`);

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
      throw new Error(`AI gateway error [${aiResponse.status}]: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("No content returned from AI");

    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(cleanJson);

    // 9. Deactivate old signals for these tickers
    await supabase
      .from("sell_signals")
      .update({ is_active: false, resolved_at: new Date().toISOString() })
      .in("ticker", tickerList)
      .eq("is_active", true);

    // 10. Insert new signals
    const signalsToInsert = (result.signals || []).map((s: any) => {
      const ctx = tickerContexts.find((t) => t.ticker === s.ticker);
      return {
        ticker: s.ticker,
        signal: s.signal,
        confidence: s.confidence,
        reasoning: s.reasoning,
        sentiment_score: ctx ? parseFloat(ctx.sentiment.current_score) : null,
        sentiment_change: ctx ? parseFloat(ctx.sentiment.change) : null,
        fundamental_flags: s.key_risks || null,
        price_at_signal: ctx?.currentPrice || null,
        is_active: true,
      };
    });

    if (signalsToInsert.length > 0) {
      const { error: insertErr } = await supabase
        .from("sell_signals")
        .insert(signalsToInsert);
      if (insertErr) throw new Error(`Failed to save signals: ${insertErr.message}`);
    }

    console.log(`Saved ${signalsToInsert.length} sell signals`);

    return new Response(
      JSON.stringify({ success: true, signals: result.signals }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sell signal evaluator error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
