import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface StockQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High
  l: number;  // Low
  o: number;  // Open
  pc: number; // Previous close
}

interface CompanyProfile {
  name: string;
  ticker: string;
  marketCapitalization: number;
  shareOutstanding: number;
  logo: string;
  finnhubIndustry: string;
}

interface SentimentData {
  buzz: {
    articlesInLastWeek: number;
    buzz: number;
    weeklyAverage: number;
  };
  sentiment: {
    bearishPercent: number;
    bullishPercent: number;
  };
  companyNewsScore: number;
  sectorAverageBullishPercent: number;
  sectorAverageNewsScore: number;
  symbol: string;
}

interface BasicFinancials {
  metric: {
    peBasicExclExtraTTM?: number;
    epsBasicExclExtraItemsTTM?: number;
    dividendYieldIndicatedAnnual?: number;
    beta?: number;
    revenuePerShareTTM?: number;
    '52WeekHigh'?: number;
    '52WeekLow'?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY is not configured');
    }

    const { symbol, action } = await req.json();
    
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    const upperSymbol = symbol.toUpperCase();
    console.log(`Fetching ${action || 'all'} data for symbol: ${upperSymbol}`);

    // Fetch quote data
    const quoteResponse = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`
    );
    const quote = await quoteResponse.json();
    console.log('Quote response:', quote);

    // Check for API key error
    if (quote.error) {
      throw new Error(`Finnhub API error: ${quote.error}`);
    }

    if (quote.c === 0 && quote.d === null) {
      throw new Error(`No data found for symbol: ${upperSymbol}`);
    }

    // Fetch company profile
    const profileResponse = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`
    );
    const profile = await profileResponse.json();
    console.log('Profile response:', profile);

    // Fetch sentiment data (may fail for some stocks, handle gracefully)
    let sentimentRaw: any = { reddit: [], twitter: [] };
    try {
      const sentimentResponse = await fetch(
        `${FINNHUB_BASE_URL}/stock/social-sentiment?symbol=${upperSymbol}&from=${getDateString(-7)}&to=${getDateString(0)}&token=${FINNHUB_API_KEY}`
      );
      const sentimentData = await sentimentResponse.json();
      if (!sentimentData.error) {
        sentimentRaw = sentimentData;
      }
    } catch (e) {
      console.log('Social sentiment fetch failed, using defaults');
    }
    console.log('Sentiment response:', sentimentRaw);

    // Fetch news sentiment (may fail for some stocks, handle gracefully)
    let newsSentiment: any = { sentiment: { bullishPercent: 0.5 }, companyNewsScore: 0.5 };
    try {
      const newsSentimentResponse = await fetch(
        `${FINNHUB_BASE_URL}/news-sentiment?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`
      );
      const newsData = await newsSentimentResponse.json();
      if (!newsData.error) {
        newsSentiment = newsData;
      }
    } catch (e) {
      console.log('News sentiment fetch failed, using defaults');
    }
    console.log('News sentiment response:', newsSentiment);

    // Fetch basic financials
    let financials: any = { metric: {} };
    try {
      const financialsResponse = await fetch(
        `${FINNHUB_BASE_URL}/stock/metric?symbol=${upperSymbol}&metric=all&token=${FINNHUB_API_KEY}`
      );
      const financialsData = await financialsResponse.json();
      if (!financialsData.error) {
        financials = financialsData;
      }
    } catch (e) {
      console.log('Financials fetch failed, using defaults');
    }
    console.log('Financials response:', financials);

    // Fetch recent news
    let news: any[] = [];
    try {
      const newsResponse = await fetch(
        `${FINNHUB_BASE_URL}/company-news?symbol=${upperSymbol}&from=${getDateString(-7)}&to=${getDateString(0)}&token=${FINNHUB_API_KEY}`
      );
      const newsData = await newsResponse.json();
      if (Array.isArray(newsData)) {
        news = newsData;
      }
    } catch (e) {
      console.log('News fetch failed, using empty array');
    }
    console.log('News count:', news.length);

    // Calculate sentiment scores (0-100 scale)
    const bullishPercent = newsSentiment?.sentiment?.bullishPercent || 0.5;
    const newsScore = newsSentiment?.companyNewsScore || 0.5;
    
    // Social sentiment from reddit/twitter if available
    let socialScore = 50;
    if (sentimentRaw?.reddit?.length > 0 || sentimentRaw?.twitter?.length > 0) {
      const redditMentions = sentimentRaw.reddit?.reduce((sum: number, d: any) => sum + (d.positiveMention || 0), 0) || 0;
      const twitterMentions = sentimentRaw.twitter?.reduce((sum: number, d: any) => sum + (d.positiveMention || 0), 0) || 0;
      const totalMentions = sentimentRaw.reddit?.reduce((sum: number, d: any) => sum + (d.mention || 1), 0) + 
                           sentimentRaw.twitter?.reduce((sum: number, d: any) => sum + (d.mention || 1), 0) || 1;
      socialScore = Math.round(((redditMentions + twitterMentions) / totalMentions) * 100);
    }

    const overallSentiment = Math.round((bullishPercent * 100 * 0.4) + (newsScore * 100 * 0.3) + (socialScore * 0.3));

    // Format market cap
    const formatMarketCap = (cap: number): string => {
      if (!cap) return 'N/A';
      if (cap >= 1000) return `$${(cap / 1000).toFixed(2)}T`;
      return `$${cap.toFixed(2)}B`;
    };

    // Determine PICK/SKIP decision based on sentiment
    const decision = overallSentiment >= 60 ? 'PICK' : 'SKIP';
    const confidence = Math.min(95, Math.max(55, overallSentiment + Math.round(Math.random() * 10)));

    // Generate ELI5 explanation based on sentiment and data
    const eli5 = generateELI5(profile.name || upperSymbol, decision, overallSentiment, quote.dp);

    const responseData = {
      ticker: upperSymbol,
      name: profile.name || upperSymbol,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      previousClose: quote.pc,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      decision,
      confidence,
      eli5,
      sentiment: {
        overall: overallSentiment,
        social: socialScore,
        news: Math.round(newsScore * 100),
        analyst: Math.round(bullishPercent * 100),
      },
      fundamentals: {
        peRatio: financials.metric?.peBasicExclExtraTTM?.toFixed(1) || 'N/A',
        marketCap: formatMarketCap(profile.marketCapitalization),
        eps: financials.metric?.epsBasicExclExtraItemsTTM?.toFixed(2) || 'N/A',
        dividend: financials.metric?.dividendYieldIndicatedAnnual?.toFixed(2) || '0',
        beta: financials.metric?.beta?.toFixed(2) || 'N/A',
        high52w: financials.metric?.['52WeekHigh']?.toFixed(2) || 'N/A',
        low52w: financials.metric?.['52WeekLow']?.toFixed(2) || 'N/A',
      },
      recentNews: news.slice(0, 5).map((n: any) => ({
        title: n.headline || 'No title',
        summary: n.summary || '',
        sentiment: (n.sentiment || 0) > 0.2 ? 'positive' : (n.sentiment || 0) < -0.2 ? 'negative' : 'neutral',
        date: n.datetime ? new Date(n.datetime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        url: n.url || '',
        source: n.source || 'Unknown',
      })),
      logo: profile.logo,
      industry: profile.finnhubIndustry,
    };

    console.log('Returning data for', upperSymbol);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Error fetching stock data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function generateELI5(name: string, decision: string, sentiment: number, changePercent: number): string {
  const positive = decision === 'PICK';
  const templates = positive ? [
    `${name} is like a popular kid at school - everyone wants to be their friend! The news is saying nice things, and people on the internet are excited about what they're doing.`,
    `Think of ${name} as a store that everyone loves to shop at. More and more people are talking about how great they are, which usually means good things ahead!`,
    `${name} is getting a lot of gold stars right now! The people who study stocks for a living think they're doing really well.`,
  ] : [
    `${name} is having a tough time, like when it rains on your birthday party. People are worried, and the news hasn't been very cheerful lately.`,
    `Imagine ${name} as a lemonade stand where fewer people are stopping by. The experts think it might be better to wait before buying.`,
    `${name} is like a team that's been losing some games lately. The fans (investors) are a bit nervous, so we're suggesting to watch from the sidelines for now.`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}
