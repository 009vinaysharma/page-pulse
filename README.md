# Page Pulse

A production-quality, full-stack website auditing tool. Enter any URL and
get back its HTTP status, response time, title, meta description,
heading/image stats, word count, and final redirect destination — rendered
as clean, monitor-style "vital sign" cards.

Built for the **Digital Heroes Software Development Internship**.

---

## Tech Stack

**Frontend:** React (Vite) · Tailwind CSS · Axios
**Backend:** FastAPI · Requests · BeautifulSoup4 (+ lxml) · Uvicorn

## Architecture

Both halves follow clean, layered architecture — each module has exactly
one reason to change.

```
page-pulse/
├── backend/
│   ├── app/
│   │   ├── main.py                  # App factory: middleware, CORS, exception handlers
│   │   ├── core/
│   │   │   ├── config.py            # Env-driven settings (pydantic-settings)
│   │   │   └── logging_config.py    # Structured logging setup
│   │   ├── domain/
│   │   │   ├── schemas.py           # Request/response models + input validation
│   │   │   └── exceptions.py        # Typed errors, each mapped to an HTTP status code
│   │   ├── services/
│   │   │   ├── url_validator.py     # URL sanitation + SSRF protection
│   │   │   └── web_analyzer.py      # Guarded fetch + HTML parsing (the audit engine)
│   │   └── api/
│   │       ├── routes.py            # Thin HTTP layer
│   │       └── dependencies.py      # Dependency-injection wiring
│   ├── requirements.txt
│   ├── render.yaml                  # Render deployment config
│   ├── .env.example
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── api/pagePulseApi.js          # Axios client, normalizes every failure mode
    │   ├── hooks/useAnalyzeUrl.js       # Owns audit state + in-flight request cancellation
    │   ├── utils/                       # urlValidation.js, formatters.js (pure, reusable)
    │   ├── constants/errorMessages.js   # error_type -> human label
    │   ├── components/
    │   │   ├── common/                  # Button, Card, Spinner — shared primitives
    │   │   ├── layout/                  # Header, Footer
    │   │   ├── hero/                    # Hero
    │   │   ├── analyzer/                # URLInputForm (client-side validation)
    │   │   ├── feedback/                # Loader (skeleton), ErrorState
    │   │   └── results/                 # ResultCards, StatCard (memoized, lazy-loaded)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── public/                      # favicon.svg/.ico, apple-touch-icon, og-image, manifest
    ├── index.html                   # Full SEO + Open Graph + Twitter Card meta
    ├── package.json
    ├── tailwind.config.js
    ├── vercel.json                  # Vercel deployment config
    └── .gitignore
```

---

## Running Locally

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # optional — sensible defaults are built in
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Visit
`http://localhost:8000/api/health` to confirm it's running, and
`http://localhost:8000/docs` for interactive Swagger docs.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env        # then edit VITE_API_BASE_URL if needed
npm run dev
```

The app will be live at `http://localhost:5173`.

---

## API Reference

### `POST /api/analyze`

**Request body:**
```json
{ "url": "example.com" }
```

**Success response (`200`):**
```json
{
  "success": true,
  "requested_url": "example.com",
  "final_url": "https://example.com/",
  "http_status": 200,
  "response_time_ms": 184,
  "title": "Example Domain",
  "meta_description": null,
  "h1_count": 1,
  "image_count": 0,
  "images_missing_alt": 0,
  "word_count": 28,
  "content_type": "text/html; charset=UTF-8",
  "was_redirected": true
}
```

**Error response** (structured body, with a status code matched to the failure):
```json
{
  "success": false,
  "error_type": "TIMEOUT",
  "message": "The site took too long to respond (over 10s). It may be down or overloaded."
}
```

| error_type            | HTTP status | Meaning                                             |
|------------------------|:-----------:|------------------------------------------------------|
| `INVALID_URL`           | 400 / 422   | Malformed, empty, or unsupported-scheme input        |
| `BLOCKED_URL`           | 400         | URL targets a private/internal/loopback address      |
| `SSL_ERROR`             | 502         | Target site's TLS certificate failed verification    |
| `TIMEOUT`               | 408         | Target site did not respond in time                  |
| `CONNECTION_ERROR`      | 502         | DNS/TCP connection to target site failed              |
| `TOO_MANY_REDIRECTS`    | 502         | Redirect loop                                         |
| `REQUEST_FAILED`        | 502         | Other upstream request failure                        |
| `SERVER_ERROR`          | 500         | Unexpected server-side error                          |

The API never crashes or returns an unstructured error — every failure,
including ones FastAPI/Pydantic would normally format differently, is
normalized into this one JSON shape.

### `GET /api/health`
Lightweight liveness check, used for Render's health monitoring.

---

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. On Render, create a **New Web Service**, point it at the repo, and set
   the **Root Directory** to `backend`.
3. Render will pick up `render.yaml`, or you can set manually:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables (see `backend/.env.example`):
   - `ALLOWED_ORIGINS_RAW` — your Vercel frontend URL (comma-separated if more than one)
   - `ENVIRONMENT=production`
   - `LOG_LEVEL=INFO`

### Frontend → Vercel

1. On Vercel, **Import Project**, point it at this repo, and set the
   **Root Directory** to `frontend`.
2. Framework preset: **Vite**.
3. Add an environment variable `VITE_API_BASE_URL` set to your deployed
   Render backend URL (e.g. `https://page-pulse-api.onrender.com`).
4. Deploy. `vercel.json` is already configured for SPA routing.

Both configs work out of the box with no code changes required.

---

## Security

- **Input validation at every boundary:** Pydantic rejects empty,
  oversized, or control-character-laced input before it reaches business
  logic; the frontend mirrors this for instant feedback but the backend
  is the actual source of truth.
- **SSRF protection:** the backend refuses to fetch `localhost`, loopback,
  private (RFC 1918), link-local (including the `169.254.169.254` cloud
  metadata endpoint), and other reserved addresses — checked both on the
  original URL and on every redirect hop (redirects are followed manually,
  one at a time, specifically so each hop can be re-validated).
- **Bounded resource usage:** requests are capped by timeout (10s default)
  and response size (5MB default) so a malicious or huge page can't hang
  or exhaust the server.
- **Locked-down CORS:** only explicitly allowed origins (via
  `ALLOWED_ORIGINS_RAW`) can call the API from a browser.
- **No stack traces leak to clients:** a global exception handler
  guarantees any unexpected error still returns a generic, safe JSON body.

## Performance

- HTML parsing uses **lxml** (falling back to Python's built-in parser if
  unavailable) for significantly faster DOM parsing than the pure-Python
  default.
- The response body is streamed and capped rather than fully buffered
  up front.
- The frontend code-splits the results view (`React.lazy`/`Suspense`) so
  the initial bundle stays small for first-time visitors.
- Stat cards are memoized (`React.memo`) so re-renders are scoped to
  only the data that actually changed.
- In-flight requests are cancelled (`AbortController`) whenever a new
  audit starts or the component unmounts, preventing a slow, stale
  response from overwriting a newer result.

---

Built for Digital Heroes Training Task — https://digitalheroesco.com
