# Redis

Redis is an in-memory data structure store used as a cache, session store, message broker, and rate-limiting backend. In Rakta.js applications, Redis typically sits as a layer between the backend and the database - it does not serve as the primary persistent store.

## When to Use

Use Redis for:
- **Session management** - store user sessions server-side with automatic TTL expiry
- **Caching** - cache expensive database queries or API responses
- **Rate limiting** - count requests per IP per time window
- **Real-time pub/sub** - broadcast events between backend services
- **Job queues** - offload background processing (email, image resizing)

Redis is not a primary relational database. Pair it with PostgreSQL, MySQL, or MongoDB for persistent data.

## Installation

### Node.js / Bun

```bash
bun add ioredis
```

### Python

```bash
pip install redis
```

### Go

```bash
go get github.com/redis/go-redis/v9
```

### Java (Spring Boot)

Add `spring-boot-starter-data-redis` to your dependencies.

## Configuration

```env
REDIS_URL="redis://localhost:6379"
# With authentication:
REDIS_URL="redis://:password@localhost:6379"
# Redis Cloud / Upstash:
REDIS_URL="rediss://default:token@hostname:6380"
```

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── dashboard/
│   │       └── page.tsx       # Reads cached data via backend
│   └── services/
│       └── dashboard.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── dashboard.ts
│   ├── services/
│   │   └── cacheService.ts    # Redis caching layer
│   └── db/
│       └── redis.ts           # ioredis client
```

## Backend Integration

### Node.js + ioredis

```typescript
// backend/db/redis.ts
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});
```

### Caching Layer

```typescript
// backend/services/cacheService.ts
import { redis } from "../db/redis";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 60
): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key);
}
```

### Session Management

```typescript
// backend/services/sessionService.ts
import { redis } from "../db/redis";
import crypto from "node:crypto";

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
}

export async function createSession(data: SessionData): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const key = `session:${sessionId}`;
  await redis.set(key, JSON.stringify(data), "EX", 60 * 60 * 24 * 7); // 7 days
  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const raw = await redis.get(`session:${sessionId}`);
  if (!raw) return null;
  return JSON.parse(raw) as SessionData;
}

export async function destroySession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}
```

### Rate Limiting

```typescript
// backend/middleware/rateLimiter.ts
import { redis } from "../db/redis";
import { defineMiddleware } from "raktajs/middleware";

export const apiRateLimiter = defineMiddleware(async (ctx, next) => {
  const ip = ctx.request.headers.get("x-forwarded-for") ?? "unknown";
  const key = `ratelimit:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60); // 60-second window
  }

  if (count > 100) {
    return ctx.json({ error: "Too many requests" }, 429);
  }

  return next();
});
```

### API Route with Caching

```typescript
// backend/routes/dashboard.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { cacheGet, cacheSet } from "../services/cacheService";
import { fetchDashboardStats } from "../services/statsService";

export default defineRoute({
  "GET /api/dashboard/stats": async (ctx) => {
    const CACHE_KEY = "dashboard:stats";
    const cached = await cacheGet<DashboardStats>(CACHE_KEY);

    if (cached) {
      return ctx.json({ stats: cached, fromCache: true });
    }

    const stats = await fetchDashboardStats();
    await cacheSet(CACHE_KEY, stats, 30); // Cache for 30 seconds
    return ctx.json({ stats, fromCache: false });
  },
});
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/dashboard.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  revenueThisMonth: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const data = await api.get<{ stats: DashboardStats }>("/api/dashboard/stats");
  return data.stats;
}
```

```tsx
// frontend/app/dashboard/page.tsx
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
  }, []);

  return (
    <main>
      <title>Dashboard</title>
      <guard isAllowed={stats !== null} fallback={<p>Loading stats...</p>}>
        {stats && (
          <div>
            <p>Total users: {stats.totalUsers}</p>
            <p>Active today: {stats.activeToday}</p>
            <p>Revenue: ${stats.revenueThisMonth}</p>
          </div>
        )}
      </guard>
    </main>
  );
}
```

## Pub/Sub (Real-time Events)

```typescript
// backend/services/pubsub.ts
import Redis from "ioredis";

const publisher = new Redis(process.env.REDIS_URL!);
const subscriber = new Redis(process.env.REDIS_URL!);

export async function publish(channel: string, message: unknown): Promise<void> {
  await publisher.publish(channel, JSON.stringify(message));
}

export function subscribe(
  channel: string,
  handler: (message: unknown) => void
): void {
  subscriber.subscribe(channel);
  subscriber.on("message", (ch, raw) => {
    if (ch === channel) {
      try {
        handler(JSON.parse(raw));
      } catch {
        // ignore malformed messages
      }
    }
  });
}
```

## Development

Run Redis locally with Docker:

```bash
docker run -d \
  --name redis-dev \
  -p 6379:6379 \
  redis:7 --save 60 1 --loglevel warning
```

Connect with Redis CLI:

```bash
docker exec -it redis-dev redis-cli
> PING
PONG
> KEYS *
```

## Production

- **Upstash** - serverless Redis, pay-per-request, edge-compatible
- **Redis Cloud** - managed Redis with clustering and persistence
- **AWS ElastiCache** - enterprise managed Redis
- **Railway** - simple cloud Redis deployment

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / NestJS / Django)
  ↓ check Redis cache (ioredis)
Cache HIT → return JSON immediately
Cache MISS → query PostgreSQL/MySQL → store in Redis → return JSON
  ↓
Rakta.js UI
```
