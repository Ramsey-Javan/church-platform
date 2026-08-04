# Church Platform — Development Plan v1

Stack: Django 5 + DRF, PostgreSQL, Redis + Celery, React + Vite, Cloudflare (CDN/WAF), YouTube/Vimeo embed, Stripe + M-Pesa Daraja.

---

## 1. Django apps

| App | Responsibility |
|---|---|
| `accounts` | Custom user model, Django Groups (Admin, Content Editor, Finance Viewer) |
| `core` | `ChurchSettings` singleton (name, service times, address, map coords, social links) |
| `sermons` | Sermons, series, speakers, scripture tags, transcripts, audio/slide downloads |
| `events` | Events, categories, RSVP/registration |
| `ministries` | Ministries, small groups/home cells, volunteer signups |
| `connect` | Connection cards, prayer requests (privacy-flagged) |
| `giving` | Funds, donations, recurring giving, Stripe + M-Pesa integration |
| `media` (optional, phase 2) | Podcast feed, downloadable resources |

## 2. Key models (abbreviated)

- **Sermon**: title, speaker(FK), series(FK), scripture_refs(M2M/tags), date, video_url, audio_file, slides_file, transcript_text, topic_tags
- **Event**: title, category, start/end, location, description, registration_required(bool), capacity, rsvp_count
- **ConnectCard**: name, email, phone, how_heard, message, is_prayer_request(bool), created_at
- **Fund**: name (General, Missions, Building), description, active
- **Donation**: donor_name, email, amount, fund(FK), method(stripe/mpesa), recurring(bool), status, external_ref
- **Ministry**: name, description, leader_contact, meeting_schedule
- **SmallGroup**: name, ministry(FK), location_area, day/time, leader_contact, capacity

## 3. API endpoint map (DRF, `/api/v1/...`)

```
GET  /sermons/                filter: speaker, series, scripture, topic, q
GET  /sermons/{id}/
GET  /events/                 filter: category, date range
POST /events/{id}/rsvp/
GET  /ministries/
GET  /small-groups/           filter: area, day
POST /connect-cards/          public, Turnstile-protected
GET  /funds/
POST /donations/checkout/     creates Stripe session or M-Pesa STK push
POST /donations/webhook/stripe/
POST /donations/webhook/mpesa/
GET  /church-settings/        public, singleton
```

## 4. Auth & permission matrix

| Role | Sermons/Events/Ministries | ConnectCard/Prayer | Donations | Users/Settings |
|---|---|---|---|---|
| Admin | RW | RW | RW | RW |
| Content Editor (volunteer) | RW | Read only | No access | No access |
| Finance Viewer (later) | Read | No access | Read only | No access |
| Public (unauthenticated) | Read | Create only | Create only (checkout) | Read (settings only) |

Enforced via Django Groups + DRF permission classes; `django-guardian` only if you need per-object (not just per-model) restrictions later.

## 5. Frontend pages → API mapping

- **Home** → `/church-settings/`, latest sermon, upcoming events
- **Plan a Visit** → `/church-settings/` (map, service times)
- **Watch/Media** → `/sermons/` (search/filter), live embed (static YouTube/Vimeo URL from settings)
- **Connect/Ministries** → `/ministries/`, `/small-groups/`
- **Events & Calendar** → `/events/`, iCal export (generate `.ics` server-side)
- **Give** → `/funds/`, `/donations/checkout/`

## 6. Deployment plan

- **Backend**: Render or Railway (Django + Celery worker + Redis), PostgreSQL managed instance
- **Frontend**: Static build (Vite) on Cloudflare Pages or same host, behind Cloudflare CDN/WAF
- **Media/backups**: Cloudflare R2 (you already have this pattern from YvBackend) — daily `pg_dump` cron → R2, 30-day retention
- **Secrets**: environment variables, never committed; Stripe/M-Pesa keys in platform secret manager

## 7. Security checklist

- SSL/TLS everywhere (platform-default on Render/Cloudflare)
- Turnstile on ConnectCard and prayer request forms
- Never touch raw card data — use Stripe Checkout/Elements; M-Pesa via STK push (Daraja), no card storage
- Rate-limit public POST endpoints (django-ratelimit)
- GDPR-style consent checkbox + clear data-use note on ConnectCard/prayer forms
- RBAC as above; audit log on donation and user-permission changes

## 8. Build order (dependency-driven, not a feature-scope cut)

1. `accounts` + `core` (auth, RBAC groups, ChurchSettings) — everything else depends on this
2. `sermons`, `events`, `ministries` models + Django admin (content team can start populating while frontend is built)
3. Frontend shell + routing for full IA, wired to the above
4. `connect` app (connection card + prayer request) with Turnstile
5. `giving` app — Stripe first (simpler), then M-Pesa Daraja
6. Live stream embed + calendar RSVP/iCal export polish
7. Accessibility pass (WCAG 2.1 audit), image optimization (webp/avif, lazy load), caching tune
8. Backups automation + deploy pipeline + go-live
