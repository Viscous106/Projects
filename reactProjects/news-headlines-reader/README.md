# News Headlines Reader (React + shadcn/ui)

This project implements the **News Headlines Reader** mini project using React, `useState`, `useEffect`, list mapping, category filtering, expandable descriptions, and read tracking.

## Implemented Requirements

- Fetch headlines with `useEffect`
- Category dropdown filter
- Expand headline description
- Mark headline as read (strike-through style)
- Read count display
- Loading state and empty/error state handling
- Light mode / dark mode toggle

## Tech Stack

- React + Vite
- Express proxy server
- Tailwind CSS
- shadcn/ui components (`Card`, `Button`, `Badge`, `Select`, `Skeleton`)

## Run Locally

1. Install dependencies:

	```bash
	npm install
	```

2. Add your API key (GNews or NewsAPI):

	```bash
	cp .env.example .env
	```

	For GNews (recommended for this project):
	- `NEWS_PROVIDER=gnews`
	- `GNEWS_API_KEY=your_key_here`

	For NewsAPI:
	- `NEWS_PROVIDER=newsapi`
	- `NEWS_API_KEY=your_key_here`

	Get keys from:
	- GNews: https://gnews.io/
	- NewsAPI: https://newsapi.org/

	Steps:
	1. Create a free account on NewsAPI
	2. Open your account dashboard
	3. Copy the API key
	4. Paste it into `.env` based on your selected provider.

3. Start the full app:

	```bash
	npm run dev
	```

	Frontend runs on `http://localhost:5173`
	Backend runs on `http://localhost:8787`

	If backend is unavailable, frontend can still fetch directly from GNews when `VITE_GNEWS_API_KEY` is set.

4. Build for production:

	```bash
	npm run build
	```

5. Serve the built app:

	```bash
	npm run serve
	```

## Notes

- The source mentioned in the problem statement is NewsAPI: https://newsapi.org/v2/top-headlines
- The app now uses a backend proxy so the API key is not exposed in the frontend bundle.
- GNews endpoint used when `NEWS_PROVIDER=gnews`: https://gnews.io/api/v4/top-headlines

## Troubleshooting Fetch Failure

- Always run from project folder [news-headlines-reader](news-headlines-reader)
- Use `npm run dev` (starts both client + server)
- If you run only client, configure `VITE_GNEWS_API_KEY` in `.env` for direct fetch fallback

## Deploy on Render (Free)

### Option A: Blueprint (recommended)

1. Push this project to GitHub.
2. In Render, click **New +** → **Blueprint**.
3. Select your GitHub repository.
4. Render reads [render.yaml](render.yaml) automatically.
5. Add secret env var in Render dashboard:
	- `GNEWS_API_KEY=your_real_key`
6. Click **Apply** and wait for deploy.

### Option B: Manual Web Service

Create a **Web Service** with these settings:

- Environment: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm run serve`

Add environment variables:

- `NEWS_PROVIDER=gnews`
- `NEWS_COUNTRY=in`
- `NEWS_LANGUAGE=en`
- `NEWS_MAX_RESULTS=20`
- `GNEWS_API_KEY=your_real_key`

After deploy, open the Render URL and test category switching in the filter.
