# DevCard Studio &bull; REST API & Rendering Documentation

This document describes all RESTful API endpoints, server-side string manipulation utilities, dynamic HTML rendering capabilities, and request/response specifications for the **User Profile Card Generator**.

---

## 🎯 Architectural Overview

The application follows a clean layered architecture:
- **Express Router & Controller Layer**: Request validation, error formatting, HTTP status codes.
- **String Manipulation Utilities**: Trimming, XSS escaping, initials extraction, URL slug generation, skill deduplication, social handle normalization, and reading stats.
- **Dynamic HTML Card Rendering Engine**: Server-Side Rendering (SSR) of semantic HTML5 cards with responsive themes and CSS variables.
- **Atomic Persistent Storage**: JSON store with `/tmp` support for serverless environments (e.g. Vercel).

---

## 🌐 Endpoints Summary

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & service metadata | `200 OK` |
| `POST` | `/api/profiles/preview` | Real-time dynamic card rendering (ephemeral, not persisted) | `200 OK` |
| `GET` | `/api/profiles` | List profiles with search & filters | `200 OK` |
| `POST` | `/api/profiles` | Create and store new profile card | `201 Created` / `400 Bad Request` |
| `GET` | `/api/profiles/:id` | Get single profile JSON + dynamic card markup | `200 OK` / `404 Not Found` |
| `GET` | `/api/profiles/slug/:slug` | Get single profile by URL slug | `200 OK` / `404 Not Found` |
| `PUT` | `/api/profiles/:id` | Update profile fields and re-render card | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/profiles/:id` | Delete profile record | `200 OK` / `404 Not Found` |
| `GET` | `/cards/:id` | Standalone full HTML page | `200 OK` (`text/html`) |
| `GET` | `/cards/:id/embed` | Embeddable iframe HTML snippet | `200 OK` (`text/html`) |
| `GET` | `/cards/:id/svg` | Dynamic SVG badge for GitHub README | `200 OK` (`image/svg+xml`) |

---

## 📋 Endpoint Details

### 1. Generate Real-Time Card Preview
- **Route**: `POST /api/profiles/preview`
- **Payload**:
  ```json
  {
    "fullName": "Lava Kumar",
    "title": "Full-Stack Developer & Cloud Architect",
    "bio": "Passionate about microservices and automated workflows.",
    "location": "Hyderabad, India",
    "theme": "aurora",
    "badge": "Pro Developer",
    "skills": "JavaScript, Node.js, Express, React, Docker",
    "github": "lavach02-arch",
    "linkedin": "lavach",
    "twitter": "@lavach_dev",
    "website": "https://lavach.dev",
    "avatarStyle": "bottts"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "isValid": true,
    "errors": {},
    "profile": {
      "id": "preview",
      "fullName": "Lava Kumar",
      "title": "Full-Stack Developer & Cloud Architect",
      "slug": "lava-kumar-preview",
      "avatarUrl": "https://api.dicebear.com/7.x/bottts/svg?seed=lava%20kumar&radius=50",
      "stats": {
        "wordCount": 8,
        "charCount": 59,
        "readingTimeSeconds": 3,
        "completionPercent": 100
      }
    },
    "htmlCard": "<!-- DevCard Generated Profile Card [ID: preview] -->..."
  }
  ```

---

### 2. Create and Store Profile Card
- **Route**: `POST /api/profiles`
- **Response `201 Created`**: Returns created profile with persistent ID and dynamic HTML markup.
- **Validation Failure `400 Bad Request`**:
  ```json
  {
    "success": false,
    "message": "Validation failed for profile input",
    "errors": {
      "fullName": "Full Name is required and must be at least 2 characters.",
      "title": "Professional Title is required and must be at least 2 characters."
    }
  }
  ```

---

### 3. Query Profile Directory
- **Route**: `GET /api/profiles?search=cloud&theme=emerald&limit=10&offset=0`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "total": 1,
    "count": 1,
    "profiles": [
      {
        "id": "prof_1794114...",
        "fullName": "Kavya Reddy",
        "title": "Lead Cloud Architect",
        "theme": "emerald"
      }
    ]
  }
  ```

---

### 4. Dynamic GitHub README Badge
- **Route**: `GET /cards/:id/svg`
- **Response Headers**: `Content-Type: image/svg+xml`
- **Usage**:
  ```markdown
  [![DevCard](https://your-domain.vercel.app/cards/prof_seed_001/svg)](https://your-domain.vercel.app/cards/prof_seed_001)
  ```
