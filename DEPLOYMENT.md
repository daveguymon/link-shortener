# Deployment

This document describes simple ways to deploy the link-shortener service.

1) Deploy with Docker Compose (recommended for simple self-hosting)

```bash
# Build and start locally
docker compose up --build -d

# If you need to run migrations:
cat migrations/001_create_links.sql | docker exec -i <postgres_container_name> psql -U postgres -d link_shortener
```

2) Build and push a production image (Docker Hub)

```bash
# Tag and push
docker build -t YOUR_DOCKERHUB_USERNAME/link-shortener:latest .
docker push YOUR_DOCKERHUB_USERNAME/link-shortener:latest

# Run with environment variables (example)
docker run -d -p 3000:3000 \
  -e BASE_URL=https://your-short-domain.example \
  -e PGHOST=your-postgres-host \
  -e PGUSER=youruser -e PGPASSWORD=yourpass -e PGDATABASE=link_shortener \
  -e REDIS_HOST=your-redis-host YOUR_DOCKERHUB_USERNAME/link-shortener:latest
```

3) Deploy to a container-based cloud service

- Use your cloud provider's container registry or Docker Hub image.
- Configure environment variables (`BASE_URL`, Postgres/Redis connection variables).
- Ensure the Postgres database is initialized with `migrations/001_create_links.sql`.

Notes:
- For low-latency redirect traffic, place a cache/Redis close to your app instances.
- Consider using a managed Postgres and managed Redis for production durability and availability.
- Secure `BASE_URL` and database credentials via your provider's secret store.
