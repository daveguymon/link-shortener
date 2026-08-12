# Link Shortener

Lightweight link shortener service (API-only) using Fastify, Postgres, and Redis.

Quick start (using Docker Compose):

```bash
cp .env.example .env
docker-compose up --build

# then create a link:
curl -X POST -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  http://localhost:3000/api/links
```

The service provides:
- `POST /api/links` — create a short link
- `GET /:alias` — redirect to original URL (301)
