import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

function getDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

async function finnhubFetch(path: string, apiKey: string) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${FINNHUB_BASE_URL}${path}${sep}token=${apiKey}`);
  if (!res.ok) throw new Error(`Finnhub ${path} returned ${res.status}`);
  return res.json();
}

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!FINNHUB_API_KEY) throw new Error("FINNHUB_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase credentials not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const today = getDateString(0);
    const weekAgo = getDateString(-7);
    const now = new Date();
    const daysUntilSunday = now.getDay() === 0 ? 0 : 7 - now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    const weekEnding = sunday.toISOString().split("T")[0];

    const results = { discovered: 0, tickers: 0, sentiment: 0, fundamentals: 0, sentimentItems: 0, errors: [] as string[] };

    // ── Phase 1: Auto-discover trending tickers ──
    console.log("Phase 1: Discovering trending tickers...");
    try {
      const [buzzData, trendData] = await Promise.all([
        finnhubFetch("/stock/social-sentiment/trending", FINNHUB_API_KEY),
        finnhubFetch("/stock/market-status?exchange=US", FINNHUB_API_KEY),
      ]);

      const trendingSymbols = new Set<string>();

      // Social buzz trending
      if (Array.isArray(buzzData)) {
        for (const item of buzzData.slice(0, 30)) {
          if (item.symbol) trendingSymbols.add(item.symbol);
        }
      }

      // Add symbols from social sentiment trending
      await delay(1200);
      try {
        const redditBuzz = await finnhubFetch("/stock/social-sentiment/buzz", FINNHUB_API_KEY);
        if (redditBuzz?.buzz) {
          // buzz returns aggregates, not symbols — skip
        }
      } catch { /* optional */ }

      // For each discovered symbol, upsert into tickers if not already there
      const { data: existingTickers } = await supabase.from("tickers").select("ticker");
      const existingSet = new Set((existingTickers || []).map((t: any) => t.ticker));

      for (const sym of trendingSymbols) {
        if (existingSet.has(sym)) continue;
        try {
          await delay(1200);
          const profile = await finnhubFetch(`/stock/profile2?symbol=${sym}`, FINNHUB_API_KEY);
          if (profile?.name && profile?.marketCapitalization > 0) {
            await delay(1200);
            const quote = await finnhubFetch(`/quote?symbol=${sym}`, FINNHUB_API_KEY);
            if (quote?.c > 0) {
              await supabase.from("tickers").upsert({
                ticker: sym,
                company_name: profile.name,
                sector: profile.finnhubIndustry || "Unknown",
                price: quote.c,
                market_cap: profile.marketCapitalization || 0,
                avg_dollar_volume: (profile.shareOutstanding || 0) * quote.c * 0.01,
              }, { onConflict: "ticker" });
              results.discovered++;
              console.log(`🆕 Discovered: ${sym} (${profile.name})`);
            }
          }
        } catch (err) {
          console.warn(`Skip discovery ${sym}:`, err);
        }
      }
    } catch (err) {
      console.warn("Discovery phase error (non-fatal):", err);
    }

    // ── Phase 2: Refresh all tracked tickers ──
    console.log("Phase 2: Refreshing all tracked tickers...");
    const { data: allTickers, error: tickErr } = await supabase
      .from("tickers")
      .select("ticker")
      .order("avg_dollar_volume", { ascending: false })
      .limit(60); // Process top 60 by volume to stay within rate limits
    if (tickErr) throw new Error(`Failed to fetch tickers: ${tickErr.message}`);

    const symbols = (allTickers || []).map((t: any) => t.ticker);
    console.log(`Refreshing ${symbols.length} tickers...`);

    for (const symbol of symbols) {
      try {
        await delay(1200);

        // 1. Update ticker price data
        const [quote, profile] = await Promise.all([
          finnhubFetch(`/quote?symbol=${symbol}`, FINNHUB_API_KEY),
          finnhubFetch(`/stock/profile2?symbol=${symbol}`, FINNHUB_API_KEY),
        ]);

        if (quote.c && quote.c > 0) {
          await supabase.from("tickers").upsert({
            ticker: symbol,
            company_name: profile.name || symbol,
            sector: profile.finnhubIndustry || "Unknown",
            price: quote.c,
            market_cap: profile.marketCapitalization || 0,
            avg_dollar_volume: (profile.shareOutstanding || 0) * quote.c * 0.01,
          }, { onConflict: "ticker" });
          results.tickers++;
        }

        await delay(1200);

        // 2. Social sentiment
        let redditMentions = 0, redditEngagement = 0, redditScore = 50;
        let xMentions = 0, xEngagement = 0, xScore = 50;
        let overallScore = 50, confidence = 0.5;

        try {
          const sentData = await finnhubFetch(
            `/stock/social-sentiment?symbol=${symbol}&from=${weekAgo}&to=${today}`, FINNHUB_API_KEY
          );
          if (!sentData.error) {
            const reddit = sentData.reddit || [];
            const twitter = sentData.twitter || [];

            redditMentions = reddit.reduce((s: number, d: any) => s + (d.mention || 0), 0);
            redditEngagement = reddit.reduce((s: number, d: any) => s + (d.positiveMention || 0) + (d.negativeMention || 0), 0) * 50;
            const rPos = reddit.reduce((s: number, d: any) => s + (d.positiveMention || 0), 0);
            const rTotal = reddit.reduce((s: number, d: any) => s + (d.mention || 1), 0) || 1;
            redditScore = Math.round((rPos / rTotal) * 100);

            xMentions = twitter.reduce((s: number, d: any) => s + (d.mention || 0), 0);
            xEngagement = twitter.reduce((s: number, d: any) => s + (d.positiveMention || 0) + (d.negativeMention || 0), 0) * 50;
            const xPos = twitter.reduce((s: number, d: any) => s + (d.positiveMention || 0), 0);
            const xTotal = twitter.reduce((s: number, d: any) => s + (d.mention || 1), 0) || 1;
            xScore = Math.round((xPos / xTotal) * 100);
          }
        } catch { /* use defaults */ }

        // News sentiment
        try {
          await delay(1200);
          const newsData = await finnhubFetch(`/news-sentiment?symbol=${symbol}`, FINNHUB_API_KEY);
          if (!newsData.error) {
            const bullish = (newsData.sentiment?.bullishPercent || 0.5) * 100;
            const newsScore = (newsData.companyNewsScore || 0.5) * 100;
            overallScore = Math.round(bullish * 0.3 + newsScore * 0.2 + redditScore * 0.25 + xScore * 0.25);
            confidence = Math.min(0.95, Math.max(0.4, overallScore / 100));
          }
        } catch { /* use defaults */ }

        await supabase.from("daily_sentiment").upsert({
          date: today,
          ticker: symbol,
          reddit_mentions: redditMentions,
          reddit_engagement: redditEngagement,
          reddit_velocity: 0,
          reddit_sentiment_score: redditScore,
          x_mentions: xMentions,
          x_engagement: xEngagement,
          x_velocity: 0,
          x_sentiment_score: xScore,
          sentiment_score: overallScore,
          confidence,
          reddit_confirmed: redditMentions > 5,
          x_confirmed: xMentions > 5,
        }, { onConflict: "date,ticker", ignoreDuplicates: false });
        results.sentiment++;

        // 3. Fundamentals
        await delay(1200);
        try {
          const finData = await finnhubFetch(`/stock/metric?symbol=${symbol}&metric=all`, FINNHUB_API_KEY);
          if (!finData.error && finData.metric) {
            const m = finData.metric;
            await supabase.from("fundamentals_snapshot").upsert({
              ticker: symbol,
              week_ending: weekEnding,
              pe: m.peBasicExclExtraTTM || null,
              rev_yoy: m.revenueGrowthTTMYoy || null,
              rev_cagr_3y: m.revenueGrowth3Y || null,
              op_margin: m.operatingMarginTTM || null,
              net_margin: m.netProfitMarginTTM || null,
              fcf: m.freeCashFlowTTM || null,
              ev_sales: m.currentEv_freeCashFlowTTM || null,
              cash: m.totalCashPerShareQuarterly || null,
              debt: m.totalDebt_totalEquityQuarterly || null,
              risk_flags: null,
            }, { onConflict: "ticker,week_ending", ignoreDuplicates: false });
            results.fundamentals++;
          }
        } catch { /* skip */ }

        // 4. News items
        await delay(1200);
        try {
          const newsArr = await finnhubFetch(
            `/company-news?symbol=${symbol}&from=${weekAgo}&to=${today}`, FINNHUB_API_KEY
          );
          if (Array.isArray(newsArr) && newsArr.length > 0) {
            for (const n of newsArr.slice(0, 3)) {
              const sentLabel = (n.sentiment || 0) > 0.2 ? "bullish" : (n.sentiment || 0) < -0.2 ? "bearish" : "neutral";
              await supabase.from("sentiment_items").insert({
                ticker: symbol,
                week_ending: weekEnding,
                platform: "news",
                sentiment_label: sentLabel,
                snippet: (n.headline || "").substring(0, 300),
                url: n.url || "",
                engagement: n.id ? 100 : 0,
                velocity: null,
              });
              results.sentimentItems++;
            }
          }
        } catch { /* skip */ }

        console.log(`✅ ${symbol} refreshed`);
      } catch (err) {
        const msg = `${symbol}: ${err instanceof Error ? err.message : "unknown error"}`;
        console.error(`❌ ${msg}`);
        results.errors.push(msg);
      }
    }

    console.log("Data refresh complete:", results);

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Data refresh error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
