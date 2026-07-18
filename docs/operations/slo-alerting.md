# SLO and Alerting Baseline

## Suggested SLOs

- Availability (monthly): `99.9%` for web and API.
- API p95 latency:
  - `POST /api/leads` < `700ms`
  - `POST /api/diagnostics/analyze` < `3500ms`
- Error budget:
  - 0.1% monthly downtime budget.

## Alerting thresholds

- Health degradation:
  - Trigger if `/api/health` is non-200 for 3 consecutive checks.
- API error rate:
  - Trigger if 5xx > 2% over 5 minutes.
- Rate-limit saturation:
  - Trigger if 429 > 10% over 10 minutes in any endpoint.
- Lead intake:
  - Trigger if no successful lead insertion for 60 minutes during business hours.

## Recommended monitors

- Uptime monitor for:
  - `/`
  - `/api/health`
- Synthetic flow:
  - Contact form submit
  - Diagnostic analyze submit
- Log monitor on structured events:
  - `*.error`
  - `*.db_error`
  - `*.captcha_failed`
  - `*.rate_limited`
