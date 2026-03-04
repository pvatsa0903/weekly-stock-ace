# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.1.x   | ✅ Active support  |
| 1.0.x   | ⚠️ Security fixes only |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainer or reach out via [LinkedIn](https://www.linkedin.com/in/phalgunivatsa/)
3. Include a detailed description of the vulnerability and steps to reproduce

You can expect an initial response within **48 hours**.

## Security Practices

- All database tables use Row Level Security (RLS) policies — no table is publicly writable
- API keys and secrets are stored server-side in Edge Function environment variables, never in client code
- The Supabase anon key (publishable) is the only key exposed to the browser
- Edge Functions validate and sanitize all inputs before processing
- The AI recommendation pipeline includes a mandatory human review step before publication
- No user authentication data is stored in application tables
- All external API calls (Finnhub, StockTwits) happen server-side via Edge Functions
- Database queries use parameterized inputs — no raw SQL concatenation

## Architecture Security Notes

- **Edge Functions** act as a secure proxy between the frontend and external APIs
- **Cron jobs** (pg_cron + pg_net) trigger Edge Functions server-side — no client involvement
- **AI Gateway** calls are authenticated with server-side keys, never exposed to the browser
- **CORS** is configured to allow only the published domain
