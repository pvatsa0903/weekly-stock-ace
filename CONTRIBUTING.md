# Contributing to 2-Stock Shortlist

Thank you for your interest in contributing to **2-Stock Shortlist** — an AI-driven stock recommendation engine with multi-source sentiment analysis and human-in-the-loop oversight.

---

## 🚀 Getting Started

1. **Fork** the repository
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/stockpulse.git
   cd stockpulse
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the dev server**:
   ```bash
   npm run dev
   ```

---

## 🧱 Project Structure

```
src/
├── pages/           # Route-level page components
├── components/
│   ├── dashboard/   # Dashboard widgets (banners, stats, movers)
│   ├── layout/      # Sidebar, DashboardLayout
│   ├── sentiment/   # Heatmaps, trendlines, volatile tickers
│   ├── ticker/      # Ticker detail cards
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom React hooks
└── integrations/    # Supabase client & types (auto-generated)

supabase/
└── functions/       # Edge Functions (AI picker, data refresh, stock data)
```

---

## 📐 Code Style

- **TypeScript** — strict mode, no `any` types
- **Tailwind CSS** — use semantic design tokens (`bg-primary`, `text-muted-foreground`), never raw color values
- **Components** — small, focused, single-responsibility
- **Naming** — PascalCase for components, camelCase for hooks/utilities

---

## 🔀 Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes with clear, atomic commits
3. Ensure the app builds without errors: `npm run build`
4. Open a PR with a clear description of **what** and **why**
5. Link any related issues

---

## 🐛 Reporting Issues

When filing an issue, please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screenshots if applicable

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## 👤 Maintainer

**Phalguni Vatsa**
- [LinkedIn](https://www.linkedin.com/in/phalgunivatsa/)
- [GitHub](https://github.com/pvatsa0903)
