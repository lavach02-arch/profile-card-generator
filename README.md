# 🎴 DevCard Studio &bull; User Profile Card Generator

> A production-grade, server-processed web application where user form inputs are sanitized, normalized, and returned as dynamic, responsive profile cards with custom themes and embeddable assets.

Built for the **Workora Full-Stack Development Milestone**.

[![Tests](https://img.shields.io/badge/tests-22%20passed-success?style=flat-square)](backend/tests/profile.test.js)
[![Node.js](https://img.shields.io/badge/node.js-v20%2B-blue?style=flat-square)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-v4.19-lightgrey?style=flat-square)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🌟 Key Features

- ⚡ **Server-Side String Manipulation**:
  - **HTML Sanitization**: Escapes `<`, `>`, `&`, `"`, `'` to block XSS injection.
  - **Initials Extraction**: Dynamically derives uppercase 2-letter initials from names (e.g. `Lava Kumar` &rarr; `LK`).
  - **URL Slug Generator**: Generates safe, hyphenated URLs for cards.
  - **Skills Cloud Parser**: Splits by commas/semicolons, cleans, deduplicates, and assigns color palettes.
  - **Social Links Normalizer**: Resolves shorthand handles (e.g. `@lavach02-arch` &rarr; `https://github.com/lavach02-arch`).
  - **Reading & Completion Analytics**: Calculates word counts, reading time, and completeness percentage.

- 🎨 **Dynamic HTML Card Rendering Engine (SSR)**:
  - Generates responsive, semantic HTML5 card markup styled with CSS variables and gradients.
  - **5 Themes**: *Aurora Borealis*, *Midnight Cyberpunk*, *Emerald Nature*, *Sunset Gold*, *Minimal Mono*.
  - **5 Avatar Styles**: DiceBear *Bottts*, *Lorelei*, *Adventurer*, *Initials Circle*, or Custom Image URLs.

- 🗄️ **Persistent Database Storage**:
  - Atomic JSON database in `data/profiles.json` pre-seeded with 4 realistic developer profiles.
  - Serverless `/tmp` directory compatibility for seamless Vercel deployment.
  - Full CRUD operations with search and filtering.

- 🚀 **Export & Sharing Tools**:
  - Live Interactive Card Preview.
  - 1-Click `<iframe>` Embed Code Generator.
  - Dynamic SVG Badges for GitHub READMEs (`GET /cards/:id/svg`).
  - Standalone Shareable Full HTML Page (`GET /cards/:id`).
  - Instant `.html` Card File Download.

- 🧪 **Comprehensive Automated Testing**:
  - 22 native tests covering string utilities, validation, CRUD endpoints, and SSR renderers.

---

## 📁 Project Architecture

```
profile-card-generator/
├── api/
│   └── index.js                      # Serverless entrypoint for Vercel
├── backend/
│   ├── data/
│   │   └── profiles.json             # Persistent atomic JSON storage
│   ├── src/
│   │   ├── controllers/
│   │   │   └── profileController.js  # Validation, CRUD & SSR rendering handlers
│   │   ├── routes/
│   │   │   └── profileRoutes.js      # REST API route declarations
│   │   ├── utils/
│   │   │   ├── cardRenderer.js       # Dynamic HTML card & SVG generator
│   │   │   ├── storage.js            # Database read/write & seed loader
│   │   │   └── stringUtils.js        # String manipulation & sanitization utilities
│   │   ├── app.js                    # Express app configuration & middlewares
│   │   └── server.js                 # Server listener (Port 5002)
│   ├── tests/
│   │   └── profile.test.js           # 22 comprehensive automated tests
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md          # Complete REST API specification
│   └── WORKORA_SUBMISSION_GUIDE.md   # Workora rubric & verification matrix
├── frontend/
│   └── public/
│       ├── app.js                    # Client fetch(), live preview & gallery logic
│       ├── index.html                # Responsive UI with Tailwind CSS & Lucide icons
│       └── styles.css                # Card CSS variables & animations
├── package.json                      # Monorepo root package
├── vercel.json                       # Vercel deployment configuration
└── README.md
```

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ installed

### 1. Installation
```bash
cd backend
npm install
```

### 2. Run Automated Tests
```bash
npm test
```
*Result: 22 passed, 0 failed.*

### 3. Start Local Server
```bash
npm start
```
Open **[http://localhost:5002](http://localhost:5002)** in your browser.

---

## 🚢 Deployment on Vercel

1. Push this repository to GitHub: `https://github.com/lavach02-arch/profile-card-generator`.
2. Visit [Vercel New Project](https://vercel.com/new).
3. Import `profile-card-generator` and click **Deploy**.
4. Vercel automatically deploys the frontend and serverless API functions using `vercel.json`.

---

## 👨‍💻 Author

- GitHub: [@lavach02-arch](https://github.com/lavach02-arch)
- License: [MIT](LICENSE)
