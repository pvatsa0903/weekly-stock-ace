# Changelog

All notable changes to **StockPulse** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.2.0] — 2026-03-04

### Added
- `SOUL.md` — project philosophy and design rationale in human tone
- Comprehensive `ARCHITECTURE.md` with system design, data flow, and schema docs
- Enhanced `SECURITY.md` with architecture security notes
- Updated `CONTRIBUTING.md` with full project structure and contribution guidelines
- Updated `README.md` with features, tech stack, and pipeline overview

### Changed
- About page redesigned with pipeline visualization, sentiment scoring table, and tech stack section
- All GitHub-facing documentation aligned with current v1.1 feature set

---

## [1.1.0] — 2026-03-04

### Added
- Weekly cron job (Monday 6 AM UTC) for automated sentiment data refresh
- AI-powered sentiment analysis using Gemini 2.5 Flash Lite via Lovable AI Gateway
- Smart Reddit/X mention estimation when social APIs return empty data
- Multi-source weighted sentiment blend: AI (30%) + News (20%) + Reddit (15%) + X (15%) + StockTwits (20%)
- Responsive mobile and iPad layouts with adaptive grids and chart sizing
- Dynamic sidebar footer with real-time week and date display

### Changed
- Renamed "How It Works" to "About" in navigation
- Volatile tickers grid: 2 cols (mobile) → 3 cols (tablet) → 5 cols (desktop)
- Dashboard buttons stack vertically on mobile

### Fixed
- Reddit mentions no longer show 0 — uses AI-estimated floor when APIs return empty
- Sentiment scores no longer default to 50 — AI analysis provides differentiated values

---

## [1.0.0] — 2026-02-14

### Added
- AI-driven stock recommendation engine with LLM-powered analysis
- Human-in-the-loop review gate for all AI picks
- Dashboard with live weekly picks banner and stat cards
- Sentiment Radar with heatmap, trendlines, and top 5 volatile tickers
- Multi-source sentiment tracking: Reddit, X, and StockTwits
- Recent sentiment feed with platform-coded badges
- Ticker detail pages with fundamentals, sentiment, and news cards
- Historical decisions table with PICK/SKIP tracking
- Pick performance tracking with win-rate and ROI analysis
- About page explaining the full pipeline
- Edge Functions: `ai-stock-picker`, `refresh-data`, `stock-data`
- ELI5 plain-English summaries for every recommendation
- Responsive sidebar navigation with dark theme
