# Church Platform — Frontend

React + Vite, Tailwind v4. Talks to the Django backend via `src/api/client.js`.

## Setup
```bash
npm install
cp .env.example .env    # points to your local Django API
npm run dev
```

## Structure
- `src/pages/` — one file per IA page (Home is wired to the API as a working example; rest are stubs)
- `src/components/` — shared UI (Nav, and whatever else you pull out as you build)
- `src/api/client.js` — axios instance + endpoint wrapper functions
- `src/hooks/` — empty for now, add data-fetching hooks here as pages get built out
- `src/index.css` — design tokens (colors, fonts) as CSS variables, plus Tailwind import

## Design tokens
- `--color-ink` #1F2A24, `--color-paper` #FAF7F1, `--color-gold` #B8863B (primary accent),
  `--color-sage` #6B7F6B (secondary), `--color-rule` #E4DDD0 (dividers)
- Display font: Fraunces (headings), body font: Inter
