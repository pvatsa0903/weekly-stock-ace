# Architecture: AI-Driven Stock Recommendation Engine

## Overview

**2-Stock Shortlist** is an AI-driven stock recommendation engine that ingests market data, processes it through a large language model, and surfaces two actionable weekly stock picks — with a **human-in-the-loop** review step to ensure quality, accountability, and responsible AI deployment.

---

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Data Ingestion  │────▶│  AI Analysis     │────▶│  Human Review   │────▶│  Publication    │
│  (Scheduled)     │     │  Engine (LLM)    │     │  (Override Gate) │     │  (Dashboard)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │                        │
   Market data            Custom prompt             Bias checks             Weekly picks
   Fundamentals           Multi-factor score        Factual review          Confidence scores
   Social sentiment       ELI5 generation           Final decision          ELI5 summaries
```

---

## Data Pipeline

### 1. Data Ingestion (Scheduled Cron)

A scheduled Edge Function runs on a cron schedule to collect and refresh data:

| Data Source         | What's Collected                              | Storage Table           |
|---------------------|-----------------------------------------------|--------------------------|
| Market Data         | Price, volume, market cap, sector             | `tickers`               |
| Fundamentals        | P/E, revenue growth, margins, FCF, debt/cash  | `fundamentals_snapshot` |
| Social Sentiment    | Reddit & X mentions, engagement, velocity     | `daily_sentiment`       |
| Sentiment Items     | Individual posts with sentiment labels         | `sentiment_items`       |

### 2. AI Analysis Engine

The core AI pipeline uses a **large language model** via the Lovable AI Gateway:

- **Input**: Aggregated data from all tables (tickers, fundamentals, sentiment)
- **Prompt**: A custom-engineered system prompt with multi-factor scoring criteria
- **Output**: Structured JSON with:
  - Two ticker symbols (picks of the week)
  - PICK / SKIP decision per ticker
  - Confidence percentage (0–100%)
  - ELI5 (Explain Like I'm 5) plain-English summary
  - Detailed rationale

#### Scoring Factors

| Factor              | Weight | Source                    |
|---------------------|--------|---------------------------|
| Revenue Growth      | High   | `fundamentals_snapshot`   |
| Profit Margins      | High   | `fundamentals_snapshot`   |
| Valuation (P/E)     | Medium | `fundamentals_snapshot`   |
| Social Sentiment    | Medium | `daily_sentiment`         |
| Mention Velocity    | Low    | `daily_sentiment`         |
| Risk Flags          | High   | `fundamentals_snapshot`   |

### 3. Human-in-the-Loop Review

Every AI recommendation passes through a human review gate before publication:

- **Why**: Pure AI systems can hallucinate, overfit to recent trends, or miss qualitative context
- **What the reviewer checks**:
  - Factual accuracy of AI rationale
  - Bias detection (recency bias, sector concentration)
  - Market context the model may have missed
  - Confidence calibration
- **Actions available**:
  - ✅ Approve picks as-is
  - ✏️ Adjust confidence scores
  - 🔄 Override with different picks
  - ❌ Reject and request re-analysis

All decisions — both AI-generated and human-modified — are logged in `weekly_decisions` for full auditability.

### 4. Publication

Approved picks are written to the `weekly_decisions` table and immediately reflected on the dashboard:

- `LiveWeeklyBanner` components fetch the latest picks dynamically
- Performance tracking begins automatically via `pick_performance`
- Historical data is preserved for backtesting

---

## Tech Stack

| Layer            | Technology                                        |
|------------------|---------------------------------------------------|
| **Frontend**     | React 18 + TypeScript + Tailwind CSS              |
| **UI Components**| shadcn/ui + Radix UI primitives                   |
| **Charts**       | Recharts                                          |
| **Routing**      | React Router v6                                   |
| **State**        | TanStack React Query (server state)               |
| **Backend**      | Lovable Cloud (Edge Functions + PostgreSQL)        |
| **AI Model**     | LLM via Lovable AI Gateway (custom prompt)        |
| **Scheduling**   | Cron-triggered Edge Functions                     |
| **Build**        | Vite                                              |

---

## Database Schema

### `tickers`
Universe of tracked stocks with basic market data.

### `fundamentals_snapshot`
Weekly snapshot of financial fundamentals per ticker (P/E, margins, revenue growth, risk flags).

### `daily_sentiment`
Daily aggregated sentiment scores from Reddit and X, including mention counts, engagement, and velocity.

### `sentiment_items`
Individual social media posts/comments with sentiment labels, snippets, and engagement metrics.

### `weekly_decisions`
The core output table — stores the AI's PICK/SKIP decision, ELI5 summary, rationale, and the two selected tickers.

### `pick_performance`
Tracks entry/exit prices and returns for each historical pick, enabling win-rate and ROI analysis.

---

## Key Design Decisions

1. **Human-in-the-loop over full automation**: Mirrors enterprise ML deployment patterns where responsible AI requires human oversight before automated decisions reach end users.

2. **ELI5 summaries**: Every pick includes a plain-English explanation, making the AI's reasoning transparent and accessible to non-technical users.

3. **Structured JSON output**: The AI prompt enforces structured output, ensuring reliable parsing while maintaining human readability.

4. **Separation of data and decisions**: Raw data (sentiment, fundamentals) is stored independently from decisions, enabling re-analysis and backtesting.

5. **Performance tracking**: Automated win/loss tracking creates a feedback loop for evaluating and improving the AI's accuracy over time.

---

## Project Structure

```
src/
├── pages/
│   ├── Index.tsx           # Dashboard with live weekly picks
│   ├── Decisions.tsx       # Historical decisions table
│   ├── Sentiment.tsx       # Sentiment radar & heatmaps
│   ├── TickerDetail.tsx    # Individual ticker deep-dive
│   ├── About.tsx           # How It Works page (for recruiters)
│   └── Settings.tsx        # App settings
├── components/
│   ├── dashboard/          # Dashboard widgets (banners, stats, movers)
│   ├── layout/             # Sidebar, DashboardLayout
│   ├── sentiment/          # Heatmaps, trendlines
│   └── ticker/             # Ticker detail cards
├── hooks/
│   └── useStockData.ts     # Stock data fetching hook
└── integrations/
    └── supabase/           # Auto-generated client & types

supabase/
└── functions/
    └── stock-data/         # Edge function for stock data
```

---

## Author

**Phalguni Vatsa**
- LinkedIn: [linkedin.com/in/phalgunivatsa](https://www.linkedin.com/in/phalgunivatsa/)
- GitHub: [github.com/pvatsa0903](https://github.com/pvatsa0903)
