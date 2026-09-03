# NPM Search Optimization Strategy for Rakta.js

**Goal:** Make Rakta.js rank #1 when developers search "react framework", "fullstack framework", "next alternative", etc.

---

## 📊 How npm Search Ranking Works

npm uses a **weighted scoring algorithm**:

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| **Quality** | 30% | README completeness, repository link, homepage, metadata |
| **Maintenance** | 35% | Publish frequency, recency of last update |
| **Popularity** | 35% | Download velocity, sustained install volume |

**Key insight:** Exact name matches rank highest, followed by keyword relevance in description and README.

---

## ✅ Current Optimization Status

### Package Names (Optimal)
- `raktajs` - ✅ Contains primary keyword "rakta"
- `create-rakta-app` - ✅ Contains "rakta" + "app"

**No changes needed.** Exact matches dominate search results.

---

### Descriptions (OPTIMIZED)

#### raktajs
**Before:**
```
"Rakta.js core framework package for React, Bun, TypeScript, app routing..."
```

**After (v1.2.4):**
```
"Rakta.js - Ultra-fast React framework with SSR, SSG, and edge runtime. Small bundle, blazing performance, zero-config TypeScript and Bun support."
```

**Improvement:**
- Value proposition in first 140 chars (search result preview)
- Keywords: "ultra-fast", "React framework", "SSR", "SSG", "edge runtime", "performance"
- Clear differentiation

#### create-rakta-app
**Before:**
```
"Create a fullstack Rakta.js application with frontend, backend, database..."
```

**After (v1.2.4):**
```
"Create Rakta.js apps instantly - Interactive CLI for React fullstack projects with SSR, TypeScript, Bun, and modern tooling. Zero config required."
```

**Improvement:**
- Action-oriented ("Create...instantly")
- Keywords: "Interactive CLI", "React fullstack", "SSR", "TypeScript", "Bun", "Zero config"

---

### Keywords (OPTIMIZED)

#### raktajs - Reduced from 38 to 18 targeted keywords

**Strategy:** 
- Target competitor alternatives: "next-alternative", "remix-alternative"
- Target problem domains: "react-framework", "fullstack-framework", "ssr-framework"
- Target technology stack: "bun-framework", "typescript-framework", "edge-runtime"

**New keywords:**
```json
[
  "rakta",
  "raktajs",
  "rakta.js",
  "react-framework",
  "fullstack-framework",
  "ssr-framework",
  "edge-runtime",
  "bun-framework",
  "next-alternative",
  "remix-alternative",
  "typescript-framework",
  "zero-config",
  "app-router",
  "web-framework",
  "react-ssr",
  "static-site-generator",
  "server-side-rendering",
  "modern-framework"
]
```

**Target searches:**
- ✅ "react framework"
- ✅ "fullstack framework"
- ✅ "next alternative"
- ✅ "remix alternative"
- ✅ "bun framework"
- ✅ "ssr framework"
- ✅ "typescript framework"

#### create-rakta-app - Reduced from 17 to 12 targeted keywords

**New keywords:**
```json
[
  "rakta",
  "create-rakta-app",
  "react-scaffold",
  "fullstack-cli",
  "project-generator",
  "typescript-starter",
  "bun-create",
  "next-alternative",
  "interactive-cli",
  "zero-config",
  "modern-stack",
  "web-framework-cli"
]
```

---

### Repository & Homepage (Optimal)

```json
{
  "homepage": "https://raktajs.dev",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/RheinSullivan/raktajs.git"
  }
}
```

✅ **Quality signal:** Both fields populated = ranking boost

---

## 🚀 Action Plan for Maximum Ranking

### Priority 1: README Optimization (CRITICAL)

**Current gaps:**
- ❌ Missing npm badges (version, downloads, stars)
- ❌ Value proposition could be more prominent
- ❌ Install command not copy-pasteable in first screen

**Required structure:**

```markdown
# Rakta.js

[![npm version](https://img.shields.io/npm/v/raktajs.svg)](https://www.npmjs.com/package/raktajs)
[![npm downloads](https://img.shields.io/npm/dm/raktajs.svg)](https://www.npmjs.com/package/raktajs)
[![GitHub stars](https://img.shields.io/github/stars/RheinSullivan/raktajs.svg)](https://github.com/RheinSullivan/raktajs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Ultra-fast React framework with SSR, SSG, and edge runtime. Small bundle, blazing performance.

## Quick Start

\`\`\`bash
bunx create-rakta-app
# or
npx create-rakta-app
\`\`\`

## Features

- ⚡ **Zero Config** - Start coding immediately
- 🚀 **SSR/SSG/CSR** - Choose your rendering mode
- 📦 **Tiny Bundle** - Smaller than Next.js
- 🔥 **Bun-First** - Built for modern runtimes
- 🎯 **TypeScript** - Full type safety

## Documentation

Visit [raktajs.dev](https://raktajs.dev) for full documentation.
```

**Why this works:**
- Badges = social proof before install
- Value proposition in first line
- Install command visible without scrolling
- Feature bullets with emojis = scannable

---

### Priority 2: Publish Frequency (MAINTENANCE SIGNAL)

**Current problem:** New framework = low download count

**Solution:** Regular releases maintain ranking even with low installs

**Recommended cadence:**
```
v1.2.4 (now) 
→ v1.2.5 (2 weeks - dependency updates + docs)
→ v1.2.6 (2 weeks - bug fixes + new feature)
→ v1.2.7 (2 weeks - performance improvements)
→ v1.3.0 (major release)
```

**What counts as a release:**
- ✅ Documentation improvements
- ✅ Dependency updates
- ✅ Bug fixes
- ✅ Performance optimizations
- ✅ New features
- ❌ Empty releases (avoid)

**Why:** npm algorithm favors packages updated in last 30 days. Stale packages drift downward regardless of download history.

---

### Priority 3: Cross-Promotion Strategy

**Goal:** Drive external traffic to npm package page to boost download velocity

#### GitHub
- ✅ Add npm badges to README
- ✅ Link to npm package in "Installation" section
- ✅ Mention npm downloads in release notes

#### Website (raktajs.dev)
- ❌ Add prominent "Install via npm" CTA on homepage
- ❌ Show live download count widget
- ❌ Feature npm command in hero section

#### Documentation
- ✅ Always show npm install command first (not just bun)
- ✅ Include npx alternative for create-rakta-app

#### Social Media
- ❌ Tweet each release with npm link
- ❌ Use hashtags: #RaktaJS #React #Bun #TypeScript
- ❌ Post to r/reactjs, r/webdev when hitting milestones

#### Content Marketing
- ❌ Write "Migrating from Next.js to Rakta.js" article on Dev.to
- ❌ Create "Why We Switched from Remix" case study
- ❌ Publish "Rakta.js vs Next.js Performance Benchmark"

---

## 📈 Measuring Success

### Key Metrics to Track

| Metric | How to Track | Target (3 months) |
|--------|-------------|-------------------|
| **npm Weekly Downloads** | npmjs.com/package/raktajs | 1,000+ |
| **Search Rank for "react framework"** | Manual npm search | Top 10 |
| **Search Rank for "next alternative"** | Manual npm search | Top 5 |
| **GitHub Stars** | github.com/RheinSullivan/raktajs | 500+ |
| **npm Quality Score** | npms.io/search?q=raktajs | 70+ |

### Weekly Monitoring

Run this command weekly:
```bash
npm search rakta
npm search "react framework"
npm search "next alternative"
npm search "fullstack framework"
```

Track position changes and adjust keywords if needed.

---

## 🎯 Competitor Analysis

### Current Top Packages for "react framework"

1. **next** - 10M+ downloads/week
2. **gatsby** - 500K+ downloads/week
3. **remix-run** - 100K+ downloads/week

### Rakta.js Competitive Advantages

| Feature | Next.js | Remix | Rakta.js |
|---------|---------|-------|----------|
| Bundle Size | Large | Medium | **Small** ✅ |
| Bun Support | Partial | No | **Native** ✅ |
| Zero Config | Yes | No | **Yes** ✅ |
| Edge Runtime | Yes | No | **Yes** ✅ |
| Learning Curve | Steep | Medium | **Easy** ✅ |

**Marketing angle:** "Next.js simplicity + Remix performance + Bun speed"

---

## 🔥 Advanced Tactics

### 1. Create "Awesome Rakta.js" Repository
- Curated list of Rakta.js resources
- Links back to npm packages
- SEO juice for brand searches

### 2. Publish Official Plugins to npm
```
@raktajs/tailwind
@raktajs/auth
@raktajs/database
```
Each plugin:
- Links to main raktajs package
- Uses keywords: "rakta", "rakta-plugin"
- Increases ecosystem visibility

### 3. npm Funding Field
```json
{
  "funding": {
    "type": "buymeacoffee",
    "url": "https://buymeacoffee.com/rheinsullivan"
  }
}
```
Shows funding link on npm page → drives Palestine relief donations

### 4. Bundle Size Comparison Badge
```markdown
[![Bundle size](https://img.shields.io/bundlephobia/minzip/raktajs)](https://bundlephobia.com/package/raktajs)
```
Visual proof of "small bundle" claim

---

## ⚠️ What NOT to Do

### Avoid These Tactics (npm Penalties)

❌ **Keyword stuffing** - Don't add 50+ irrelevant keywords  
❌ **Empty releases** - Don't publish just to bump recency  
❌ **Fake downloads** - npm detects bot installs  
❌ **Unpublishing packages** - Destroys download history  
❌ **Changing package name** - Resets all ranking signals

---

## 📅 90-Day Execution Timeline

### Month 1: Foundation
- ✅ Week 1: Optimize package.json (DONE)
- ⬜ Week 2: Update README with badges
- ⬜ Week 3: Publish v1.2.5 (documentation updates)
- ⬜ Week 4: Write "Getting Started" blog post

### Month 2: Momentum
- ⬜ Week 5: Publish v1.2.6 (bug fixes)
- ⬜ Week 6: Launch @raktajs/tailwind plugin
- ⬜ Week 7: Publish v1.2.7 (performance)
- ⬜ Week 8: Post to r/reactjs

### Month 3: Scale
- ⬜ Week 9: Publish v1.3.0 (major release)
- ⬜ Week 10: "Rakta vs Next.js" benchmark article
- ⬜ Week 11: Create awesome-raktajs repo
- ⬜ Week 12: Measure results & iterate

---

## 💡 Key Takeaways

1. **Package name is king** - "raktajs" already optimal for "rakta" searches
2. **Keywords target alternatives** - "next-alternative", "remix-alternative"
3. **Description sells in 140 chars** - First line = search preview
4. **Publish every 2-4 weeks** - Recency = 35% of ranking
5. **README = landing page** - Badges + value prop + install command
6. **Cross-promote everywhere** - GitHub, website, social, content

**Bottom line:** Ranking is a **sustained effort**, not a one-time optimization. Consistent releases + cross-promotion + keyword targeting = top search results.

---

**Last updated:** September 4, 2026  
**Framework version:** 1.2.4  
**Author:** Rhein Sullivan | Vyagra Nexus™
