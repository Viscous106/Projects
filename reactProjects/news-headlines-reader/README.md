# News Headlines Reader

A production-style React news dashboard built for category-based headline browsing with a clean, responsive UI and API-driven content.

## Project Overview

This application allows users to:

- Browse top headlines by category (including **Tech** in the filter)
- Expand/collapse article details
- Mark articles as read/unread with a live read counter
- Switch between light and dark theme (persisted preference)
- Handle loading, empty, and error states gracefully

The project is implemented as a full-stack setup:

- **Frontend:** React + Vite + Tailwind + shadcn/ui
- **Backend:** Express proxy (`/api/news`) for provider integration and safer key handling

---

## Architecture

### High-Level Flow

1. User selects a category in the UI.
2. Frontend requests `/api/news?category=<selected>`.
3. Express server reads provider/env config and calls upstream news API.
4. Server normalizes response and returns article list.
5. Frontend renders cards with interactive read/expand behavior.

### Why a Backend Proxy?

- Keeps provider integration centralized
- Provides cleaner error messages and response normalization
- Reduces direct coupling between UI and upstream API formats

> Note: A direct frontend fallback for GNews is also supported via Vite env keys for resilience during local runs.

---

## Key Features

- **Category Filtering:** General, Business, Tech, Sports, Health, Science, Entertainment
- **Article Interactions:** expand details, mark read/unread
- **Read Tracking:** dynamic count in UI
- **Theme Toggle:** light/dark mode with persistence
- **Robust States:** loading skeletons, empty results, API error UI
- **Responsive Design:** mobile-first layout using Tailwind utility patterns

---

## Tech Stack

### Frontend

- React 19
- Vite 8
- Tailwind CSS
- shadcn/ui + Radix primitives
- Lucide icons

### Backend

- Node.js
- Express 5
- dotenv

### External Providers

- GNews: https://gnews.io/api/v4/top-headlines
- NewsAPI: https://newsapi.org/v2/top-headlines

---

## Folder Structure

```text
news-headlines-reader/
├─ src/
│  ├─ components/ui/        # shadcn UI primitives
│  ├─ lib/utils.js          # utility helpers
│  ├─ App.jsx               # main app logic + UI
│  └─ index.css             # Tailwind + design tokens
├─ server.js                # Express API proxy server
├─ .env.example             # environment template
├─ render.yaml              # Render blueprint config
└─ package.json             # scripts and dependencies
```

---

## Environment Configuration

Copy env template:

```bash
cp .env.example .env
```

### Required/Important Variables

| Variable | Purpose | Example |
|---|---|---|
| `NEWS_PROVIDER` | provider selector (`gnews` or `newsapi`) | `gnews` |
| `GNEWS_API_KEY` | GNews API key | `xxxx` |
| `NEWS_API_KEY` | NewsAPI key (if using NewsAPI) | `xxxx` |
| `NEWS_COUNTRY` | country filter | `in` |
| `NEWS_LANGUAGE` | language for GNews | `en` |
| `NEWS_MAX_RESULTS` | max results per request | `20` |
| `PORT` | backend port | `8787` |

### Optional Frontend Fallback Variables

| Variable | Purpose |
|---|---|
| `VITE_GNEWS_API_KEY` | direct GNews fallback from frontend |
| `VITE_NEWS_COUNTRY` | fallback country |
| `VITE_NEWS_LANGUAGE` | fallback language |
| `VITE_NEWS_MAX_RESULTS` | fallback max results |

---

## Local Development

Install dependencies:

```bash
npm install
```

Run full stack (frontend + backend):

```bash
npm run dev
```

Endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`

Build for production:

```bash
npm run build
```

Serve production build:

```bash
npm run serve
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | runs client + server concurrently |
| `npm run dev:client` | runs Vite dev server |
| `npm run dev:server` | runs Express backend |
| `npm run build` | creates production frontend build |
| `npm run serve` | serves app using Express |
| `npm run lint` | ESLint checks |

---

## Deployment (Render)

This project supports deployment from a monorepo subfolder.

### Manual Web Service Setup

- **Root Directory:** `reactProjects/news-headlines-reader`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run serve`

Set env vars in Render dashboard:

- `NEWS_PROVIDER=gnews`
- `GNEWS_API_KEY=<your_key>`
- `NEWS_COUNTRY=in`
- `NEWS_LANGUAGE=en`
- `NEWS_MAX_RESULTS=20`

---

## Troubleshooting

- Ensure you run from the project folder: [news-headlines-reader](news-headlines-reader)
- Use `npm run dev` to start both frontend and backend
- If fetch fails, verify provider key and env var names
- If using frontend fallback, confirm `VITE_GNEWS_API_KEY` is set

---

## Evaluation Alignment

This implementation covers the core mini-project expectations:

- API integration with `useEffect`
- state management with `useState`
- conditional rendering and interactive UI
- list rendering with proper keys
- filter + toggle interactions

