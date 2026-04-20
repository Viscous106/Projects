# 2-Minute Pitch Script

## Opening (15–20 sec)
Hi, I built **News Headlines Reader**, a full-stack React project that lets users browse live headlines by category, mark articles as read, and switch between light and dark mode with a clean responsive UI.

## Problem & Goal (15–20 sec)
The goal was to create a practical news dashboard that is not just UI-only, but also production-oriented with real API integration, proper error handling, and deploy-ready architecture.

## What I Built (35–40 sec)
The app includes:

- Category filter (including **Tech**)
- Live article feed by selected category
- Expand/collapse article descriptions
- Mark as read/unread with a live read count
- Loading, empty, and error states
- Theme toggle with persisted preference

I implemented the frontend using React + shadcn UI + Tailwind for a clean component-based design.

## Architecture & Technical Decisions (35–40 sec)
I used a two-layer architecture:

1. **React frontend** for UI state and interactions
2. **Express backend proxy** at `/api/news` for provider integration

The backend handles provider logic (GNews/NewsAPI style config), normalizes response shape, and improves reliability/error messages.

I used `useEffect` for data fetching and `useState` for UI/data state such as selected category, read IDs, expanded article, loading, and theme.

## Deployment & Readiness (20–25 sec)
The project is deployment-ready on Render, including monorepo subfolder deployment support. Environment variables are fully documented, and the app handles real-world fetch failures gracefully.

## Closing (10–15 sec)
So overall, this project demonstrates frontend fundamentals, API integration, backend proxy architecture, and practical deployment readiness in one complete mini product.

---

## 20-Second Demo Flow

1. Open app and switch category (for example, **Tech**)
2. Expand an article and mark it as read
3. Show read count update
4. Toggle dark/light mode and refresh to show persistence
