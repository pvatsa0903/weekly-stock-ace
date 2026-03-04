# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Active support  |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email the maintainer or reach out via [LinkedIn](https://www.linkedin.com/in/phalgunivatsa/)
3. Include a detailed description of the vulnerability and steps to reproduce

You can expect an initial response within **48 hours**.

## Security Practices

- All database tables use Row Level Security (RLS) policies
- API keys and secrets are stored server-side, never in client code
- Edge Functions validate inputs before processing
- The AI recommendation pipeline includes human review before publication
- No user authentication data is stored in application tables
