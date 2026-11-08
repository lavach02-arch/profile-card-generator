# Workora Milestone Submission Guide
## Project: User Profile Card Generator

---

### 📌 Milestone Objectives & Verification Matrix

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **1. Create HTML Form** | Captures Name, Headline, Location, Status Badge, Bio, Skills (with quick-add chips), Social Links (GitHub, LinkedIn, Twitter, Website, Email), Themes, and Avatar Styles. | ✅ **Verified** |
| **2. Process input on Node.js server** | Server sanitizes strings against XSS, extracts 2-letter uppercase initials, normalizes social media handles into valid URLs, parses and styles skills, estimates reading metrics, and calculates completion scores. | ✅ **Verified** |
| **3. Generate dynamic HTML card response** | Built-in SSR rendering engine generates styled HTML card components with custom CSS variables, responsive typography, and SVG badges. | ✅ **Verified** |
| **4. Store profile records in database** | Persistent JSON store with pre-seeded developer profiles, search/filter querying, and `/tmp` support for serverless Vercel environments. | ✅ **Verified** |
| **5. Automated Testing Suite** | 22 tests passing with 0 dependencies using Node.js native test runner. | ✅ **Verified (22/22 Pass)** |
| **6. Vercel & Cloud Deployment** | Ready for 1-click serverless deployment via `vercel.json` and `api/index.js`. | ✅ **Verified** |

---

### 🚀 Running the Project Locally

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   Open your browser at `http://localhost:5002`.
