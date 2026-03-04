# Soul of 2-Stock Shortlist

## Why This Exists

I got tired of the noise.

Every week, thousands of stock tips flood Reddit, Twitter, Discord, and YouTube. Most are garbage — pump-and-dump schemes, confirmation bias dressed up as "DD," or just vibes masquerading as analysis. I wanted something different: a system that actually looks at the data, thinks about it carefully, and gives me two names. That's it. Two stocks. Every week.

Not fifty. Not a screener with 200 filters. Just two.

## The Philosophy

**Less is more.** The hardest part of investing isn't finding opportunities — it's filtering out the noise. This project is deliberately constrained to two picks per week because constraints force clarity. If the AI can only pick two, it has to be confident. If I can only approve two, I have to actually think about them.

**AI is a tool, not an oracle.** I use Google Gemini to analyze data and generate recommendations, but every single pick goes through a human review step before it's published. The AI is fast and thorough; I'm the one who catches the things it misses — like "hey, that company is literally being sued by the DOJ right now." That's the human-in-the-loop, and it matters.

**Show your work.** Every pick comes with a confidence score, a rationale, and an ELI5 summary. Every decision — including skips — is logged. If I'm wrong, I want to know *why* I was wrong, not just *that* I was wrong. The audit trail is the whole point.

**Real data beats vibes.** The sentiment scores aren't made up. They pull from five sources — AI analysis, Finnhub news, Reddit, X, and StockTwits — each weighted based on reliability. When an API fails (which happens a lot on free tiers), the system estimates reasonable values instead of showing zeros or hiding the data. Honest approximation beats false precision.

## What I Learned Building This

- **Prompt engineering is real engineering.** Getting Gemini to output structured, parseable JSON with consistent confidence scores took dozens of iterations. The difference between a good prompt and a great one is the difference between useful output and hallucinated nonsense.

- **Free APIs are unreliable.** Finnhub's social endpoints return 403 half the time. StockTwits rate-limits aggressively. You have to build for failure — smart fallbacks, reasonable defaults, and graceful degradation aren't nice-to-haves, they're the product.

- **The boring parts matter most.** The cron job that refreshes data every week isn't exciting. The database schema that tracks performance over time isn't glamorous. But without them, this is just a pretty dashboard with stale numbers. Infrastructure *is* the product.

- **Constraints breed creativity.** Limiting to two picks per week, using only free-tier APIs, building everything on a single platform — these constraints forced better decisions at every level.

## Who This Is For

This isn't financial advice. Seriously. I built this as a portfolio project to demonstrate end-to-end product thinking: data engineering, AI integration, full-stack development, and responsible ML deployment.

If you're a recruiter or hiring manager looking at this repo, here's what I want you to see: I don't just write code. I think about the problem, design the system, build the pipeline, handle the edge cases, and ship something that actually works. Every week. Automatically.

If you're a developer, feel free to fork it, learn from it, or tell me what I did wrong. I'm always learning.

## The Name

"2-Stock Shortlist" — because that's exactly what it is. No clever branding, no buzzwords. Two stocks. A shortlist. Updated weekly. The name tells you everything you need to know, and I think that's kind of beautiful in a world of AI-powered-blockchain-enabled-synergy-platforms.

---

*Built with curiosity, caffeine, and an unreasonable amount of time spent arguing with API rate limits.*

— Phalguni Vatsa
