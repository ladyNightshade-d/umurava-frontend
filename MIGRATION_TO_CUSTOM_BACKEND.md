# Migration to Custom Backend API - Complete

This document outlines the changes made to fully commit to the custom backend API architecture and remove all Supabase dependencies.

## What Was Changed

### 1. **Removed Supabase Integration**
- ❌ Deleted `src/integrations/client.ts` (dead code - never imported)
- ❌ Deleted `src/integrations/types.ts` (Supabase type definitions)
- ❌ Deleted `supabase/` folder (edge functions and migrations)
- ✅ Updated `src/lib/supabase.ts` to clarify it's not used

### 2. **Fixed Candidate Portal Authentication**
**Before:** `CandidateAuth.tsx` called `supabase.auth.signUp()` which was `null` → crashed at runtime

**After:** Uses custom backend API like recruiter auth:
- `POST /api/auth/register` with `{ name, email, password, role: "candidate" }`
- `POST /api/auth/login` with `{ email, password }`
- Stores JWT token in localStorage
- Redirects to `/candidate/jobs` on success

### 3. **Fixed All Candidate Views**

#### `CandidateProfile.tsx`
- `GET /api/candidates/profile` - Load profile
- `PUT /api/candidates/profile` - Update profile

#### `JobBoard.tsx`
- `GET /api/jobs/public` - List all jobs
- `GET /api/candidates/applications` - Get user's applications
- `POST /api/candidates/applications` - Submit application

#### `MyApplications.tsx`
- `GET /api/candidates/applications` - List applications with job details

#### `CandidateFeedback.tsx`
- `GET /api/candidates/feedback` - Get all feedback for user
- `POST /api/candidates/feedback/generate` - Request AI feedback generation

### 4. **Updated AuthContext**
- Added `role` field to `User` interface: `"recruiter" | "candidate"`
- Role is stored in localStorage with user object
- `signOut()` redirects to `/candidate/auth` for candidates, `/auth` for recruiters

### 5. **Created Candidate Routes**
New Next.js app routes:
- `/candidate` - Landing page
- `/candidate/auth` - Sign in/up
- `/candidate/jobs` - Job board
- `/candidate/applications` - My applications
- `/candidate/feedback` - AI feedback
- `/candidate/profile` - Profile settings

### 6. **Updated Environment Configuration**
`.env.example` now reflects actual setup:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Architecture Overview

```
Frontend (Next.js + React)
    ↓
Redux Store (jobsSlice, candidatesSlice, resultsSlice)
    ↓
Custom Backend API (localhost:5000)
    ↓
[Your Database] + [AI Service]
```

## Backend API Endpoints Required

Your custom backend at `http://localhost:5000/api` needs these endpoints:

### Recruiter Endpoints (Already Working)
- `POST /auth/register` - Register recruiter
- `POST /auth/login` - Login
- `GET /jobs` - List jobs
- `POST /jobs` - Create job
- `DELETE /jobs/:id` - Delete job
- `GET /jobs/:id/applicants` - List candidates
- `POST /jobs/:id/applicants` - Add candidate
- `POST /jobs/:id/applicants/upload-csv` - Bulk upload
- `GET /jobs/:id/applicants/shortlist` - Get screening results
- `POST /jobs/:id/applicants/screen` - Run AI screening

### Candidate Endpoints (Need Implementation)
- `POST /auth/register` - Accept `role: "candidate"` parameter
- `POST /auth/login` - Return user with role field
- `GET /candidates/profile` - Get candidate profile
- `PUT /candidates/profile` - Update candidate profile
- `GET /jobs/public` - List all public jobs
- `GET /candidates/applications` - List user's applications
- `POST /candidates/applications` - Submit application
- `GET /candidates/feedback` - Get AI feedback for user
- `POST /candidates/feedback/generate` - Generate AI feedback

## What's Left to Do

### Backend Implementation
You need to implement the candidate endpoints listed above in your custom backend.

### Expected Response Formats

**Application Object:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "job_id": "uuid",
  "resume_text": "string",
  "skills": ["skill1", "skill2"],
  "status": "pending|reviewed|accepted|rejected",
  "created_at": "2026-04-25T...",
  "job": {
    "title": "Software Engineer",
    "department": "Engineering",
    "experience_level": "Mid-level"
  }
}
```

**Feedback Object:**
```json
{
  "id": "uuid",
  "application_id": "uuid",
  "job_id": "uuid",
  "user_id": "uuid",
  "final_score": 85,
  "strengths": ["Strong React skills", "Good communication"],
  "gaps": ["Limited backend experience"],
  "culture_fit": "High",
  "status_reason": "Great technical fit but needs more backend work",
  "improvement_tips": ["Learn Node.js", "Build full-stack projects"],
  "created_at": "2026-04-25T...",
  "job": { "title": "...", "department": "..." }
}
```

## Testing the Changes

1. **Start your backend:** `cd backend && npm start` (or however you run it)
2. **Start Next.js:** `npm run dev`
3. **Test recruiter flow:** `/auth` → create job → add candidates → screen
4. **Test candidate flow:** `/candidate/auth` → browse jobs → apply → view feedback

## Migration Complete ✅

The app is now fully committed to the custom backend architecture. All Supabase code has been removed, and the candidate portal is functional (pending backend implementation).
