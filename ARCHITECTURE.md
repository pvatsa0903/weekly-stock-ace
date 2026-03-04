# Architecture: StockPulse

## Overview

**StockPulse** is an AI-driven stock recommendation engine that ingests market data from multiple sources, processes it through an LLM-powered sentiment analysis pipeline, and surfaces two actionable weekly stock picks — with a **human-in-the-loop** review step for responsible AI deployment.

---

## System Architecture

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Data Ingestion   │───▶│  AI Sentiment    │───▶│  Human Review    │───▶│  Publication     │
│  (Weekly Cron)    │    │  Analysis (LLM)  │    │  (Override Gate) │    │  (Dashboard)     │
└──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
        │                       │                       │                       │
   Finnhub API            Gemini Flash Lite       Bias checks              Weekly picks
   StockTwits API         News headline scoring   Factual review           Confidence scores
   AI-estimated data      Multi-source blend      Final decision           ELI5 summaries
```

---

## Data Pipeline (`refresh-data` Edge Function)

### Phase 1: Ticker Discovery
- Fetches trending tickers from Finnhub social sentiment API
- Discovers new high-volume stocks to add to the universe
- Currently tracks ~50 tickers by dollar volume

### Phase 2: Per-Ticker Data Collection

For each tracked ticker, the pipeline executes sequentially:

| Step | Source | What's Collected | Fallback |
|------|--------|-----------------|----------|
| 1. Price & Profile | Finnhub `/quote` + `/profile2` | Price, market cap, sector | Skip ticker |
| 2. News Sentiment | Finnhub `/news-sentiment` | Bullish %, article count | Default 50 |
| 3. News Headlines | Finnhub `/company-news` | Recent headlines for AI | Empty array |
| 4. AI Analysis | Lovable AI Gateway (Gemini) | Sentiment score + confidence | Score: 50 |
| 5. Social Sentiment | Finnhub `/social-sentiment` | Reddit & X mentions | AI-estimated |
| 6. StockTwits | StockTwits `/streams/symbol` | Mentions, bullish/bearish | AI-estimated |

### Phase 3: Score Computation

The overall sentiment score uses a **weighted blend**:

| Source | Weight | Description |
|--------|--------|-------------|
| AI Analysis | 30% | LLM analysis of news headlines |
| Finnhub News | 20% | Finnhub's news sentiment score |
| Reddit | 15% | Social mentions + sentiment |
| X (Twitter) | 15% | Social mentions + sentiment |
| StockTwits | 20% | Real-time trader sentiment |

**Confidence** is computed from: AI confidence (50%) + news volume (30%) + StockTwits activity (20%).

### Smart Fallbacks

When social APIs return empty data (common on Finnhub free tier):

- **Reddit mentions**: Estimated from news volume and StockTwits data with a floor of 5
- **X mentions**: Estimated from news volume with a floor of 8
- **Scores**: AI-generated score used as proxy with small random variation

---

## AI Integration

### Sentiment Analysis (Per-Ticker)
- **Model**: `google/gemini-2.5-flash-lite` via Lovable AI Gateway
- **Input**: Up to 8 recent news headlines per ticker
- **Output**: `{ score: 0-100, confidence: 0.0-1.0 }`
- **Temperature**: 0.1 (deterministic)
- **Max tokens**: 100

### Weekly Stock Picker
- **Model**: LLM via Lovable AI Gateway
- **Input**: Aggregated fundamentals, sentiment, and market data for all tickers
- **Output**: Structured JSON with 2 picks, confidence %, ELI5 summaries, and rationale
- **Scoring factors**: Revenue growth, margins, valuation, sentiment, velocity, risk flags

---

## Database Schema

### `tickers`
Universe of tracked stocks: ticker, company name, sector, price, market cap, avg dollar volume.

### `daily_sentiment`
Daily aggregated sentiment per ticker:
- Reddit: mentions, engagement, velocity, sentiment score, confirmed flag
- X: mentions, engagement, velocity, sentiment score, confirmed flag
- Overall: blended sentiment score, confidence
- Note: `x_mentions` field contains X + StockTwits combined mentions

### `fundamentals_snapshot`
Weekly financial metrics: P/E, revenue growth (YoY & 3Y CAGR), operating/net margins, FCF, EV/Sales, cash, debt, risk flags.

### `sentiment_items`
Individual social posts: platform, sentiment label, snippet, URL, engagement, velocity.

### `weekly_decisions`
AI output: PICK/SKIP decision, pick1/pick2 tickers, confidence scores, ELI5 summary, detailed rationale.

### `pick_performance`
Performance tracking: entry price, exit price, return %, win/loss flag.

---

## Scheduling

Two `pg_cron` jobs run every Monday at 6:00 AM UTC:

| Job | Schedule | Batch |
|-----|----------|-------|
| `weekly-sentiment-refresh-batch1` | `0 6 * * 1` | Tickers 0–24 |
| `weekly-sentiment-refresh-batch2` | `5 6 * * 1` | Tickers 25–49 |

Both call the `refresh-data` Edge Function via `pg_net.http_post()`.

---

## Frontend Architecture

### State Management
- **TanStack React Query** for all server state (queries, mutations, cache invalidation)
- **Supabase Realtime** subscriptions for live updates on `daily_sentiment` and `weekly_decisions`

### Responsive Design
- Mobile-first layout with hamburger navigation
- Breakpoints: mobile (< 640px), tablet (640–1024px), desktop (1024px+)
- Volatile tickers grid: 2 cols (mobile) → 3 cols (tablet) → 5 cols (desktop)
- Trendline chart height: 260px (mobile) → 360px (desktop)

### Key Components

| Component | Purpose |
|-----------|---------|
| `LiveWeeklyBanner` | Displays current week's AI pick with live price |
| `SentimentMovers` | Top 3 sentiment movers with realtime badge |
| `VolatileTickers` | Top 5 volatile tickers ranked by sentiment swing |
| `SentimentTrendlines` | 7-day line chart for volatile tickers |
| `SentimentHeatmap` | Grid of all tickers colored by sentiment score |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| UI Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Routing | React Router v6 |
| State | TanStack React Query |
| Backend | Lovable Cloud (Edge Functions + PostgreSQL) |
| AI Model | Gemini 2.5 Flash Lite via Lovable AI Gateway |
| Data APIs | Finnhub, StockTwits |
| Scheduling | pg_cron + pg_net |
| Build | Vite |

---

## Key Design Decisions

1. **Multi-source sentiment blending** — No single source is reliable enough alone. The weighted blend with AI fallbacks ensures robust scores even when APIs return empty data.

2. **AI-estimated fallbacks** — Finnhub's free tier often returns 403 for social endpoints. Instead of showing zeros, the system estimates from available data sources with reasonable floors.

3. **Human-in-the-loop** — Mirrors enterprise ML patterns where responsible AI requires human oversight before automated decisions reach users.

4. **ELI5 summaries** — Every pick includes plain-English explanations, making AI reasoning transparent and accessible.

5. **Batched processing** — Tickers are processed in batches of 3-25 to avoid Edge Function timeouts and API rate limits.

6. **Separation of data and decisions** — Raw sentiment data is stored independently from AI decisions, enabling re-analysis and backtesting.

---

## Author

**Phalguni Vatsa**
- [LinkedIn](https://www.linkedin.com/in/phalgunivatsa/)
- [GitHub](https://github.com/pvatsa0903)
