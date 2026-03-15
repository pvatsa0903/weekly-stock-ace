import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get latest weekly decision
    const { data: decision } = await supabase
      .from("weekly_decisions")
      .select("pick1, pick2, decision, eli5_summary, pick1_confidence, pick2_confidence, week_ending")
      .order("week_ending", { ascending: false })
      .limit(1)
      .single();

    // Get active sell signals
    const { data: signals } = await supabase
      .from("sell_signals")
      .select("ticker, signal, confidence")
      .eq("is_active", true)
      .order("confidence", { ascending: false })
      .limit(3);

    const weekLabel = decision?.week_ending
      ? new Date(decision.week_ending + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "This Week";

    const pick1 = decision?.pick1 || null;
    const pick2 = decision?.pick2 || null;
    const pick1Conf = decision?.pick1_confidence ?? null;
    const pick2Conf = decision?.pick2_confidence ?? null;
    const decisionType = decision?.decision || "SKIP";
    const eli5 = decision?.eli5_summary || "";
    // Truncate eli5 for the image
    const eli5Short = eli5.length > 120 ? eli5.slice(0, 117) + "…" : eli5;

    const sellSignals = (signals || []).filter((s) => s.signal === "SELL");
    const watchSignals = (signals || []).filter((s) => s.signal === "WATCH" || s.signal === "HOLD");

    // Build pick pills
    const pickPills = [pick1, pick2].filter(Boolean).map((ticker, i) => {
      const conf = i === 0 ? pick1Conf : pick2Conf;
      return `
        <g transform="translate(${i * 220}, 0)">
          <rect x="0" y="0" width="200" height="52" rx="26" fill="#10b981" opacity="0.15"/>
          <text x="20" y="33" font-family="monospace, sans-serif" font-size="20" font-weight="bold" fill="#10b981">${ticker}</text>
          ${conf != null ? `<text x="180" y="33" font-family="sans-serif" font-size="14" fill="#10b981" text-anchor="end">${conf}%</text>` : ""}
        </g>`;
    }).join("");

    // Build sell signal pills
    const sellPills = sellSignals.slice(0, 2).map((s, i) => `
      <g transform="translate(${i * 180}, 0)">
        <rect x="0" y="0" width="160" height="40" rx="20" fill="#ef4444" opacity="0.15"/>
        <text x="16" y="26" font-family="monospace, sans-serif" font-size="16" font-weight="bold" fill="#ef4444">⚠ ${s.ticker}</text>
        <text x="144" y="26" font-family="sans-serif" font-size="12" fill="#ef4444" text-anchor="end">${s.confidence}%</text>
      </g>`).join("");

    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      <rect width="1200" height="630" fill="url(#grid)"/>

      <!-- Top accent line -->
      <rect x="0" y="0" width="1200" height="4" fill="#e11d48"/>

      <!-- Logo area -->
      <g transform="translate(60, 48)">
        <rect width="44" height="44" rx="10" fill="#e11d48"/>
        <text x="22" y="30" font-family="sans-serif" font-size="22" fill="white" text-anchor="middle" font-weight="bold">↗</text>
        <text x="60" y="32" font-family="sans-serif" font-size="24" font-weight="bold" fill="white">StockPulse</text>
      </g>

      <!-- Week label -->
      <text x="1140" y="78" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="end">Week of ${weekLabel}</text>

      <!-- Divider -->
      <line x1="60" y1="110" x2="1140" y2="110" stroke="#334155" stroke-width="1"/>

      <!-- Main heading -->
      <text x="60" y="170" font-family="sans-serif" font-size="40" font-weight="bold" fill="white">
        ${decisionType === "PICK" ? "This Week's AI Picks" : "AI Decision: SKIP"}
      </text>

      <!-- Pick pills -->
      ${pick1 || pick2 ? `<g transform="translate(60, 200)">${pickPills}</g>` : `<text x="60" y="230" font-family="sans-serif" font-size="18" fill="#64748b">No picks this week — conditions didn't meet threshold</text>`}

      <!-- ELI5 summary -->
      ${eli5Short ? `<text x="60" y="290" font-family="sans-serif" font-size="16" fill="#94a3b8" textLength="1080" lengthAdjust="spacing">${escapeXml(eli5Short)}</text>` : ""}

      <!-- Sell signals section -->
      ${sellSignals.length > 0 ? `
        <text x="60" y="360" font-family="sans-serif" font-size="18" font-weight="bold" fill="#ef4444">Active Sell Signals</text>
        <g transform="translate(60, 380)">${sellPills}</g>
      ` : ""}

      <!-- Footer -->
      <line x1="60" y1="540" x2="1140" y2="540" stroke="#334155" stroke-width="1"/>
      <text x="60" y="580" font-family="sans-serif" font-size="14" fill="#64748b">AI-Powered Sentiment Analysis · Reddit · X · StockTwits · News</text>
      <text x="1140" y="580" font-family="sans-serif" font-size="14" fill="#64748b" text-anchor="end">stockpulse.app</text>
    </svg>`;

    // Return SVG as PNG would require additional deps — return SVG with proper content type
    // Most platforms support SVG OG images, and we set a PNG fallback in HTML meta tags
    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("OG image generation failed:", error);
    // Redirect to static fallback
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: "https://weekly-stock-ace.lovable.app/og-default.png",
      },
    });
  }
});

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
