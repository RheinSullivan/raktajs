# MongoDB

MongoDB is a document-oriented NoSQL database that stores data in flexible BSON (Binary JSON) format. It is well-suited for applications with evolving schemas, hierarchical data, or content that maps naturally to JSON objects.

## When to Use

Use MongoDB when your application has:
- Flexible, schema-optional data structures
- Embedded documents and arrays rather than normalized joins
- Real-time analytics or log aggregation
- Content management, catalog, or user-profile data with variable fields
- Geospatial query requirements

## Installation

### Node.js / Bun - Mongoose

```bash
bun add mongoose
```

### Node.js / Bun - Official MongoDB Driver

```bash
bun add mongodb
```

### Python (Django / Flask)

```bash
pip install pymongo
# or with Motor for async Django
pip install motor
```

### Go (Prabogo / Beego)

```bash
go get go.mongodb.org/mongo-driver/mongo
```

### Java (Spring Boot)

Add `spring-boot-starter-data-mongodb` to your `pom.xml` or `build.gradle`.

## Configuration

```env
MONGODB_URI="mongodb://localhost:27017/rakta_db"
# With authentication:
MONGODB_URI="mongodb://user:password@localhost:27017/rakta_db?authSource=admin"
# MongoDB Atlas (cloud):
MONGODB_URI="mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/rakta_db"
```

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── articles/
│   │       └── page.tsx
│   └── services/
│       └── articles.ts
├── backend/                # Node.js / Gaman.js backend
│   ├── routes/
│   │   └── articles.ts
│   ├── models/
│   │   └── Article.ts      # Mongoose model
│   └── services/
│       └── articleService.ts
```

## Backend Integration

### Node.js + Mongoose

```typescript
// backend/db/mongoose.ts
import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI ?? "mongodb://localhost:27017/rakta_db");
  isConnected = true;
}
```

```typescript
// backend/models/Article.ts
import { Schema, model, Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  publishedAt: Date | null;
  author: {
    id: string;
    name: string;
  };
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    publishedAt: { type: Date, default: null },
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Article = model<IArticle>("Article", ArticleSchema);
```

```typescript
// backend/services/articleService.ts
import { connectDB } from "../db/mongoose";
import { Article } from "../models/Article";

export async function getPublishedArticles() {
  await connectDB();
  return Article.find({ publishedAt: { $ne: null } })
    .sort({ publishedAt: -1 })
    .select("title slug tags publishedAt author")
    .lean();
}

export async function getArticleBySlug(slug: string) {
  await connectDB();
  return Article.findOne({ slug }).lean();
}
```

```typescript
// backend/routes/articles.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getPublishedArticles, getArticleBySlug } from "../services/articleService";

export default defineRoute({
  "GET /api/articles": async (ctx) => {
    const articles = await getPublishedArticles();
    return ctx.json({ articles });
  },
  "GET /api/articles/:slug": async (ctx) => {
    const article = await getArticleBySlug(ctx.params.slug);
    if (!article) return ctx.json({ error: "Not found" }, 404);
    return ctx.json({ article });
  },
});
```

## Rakta.js Frontend Integration

```typescript
// frontend/services/articles.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export interface Article {
  _id: string;
  title: string;
  slug: string;
  tags: string[];
  publishedAt: string;
  author: { id: string; name: string };
}

export async function fetchArticles(): Promise<Article[]> {
  const data = await api.get<{ articles: Article[] }>("/api/articles");
  return data.articles;
}

export async function fetchArticle(slug: string): Promise<Article> {
  const data = await api.get<{ article: Article }>(`/api/articles/${slug}`);
  return data.article;
}
```

```tsx
// frontend/app/articles/page.tsx
export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticles().then(setArticles);
  }, []);

  return (
    <main>
      <title>Articles</title>
      <lazy fallback={<p>Loading articles...</p>}>
        <ul>
          {articles.map((article) => (
            <li key={article._id}>
              <click to={`/articles/${article.slug}`}>{article.title}</click>
              <span> by {article.author.name}</span>
            </li>
          ))}
        </ul>
      </lazy>
    </main>
  );
}
```

## MongoDB Atlas Setup

```bash
# Install MongoDB Atlas CLI
npm install -g @mongodb-js/atlas-cli

# Initialize connection
atlas auth login
atlas clusters list
```

Atlas provides a connection string in this format:
```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>
```

Paste this into your `.env` as `MONGODB_URI`.

## Development

Run MongoDB locally with Docker:

```bash
docker run -d \
  --name mongo-dev \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:7
```

## Production

- **MongoDB Atlas** - fully managed, multi-region, with built-in search
- **DigitalOcean Managed MongoDB** - simple cloud MongoDB
- **Self-hosted** on VPS with replica sets for high availability

## Architecture Summary

```
Rakta.js page
  ↓ createRaktaHttp
Backend route (Gaman.js / Express / NestJS)
  ↓ Mongoose / MongoDB driver
MongoDB collection
  ↓ document cursor / lean()
JSON response
  ↓
Rakta.js UI
```
