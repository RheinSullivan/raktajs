# Firebase

Firebase is Google's platform for building web and mobile applications. For database use cases, it offers two products: **Firestore** (document database with real-time sync) and **Realtime Database** (JSON tree with real-time streaming). Firestore is the recommended choice for new projects.

## When to Use

Use Firebase/Firestore when your application needs:
- Real-time data synchronization (chat, live dashboards, collaborative editing)
- Offline support with automatic sync when reconnected
- Schema-free, document-based data storage
- Built-in authentication tightly coupled with data access rules
- A backend-as-a-service setup without running your own server

## Installation

### Node.js / Bun (server-side with Admin SDK)

```bash
bun add firebase-admin
```

### Client-side (browser, used in Rakta.js frontend)

```bash
bun add firebase
```

## Configuration

```env
# Server-side (Admin SDK)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Client-side (frontend)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

## Project Structure

```
project/
├── frontend/               # Rakta.js frontend
│   ├── app/
│   │   └── feed/
│   │       └── page.tsx       # Real-time feed with onSnapshot
│   └── services/
│       └── firebase.ts        # Client Firebase setup
│       └── feed.ts            # Firestore queries
├── backend/                # Optional: Gaman.js / NestJS
│   └── services/
│       └── admin.ts           # Firebase Admin SDK
```

## Backend Integration (Admin SDK)

```typescript
// backend/services/admin.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = getFirestore();
```

```typescript
// backend/services/postService.ts
import { adminDb } from "./admin";

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export async function getAllPosts(): Promise<Post[]> {
  const snapshot = await adminDb
    .collection("posts")
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Post, "id">),
  }));
}

export async function createPost(data: {
  title: string;
  content: string;
  authorId: string;
}): Promise<string> {
  const ref = await adminDb.collection("posts").add({
    ...data,
    createdAt: new Date(),
  });
  return ref.id;
}
```

```typescript
// backend/routes/posts.ts (Gaman.js)
import { defineRoute } from "gamanjs";
import { getAllPosts, createPost } from "../services/postService";

export default defineRoute({
  "GET /api/posts": async (ctx) => {
    const posts = await getAllPosts();
    return ctx.json({ posts });
  },
  "POST /api/posts": async (ctx) => {
    const body = await ctx.json();
    const id = await createPost(body);
    return ctx.json({ id }, 201);
  },
});
```

## Rakta.js Frontend Integration

### Option 1 - Via Backend API (recommended)

```typescript
// frontend/services/posts.ts
import { createRaktaHttp } from "raktajs/http";

const api = createRaktaHttp({ baseUrl: process.env.API_URL ?? "http://localhost:4000" });

export async function fetchPosts() {
  const data = await api.get<{ posts: Post[] }>("/api/posts");
  return data.posts;
}
```

### Option 2 - Direct Firestore with real-time updates

```typescript
// frontend/services/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const db = getFirestore();
```

```typescript
// frontend/services/feed.ts
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "./firebase";

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

export function subscribeToPosts(callback: (posts: Post[]) => void): () => void {
  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
    callback(posts);
  });
}
```

```tsx
// frontend/app/feed/page.tsx
import { subscribeToPosts, type Post } from "../../services/feed";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    // onSnapshot returns an unsubscribe function
    return subscribeToPosts(setPosts);
  }, []);

  return (
    <main>
      <title>Live Feed</title>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <click to={`/posts/${post.id}`}>{post.title}</click>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

## Security Rules

Firestore Security Rules control who can read/write data. Define rules in `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase emulators:start
```

## Production

Firebase projects are always cloud-based. There is no self-hosted option. Use the Firebase console at [console.firebase.google.com](https://console.firebase.google.com) to manage your project.

## Architecture Summary

```
Rakta.js page
  ↓ (Option A) createRaktaHttp → Backend API → Firebase Admin SDK → Firestore
  ↓ (Option B) firebase client SDK → onSnapshot → real-time updates
Firestore collection
  ↓ document snapshot
Rakta.js UI (re-renders on data change)
```
