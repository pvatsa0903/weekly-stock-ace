# Contributing to StockPulse

Thank you for your interest in contributing to **StockPulse** — an AI-driven stock recommendation engine with multi-source sentiment analysis and human-in-the-loop oversight.

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/weekly-stock-ace.git
   cd weekly-stock-ace
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the dev server**:
   ```bash
   npm run dev
   ```

> **Note:** The app connects to a live backend. Some features (AI picks, data refresh) require Edge Function access and won't work in a local fork without your own backend setup.

## 🧱 Project Structure

```
src/
├── pages/           # Route-level page components
│   ├── Index.tsx    # Dashboard (live picks, stats, movers)
│   ├── Decisions.tsx # Weekly decisions audit trail
│   ├── Sentiment.tsx # Sentiment radar (heatmap, trendlines)
│   ├── TickerDetail.tsx # Individual ticker deep-dive
│   ├── About.tsx    # Project overview & methodology
│   └── Settings.tsx # App settings
├── components/
│   ├── dashboard/   # Dashboard widgets (banners, stats, movers)
│   ├── layout/      # Sidebar, DashboardLayout
│   ├── sentiment/   # Heatmaps, trendlines, volatile tickers
│   ├── ticker/      # Ticker detail cards
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom React hooks (useStockData, etc.)
└── integrations/    # Supabase client & types (auto-generated, DO NOT EDIT)

supabase/
└── functions/
    ├── ai-stock-picker/  # Gemini-powered weekly pick generation
    ├── refresh-data/     # Cron-triggered data refresh pipeline
    └── stock-data/       # Market data proxy (Finnhub, StockTwits)
```

## 📐 Code Style

- **TypeScript** — strict mode, no `any` types
- **Tailwind CSS** — use semantic design tokens (`bg-primary`, `text-muted-foreground`), never raw color values in components
- **Components** — small, focused, single-responsibility
- **Naming** — PascalCase for components, camelCase for hooks/utilities
- **Imports** — use `@/` path alias for all project imports

## 🔀 Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes with clear, atomic commits
3. Ensure the app builds without errors: `npm run build`
4. Test on mobile, tablet, and desktop viewports
5. Open a PR with a clear description of **what** and **why**
6. Link any related issues

## 🐛 Reporting Issues

When filing an issue, please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable
- Console errors (if any)

## 💡 Ideas & Feature Requests

Have an idea? Open a GitHub Discussion or Issue tagged `enhancement`. Some areas I'd love help with:
- Additional data source integrations
- Performance backtesting improvements
- Accessibility enhancements
- Internationalization

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 👤 Maintainer

**Phalguni Vatsa**
- [LinkedIn](https://www.linkedin.com/in/phalgunivatsa/)
- [GitHub](https://github.com/pvatsa0903)
- [Live App](https://weekly-stock-ace.lovable.app)
