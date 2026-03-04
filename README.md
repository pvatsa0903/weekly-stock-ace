# StockPulse

> An AI-driven stock recommendation engine that surfaces **two actionable weekly picks** from a universe of 50 high-volume stocks — with multi-source sentiment analysis and human-in-the-loop oversight.

🔗 **Live App**: [weekly-stock-ace.lovable.app](https://weekly-stock-ace.lovable.app)

---

## What It Does

Every week, the system:

1. **Ingests market data** — prices, fundamentals, and social sentiment from Reddit, X, and StockTwits
2. **Runs AI analysis** — a large language model scores each ticker on fundamentals, momentum, and sentiment
3. **Surfaces 2 picks** — with confidence scores, ELI5 summaries, and full rationale
4. **Tracks performance** — entry/exit prices, win rate, and ROI are logged automatically

---

## Screenshots

| Dashboard | Sentiment Radar |
|-----------|-----------------|
| Weekly picks, stat cards, top movers | Top 5 volatile tickers, 7-day trendlines |

---

## Features

- **AI-Powered Analysis** — LLM-driven scoring with custom prompt engineering (Gemini via Lovable AI Gateway)
- **Multi-Source Sentiment** — Aggregated from Reddit, X (Twitter), and StockTwits with AI-estimated fallbacks
- **Sentiment Radar** — Top 5 most volatile tickers with 7-day trendline charts
- **Real-Time Updates** — PostgreSQL realtime subscriptions push live data to the UI
- **Weekly Cron Job** — Automated data refresh every Monday at 6:00 AM UTC
- **Performance Tracking** — Win rate, average return, and historical pick audit trail
- **ELI5 Summaries** — Plain-English explanations for every AI recommendation
- **Responsive Design** — Optimized for mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 · TypeScript · Tailwind CSS · shadcn/ui |
| **Charts** | Recharts |
| **Routing** | React Router v6 |
| **State** | TanStack React Query |
| **Backend** | Lovable Cloud (Edge Functions + PostgreSQL) |
| **AI** | Gemini 2.5 Flash Lite via Lovable AI Gateway |
| **Data Sources** | Finnhub API · StockTwits API · AI-estimated sentiment |
| **Scheduling** | pg_cron + pg_net → Edge Function triggers |
| **Build** | Vite |

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design, data pipeline, and database schema.

```
Data Ingestion → AI Sentiment Analysis → Multi-Source Blend → Database
                                                                  ↓
Dashboard ← Realtime Subscriptions ← PostgreSQL ← Weekly AI Picker
```

---

## Project Structure

```
src/
├── pages/              # Route-level pages
│   ├── Index.tsx        # Dashboard — weekly picks, stats, movers
│   ├── Decisions.tsx    # Historical PICK/SKIP decisions table
│   ├── Sentiment.tsx    # Sentiment Radar — volatile tickers + trendlines
│   ├── TickerDetail.tsx # Individual ticker deep-dive
│   ├── About.tsx        # Project overview + pipeline explanation
│   └── Settings.tsx     # App settings
├── components/
│   ├── dashboard/       # LiveWeeklyBanner, StatCard, SentimentMovers
│   ├── layout/          # Sidebar, DashboardLayout
│   ├── sentiment/       # VolatileTickers, SentimentTrendlines, Heatmap
│   └── ticker/          # FundamentalsCard, SentimentCard, NewsCard
├── hooks/               # useStockData, use-mobile
└── integrations/        # Supabase client & types (auto-generated)

supabase/functions/
├── ai-stock-picker/     # LLM-powered weekly pick generation
├── refresh-data/        # Multi-source data ingestion pipeline
└── stock-data/          # On-demand stock data fetching
```

---

## Data Pipeline

The `refresh-data` Edge Function runs weekly (Monday 6 AM UTC) and:

1. Fetches price/profile data from **Finnhub**
2. Pulls StockTwits stream for real-time social sentiment
3. Calls **Gemini AI** to analyze news headlines and generate sentiment scores
4. Computes a **weighted blend**: AI (30%) + News (20%) + Reddit (15%) + X (15%) + StockTwits (20%)
5. Upserts results into `daily_sentiment` with confidence scores

When social APIs return empty data (common on free tiers), the system **estimates** mention counts from AI analysis and cross-source data — ensuring the UI always shows meaningful values.

---

## Local Development

```bash
git clone <repo-url>
cd 2-stock-shortlist
npm install
npm run dev
```

Requires environment variables for Supabase and Finnhub (see `.env` template).

---

## Author

**Phalguni Vatsa**

- [LinkedIn](https://www.linkedin.com/in/phalgunivatsa/)
- [GitHub](https://github.com/pvatsa0903)

---

## License

See [LICENSE](./LICENSE) for details.
